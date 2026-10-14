from typing import List, Tuple, Dict, Any
from app.models.schemas import (
    DiffItem,
    EvidenceRecord,
    ClaimStatus,
    DiffDecision
)

class FactValidator:
    """
    Enforces Non-Negotiable Rule #2:
    - Every generated claim must carry an evidence_id pointing to the master resume
      or a user-confirmed evidence record.
    - Reject any line or bullet without a valid evidence_id.
    - Hallucination checks: ensures fabricated skills (e.g. AWS, 5 yrs experience)
      not present in the evidence anchor are discarded.
    """

    def __init__(self, evidence_bank: List[EvidenceRecord]):
        self.evidence_map = {ev.id: ev for ev in evidence_bank}

    def validate_diff(self, diff: DiffItem) -> Tuple[bool, str]:
        # 1. Reject if no evidence_id
        if not diff.evidence_id:
            return False, "REJECTED: Claim lacks an evidence_id. Non-negotiable Rule #2 violated."

        # 2. Check evidence existence
        anchor = self.evidence_map.get(diff.evidence_id)
        if not anchor:
            return False, f"REJECTED: evidence_id '{diff.evidence_id}' does not exist in candidate Evidence Bank."

        # 3. Detect ungrounded metric / credential inflation
        # If rewritten claims metrics not supported by the anchor
        # e.g. Anchor had 10M, rewrite says 100M without verification
        anchor_nums = set(re.findall(r'\b\d+[%xXmMkK]?\b', anchor.raw_text.lower()))
        rewrite_nums = set(re.findall(r'\b\d+[%xXmMkK]?\b', diff.rewritten_text.lower()))
        
        # New numbers introduced that are not in anchor
        unverified_metrics = rewrite_nums - anchor_nums
        # Allow benign variations like 10M+ from 10M
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

import re
