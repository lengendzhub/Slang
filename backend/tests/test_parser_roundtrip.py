import os
import pytest
from app.core.resume_parser import ResumeParser

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

SAMPLE_LATEX = r"""
\documentclass[letterpaper,11pt]{article}
\usepackage{titlesec}
\begin{document}
\section{Experience}
\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.}
\resumeItem{Spearheaded migration of core billing microservices to Go and PostgreSQL, improving transaction throughput by 3.5x.}
\section{Projects}
\resumeItem{Built a high-throughput, distributed key-value store implementing the Raft consensus algorithm in Rust.}
\end{document}
"""

def test_parser_extracts_sections_and_evidence():
    parser = ResumeParser(SAMPLE_LATEX)
    parsed = parser.parse()

    assert len(parsed.sections) == 2
    assert parsed.sections[0].title == "Experience"
    assert parsed.sections[1].title == "Projects"

    # Verify evidence records created
    assert len(parsed.evidence_bank) == 3
    for ev in parsed.evidence_bank:
        assert ev.id.startswith("ev_sec_")
        assert ev.verified is True
        assert ev.status == "extracted"

def test_round_trip_integrity_sample():
    parser = ResumeParser(SAMPLE_LATEX)
    parsed = parser.parse()
    is_valid = ResumeParser.verify_round_trip(SAMPLE_LATEX, parsed)
    assert is_valid is True

def test_round_trip_jakes_resume():
    jakes_path = os.path.join(TEMPLATE_DIR, "jakes_resume.tex")
    assert os.path.exists(jakes_path)
    with open(jakes_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = ResumeParser(content)
    parsed = parser.parse()

    assert len(parsed.sections) >= 3
    assert len(parsed.evidence_bank) >= 5
    assert parsed.parse_confidence >= 0.70
    assert parsed.requires_section_mapping is False
    assert ResumeParser.verify_round_trip(content, parsed) is True

def test_round_trip_deedy_resume():
    deedy_path = os.path.join(TEMPLATE_DIR, "deedy_resume.tex")
    assert os.path.exists(deedy_path)
    with open(deedy_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = ResumeParser(content)
    parsed = parser.parse()

    assert len(parsed.sections) >= 3
    assert len(parsed.evidence_bank) >= 4
    assert parsed.parse_confidence >= 0.70
    assert parsed.requires_section_mapping is False
    assert ResumeParser.verify_round_trip(content, parsed) is True

def test_round_trip_classic_resume():
    classic_path = os.path.join(TEMPLATE_DIR, "classic_resume.tex")
    assert os.path.exists(classic_path)
    with open(classic_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = ResumeParser(content)
    parsed = parser.parse()

    assert len(parsed.sections) >= 3
    assert len(parsed.evidence_bank) >= 4
    assert parsed.parse_confidence >= 0.70
    assert parsed.requires_section_mapping is False
    assert ResumeParser.verify_round_trip(content, parsed) is True

def test_low_confidence_fallback():
    # Malformed LaTeX without clear sections or items
    poor_latex = r"""\documentclass{article}\begin{document}Just some unstructured text without sections.\end{document}"""
    parser = ResumeParser(poor_latex)
    parsed = parser.parse()
    assert parsed.parse_confidence < 0.70
    assert parsed.requires_section_mapping is True
