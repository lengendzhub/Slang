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

def _escape_latex(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r'(?<!\\)&', r'\&', s)
    s = re.sub(r'(?<!\\)%', r'\%', s)
    s = re.sub(r'(?<!\\)\$', r'\$', s)
    s = re.sub(r'(?<!\\)_', r'\_', s)
    s = re.sub(r'(?<!\\)#', r'\#', s)
    return s

class PDFResumeExtractor:
    """
    Extracts text, contact details, sections, and bullet items from uploaded PDF resumes.
    Converts unstructured PDF streams into structured ParsedResume and compiling LaTeX.
    """

    KNOWN_SECTION_HEADINGS = [
        "experience", "work experience", "employment", "professional experience",
        "education", "academic background",
        "projects", "personal projects", "technical projects",
        "skills", "technical skills", "technologies", "core competencies",
        "certifications", "summary", "profile", "leadership"
    ]

    def __init__(self, pdf_bytes: bytes):
        self.pdf_bytes = pdf_bytes

    def extract(self) -> ParsedResume:
        doc = pymupdf.open(stream=self.pdf_bytes, filetype="pdf")
        full_text = ""
        lines = []

        for page in doc:
            text = page.get_text("text")
            full_text += text + "\n"
            page_lines = [l.strip() for l in text.split("\n") if l.strip()]
            lines.extend(page_lines)

        # 1. Extract Contact Info
        contact_name = "Candidate"
        if lines:
            # First non-empty line is usually the candidate's name
            first_line = lines[0]
            if len(first_line) < 40 and not any(char in first_line for char in ["@", "http", "www", "/", "\\"]):
                contact_name = first_line

        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', full_text)
        contact_email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', full_text)
        contact_phone = phone_match.group(0) if phone_match else None

        # 2. Segment Sections
        current_section_title = "Summary"
        current_section_lines = []
        raw_sections: List[Tuple[str, List[str]]] = []

        for line in lines[1:]:
            line_clean = line.strip()
            line_lower = line_clean.lower()
            
            # Check if this line is a section heading
            is_heading = False
            for heading in self.KNOWN_SECTION_HEADINGS:
                # Must be short and match heading
                if line_lower == heading or (line_lower.startswith(heading) and len(line_clean) < len(heading) + 5):
                    is_heading = True
                    break

            if is_heading:
                if current_section_lines:
                    raw_sections.append((current_section_title, current_section_lines))
                current_section_title = line_clean.title()
                current_section_lines = []
            else:
                current_section_lines.append(line_clean)

        if current_section_lines:
            raw_sections.append((current_section_title, current_section_lines))

        # 3. Build ResumeSection and EvidenceRecord items
        sections: List[ResumeSection] = []
        evidence_bank: List[EvidenceRecord] = []
        latex_body_parts = []

        for sec_idx, (sec_title, sec_lines) in enumerate(raw_sections):
            sec_id = f"sec_{sec_idx}_{re.sub(r'[^a-zA-Z0-9]', '', sec_title.lower())}"
            bullets: List[ResumeBullet] = []
            sec_latex_blocks = []
            current_bullet_items = []

            def flush_bullets():
                if current_bullet_items:
                    sec_latex_blocks.append("  \\begin{itemize}[leftmargin=0.15in]\n" + "\n".join(current_bullet_items) + "\n  \\end{itemize}")
                    current_bullet_items.clear()

            # Group continuation lines to avoid fragmentation
            raw_items = []
            curr_text = ""
            curr_is_heading = False
            curr_is_bullet = False

            for line in sec_lines:
                clean = line.strip()
                if not clean:
                    continue
                is_bullet = clean.startswith(('-', '•', '*', '–', '·', '>', '—'))
                has_date = bool(re.search(r'\b(19\d\d|20\d\d)\s*[-–—]\s*(Present|current|now|\d{4})\b', clean, re.IGNORECASE))
                clean_text = re.sub(r'^[-•*–·>—\d\.]+\s*', '', clean).strip()

                if is_bullet or has_date:
                    if curr_text:
                        raw_items.append((curr_text, curr_is_heading, curr_is_bullet))
                    curr_text = clean_text
                    curr_is_heading = has_date and not is_bullet
                    curr_is_bullet = is_bullet
                else:
                    if curr_text and not curr_text.endswith(('.', ':', ';')) and len(clean_text) > 0:
                        curr_text += " " + clean_text
                    else:
                        if curr_text:
                            raw_items.append((curr_text, curr_is_heading, curr_is_bullet))
                        curr_text = clean_text
                        curr_is_heading = False
                        curr_is_bullet = False

            if curr_text:
                raw_items.append((curr_text, curr_is_heading, curr_is_bullet))

            b_idx = 0
            is_summary_sec = "summary" in sec_title.lower() or "objective" in sec_title.lower()

            for item_text, is_heading, is_bullet in raw_items:
                if is_heading:
                    flush_bullets()
                    escaped_subheading = _escape_latex(item_text)
                    sec_latex_blocks.append(f"  \\vspace{{2pt}}\\textbf{{{escaped_subheading}}}\\par")
                    evidence_bank.append(EvidenceRecord(
                        id=f"ev_{sec_id}_hdr_{b_idx}",
                        source="uploaded_pdf",
                        raw_text=item_text,
                        context=f"Role/Institution in {sec_title}",
                        verified=True
                    ))
                    b_idx += 1
                elif is_summary_sec and not is_bullet:
                    flush_bullets()
                    escaped_summary = _escape_latex(item_text)
                    sec_latex_blocks.append(f"  \\small{{{escaped_summary}}}\\par\\vspace{{2pt}}")
                    evidence_bank.append(EvidenceRecord(
                        id=f"ev_{sec_id}_{b_idx}",
                        source="uploaded_pdf",
                        raw_text=item_text,
                        context=f"Section: {sec_title}",
                        verified=True
                    ))
                    b_idx += 1
                else:
                    ev_id = f"ev_{sec_id}_{b_idx}"
                    bullet_item = ResumeBullet(
                        id=f"{sec_id}_b{b_idx}",
                        text=item_text,
                        raw_slot=f"\\resumeItem{{{item_text}}}",
                        evidence_id=ev_id,
                        max_length_budget=int(len(item_text) * 1.05)
                    )
                    bullets.append(bullet_item)

                    evidence_bank.append(EvidenceRecord(
                        id=ev_id,
                        source="uploaded_pdf",
                        raw_text=item_text,
                        context=f"Section: {sec_title}",
                        verified=True
                    ))
                    escaped_bullet = _escape_latex(item_text)
                    current_bullet_items.append(f"    \\resumeItem{{{escaped_bullet}}}")
                    b_idx += 1

            flush_bullets()

            section_obj = ResumeSection(
                id=sec_id,
                title=sec_title,
                raw_body="\n".join(sec_lines),
                bullets=bullets
            )
            sections.append(section_obj)

            if sec_latex_blocks:
                latex_body_parts.append(f"\\section{{{_escape_latex(sec_title)}}}\n" + "\n".join(sec_latex_blocks))

        # 4. Generate clean compiling LaTeX template with compact single-page budget
        esc_name = _escape_latex(contact_name)
        esc_email = _escape_latex(contact_email or '')
        esc_phone = _escape_latex(contact_phone or '')

        compiled_latex = (
            "\\documentclass[letterpaper,10pt]{article}\n"
            "\\usepackage[margin=0.45in]{geometry}\n"
            "\\usepackage{latexsym,titlesec,hyperref,enumitem}\n"
            "\\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\titlerule \\vspace{-4pt}]\n"
            "\\titlespacing{\\section}{0pt}{4pt}{2pt}\n"
            "\\setlist[itemize]{noitemsep, topsep=1pt, parsep=0pt, partopsep=0pt, leftmargin=0.15in}\n"
            "\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-1pt}}}}\n"
            "\\begin{document}\n\n"
            "\\begin{center}\n"
            f"    \\textbf{{\\Huge \\scshape {esc_name}}} \\\\ \\vspace{{2pt}}\n"
            f"    \\small {esc_email} $|$ {esc_phone}\n"
            "\\end{center}\n\n"
            + "\n\n".join(latex_body_parts) +
            "\n\n\\end{document}\n"
        )

        resume_id = "pdf_res_" + hashlib.md5(full_text.encode("utf-8")).hexdigest()[:10]

        return ParsedResume(
            id=resume_id,
            raw_latex=compiled_latex,
            preamble="\\documentclass[letterpaper,11pt]{article}\n\\begin{document}",
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            sections=sections,
            evidence_bank=evidence_bank
        )
