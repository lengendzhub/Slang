import pytest
from app.models.schemas import DiffItem, EvidenceRecord, ClaimStatus, DiffDecision
from app.core.fact_validator import FactValidator

def test_fact_validator_rejects_unanchored_claim():
    evidence_bank = [
        EvidenceRecord(
            id="ev_1",
            raw_text="Architected distributed caching layer with Redis, reducing latency by 42%.",
            source="master_resume"
        )
    ]
    validator = FactValidator(evidence_bank)

    # Claim without evidence_id
    bad_diff = DiffItem(
        id="diff_bad_1",
        section_id="sec_exp",
        section_title="Experience",
        original_text="Some text",
        rewritten_text="Deployed multi-region AWS cloud infrastructure with 99.99% SLA.",
        reason="Matched AWS keyword",
        evidence_id="",  # Missing evidence anchor!
        original_length=50,
        new_length=65
    )

    valid, reason = validator.validate_diff(bad_diff)
    assert valid is False
    assert "Rule #2 violated" in reason

def test_fact_validator_rejects_nonexistent_evidence_id():
    evidence_bank = [
        EvidenceRecord(
            id="ev_1",
            raw_text="Architected distributed caching layer with Redis.",
            source="master_resume"
        )
    ]
    validator = FactValidator(evidence_bank)

    bad_diff = DiffItem(
        id="diff_bad_2",
        section_id="sec_exp",
        section_title="Experience",
        original_text="Some text",
        rewritten_text="Led 10 engineers on machine learning pipelines.",
        reason="Claimed ML leadership",
        evidence_id="ev_non_existent",
        original_length=50,
        new_length=55
    )

    valid, reason = validator.validate_diff(bad_diff)
    assert valid is False
    assert "does not exist" in reason

def test_fact_validator_accepts_valid_anchor():
    evidence_bank = [
        EvidenceRecord(
            id="ev_valid",
            raw_text="Architected distributed caching layer with Redis, reducing p99 API query latency by 42%.",
            source="master_resume"
        )
    ]
    validator = FactValidator(evidence_bank)

    good_diff = DiffItem(
        id="diff_good",
        section_id="sec_exp",
        section_title="Experience",
        original_text="Architected distributed caching layer with Redis, reducing p99 API query latency by 42%.",
        rewritten_text="Architected multi-region Redis caching tier, cutting p99 API latency by 42%.",
        reason="Highlighted multi-region scale",
        evidence_id="ev_valid",
        original_length=95,
        new_length=85
    )

    valid, reason = validator.validate_diff(good_diff)
    assert valid is True
