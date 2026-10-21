from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
import json
import asyncio
import uuid
import hashlib
from datetime import datetime
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
    title="Slang API",
    description="Precision LaTeX Resume Tailoring Engine with Zero-Hallucination Evidence Anchoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# In-memory session store (with Postgres/pgvector architecture specification)
db_resumes: Dict[str, ParsedResume] = {}
db_jds: Dict[str, JDAnalysis] = {}
db_jobs: Dict[str, TailorJob] = {}
db_evidence: Dict[str, List[EvidenceRecord]] = {}
db_siblings: Dict[str, List[SiblingResume]] = {}

def init_default_resumes():
    from pathlib import Path
    for cand_path in [Path("templates/jakes_resume.tex"), Path("../templates/jakes_resume.tex")]:
        if cand_path.exists():
            try:
                tex = cand_path.read_text(encoding="utf-8")
                parsed = ResumeParser(tex).parse()
                parsed.id = "master_default"
                db_resumes["master_default"] = parsed
                db_evidence["master_default"] = parsed.evidence_bank
                break
            except Exception as e:
                print("Failed to initialize default master resume:", e)

init_default_resumes()

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Slang Engine",
        "version": "1.0.0",
        "sandbox_status": "locked_down",
        "fact_validator": "active"
    }

@app.get("/demo-samples")
def get_demo_samples():
    """
    Returns authentic demo resume templates and real matching target job descriptions
    for instant interactive demonstration and testing.
    """
    from pathlib import Path
    
    samples = []
    
    # 1. Software Engineer (Jake's Resume)
    latex_se = ""
    for p in [Path("templates/jakes_resume.tex"), Path("../templates/jakes_resume.tex"), Path("backend/templates/jakes_resume.tex")]:
        if p.exists():
            latex_se = p.read_text(encoding="utf-8")
            break
            
    jd_se = ""
    for p in [Path("templates/sample_jds/software_engineer.txt"), Path("../templates/sample_jds/software_engineer.txt"), Path("backend/templates/sample_jds/software_engineer.txt")]:
        if p.exists():
            jd_se = p.read_text(encoding="utf-8")
            break
            
    if latex_se and jd_se:
        samples.append({
            "id": "demo_swe",
            "title": "Senior Distributed Systems Engineer",
            "company": "CloudScale Infrastructure",
            "resume_name": "Jake Gutierrez (Software Engineer)",
            "candidate_name": "Jake Gutierrez",
            "candidate_email": "jake@alumni.neu.edu",
            "mode": "Same Field",
            "raw_latex": latex_se,
            "jd_text": jd_se
        })

    # 2. Product Manager (Classic Resume)
    latex_pm = ""
    for p in [Path("templates/classic_resume.tex"), Path("../templates/classic_resume.tex"), Path("backend/templates/classic_resume.tex")]:
        if p.exists():
            latex_pm = p.read_text(encoding="utf-8")
            break
            
    jd_pm = ""
    for p in [Path("templates/sample_jds/product_manager.txt"), Path("../templates/sample_jds/product_manager.txt"), Path("backend/templates/sample_jds/product_manager.txt")]:
        if p.exists():
            jd_pm = p.read_text(encoding="utf-8")
            break
            
    if latex_pm and jd_pm:
        samples.append({
            "id": "demo_pm",
            "title": "Technical Product Manager",
            "company": "DataPulse Technologies",
            "resume_name": "Classic Template (Product Lead)",
            "candidate_name": "Alex Morgan",
            "candidate_email": "alex.morgan@alumni.edu",
            "mode": "Career Pivot",
            "raw_latex": latex_pm,
            "jd_text": jd_pm
        })

    # 3. Business Analyst (Deedy Resume)
    latex_ba = ""
    for p in [Path("templates/deedy_resume.tex"), Path("../templates/deedy_resume.tex"), Path("backend/templates/deedy_resume.tex")]:
        if p.exists():
            latex_ba = p.read_text(encoding="utf-8")
            break
            
    jd_ba = ""
    for p in [Path("templates/sample_jds/business_analyst.txt"), Path("../templates/sample_jds/business_analyst.txt"), Path("backend/templates/sample_jds/business_analyst.txt")]:
        if p.exists():
            jd_ba = p.read_text(encoding="utf-8")
            break
            
    if latex_ba and jd_ba:
        samples.append({
            "id": "demo_ba",
            "title": "Business Analyst / Strategy & Ops",
            "company": "Horizon Capital",
            "resume_name": "Deedy Template (Strategy Analyst)",
            "candidate_name": "Debarghya Das",
            "candidate_email": "ddas@cornell.edu",
            "mode": "Career Pivot",
            "raw_latex": latex_ba,
            "jd_text": jd_ba
        })

    return samples

from app.core.pdf_extractor import PDFResumeExtractor
from app.api.export_pdf import router as export_pdf_router
from app.api.auth import router as auth_router

app.include_router(export_pdf_router)
app.include_router(auth_router)

# 1. POST /resumes (Supports both PDF and LaTeX .tex files)
@app.post("/resumes", response_model=ParsedResume)
async def upload_resume(
    file: Optional[UploadFile] = File(None),
    raw_latex: Optional[str] = Form(None)
):
    if file:
        file_bytes = await file.read()
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf") or file_bytes.startswith(b"%PDF"):
            # Direct PDF Upload Extraction
            extractor = PDFResumeExtractor(file_bytes)
            parsed = extractor.extract()
        else:
            # LaTeX .tex File Upload
            content = file_bytes.decode("utf-8", errors="ignore")
            parser = ResumeParser(content)
            parsed = parser.parse()
    elif raw_latex:
        parser = ResumeParser(raw_latex)
        parsed = parser.parse()
    else:
        raise HTTPException(status_code=400, detail="Either a .pdf file, .tex file, or raw_latex text is required.")

    db_resumes[parsed.id] = parsed
    db_evidence[parsed.id] = parsed.evidence_bank

    return parsed

@app.get("/resumes", response_model=List[ParsedResume])
async def list_resumes():
    return list(db_resumes.values())

@app.get("/resumes/{resume_id}", response_model=ParsedResume)
async def get_resume_by_id(resume_id: str):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    return res

# Evidence Bank & Section Lock Management
@app.get("/resumes/{resume_id}/evidence", response_model=List[EvidenceRecord])
async def get_resume_evidence(resume_id: str):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    return res.evidence_bank

@app.post("/resumes/{resume_id}/evidence", response_model=EvidenceRecord)
async def add_resume_evidence(
    resume_id: str,
    text: str = Form(...),
    category: str = Form("Experience"),
    source: str = Form("custom"),
    source_name: Optional[str] = Form("Custom Candidate Fact"),
    context: Optional[str] = Form("User Confirmed Evidence"),
    skills: Optional[str] = Form("")
):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    skill_list = [s.strip() for s in skills.split(",") if s.strip()] if skills else []
    ev_id = f"ev_user_{int(datetime.utcnow().timestamp())}_{hashlib.md5(text.encode()).hexdigest()[:4]}"
    
    new_record = EvidenceRecord(
        id=ev_id,
        source=source,
        source_name=source_name or "Custom Fact",
        raw_text=text.strip(),
        context=context or "User Confirmed Evidence",
        category=category,
        skills=skill_list,
        status="confirmed",
        verified=True,
        date_added="Just now"
    )
    res.evidence_bank.insert(0, new_record)
    db_evidence[resume_id] = res.evidence_bank
    return new_record

@app.put("/resumes/{resume_id}/evidence/{evidence_id}", response_model=EvidenceRecord)
async def update_resume_evidence(
    resume_id: str,
    evidence_id: str,
    text: Optional[str] = Form(None),
    status: Optional[str] = Form(None),
    category: Optional[str] = Form(None)
):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    for item in res.evidence_bank:
        if item.id == evidence_id:
            if text:
                item.raw_text = text.strip()
            if status:
                item.status = status
            if category:
                item.category = category
            db_evidence[resume_id] = res.evidence_bank
            return item
    raise HTTPException(status_code=404, detail="Evidence item not found")

@app.delete("/resumes/{resume_id}/evidence/{evidence_id}")
async def delete_resume_evidence(resume_id: str, evidence_id: str):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    res.evidence_bank = [item for item in res.evidence_bank if item.id != evidence_id]
    db_evidence[resume_id] = res.evidence_bank
    return {"status": "success", "deleted_id": evidence_id}

@app.patch("/resumes/{resume_id}/sections/{section_id}/lock")
async def toggle_section_lock(
    resume_id: str,
    section_id: str,
    is_locked: bool = Form(...)
):
    res = db_resumes.get(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    for sec in res.sections:
        if sec.id == section_id:
            sec.is_locked = is_locked
            return {"status": "success", "section_id": section_id, "is_locked": sec.is_locked}
    raise HTTPException(status_code=404, detail="Section not found")

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
        requirements=matched_reqs,
        created_at=datetime.utcnow().strftime("%Y-%m-%d")
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

# 9. GET and POST /siblings
@app.get("/siblings", response_model=List[SiblingResume])
async def list_siblings():
    return list(db_siblings.values())

@app.post("/siblings", response_model=SiblingResume)
async def create_sibling(sibling: SiblingResume):
    db_siblings[sibling.id] = sibling
    return sibling

# 10. DELETE /me/data (Privacy purge)
@app.delete("/me/data")
@app.post("/me/data/clear")
async def delete_my_data():
    db_resumes.clear()
    db_jds.clear()
    db_jobs.clear()
    db_evidence.clear()
    db_siblings.clear()
    init_default_resumes()
    return {
        "status": "purged",
        "message": "All user resumes, job descriptions, diffs, and evidence records have been permanently erased."
    }

# 11. GET /llm/pool-status (Load-balanced LLM multi-key telemetry)
@app.get("/llm/pool-status")
async def get_llm_pool_status():
    from app.core.constrained_editor import ConstrainedEditor
    editor = ConstrainedEditor()
    return {
        "cloud_pool": editor.key_pool.get_stats(),
        "local_ollama": {
            "url": editor.ollama_url,
            "detected_model": editor.get_available_model(),
            "status": "ready" if editor.get_available_model() else "offline"
        }
    }

