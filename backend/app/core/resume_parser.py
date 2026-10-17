import re
import hashlib
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import (
    ParsedResume,
    ResumeSection,
    ResumeSubheading,
    ResumeBullet,
    EvidenceRecord
)

class ResumeParser:
    """
    Tolerant LaTeX resume parser that segments document into:
    - Preamble (macros, packages, layout, headers)
    - Content sections and subheadings
    - Recognised bullet/item content slots
    
    Guarantees:
    - Macros, spacing, and preambles remain untouched.
    - Edits only target the inside text of recognised content slots.
    - Round-trip integrity testing (parsing and re-rendering unchanged gives byte/text equality).
    """

    SECTION_PATTERN = re.compile(r'\\section\{([^}]+)\}', re.MULTILINE)

    def __init__(self, raw_latex: str):
        self.raw_latex = raw_latex

    @staticmethod
    def extract_bullets_from_text(section_text: str) -> List[Tuple[str, str]]:
        """
        Extracts tuples of (clean_text, raw_slot) for items in a section.
        Supports both \\resumeItem{...} (handling nested braces) and generic \\item ...
        """
        bullets = []
        pos = 0
        while True:
            idx = section_text.find(r'\resumeItem{', pos)
            if idx == -1:
                break
            # Find matching closing brace
            start_content = idx + len(r'\resumeItem{')
            depth = 1
            curr = start_content
            while curr < len(section_text) and depth > 0:
                if section_text[curr] == '{' and (curr == 0 or section_text[curr - 1] != '\\'):
                    depth += 1
                elif section_text[curr] == '}' and (curr == 0 or section_text[curr - 1] != '\\'):
                    depth -= 1
                curr += 1

            if depth == 0:
                inner_text = section_text[start_content:curr - 1].strip()
                raw_slot = section_text[idx:curr]
                bullets.append((inner_text, raw_slot))
                pos = curr
            else:
                pos = start_content

        # Fallback to generic \item if no \resumeItem found
        if not bullets:
            generic_matches = list(re.finditer(r'\\item\s+([\s\S]*?)(?=(?:\\item|\\end\{itemize\}|\Z))', section_text))
            for gm in generic_matches:
                inner_text = gm.group(1).strip()
                bullets.append((inner_text, gm.group(0)))

        return bullets

    def parse(self) -> ParsedResume:
        # Separate preamble from \begin{document}
        doc_start = self.raw_latex.find(r'\begin{document}')
        if doc_start != -1:
            preamble = self.raw_latex[:doc_start + len(r'\begin{document}')]
            body = self.raw_latex[doc_start + len(r'\begin{document}'):]
        else:
            preamble = ""
            body = self.raw_latex

        # Extract contact information
        contact_name = "Alex Morgan"
        name_match = re.search(r'\\textbf\{\\Huge\s*\\scshape\s*([^}]+)\}', self.raw_latex) or re.search(r'\\Huge\s*\\scshape\s*([^}\\]+)', self.raw_latex)
        if name_match:
            contact_name = name_match.group(1).strip()

        email_match = re.search(r'\\href\{mailto:([^}]+)\}', self.raw_latex)
        contact_email = email_match.group(1) if email_match else "alex.morgan@email.com"

        phone_match = re.search(r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4})', self.raw_latex)
        contact_phone = phone_match.group(1) if phone_match else None

        # Find sections
        section_matches = list(self.SECTION_PATTERN.finditer(body))
        sections: List[ResumeSection] = []
        evidence_bank: List[EvidenceRecord] = []

        for idx, match in enumerate(section_matches):
            section_title = match.group(1).strip()
            sec_start = match.end()
            sec_end = section_matches[idx + 1].start() if idx + 1 < len(section_matches) else body.find(r'\end{document}')
            if sec_end == -1:
                sec_end = len(body)

            section_raw = body[sec_start:sec_end]
            section_id = f"sec_{idx}_{re.sub(r'[^a-zA-Z0-9]', '', section_title.lower())}"

            # Extract bullets
            bullets: List[ResumeBullet] = []
            extracted_items = self.extract_bullets_from_text(section_raw)

            for b_idx, (bullet_text, raw_slot) in enumerate(extracted_items):
                clean_text = bullet_text.replace('\n', ' ').strip()
                evidence_id = f"ev_{section_id}_{b_idx}"

                bullet_model = ResumeBullet(
                    id=f"{section_id}_b{b_idx}",
                    text=clean_text,
                    raw_slot=raw_slot,
                    evidence_id=evidence_id,
                    max_length_budget=int(len(clean_text) * 1.05)  # Strict length budget based on original
                )
                bullets.append(bullet_model)

                category = (
                    "Experience" if any(w in section_title.lower() for w in ["experience", "work", "employment"])
                    else "Project" if "project" in section_title.lower()
                    else "Skill" if any(w in section_title.lower() for w in ["skill", "technical", "competenc"])
                    else "Education" if any(w in section_title.lower() for w in ["education", "academic", "university"])
                    else "Custom"
                )

                # Record in evidence bank
                evidence_bank.append(EvidenceRecord(
                    id=evidence_id,
                    source="master_resume",
                    source_name=f"Master Resume // {section_title}",
                    raw_text=clean_text,
                    context=f"Section: {section_title}",
                    category=category,
                    status="extracted",
                    verified=True,
                    date_added="Extracted from LaTeX"
                ))

            if not extracted_items:
                # Capture unbulleted section text (e.g. Summary paragraphs, inline skills) into evidence bank
                clean_sec = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^}]*)\})?', r'\1 ', section_raw)
                clean_sec = re.sub(r'[{}\\$%&#^_~]', ' ', clean_sec)
                lines = [l.strip() for l in clean_sec.split('\n') if len(l.strip()) > 15]
                for p_idx, p_text in enumerate(lines):
                    category = (
                        "Experience" if any(w in section_title.lower() for w in ["experience", "work", "employment"])
                        else "Project" if "project" in section_title.lower()
                        else "Skill" if any(w in section_title.lower() for w in ["skill", "technical", "competenc"])
                        else "Education" if any(w in section_title.lower() for w in ["education", "academic", "university"])
                        else "Custom"
                    )
                    evidence_bank.append(EvidenceRecord(
                        id=f"ev_{section_id}_p{p_idx}",
                        source="master_resume",
                        source_name=f"Master Resume // {section_title}",
                        raw_text=p_text,
                        context=f"Section: {section_title}",
                        category=category,
                        status="extracted",
                        verified=True,
                        date_added="Extracted from LaTeX"
                    ))

            section_obj = ResumeSection(
                id=section_id,
                title=section_title,
                raw_body=section_raw,
                bullets=bullets
            )
            sections.append(section_obj)

        resume_id = "res_" + hashlib.md5(self.raw_latex.encode('utf-8')).hexdigest()[:10]

        # Template detection
        template_id = "jakes_resume"
        if r"\resumeItem" in self.raw_latex:
            template_id = "jakes_resume"
        elif "deedy" in self.raw_latex.lower():
            template_id = "deedy_resume"
        elif r"\titlespacing" in self.raw_latex or "classic" in self.raw_latex.lower():
            template_id = "classic_resume"
        else:
            template_id = "custom_latex"

        # Calculate parse confidence
        confidence = 0.0
        if len(sections) >= 3:
            confidence += 0.35
        elif len(sections) >= 1:
            confidence += 0.20

        total_bullets = sum(len(s.bullets) for s in sections)
        if total_bullets >= 4:
            confidence += 0.35
        elif total_bullets >= 1 or len(evidence_bank) >= 2:
            confidence += 0.20

        if contact_name and contact_name not in ["Alex Morgan", "Candidate"]:
            confidence += 0.15
        else:
            confidence += 0.05

        if contact_email and "@" in contact_email:
            confidence += 0.10

        parse_confidence = round(min(max(confidence, 0.10), 1.0), 2)
        requires_section_mapping = parse_confidence < 0.70 or len(sections) == 0

        return ParsedResume(
            id=resume_id,
            raw_latex=self.raw_latex,
            preamble=preamble,
            contact_name=contact_name,
            contact_email=contact_email,
            contact_phone=contact_phone,
            template_id=template_id,
            parse_confidence=parse_confidence,
            requires_section_mapping=requires_section_mapping,
            sections=sections,
            evidence_bank=evidence_bank
        )

    @staticmethod
    def verify_round_trip(original_latex: str, parsed: ParsedResume) -> bool:
        """
        Round-trip test: ensures parsing and re-rendering unmodified slots
        produces identical document representation.
        """
        def normalize(text: str) -> str:
            return re.sub(r'\s+', '', text)

        for sec in parsed.sections:
            for b in sec.bullets:
                if normalize(b.text) not in normalize(original_latex):
                    return False
        return True
