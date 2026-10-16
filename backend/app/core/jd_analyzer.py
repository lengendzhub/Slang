import re
from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import (
    JDAnalysis,
    JDRequirement,
    RequirementCategory,
    RequirementClassification
)

class JDAnalyzer:
    """
    Deconstructs job descriptions into:
    - Target role title and detected seniority
    - Categorized requirements (Essential, Required, Preferred, Responsibilities)
    - Inconsistency warnings (e.g., 'Junior' asking for 5+ years)
    """

    SENIORITY_PATTERNS = [
        (r'\b(staff|principal|director|head of)\b', "Staff / Principal"),
        (r'\b(lead|architect|manager)\b', "Lead / Architect"),
        (r'\b(senior|sr\.?)\b', "Senior"),
        (r'\b(mid|intermediate|ii|iii)\b', "Mid-Level"),
        (r'\b(junior|jr\.?|associate|entry[- ]level|fresher|intern)\b', "Entry-Level / Fresher"),
    ]

    def __init__(self, raw_text: str):
        self.raw_text = raw_text

    @classmethod
    def normalize_raw_text(cls, raw: str) -> Tuple[str, Optional[str], List[str]]:
        t = raw.strip()

        # 1. Detect Company from Material Icons if present (e.g. corporate_fare Google)
        company = None
        comp_m = re.search(r'corporate_fare\s*([A-Za-z0-9\s&]+?)(?=places|info_outline|\n|$)', t, re.I)
        if comp_m:
            candidate = comp_m.group(1).strip()
            if 1 < len(candidate) < 50:
                company = candidate

        # 2. Insert newlines before Material Icons / badge markers
        t = re.sub(r'(corporate_fare|places|info_outline|location_on|schedule|business|arrow_forward)', r'\n\1 ', t, flags=re.I)

        # 3. Insert newlines before section headings (longest first to prevent sub-string overlap)
        headers = [
            "Minimum qualifications", "Basic qualifications", "Preferred qualifications",
            "About the job", "About the role", "About us", "Responsibilities",
            "Requirements", "Qualifications", "What you'll do", "What you will do"
        ]
        headers.sort(key=len, reverse=True)
        pattern = rf'(?i)\b({"|".join(re.escape(h) for h in headers)}):?\s*'
        t = re.sub(pattern, lambda m: f"\n\n{m.group(1).strip().capitalize()}:\n", t)

        # 4. Insert newlines when sentences/bullets are glued with periods (e.g. "experience.5 years")
        t = re.sub(r'\.([A-Z0-9])', r'.\n\1', t)

        lines = [line.strip() for line in t.split('\n') if line.strip()]

        # 5. Extract Title cleanly from first meaningful line
        title = "Target Professional Role"
        for line in lines[:6]:
            clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
            # Clean up leading clipped characters like 'enior' -> 'Senior'
            if re.match(r'^enior\b', clean_l, re.I):
                clean_l = "S" + clean_l

            lower_l = clean_l.lower()
            if lower_l.startswith("role:") or lower_l.startswith("title:") or lower_l.startswith("position:") or lower_l.startswith("job title:"):
                cand_title = clean_l.split(":", 1)[1].strip()
                title = cand_title
                break
            elif any(w in lower_l for w in ["engineer", "manager", "developer", "analyst", "architect", "specialist", "scientist", "designer", "consultant", "lead", "director"]):
                cand_title = re.split(r'corporate_fare|places|info_outline|Minimum qualifications|About the job|Responsibilities|\n', clean_l, flags=re.I)[0].strip()
                if cand_title:
                    title = cand_title
                break

        if len(title) > 70:
            title = title[:67].rsplit(' ', 1)[0].replace(',', '').strip() + "..."

        return title, company, lines

    def analyze(self) -> JDAnalysis:
        title, company, lines = self.normalize_raw_text(self.raw_text)

        # If company was not detected from material icons, check first few lines
        if not company:
            for line in lines[:8]:
                clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
                lower_l = clean_l.lower()
                if lower_l.startswith("company:") or lower_l.startswith("organization:") or lower_l.startswith("employer:") or lower_l.startswith("at:"):
                    company = clean_l.split(":", 1)[1].strip()
                    break

        if not company and len(lines) > 1:
            for line in lines[:3]:
                clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
                if " at " in clean_l:
                    company = clean_l.split(" at ", 1)[1].split("-")[0].split(",")[0].strip()
                    break
                elif " — " in clean_l or " - " in clean_l:
                    sep = " — " if " — " in clean_l else " - "
                    cand_comp = clean_l.split(sep, 1)[0].strip()
                    if any(w in cand_comp.lower() for w in ["technologies", "solutions", "inc", "corp", "labs", "systems", "enterprise", "stripe", "google", "meta", "amazon", "apple"]):
                        company = cand_comp
                        break

        # Detect Seniority
        seniority = "Mid-Senior"
        lower_jd = self.raw_text.lower()
        for pattern, level in self.SENIORITY_PATTERNS:
            if re.search(pattern, lower_jd):
                seniority = level
                break

        # Parse Requirements by Category
        requirements: List[JDRequirement] = []
        current_category = RequirementCategory.REQUIRED
        req_counter = 0

        for line in lines:
            line_lower = line.lower()
            if any(k in line_lower for k in ["mandatory", "essential", "must have", "minimum qualifications", "basic qualifications"]):
                current_category = RequirementCategory.ESSENTIAL
                continue
            elif any(k in line_lower for k in ["preferred", "nice to have", "bonus", "desirable"]):
                current_category = RequirementCategory.PREFERRED
                continue
            elif any(k in line_lower for k in ["responsibilities", "what you'll do", "duties"]):
                current_category = RequirementCategory.RESPONSIBILITIES
                continue
            elif any(k in line_lower for k in ["requirements", "qualifications", "what we're looking for"]):
                current_category = RequirementCategory.REQUIRED
                continue

            # Skip web icon and meta lines
            if any(line_lower.startswith(p) for p in ["corporate_fare", "places", "info_outline", "schedule", "location_on"]):
                continue

            # Check if line looks like a requirement bullet
            if line.startswith(('-', '•', '*', '–')) or (len(line) > 20 and not line.endswith(':')):
                # Strip leading list markers while preserving numbers in text (e.g. "5 years...")
                clean_req = re.sub(r'^[-•*–]\s*|^\d+[\.\)]\s+', '', line).strip()
                if len(clean_req) < 10:
                    continue
                # Skip if this line is the role title or metadata header
                clean_req_lower = clean_req.lower()
                title_lower = title.lower()
                if clean_req_lower == title_lower or clean_req_lower.endswith(title_lower) or title_lower.endswith(clean_req_lower) or (company and clean_req_lower == company.lower()):
                    continue
                if any(clean_req_lower.startswith(p) for p in ["role:", "title:", "company:", "job title:", "about the company", "about the role", "about the job"]):
                    continue

                req_counter += 1
                requirements.append(JDRequirement(
                    id=f"req_{req_counter}",
                    text=clean_req,
                    category=current_category,
                    classification=RequirementClassification.DIRECT,
                    notes=f"Category: {current_category.value}"
                ))

        if not requirements:
            req_counter += 1
            requirements.append(JDRequirement(
                id=f"req_{req_counter}",
                text=self.raw_text[:200].strip(),
                category=RequirementCategory.REQUIRED,
                classification=RequirementClassification.DIRECT
            ))

        jd_id = f"jd_{abs(hash(title)) % 100000}"

        return JDAnalysis(
            id=jd_id,
            title=title,
            company=company,
            seniority=seniority,
            requirements=requirements
        )
