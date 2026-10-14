import pytest
from app.models.schemas import CareerMode
from app.core.resume_parser import ResumeParser
from app.core.jd_analyzer import JDAnalyzer
from app.core.planner import Planner

def test_length_budget_enforcement():
    sample_latex = r"""
\documentclass{article}
\begin{document}
\section{Experience}
\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.}
\end{document}
"""
    sample_jd = """
Role: Staff Distributed Systems Engineer
Mandatory Requirements:
- Deep expertise in distributed caching with Redis and high scale latency optimization.
"""
    parser = ResumeParser(sample_latex)
    parsed = parser.parse()

    analyzer = JDAnalyzer(sample_jd)
    jd_analysis = analyzer.analyze()

    planner = Planner(mode=CareerMode.SAME_CAREER)
    diffs = planner.plan_diffs(parsed, jd_analysis)

    assert len(diffs) > 0
    diff = diffs[0]
    # Length budget check: should fit within budget
    assert diff.fits_budget is True
    # Character expansion should not exceed budget allowance
    assert diff.new_length <= diff.original_length + 30
