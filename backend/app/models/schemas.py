from __future__ import annotations
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ClaimStatus(str, Enum):
    SUPPORTED = "supported"
    NEEDS_CONFIRMATION = "needs_confirmation"
    UNSUPPORTED = "unsupported"

class RequirementClassification(str, Enum):
    DIRECT = "Direct"
    TRANSFERABLE = "Transferable"
    MISSING = "Missing"

class RequirementCategory(str, Enum):
    ESSENTIAL = "Essential"
    REQUIRED = "Required"
    PREFERRED = "Preferred"
    RESPONSIBILITIES = "Responsibilities"

class CareerMode(str, Enum):
    SAME_CAREER = "Same career"
    ADJACENT_CAREER = "Adjacent career"
    CAREER_TRANSITION = "Career transition"
    FRESHER_INTERNSHIP = "Fresher or internship"

class Claim(BaseModel):
    text: str
    evidence_id: str
    claim_type: str = "bullet"
    status: ClaimStatus = ClaimStatus.SUPPORTED

class EvidenceRecord(BaseModel):
    id: str
    source: str = "master_resume"  # 'master_resume', 'github', 'project_notes', 'user_qa'
    source_name: Optional[str] = "Master Resume"
    raw_text: str
    context: Optional[str] = None
    category: str = "Experience"  # 'Experience', 'Project', 'Skill', 'Education', 'Custom'
    skills: List[str] = Field(default_factory=list)
    status: str = "extracted"  # 'extracted' or 'confirmed'
    verified: bool = True
    date_added: Optional[str] = "Just now"

class ResumeBullet(BaseModel):
    id: str
    text: str
    raw_slot: str
    evidence_id: str
    max_length_budget: int

class ResumeSubheading(BaseModel):
    title: str
    subtitle: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    bullets: List[ResumeBullet] = Field(default_factory=list)

class ResumeSection(BaseModel):
    id: str
    title: str
    is_locked: bool = False
    raw_body: str
    subheadings: List[ResumeSubheading] = Field(default_factory=list)
    bullets: List[ResumeBullet] = Field(default_factory=list)

class ParsedResume(BaseModel):
    id: str
    raw_latex: str
    preamble: str
    contact_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    template_id: str = "jakes_resume"
    parse_confidence: float = 1.0
    requires_section_mapping: bool = False
    sections: List[ResumeSection] = Field(default_factory=list)
    evidence_bank: List[EvidenceRecord] = Field(default_factory=list)

class JDRequirement(BaseModel):
    id: str
    text: str
    category: RequirementCategory
    classification: RequirementClassification
    matched_evidence_id: Optional[str] = None
    matched_text: Optional[str] = None
    notes: Optional[str] = None

class JDAnalysis(BaseModel):
    id: str
    title: str
    company: Optional[str] = None
    seniority: str
    requirements: List[JDRequirement] = Field(default_factory=list)

class DiffDecision(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EDITED = "edited"

class DiffItem(BaseModel):
    id: str
    section_id: str
    section_title: str
    original_text: str
    rewritten_text: str
    reason: str
    evidence_id: str
    claim_type: str = "bullet"
    status: ClaimStatus = ClaimStatus.SUPPORTED
    decision: DiffDecision = DiffDecision.PENDING
    edited_text: Optional[str] = None
    original_length: int
    new_length: int
    fits_budget: bool = True

class FitRubricScore(BaseModel):
    rubric_score: int
    evidence_coverage_pct: int
    direct_match_count: int
    transferable_match_count: int
    missing_count: int
    rubric_breakdown: Dict[str, Any]
    rubric_disclaimer: str = (
        "This score is an internal fit estimate derived strictly from documented requirements "
        "and verified evidence anchors. It is not an ATS or shortlist guarantee."
    )

class TailorJob(BaseModel):
    id: str
    resume_id: str
    jd_id: str
    mode: CareerMode
    status: str  # queued, processing, completed, failed
    stage: str
    progress: int
    fit_rubric: Optional[FitRubricScore] = None
    diffs: List[DiffItem] = Field(default_factory=list)
    requirements: List[JDRequirement] = Field(default_factory=list)
    created_at: str

class DecisionRequest(BaseModel):
    decision: DiffDecision
    edited_text: Optional[str] = None

class CompileValidationResult(BaseModel):
    compiles: bool
    reading_order_ok: bool
    headings_found: List[str]
    contact_info_intact: bool
    page_count: int
    warnings: List[str] = Field(default_factory=list)
    ats_score_estimate: int = 95

class SiblingResume(BaseModel):
    id: str
    master_id: str
    title: str
    target_role: str
    created_at: str
    fit_score: int
    master_updated: bool = False
    approved_changes_count: int
    total_changes_count: int

class InterviewPrepQuestion(BaseModel):
    id: str
    claim_text: str
    evidence_id: str
    question: str
    why_asked: str
    recommended_talking_points: List[str]
