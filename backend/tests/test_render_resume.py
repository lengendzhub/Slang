import json
import pytest
from pathlib import Path
from app.core.render_resume import (
    tex,
    href,
    contact_line,
    render_tex,
    compile_pdf,
    page_count,
    trim_once,
    build
)
from app.api.export_pdf import _trim_tex_bullet, ExportRequest, export_pdf

def test_tex_escaping():
    raw = r"C++ & Python: 50% increase in $revenue #1 _under_ {braces} ~tilde~ ^hat^ -> arrow"
    escaped = tex(raw)
    assert r"\&" in escaped
    assert r"\%" in escaped
    assert r"\$" in escaped
    assert r"\#" in escaped
    assert r"\_" in escaped
    assert r"\{" in escaped
    assert r"\}" in escaped
    assert r"\textasciitilde{}" in escaped
    assert r"\textasciicircum{}" in escaped

def test_contact_line_formatting():
    header = {
        "email": "candidate@example.com",
        "phone": "+1 555 123 4567",
        "location": "San Francisco, CA",
        "links": [
            {"url": "https://linkedin.com/in/test", "label": "linkedin.com/in/test"},
            {"url": "https://github.com/test", "label": "github.com/test"}
        ]
    }
    line = contact_line(header)
    assert r"\href{mailto:candidate@example.com}{candidate@example.com}" in line
    assert "+1 555 123 4567" in line
    assert "San Francisco, CA" in line
    assert r"\href{https://linkedin.com/in/test}{linkedin.com/in/test}" in line
    assert r"\textbar" in line

def test_render_and_compile_sample_resume():
    sample_path = Path("templates/sample_resume.json")
    if not sample_path.exists():
        sample_path = Path("d:/Slang/templates/sample_resume.json")
    data = json.loads(sample_path.read_text(encoding="utf-8"))

    # Render LaTeX
    latex_src = render_tex(data)
    assert r"\documentclass" in latex_src
    assert data["header"]["name"] in latex_src
    assert r"\titlerule\vspace{3pt}" in latex_src  # Fixed spacing, no negative overlap

    # Build and fit
    pages, dropped = build(data, Path("out/test_output"), max_pages=1, fit=True)
    assert pages == 1
    assert (Path("out/test_output/tailored_resume.pdf")).exists()

def test_trim_loop_enforces_one_page():
    sample_path = Path("templates/sample_resume.json")
    if not sample_path.exists():
        sample_path = Path("d:/Slang/templates/sample_resume.json")
    data = json.loads(sample_path.read_text(encoding="utf-8"))

    # Add 25 extra bullets to trigger multi-page overflow
    for i in range(25):
        data["experience"][0]["bullets"].append({
            "text": f"Extra long operational bullet {i+1} describing maintenance of high-throughput distributed microservice architectures across multi-region Kubernetes clusters.",
            "evidence_id": f"ev_extra_{i}"
        })

    pages, dropped = build(data, Path("out/test_trim"), max_pages=1, fit=True)
    assert pages == 1
    assert len(dropped) > 0

@pytest.mark.asyncio
async def test_export_pdf_route_with_fit():
    sample_path = Path("templates/sample_resume.json")
    if not sample_path.exists():
        sample_path = Path("d:/Slang/templates/sample_resume.json")
    data = json.loads(sample_path.read_text(encoding="utf-8"))

    # Test sending structured JSON to export_pdf route
    req = ExportRequest(
        resume_data=data,
        filename="test_candidate",
        max_pages=1,
        enforce=True,
        fit=True
    )
    resp = await export_pdf(req)
    assert resp.status_code == 200
    assert resp.media_type == "application/pdf"
    assert resp.headers["X-Page-Count"] == "1"
    assert len(resp.body) > 1000
