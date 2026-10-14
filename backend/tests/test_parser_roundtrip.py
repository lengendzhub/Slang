import pytest
from app.core.resume_parser import ResumeParser

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

def test_round_trip_integrity():
    parser = ResumeParser(SAMPLE_LATEX)
    parsed = parser.parse()
    is_valid = ResumeParser.verify_round_trip(SAMPLE_LATEX, parsed)
    assert is_valid is True
