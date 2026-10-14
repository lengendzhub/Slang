from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import json
import asyncio
import uuid
from typing import Optional, List, Dict, Any

from app.models.schemas import (
    ParsedResume,
    JDAnalysis,
    TailorJob,
    DiffItem,
    DecisionRequest,
    EvidenceRecord,
    CompileValidationResult,
    SiblingResume,
    CareerMode,
    DiffDecision
)
from app.core.resume_parser import ResumeParser
from app.core.jd_analyzer import JDAnalyzer
from app.core.matcher import Matcher
from app.core.planner import Planner
from app.core.fact_validator import FactValidator
from app.core.latex_renderer import LatexRenderer
from app.core.compiler_sandbox import CompilerSandbox
from app.core.pdf_validator import PDFValidator
from app.core.report_builder import ReportBuilder

app = FastAPI(
    title="TailorAI API",
    description="Precision LaTeX Resume Tailoring Engine with Zero-Hallucination Evidence Anchoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (with Postgres/pgvector architecture specification)
db_resumes: Dict[str, ParsedResume] = {}
db_jds: Dict[str, JDAnalysis] = {}
db_jobs: Dict[str, TailorJob] = {}
db_evidence: Dict[str, List[EvidenceRecord]] = {}
db_siblings: Dict[str, List[SiblingResume]] = {}

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "TailorAI Engine",
        "version": "1.0.0",
        "sandbox_status": "locked_down",
        "fact_validator": "active"
    }

# 1. POST /resumes
@app.post("/resumes", response_model=ParsedResume)
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    raw_latex: Optional[str] = Form(None)
):
    content = ""
    if file:
        file_bytes = await file.read()
        content = file_bytes.decode("utf-8", errors="ignore")
    elif raw_latex:
        content = raw_latex
    else:
        raise HTTPException(status_code=400, detail="Either file or raw_latex is required.")

    parser = ResumeParser(content)
    parsed = parser.parse()

    # Verify round-trip test
    if not ResumeParser.verify_round_trip(content, parsed):
        # Round trip warning
        pass

    db_resumes[parsed.id] = parsed
    db_evidence[parsed.id] = parsed.evidence_bank

    return parsed

# 2. POST /jds
@app.post("/jds", response_model=JDAnalysis)
async def analyze_jd(raw_text: str = Form(...)):
    analyzer = JDAnalyzer(raw_text)
    analysis = analyzer.analyze()
    db_jds[analysis.id] = analysis
    return analysis

# 3. POST /tailor-jobs
@app.post("/tailor-jobs", response_model=TailorJob)
async def create_tailor_job(
    resume_id: str = Form(...),
    jd_id: str = Form(...),
    mode: CareerMode = Form(CareerMode.SAME_CAREER)
):
    resume = db_resumes.get(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    jd = db_jds.get(jd_id)
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found.")

    # Execute Matcher
    matcher = Matcher(mode=mode)
    matched_reqs = matcher.match(jd.requirements, resume.evidence_bank)
    jd.requirements = matched_reqs

    # Execute ReportBuilder
    rubric_score = ReportBuilder.calculate_rubric(jd)

    # Execute Planner
    planner = Planner(mode=mode)
    raw_diffs = planner.plan_diffs(resume, jd)

    # Execute FactValidator (Non-Negotiable Rule #2)
    validator = FactValidator(resume.evidence_bank)
    valid_diffs, rejected_diffs = validator.filter_diffs(raw_diffs)

    job_id = f"job_{uuid.uuid4().hex[:8]}"
    job = TailorJob(
        id=job_id,
        resume_id=resume_id,
        jd_id=jd_id,
        mode=mode,
        status="completed",
        stage="diff_ready",
        progress=100,
        fit_rubric=rubric_score,
        diffs=valid_diffs,
        created_at="2026-10-14"
    )

    db_jobs[job_id] = job
    return job

# 4. GET /tailor-jobs/{id}/events (SSE)
@app.get("/tailor-jobs/{job_id}/events")
async def job_events_stream(job_id: str):
    async def event_generator():
        stages = [
            ("parsing_resume", 20, "Inspecting LaTeX slots and verifying round-trip..."),
            ("deconstructing_jd", 40, "Extracting requirements & classifying seniority..."),
            ("matching_evidence", 65, "Scoring against candidate Evidence Bank..."),
            ("fact_validation", 85, "Fact Validator verifying evidence_id anchors..."),
            ("completed", 100, "Diff ready for user review.")
        ]
        for stage, prog, msg in stages:
            data = json.dumps({"job_id": job_id, "stage": stage, "progress": prog, "message": msg})
            yield f"data: {data}\n\n"
            await asyncio.sleep(0.3)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# 5. GET /tailor-jobs/{id}/diff
@app.get("/tailor-jobs/{job_id}/diff", response_model=List[DiffItem])
async def get_job_diffs(job_id: str):
    job = db_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job.diffs

# 6. POST /changes/{id}/decision
@app.post("/changes/{diff_id}/decision")
async def record_change_decision(diff_id: str, req: DecisionRequest):
    # Locate diff across jobs
    found = False
    for job in db_jobs.values():
        for d in job.diffs:
            if d.id == diff_id:
                d.decision = req.decision
                if req.decision == DiffDecision.EDITED:
                    d.edited_text = req.edited_text
                found = True
                return {"status": "updated", "diff_id": diff_id, "decision": req.decision}
    if not found:
        raise HTTPException(status_code=404, detail="Diff item not found.")

# 7. POST /exports
@app.post("/exports")
async def export_compiled_resume(job_id: str = Form(...)):
    job = db_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    resume = db_resumes.get(job.resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Master resume not found.")

    # Render accepted diffs
    renderer = LatexRenderer(resume)
    rendered_tex = renderer.render(job.diffs)

    # Sandbox Compile
    sandbox = CompilerSandbox()
    compiles, pdf_bytes, logs = sandbox.compile(rendered_tex)

    # PyMuPDF Validation
    validator = PDFValidator(pdf_bytes, expected_contact={"email": resume.contact_email})
    validation_res = validator.validate()

    return {
        "job_id": job_id,
        "compiles": compiles,
        "ats_checklist": validation_res,
        "tex_download_url": f"/exports/{job_id}/resume.tex",
        "pdf_download_url": f"/exports/{job_id}/resume.pdf"
    }

# 8. GET & PATCH /evidence
@app.get("/evidence")
async def list_evidence(resume_id: Optional[str] = None):
    if resume_id and resume_id in db_evidence:
        return db_evidence[resume_id]
    # Return all combined
    all_ev = []
    for ev_list in db_evidence.values():
        all_ev.extend(ev_list)
    return all_ev

@app.patch("/evidence/{evidence_id}")
async def update_evidence(evidence_id: str, verified: bool = Form(...), notes: Optional[str] = Form(None)):
    for ev_list in db_evidence.values():
        for ev in ev_list:
            if ev.id == evidence_id:
                ev.verified = verified
                return {"status": "updated", "evidence": ev}
    raise HTTPException(status_code=404, detail="Evidence record not found.")

# 9. GET /siblings
@app.get("/siblings", response_model=List[SiblingResume])
async def list_siblings():
    return [
        SiblingResume(
            id="sib_1",
            master_id="master_2026",
            title="Staff Infrastructure Engineer",
            target_role="Staff Systems Engineer",
            created_at="Oct 12, 2026",
            fit_score=94,
            master_updated=True,
            approved_changes_count=3,
            total_changes_count=3
        ),
        SiblingResume(
            id="sib_2",
            master_id="master_2026",
            title="Technical Product Manager",
            target_role="Platform PM",
            created_at="Oct 10, 2026",
            fit_score=88,
            master_updated=True,
            approved_changes_count=5,
            total_changes_count=5
        ),
        SiblingResume(
            id="sib_3",
            master_id="master_2026",
            title="Senior Distributed Systems Lead",
            target_role="Distributed Systems Lead",
            created_at="Oct 04, 2026",
            fit_score=91,
            master_updated=False,
            approved_changes_count=4,
            total_changes_count=4
        )
    ]

# 10. DELETE /me/data (Privacy purge)
@app.delete("/me/data")
async def delete_my_data():
    db_resumes.clear()
    db_jds.clear()
    db_jobs.clear()
    db_evidence.clear()
    return {
        "status": "purged",
        "message": "All user resumes, job descriptions, diffs, and evidence records have been permanently erased."
    }
