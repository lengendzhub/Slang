import pytest
import pymupdf
from app.core.pdf_extractor import PDFResumeExtractor

def create_sample_pdf() -> bytes:
    doc = pymupdf.open()
    page = doc.new_page(width=612, height=792)
    sample_text = """John Doe
john.doe@example.com | 555-123-4567

Experience
Senior Backend Engineer, Acme Corp (2022 - Present)
• Built low-latency distributed APIs handling 5M daily queries.
• Reduced cloud infrastructure spend by 30% via query optimization.

Education
B.S. in Computer Science, University of California (2018 - 2022)

Skills
Python, Go, Docker, Kubernetes, PostgreSQL, Redis
"""
    page.insert_text((54, 72), sample_text, fontsize=11)
    return doc.tobytes()

def test_pdf_resume_extraction():
    pdf_bytes = create_sample_pdf()
    extractor = PDFResumeExtractor(pdf_bytes)
    parsed = extractor.extract()

    # Contact details
    assert parsed.contact_name == "John Doe"
    assert parsed.contact_email == "john.doe@example.com"
    assert "555-123-4567" in parsed.contact_phone

    # Sections & Evidence
    assert len(parsed.sections) >= 2
    assert len(parsed.evidence_bank) >= 2

    # Verify bullet text
    bullet_texts = [b.text for s in parsed.sections for b in s.bullets]
    assert any("low-latency distributed APIs" in t for t in bullet_texts)

    # Verify compiling LaTeX was generated
    assert "\\documentclass" in parsed.raw_latex
    assert "John Doe" in parsed.raw_latex
