import pytest
from app.models.schemas import CareerMode, DiffDecision
from app.core.resume_parser import ResumeParser
from app.core.jd_analyzer import JDAnalyzer
from app.core.matcher import Matcher
from app.core.planner import Planner
from app.core.fact_validator import FactValidator
from app.core.latex_renderer import LatexRenderer
from app.core.compiler_sandbox import CompilerSandbox
from app.core.pdf_validator import PDFValidator
from app.core.report_builder import ReportBuilder

SAMPLE_MASTER_LATEX = r"""
\documentclass[letterpaper,11pt]{article}
\usepackage{titlesec}
\begin{document}
\begin{center}
    \textbf{\Huge \scshape Alex Morgan} \\
    \small 415-555-0198 $|$ \href{mailto:alex.morgan@email.com}{\underline{alex.morgan@email.com}}
\end{center}
\section{Experience}
\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.}
\resumeItem{Spearheaded migration of core billing microservices to Go and PostgreSQL, improving transaction throughput by 3.5x.}
\section{Projects}
\resumeItem{Built a high-throughput, distributed key-value store implementing the Raft consensus algorithm in Rust.}
\end{document}
"""

SAMPLE_STAFF_JD = """
Role: Staff Distributed Systems Engineer
Company: CloudScale Infrastructure
Mandatory / Essential Requirements:
- Deep expertise in distributed caching (Redis) and high concurrency data layers.
- Proven experience with Go or Rust microservices.
- 5+ years experience in Kafka streaming architectures.
"""

def test_full_pipeline_end_to_end():
    # 1. Parse Master LaTeX
    parser = ResumeParser(SAMPLE_MASTER_LATEX)
    parsed = parser.parse()
    assert parsed.contact_name == "Alex Morgan"
    assert parsed.contact_email == "alex.morgan@email.com"
    assert len(parsed.evidence_bank) == 3

    # 2. Analyze JD
    analyzer = JDAnalyzer(SAMPLE_STAFF_JD)
    jd_analysis = analyzer.analyze()
    assert jd_analysis.seniority == "Staff / Principal"
    assert len(jd_analysis.requirements) >= 3

    # 3. Match Requirements against Evidence Bank
    matcher = Matcher(mode=CareerMode.SAME_CAREER)
    matched_reqs = matcher.match(jd_analysis.requirements, parsed.evidence_bank)
    jd_analysis.requirements = matched_reqs

    # Verify that Kafka requirement is marked as MISSING (never fabricated)
    kafka_req = next(r for r in matched_reqs if "kafka" in r.text.lower())
    assert kafka_req.classification.value == "Missing"
    assert kafka_req.matched_evidence_id is None

    # 4. Report Builder Rubric
    rubric = ReportBuilder.calculate_rubric(jd_analysis)
    assert rubric.rubric_score > 0
    assert rubric.missing_count >= 1

    # 5. Plan Diffs
    planner = Planner(mode=CareerMode.SAME_CAREER)
    diffs = planner.plan_diffs(parsed, jd_analysis)
    assert len(diffs) > 0

    # 6. Fact Validator (Non-negotiable rule #2)
    validator = FactValidator(parsed.evidence_bank)
    valid_diffs, rejected = validator.filter_diffs(diffs)
    assert len(valid_diffs) == len(diffs)

    # 7. Simulate User Accept Decision
    for d in valid_diffs:
        d.decision = DiffDecision.ACCEPTED

    # 8. Slot-Only LaTeX Rendering (Non-negotiable rule #4)
    renderer = LatexRenderer(parsed)
    rendered_tex = renderer.render(valid_diffs)
    assert "Alex Morgan" in rendered_tex
    assert "Redis" in rendered_tex

    # 9. Sandbox Compilation (Non-negotiable rule #6)
    sandbox = CompilerSandbox()
    compiles, pdf_bytes, logs = sandbox.compile(rendered_tex)
    assert compiles is True
    assert len(pdf_bytes) > 0

    # 10. PyMuPDF ATS Extraction
    pdf_val = PDFValidator(pdf_bytes, expected_contact={"email": parsed.contact_email})
    audit = pdf_val.validate()
    assert audit.compiles is True
    assert audit.page_count == 1
    assert audit.ats_score_estimate >= 80
