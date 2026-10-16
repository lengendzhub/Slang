import re
from typing import List, Dict, Any, Tuple
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

    def analyze(self) -> JDAnalysis:
        lines = [line.strip() for line in self.raw_text.split('\n') if line.strip()]
        
        # Detect Title
        title = "Target Professional Role"
        for line in lines[:6]:
            clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
            lower_l = clean_l.lower()
            if lower_l.startswith("role:") or lower_l.startswith("title:") or lower_l.startswith("position:") or lower_l.startswith("job title:"):
                title = clean_l.split(":", 1)[1].strip()
                break
            elif any(w in lower_l for w in ["engineer", "manager", "developer", "analyst", "architect", "specialist", "scientist", "designer", "consultant", "lead", "director"]):
                title = clean_l
                break

        # Detect Company
        company = None
        for line in lines[:8]:
            clean_l = re.sub(r'^[#*\-•\s]+', '', line).strip()
            lower_l = clean_l.lower()
            if lower_l.startswith("company:") or lower_l.startswith("organization:") or lower_l.startswith("employer:") or lower_l.startswith("at:"):
                company = clean_l.split(":", 1)[1].strip()
                break

        # If company not prefixed, check if first or second line has "Role at Company" or "Company - Location"
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
            if any(k in line_lower for k in ["mandatory", "essential", "must have", "minimum qualifications"]):
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

            # Check if line looks like a requirement bullet
            if line.startswith(('-', '•', '*', '–')) or (len(line) > 20 and not line.endswith(':')):
                clean_req = re.sub(r'^[-•*–\d\.]+\s*', '', line).strip()
                if len(clean_req) < 10:
                    continue
                # Skip if this line is the role title or metadata header
                if clean_req.lower() == title.lower() or (company and clean_req.lower() == company.lower()):
                    continue
                if any(clean_req.lower().startswith(p) for p in ["role:", "title:", "company:", "job title:", "about the company", "about the role"]):
                    continue

                req_counter += 1
                requirements.append(JDRequirement(
                    id=f"req_{req_counter}",
                    text=clean_req,
                    category=current_category,
                    classification=RequirementClassification.DIRECT,  # Default, refined in Matcher
                    notes=f"Category: {current_category.value}"
                ))

        if not requirements:
            # Fallback if unbulleted text
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
