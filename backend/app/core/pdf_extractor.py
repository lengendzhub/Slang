import pymupdf
import re
import hashlib
from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import (
    ParsedResume,
    ResumeSection,
    ResumeBullet,
    EvidenceRecord
)
from app.core.render_resume import render_tex, tex


class PDFResumeExtractor:
    """
    Extracts text, contact details, sections, and bullet items from uploaded PDF resumes.
    Converts unstructured PDF streams into structured JSON and clean, ATS-compliant LaTeX
    using the Jinja2 resume template.
    """

    KNOWN_SECTION_HEADINGS = [
        "experience", "work experience", "employment", "professional experience", "internship", "internships", "work history",
        "education", "academic background", "academics", "qualifications",
        "projects", "personal projects", "technical projects", "notable projects", "academic projects", "key projects",
        "skills", "technical skills", "technologies", "core competencies", "programming languages", "tools & technologies",
        "achievements", "awards", "honors", "certifications", "licenses", "soft skills", "soft skills & achievements",
        "summary", "executive summary", "professional summary", "career objective", "objective", "profile", "about me", "leadership"
    ]

    def __init__(self, pdf_bytes: bytes):
        self.pdf_bytes = pdf_bytes

    def extract(self) -> ParsedResume:
        import unicodedata

        doc = pymupdf.open(stream=self.pdf_bytes, filetype="pdf")
        full_text = ""
        lines = []

        for page in doc:
            raw_t = page.get_text("text")
            # Normalize Unicode ligatures (fi, fl, ffi, etc.)
            t = unicodedata.normalize("NFKD", raw_t)
            for k, v in [("\ufb00", "ff"), ("\ufb01", "fi"), ("\ufb02", "fl"), ("\ufb03", "ffi"), ("\ufb04", "ffl"), ("\u2013", "--"), ("\u2014", "---"), ("\u2022", "*")]:
                t = t.replace(k, v)
            full_text += t + "\n"
            page_lines = [l.strip() for l in t.split("\n") if l.strip()]
            lines.extend(page_lines)

        # 1. Extract Contact Info
        contact_name = "Candidate"
        if lines:
            first_line = lines[0]
            if len(first_line) < 40 and not any(char in first_line for char in ["@", "http", "www", "/", "\\"]):
                contact_name = first_line

        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', full_text)
        contact_email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', full_text)
        contact_phone = phone_match.group(0) if phone_match else None

        # Extract links and location from top lines
        links = []
        location = None
        seen_urls = set()
        for l in lines[:10]:
            clean_l = l.strip()
            # Check for link patterns
            url_matches = re.findall(r'(?:https?://)?(?:www\.)?(linkedin\.com/in/[\w-]+|github\.com/[\w-]+|[\w-]+\.(?:com|org|io|dev|in)(?:/[\w-]+)?)', clean_l, re.IGNORECASE)
            for m in url_matches:
                m_clean = m.strip()
                root_domain = m_clean.lower().split("/")[0]
                # Never include email service providers as candidate website links
                if root_domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "mail.com", "proton.me", "protonmail.com"]:
                    continue
                if contact_email and root_domain in contact_email.lower():
                    continue
                if m_clean not in seen_urls:
                    seen_urls.add(m_clean)
                    full_url = m_clean if m_clean.startswith("http") else f"https://{m_clean}"
                    links.append({"url": full_url, "label": m_clean})

            # Check for location
            if not location and re.search(r'\b(Tamil Nadu|India|USA|California|San Francisco|New York|London|Bengaluru|Bangalore|Chennai|Thoothukudi)\b', clean_l, re.IGNORECASE):
                # Clean delimiters
                loc_clean = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '', clean_l)
                loc_clean = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', '', loc_clean)
                loc_clean = loc_clean.replace("|", "").strip()
                if 3 < len(loc_clean) < 50:
                    location = loc_clean

        # 2. Segment Sections
        current_section_title = None
        current_section_lines = []
        raw_sections: List[Tuple[str, List[str]]] = []

        for line in lines[1:]:
            line_clean = line.strip()
            line_lower = line_clean.lower()

            # Ignore header lines before first section
            if current_section_title is None:
                if contact_email and contact_email in line_clean:
                    continue
                if contact_phone and contact_phone in line_clean:
                    continue
                if any(link["label"] in line_clean for link in links):
                    continue
                if location and location in line_clean:
                    continue

            # Check if this line is a section heading
            is_heading = False
            matched_heading_name = None
            for heading in self.KNOWN_SECTION_HEADINGS:
                if line_lower == heading or (line_lower.startswith(heading) and len(line_clean) < len(heading) + 6):
                    is_heading = True
                    matched_heading_name = heading
                    break

            if is_heading:
                if current_section_title and current_section_lines:
                    raw_sections.append((current_section_title, current_section_lines))
                # Standardize title
                title_map = {
                    "summary": "Summary", "executive summary": "Summary", "professional summary": "Summary", "career objective": "Summary", "objective": "Summary",
                    "experience": "Experience", "work experience": "Experience", "employment": "Experience", "internship": "Experience", "internships": "Experience",
                    "projects": "Projects", "notable projects": "Projects", "technical projects": "Projects", "personal projects": "Projects",
                    "education": "Education", "academic background": "Education", "academics": "Education",
                    "skills": "Technical Skills", "technical skills": "Technical Skills", "technologies": "Technical Skills",
                    "soft skills": "Soft Skills",
                    "achievements": "Achievements", "awards": "Achievements", "certifications": "Achievements"
                }
                current_section_title = title_map.get(matched_heading_name, line_clean.title())
                current_section_lines = []
            else:
                if current_section_title:
                    current_section_lines.append(line_clean)
                else:
                    # If text appears before any heading, treat as summary if not contact info
                    if len(line_clean) > 30 and not any(k in line_clean.lower() for k in ["@", "http", "phone"]):
                        current_section_title = "Summary"
                        current_section_lines.append(line_clean)

        if current_section_title and current_section_lines:
            raw_sections.append((current_section_title, current_section_lines))

        # Helper: distinguish header/metadata lines from wrapped bullet continuations
        def is_header_or_entry_line(s: str) -> bool:
            cl = s.strip()
            if not cl:
                return False
            # Acronyms like API, SDK, UI, UX are continuations
            if cl in ["API", "SDK", "UI", "UX", "GCP", "AWS", "AI", "ML"] or len(cl) <= 3:
                return False
            # Dates
            if re.search(r"\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19\d\d|20\d\d)\b", cl, re.I):
                return True
            # Modalities
            if cl.lower() in ["remote", "offline", "hybrid", "on-site", "onsite"]:
                return True
            # Role titles
            if re.search(r"\b(?:Intern|Developer|Engineer|Analyst|Lead|Manager|Specialist|Architect|Associate|Consultant|Scientist)\b", cl, re.I):
                return True
            # Title-cased heading (< 60 chars) without bullet punctuation
            if len(cl) < 60 and not cl.startswith(("-", "*", "•", "–", "—")) and cl[0].isupper():
                words = cl.split()
                title_words = [w for w in words if w[0].isupper()]
                if len(title_words) >= len(words) * 0.7:
                    return True
            return False

        def group_section_items(sec_lines_list: List[str]) -> List[str]:
            items = []
            curr = ""
            for raw_l in sec_lines_list:
                cl = raw_l.strip()
                if not cl:
                    continue
                is_bullet_start = cl.startswith(("-", "*", "•", "–", "—")) or bool(re.match(r"^\d+\.\s+", cl))
                if is_bullet_start:
                    if curr:
                        items.append(curr)
                    curr = cl
                else:
                    is_cont = False
                    if curr and curr.startswith(("-", "*", "•", "–", "—")):
                        if cl in ["API", "SDK", "UI", "UX", "GCP", "AWS"] or cl[0].islower():
                            is_cont = True
                        elif not curr.endswith((".", ":", ";")) and not is_header_or_entry_line(cl):
                            is_cont = True
                    if is_cont:
                        curr += " " + cl
                    else:
                        if curr:
                            items.append(curr)
                        curr = cl
            if curr:
                items.append(curr)
            return items

        # 3. Structure into template data & ParsedResume
        evidence_bank: List[EvidenceRecord] = []
        sections: List[ResumeSection] = []
        structured_data: Dict[str, Any] = {
            "header": {
                "name": contact_name,
                "email": contact_email,
                "phone": contact_phone,
                "location": location,
                "links": links
            },
            "summary": None,
            "experience": [],
            "projects": [],
            "education": [],
            "skills": {},
            "achievements": []
        }

        bullet_global_idx = 0

        for sec_idx, (sec_title, sec_lines) in enumerate(raw_sections):
            sec_id = f"sec_{sec_idx}_{re.sub(r'[^a-zA-Z0-9]', '', sec_title.lower())}"
            bullets: List[ResumeBullet] = []

            # Clean and merge lines
            raw_items = group_section_items(sec_lines)

            # Map section items
            if sec_title == "Summary":
                summary_text = " ".join(raw_items)
                structured_data["summary"] = summary_text
                ev_id = f"ev_sum_{sec_idx}"
                evidence_bank.append(EvidenceRecord(
                    id=ev_id,
                    source="uploaded_pdf",
                    raw_text=summary_text,
                    context="Professional Summary",
                    verified=True
                ))

            elif sec_title == "Experience":
                current_job = None
                for item in raw_items:
                    is_bullet = item.startswith(('-', '•', '*', '–', '·', '>', '—')) or bool(re.match(r'^(?:Developed|Collaborated|Engineered|Designed|Built|Worked|Performed|Led|Implemented)\b', item, re.I))
                    clean_text = re.sub(r'^[-•*–·>—\d\.]+\s*', '', item).strip()

                    if is_bullet:
                        if not current_job:
                            current_job = {"role": "Software Developer", "company": "Experience", "dates": "", "location": "", "bullets": []}
                        ev_id = f"ev_exp_{bullet_global_idx}"
                        b_obj = ResumeBullet(
                            id=f"{sec_id}_b{bullet_global_idx}",
                            text=clean_text,
                            raw_slot=f"\\resumeItem{{{tex(clean_text)}}}",
                            evidence_id=ev_id,
                            max_length_budget=int(len(clean_text) * 1.05)
                        )
                        bullets.append(b_obj)
                        current_job["bullets"].append({"text": clean_text, "evidence_id": ev_id})
                        evidence_bank.append(EvidenceRecord(
                            id=ev_id,
                            source="uploaded_pdf",
                            raw_text=clean_text,
                            context=f"Experience at {current_job['company'] or 'Organization'}",
                            verified=True
                        ))
                        bullet_global_idx += 1
                    else:
                        if current_job and current_job["bullets"]:
                            structured_data["experience"].append(current_job)
                            current_job = None

                        if not current_job:
                            current_job = {"role": "", "company": "", "dates": "", "location": "", "bullets": []}

                        date_match = re.search(r'\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19\d\d|20\d\d)(?:\s*[-–—]+\s*(?:Present|Current|Now|\d{4}))?\b', item, re.I)
                        if date_match and not current_job["dates"]:
                            current_job["dates"] = item
                        elif item.lower() in ["remote", "offline", "hybrid", "on-site", "onsite"]:
                            current_job["location"] = item.title()
                        elif re.search(r'\b(?:Full Stack|Software|Data|Frontend|Backend|Mobile|DevOps|QA)?\s*(?:Development\s+)?(?:Intern|Developer|Engineer|Analyst|Lead|Manager)\b', item, re.I) and not item.endswith("Internship"):
                            current_job["role"] = item
                        elif not current_job["company"]:
                            current_job["company"] = item
                        elif not current_job["role"]:
                            current_job["role"] = item

                if current_job and (current_job["company"] or current_job["role"] or current_job["bullets"]):
                    if not current_job["role"]:
                        current_job["role"] = "Software Developer"
                    structured_data["experience"].append(current_job)

            elif sec_title == "Projects":
                current_proj = None
                for item in raw_items:
                    is_bullet = item.startswith(('-', '•', '*', '–', '·', '>', '—')) or bool(re.match(r'^(?:Built|Integrated|Implemented|Created|Developed|Engineered|Supports)\b', item, re.I))
                    clean_text = re.sub(r'^[-•*–·>—\d\.]+\s*', '', item).strip()

                    if is_bullet:
                        if not current_proj:
                            current_proj = {"name": "Project", "technologies": "", "dates": "", "bullets": []}
                        ev_id = f"ev_proj_{bullet_global_idx}"
                        b_obj = ResumeBullet(
                            id=f"{sec_id}_b{bullet_global_idx}",
                            text=clean_text,
                            raw_slot=f"\\resumeItem{{{tex(clean_text)}}}",
                            evidence_id=ev_id,
                            max_length_budget=int(len(clean_text) * 1.05)
                        )
                        bullets.append(b_obj)
                        current_proj["bullets"].append({"text": clean_text, "evidence_id": ev_id})
                        evidence_bank.append(EvidenceRecord(
                            id=ev_id,
                            source="uploaded_pdf",
                            raw_text=clean_text,
                            context=f"Project: {current_proj['name']}",
                            verified=True
                        ))
                        bullet_global_idx += 1
                    else:
                        if current_proj and current_proj["bullets"]:
                            structured_data["projects"].append(current_proj)
                            current_proj = None

                        if not current_proj:
                            current_proj = {"name": "", "technologies": "", "dates": "", "bullets": []}

                        date_match = re.search(r'\b(?:19\d\d|20\d\d)\b', item)
                        if not current_proj["name"]:
                            current_proj["name"] = item
                        elif date_match and not current_proj["dates"]:
                            current_proj["dates"] = item
                        elif not current_proj["technologies"]:
                            current_proj["technologies"] = item

                if current_proj and (current_proj["name"] or current_proj["bullets"]):
                    structured_data["projects"].append(current_proj)

            elif sec_title == "Education":
                edu_entry = {"institution": "", "degree": "", "dates": "", "location": "", "details": ""}
                for item in raw_items:
                    clean_text = re.sub(r'^[-•*–·>—\d\.]+\s*', '', item).strip()
                    if re.search(r'\b(?:19\d\d|20\d\d)\s*[-–—]+\s*(?:Present|Current|Now|\d{4})\b', item, re.I) or re.match(r'^\d{4}$', clean_text):
                        edu_entry["dates"] = clean_text
                    elif any(k in item.lower() for k in ["bachelor", "master", "b.e", "b.tech", "degree", "diploma"]):
                        edu_entry["degree"] = clean_text
                    elif any(k in item.lower() for k in ["college", "university", "institute", "school"]):
                        edu_entry["institution"] = clean_text
                    elif any(k in item.lower() for k in ["thoothukudi", "tamil nadu", "india"]) or re.search(r',\s*[A-Z]{2}\b', item):
                        edu_entry["location"] = clean_text
                    elif "coursework" in item.lower() or "gpa" in item.lower() or "grade" in item.lower():
                        edu_entry["details"] = clean_text

                if edu_entry["institution"] or edu_entry["degree"]:
                    if not edu_entry["institution"]:
                        edu_entry["institution"] = "University"
                    structured_data["education"].append(edu_entry)

            elif sec_title == "Technical Skills":
                i = 0
                while i < len(raw_items):
                    line = raw_items[i]
                    if ":" in line:
                        cat, val = line.split(":", 1)
                        structured_data["skills"][cat.strip()] = val.strip()
                        i += 1
                    elif i + 1 < len(raw_items) and len(line) < 30 and not ("," in line):
                        cat = line.strip()
                        val = raw_items[i + 1].strip()
                        structured_data["skills"][cat] = val
                        i += 2
                    else:
                        structured_data["skills"].setdefault("Specializations", "")
                        if structured_data["skills"]["Specializations"]:
                            structured_data["skills"]["Specializations"] += ", " + line.strip()
                        else:
                            structured_data["skills"]["Specializations"] = line.strip()
                        i += 1

            elif sec_title == "Soft Skills":
                soft_text = ", ".join(raw_items)
                structured_data["skills"]["Soft Skills"] = soft_text

            elif sec_title == "Achievements":
                for item in raw_items:
                    parts = re.split(r'\s*[-•–—]\s*', item)
                    for p in parts:
                        p_clean = p.strip()
                        if len(p_clean) > 5:
                            structured_data["achievements"].append(p_clean)

            sections.append(ResumeSection(
                id=sec_id,
                title=sec_title,
                raw_body="\n".join(sec_lines),
                bullets=bullets
            ))

        # Render clean ATS-friendly LaTeX using Jinja2 template
        rendered_latex = render_tex(structured_data)

        resume_id = "pdf_res_" + hashlib.md5(full_text.encode("utf-8")).hexdigest()[:10]

        return ParsedResume(
            id=resume_id,
            raw_latex=rendered_latex,
            preamble="\\documentclass[letterpaper,10pt]{article}\n\\begin{document}",
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            sections=sections,
            evidence_bank=evidence_bank
        )
