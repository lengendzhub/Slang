import re
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import (
    JDRequirement,
    EvidenceRecord,
    RequirementClassification,
    CareerMode
)

class Matcher:
    """
    Classifies JD requirements against the candidate's Evidence Bank into:
    - Direct (strong direct evidence)
    - Transferable (adjacent experience requiring explicit framing)
    - Missing (no evidence found; reported as a gap, NEVER written into the resume)
    """

    TRANSFERABLE_MAPPINGS = {
        "leadership": ["mentor", "lead", "spearhead", "collaborate", "guide"],
        "product": ["discovery", "roadmap", "user", "adoption", "community", "tool", "star", "github"],
        "analytics": ["sql", "telemetry", "metric", "cost", "optimization", "dashboard", "latency"],
        "distributed": ["redis", "cache", "throughput", "concurrency", "raft", "storage", "microservices"],
        "cloud": ["docker", "kubernetes", "aws", "terraform", "ci/cd", "actions", "linux"],
    }

    STOP_WORDS = {
        "the", "and", "for", "with", "from", "that", "this", "will", "have", "been",
        "team", "work", "more", "also", "into", "over", "such", "than", "were", "when",
        "your", "what", "must", "well", "plus", "role", "help", "about", "their", "they",
        "years", "year", "using", "able", "strong", "good", "great", "experience", "required",
        "applicant", "applicants", "prioritizing", "future", "sponsorship", "require",
        "skills", "knowledge", "ability", "duties", "responsibilities", "looking"
    }

    KEY_TECH_TOKENS = [
        "redis", "postgres", "postgresql", "fastapi", "python", "go", "golang", "rust",
        "caching", "latency", "docker", "kubernetes", "aws", "gcp", "azure", "sql",
        "react", "nextjs", "typescript", "javascript", "node", "nodejs", "graphql",
        "rest", "grpc", "microservices", "flutter", "dart", "celery", "playwright",
        "pytest", "ci/cd", "git", "github", "linux", "java", "kafka", "pandas",
        "power bi", "dashboard", "testing", "unit test", "automation", "postman",
        "html", "css", "php"
    ]

    def __init__(self, mode: CareerMode = CareerMode.SAME_CAREER):
        self.mode = mode

    def match(
        self,
        requirements: List[JDRequirement],
        evidence_bank: List[EvidenceRecord]
    ) -> List[JDRequirement]:
        matched_requirements: List[JDRequirement] = []

        for req in requirements:
            req_text_lower = req.text.lower()
            best_match: Optional[EvidenceRecord] = None
            classification = RequirementClassification.MISSING

            # Meaningful non-stopwords in requirement
            req_words = {w for w in re.findall(r'\b[a-z]{3,}\b', req_text_lower) if w not in self.STOP_WORDS}
            
            # 1. Check for Direct Match against evidence bank
            for ev in evidence_bank:
                ev_lower = ev.raw_text.lower()
                ev_words = {w for w in re.findall(r'\b[a-z]{3,}\b', ev_lower) if w not in self.STOP_WORDS}
                overlap = req_words.intersection(ev_words)

                # Direct match via strong technical token or high keyword overlap
                has_tech_match = any(token in ev_lower for token in self.KEY_TECH_TOKENS if token in req_text_lower)
                if has_tech_match or len(overlap) >= 2:
                    classification = RequirementClassification.DIRECT
                    best_match = ev
                    break

            # 2. Check for Transferable Match if not direct
            if classification == RequirementClassification.MISSING:
                for category, keywords in self.TRANSFERABLE_MAPPINGS.items():
                    if any(kw in req_text_lower for kw in keywords):
                        # Find an evidence record that aligns with this transferable concept
                        for ev in evidence_bank:
                            if any(kw in ev.raw_text.lower() for kw in keywords):
                                classification = RequirementClassification.TRANSFERABLE
                                best_match = ev
                                break
                    if classification == RequirementClassification.TRANSFERABLE:
                        break

            # Update requirement model
            req.classification = classification
            if best_match:
                req.matched_evidence_id = best_match.id
                req.matched_text = best_match.raw_text
                req.notes = f"Matched via {classification.value} alignment with {best_match.id}"
            else:
                req.matched_evidence_id = None
                req.matched_text = None
                req.notes = "Unsupported by candidate evidence bank. Flagged as learning gap (100% truthful)."

            matched_requirements.append(req)

        return matched_requirements
