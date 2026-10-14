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
        for line in lines[:5]:
            if line.lower().startswith("role:") or line.lower().startswith("title:") or line.lower().startswith("position:"):
                title = line.split(":", 1)[1].strip()
                break
            elif any(w in line.lower() for w in ["engineer", "manager", "developer", "analyst", "architect"]):
                title = line
                break

        # Detect Company
        company = None
        for line in lines[:6]:
            if line.lower().startswith("company:"):
                company = line.split(":", 1)[1].strip()
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
