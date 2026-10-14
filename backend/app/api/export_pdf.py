"""FastAPI route: compile the tailored .tex to a real PDF (not a browser print).

Needs: tectonic on PATH (https://tectonic-typesetting.github.io), PyMuPDF (pip install pymupdf).
Pre-warm Tectonic's package cache once (compile any sample file) so production
runs do not need network access.
Wire up with: app.include_router(router)
"""
import asyncio
import re
import subprocess
import tempfile
import os
import shutil
from pathlib import Path

import fitz  # PyMuPDF
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

router = APIRouter()

# File access / shell commands are never needed in a resume.
# \input{glyphtounicode} is allowed because many resume templates use it.
BLOCKED = re.compile(
    r"\\(?:write18|openin|openout|write|read|immediate)\b"
    r"|\\(?:input|include)\b(?!\s*\{glyphtounicode\})"
)


class ExportRequest(BaseModel):
    tex: str
    filename: str = "tailored_resume"
    max_pages: int = 1


def _fail(status: int, code: str, message: str, log: str = ""):
    raise HTTPException(status, {"error": code, "message": message, "log": log})


@router.post("/exports/pdf")
async def export_pdf(req: ExportRequest):
    if BLOCKED.search(req.tex):
        _fail(400, "blocked_command", "The LaTeX contains a command that is not allowed.")

    # Locate tectonic executable
    local_tectonic = Path("d:/Slang/backend/bin/tectonic.exe")
    tectonic_bin = shutil.which("tectonic") or (str(local_tectonic) if local_tectonic.exists() else None)
    if not tectonic_bin:
        _fail(500, "tectonic_missing", "Tectonic typesetting binary is not available.")

    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "resume.tex"
        # Sanitize pdfTeX-specific glyphtounicode primitives for XeTeX/Tectonic
        clean_tex = re.sub(r"\\input\{glyphtounicode(?:\.tex)?\}", r"% \\g<0>", req.tex)
        clean_tex = re.sub(r"\\pdfgentounicode\s*=\s*\d+", r"% \\g<0>", clean_tex)
        src.write_text(clean_tex, encoding="utf-8")
        try:
            run = await asyncio.to_thread(
                subprocess.run,
                [tectonic_bin, "-X", "compile", "--untrusted", "resume.tex"],
                cwd=tmp,
                capture_output=True,
                text=True,
                timeout=45,
            )
        except subprocess.TimeoutExpired:
            _fail(504, "compile_timeout", "LaTeX compilation took too long.")

        pdf_path = Path(tmp) / "resume.pdf"
        if run.returncode != 0 or not pdf_path.exists():
            print("\n" + "="*50)
            print("TECTONIC COMPILE FAILED! Return code:", run.returncode)
            print("STDERR:\n", run.stderr)
            print("STDOUT:\n", run.stdout)
            print("CLEAN TEX:\n", clean_tex)
            print("="*50 + "\n")
            _fail(422, "latex_compile_failed", f"LaTeX did not compile: {run.stderr[-400:]}", run.stderr[-2000:])
        data = pdf_path.read_bytes()

    with fitz.open(stream=data, filetype="pdf") as doc:
        pages = doc.page_count
        text = "".join(page.get_text() for page in doc)

    if pages > req.max_pages:
        _fail(422, "too_many_pages", f"Resume is {pages} pages; the limit is {req.max_pages}.")
    if len(text.strip()) < 30:
        _fail(422, "empty_pdf", "The PDF has almost no extractable text.")

    safe = re.sub(r"[^A-Za-z0-9_-]", "_", req.filename) or "resume"
    return Response(
        content=data,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe}.pdf"'},
    )
