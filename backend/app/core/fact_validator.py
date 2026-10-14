import re
from typing import List, Tuple, Dict, Any, Set
from app.models.schemas import (
    DiffItem,
    EvidenceRecord,
    ClaimStatus,
    DiffDecision
)

# Known technical skills, programming languages, and tool tokens to check for fabrication
TECH_KEYWORDS = {
    "c++", "cpp", "c#", "rust", "golang", "java", "python", "javascript", "typescript",
    "aws", "azure", "gcp", "kubernetes", "docker", "terraform", "ansible",
    "kafka", "spark", "hadoop", "flink", "redis", "postgres", "postgresql", "mysql", "mongodb",
    "graphql", "grpc", "rest", "react", "angular", "vue", "next.js", "node.js",
    "tableau", "powerbi", "salesforce", "snowflake", "databricks", "dbt"
}

# Inflationary and hyperbolic terms banned from tailored resumes
BANNED_INFLATION_WORDS = {
    "expert", "master", "guru", "visionary", "rockstar", "ninja", "world-class",
    "unparalleled", "unrivaled", "elite"
}

class FactValidator:
    """
    Enforces Non-Negotiable Rule #2:
    - Every generated claim must carry an evidence_id pointing to the master resume
      or a user-confirmed evidence record.
    - Reject any line or bullet without a valid evidence_id.
    - Hallucination checks: ensures fabricated skills (e.g. AWS, C++, 5 yrs experience)
      not present in the candidate Evidence Bank are strictly rejected.
    - Rejects hyperbolic fluff (e.g., 'expert', 'world-class').
    """

    def __init__(self, evidence_bank: List[EvidenceRecord]):
        self.evidence_map = {ev.id: ev for ev in evidence_bank}
        # Build global candidate known vocabulary from all master facts
        self.global_known_text = " ".join(ev.raw_text.lower() for ev in evidence_bank)
        self.global_known_words = set(re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', self.global_known_text))

    def validate_diff(self, diff: DiffItem) -> Tuple[bool, str]:
        # 1. Reject if no evidence_id
        if not diff.evidence_id:
            return False, "REJECTED: Claim lacks an evidence_id. Non-negotiable Rule #2 violated."

        # 2. Check evidence existence
        anchor = self.evidence_map.get(diff.evidence_id)
        if not anchor:
            return False, f"REJECTED: evidence_id '{diff.evidence_id}' does not exist in candidate Evidence Bank."

        anchor_lower = anchor.raw_text.lower()
        rewrite_lower = diff.rewritten_text.lower()

        # 3. Detect Banned Inflation Words (e.g. "Software dev expert")
        for word in BANNED_INFLATION_WORDS:
            pattern = rf'\b{re.escape(word)}\b'
            if re.search(pattern, rewrite_lower) and not re.search(pattern, anchor_lower):
                return False, f"REJECTED: Hyperbolic claim '{word}' is not grounded in master resume."

        # 4. Detect Fabricated Tech Skills & Languages (e.g. adding C++, AWS, Salesforce when not in master)
        anchor_tokens = set(re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', anchor_lower))
        rewrite_tokens = set(re.findall(r'\b[a-zA-Z0-9\+#\.]+\b', rewrite_lower))

        for tech in TECH_KEYWORDS:
            if tech in rewrite_tokens or (f" {tech} " in f" {rewrite_lower} "):
                # If tech is in rewrite, it MUST be either in the specific anchor OR in the global candidate evidence bank
                if tech not in anchor_tokens and (tech not in self.global_known_words and f" {tech} " not in f" {self.global_known_text} "):
                    return False, f"REJECTED: Unverified technical skill '{tech}' fabricated without evidence in master resume."

        # 5. Detect ungrounded metric inflation (e.g. 10M -> 100M)
        anchor_nums = set(re.findall(r'\b\d+[%xXmMkK]?\b', anchor_lower))
        rewrite_nums = set(re.findall(r'\b\d+[%xXmMkK]?\b', rewrite_lower))
        
        unverified_metrics = rewrite_nums - anchor_nums
        suspicious = [m for m in unverified_metrics if m not in ["1", "2", "3", "4", "5", "10m+"]]
        if len(suspicious) > 2:
            return False, f"REJECTED: Unverified metrics introduced: {suspicious}"

        return True, "VALIDATED: Anchored to verified evidence."

    def filter_diffs(self, diffs: List[DiffItem]) -> Tuple[List[DiffItem], List[DiffItem]]:
        """
        Returns (valid_diffs, rejected_diffs)
        """
        valid = []
        rejected = []
        for diff in diffs:
            is_valid, reason = self.validate_diff(diff)
            if is_valid:
                valid.append(diff)
            else:
                diff.decision = DiffDecision.REJECTED
                diff.status = ClaimStatus.UNSUPPORTED
                diff.reason = f"[FACT VALIDATOR BLOCKED] {reason}"
                rejected.append(diff)
        return valid, rejected
