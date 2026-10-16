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
import shutil
from pathlib import Path

import fitz  # PyMuPDF
from typing import Optional, Dict, Any
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
    tex: Optional[str] = None
    resume_data: Optional[dict] = None
    filename: str = "tailored_resume"
    max_pages: int = 1
    enforce: bool = True  # False for previews: return the PDF and report pages in X-Page-Count
    fit: bool = True      # Auto-trim lowest-priority bullets to fit max_pages


def _fail(status: int, code: str, message: str, log: str = "", pages=None):
    raise HTTPException(
        status, {"error": code, "message": message, "log": log, "pages": pages or []}
    )


def _preview(text: str, n: int = 110) -> str:
    return " ".join(text.split())[:n]


def sanitize_latex_characters(tex_code: str) -> str:
    r"""
    Sanitizes unescaped special characters (&, #) that commonly break XeTeX/Tectonic
    when user resumes or pasted text contains raw symbols outside tabular environments.
    Only operates within \begin{document}...\end{document} to prevent corrupting
    macro definitions (like \newcommand{\resumeItem}[1]{...}) in the preamble,
    and preserves macro parameter tokens (#1, #2, etc.).
    """
    if r"\begin{document}" in tex_code:
        preamble, rest = tex_code.split(r"\begin{document}", 1)
        if r"\end{document}" in rest:
            body, postamble = rest.split(r"\end{document}", 1)
        else:
            body, postamble = rest, ""
    else:
        preamble = ""
        body = tex_code
        postamble = ""

    lines = body.split("\n")
    in_tabular = False
    sanitized_lines = []
    
    for line in lines:
        stripped = line.strip()
        if r"\begin{tabular" in stripped:
            in_tabular = True
            sanitized_lines.append(line)
            continue
        if r"\end{tabular" in stripped:
            in_tabular = False
            sanitized_lines.append(line)
            continue
            
        if in_tabular or stripped.startswith("%"):
            sanitized_lines.append(line)
            continue
            
        # Outside tabular, raw '&' must be '\&'
        l = re.sub(r'(?<!\\)&', r'\&', line)
        # Raw '#' not followed by a digit (so we don't break macro parameter tokens like #1) must be '\#'
        l = re.sub(r'(?<!\\)#(?!\d)', r'\#', l)
        
        sanitized_lines.append(l)
        
    sanitized_body = "\n".join(sanitized_lines)
    if preamble:
        return f"{preamble}\\begin{{document}}{sanitized_body}\\end{{document}}{postamble}"
    return sanitized_body


def _trim_tex_bullet(tex_code: str) -> tuple[str, bool]:
    """Finds and drops the last itemize bullet in the document."""
    matches = list(re.finditer(r'\\resumeItem\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', tex_code))
    if len(matches) > 3:
        last = matches[-1]
        new_tex = tex_code[:last.start()] + tex_code[last.end():]
        return new_tex, True
    return tex_code, False


@router.post("/exports/pdf")
async def export_pdf(req: ExportRequest):
    tex_content = req.tex

    # If structured resume JSON was provided, render via Jinja2 template
    if not tex_content and req.resume_data:
        from app.core.render_resume import render_tex
        tex_content = render_tex(req.resume_data)

    if not tex_content:
        _fail(400, "missing_content", "Either 'tex' string or 'resume_data' JSON must be provided.")

    if BLOCKED.search(tex_content):
        _fail(400, "blocked_command", "The LaTeX contains a command that is not allowed.")

    # Locate tectonic executable
    local_tectonic = Path("d:/Slang/backend/bin/tectonic.exe")
    tectonic_bin = shutil.which("tectonic") or (str(local_tectonic) if local_tectonic.exists() else None)
    if not tectonic_bin:
        _fail(500, "tectonic_missing", "Tectonic typesetting binary is not available.")

    # Sanitize pdfTeX-specific glyphtounicode primitives for XeTeX/Tectonic
    clean_tex = re.sub(r"\\input\{glyphtounicode(?:\.tex)?\}", r"% \\g<0>", tex_content)
    clean_tex = re.sub(r"\\pdfgentounicode\s*=\s*\d+", r"% \\g<0>", clean_tex)
    clean_tex = sanitize_latex_characters(clean_tex)

    data = b""
    pages = 1
    previews = []

    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "resume.tex"
        pdf_path = Path(tmp) / "resume.pdf"

        max_trim_attempts = 10 if (req.enforce and req.fit) else 1
        for attempt in range(max_trim_attempts):
            src.write_text(clean_tex, encoding="utf-8")
            try:
                run = await asyncio.to_thread(
                    subprocess.run,
                    [tectonic_bin, "-X", "compile", "--untrusted", "resume.tex"],
                    cwd=tmp,
                    capture_output=True,
                    text=True,
                    timeout=90,
                )
            except subprocess.TimeoutExpired:
                _fail(504, "compile_timeout", "LaTeX compilation took too long.")

            if run.returncode != 0 or not pdf_path.exists():
                err_log = run.stderr[-2000:]
                _fail(422, "latex_compile_failed", f"LaTeX did not compile: {run.stderr[-400:]}", err_log)

            data = pdf_path.read_bytes()

            with fitz.open(stream=data, filetype="pdf") as doc:
                pages = doc.page_count
                page_texts = [page.get_text() for page in doc]
            previews = [f"p{i + 1}: {_preview(t)}" for i, t in enumerate(page_texts)]

            if pages <= req.max_pages or not (req.enforce and req.fit):
                break

            # Trim one bullet from the bottom and recompile
            clean_tex, trimmed = _trim_tex_bullet(clean_tex)
            if not trimmed:
                break

    text = "".join(page_texts)
    if pages > req.max_pages and req.enforce:
        _fail(
            422,
            "too_many_pages",
            f"Resume is {pages} pages; the limit is {req.max_pages}. " + " | ".join(previews),
            pages=previews,
        )
    if len(text.strip()) < 30:
        _fail(422, "empty_pdf", "The PDF has almost no extractable text.")

    safe = re.sub(r"[^A-Za-z0-9_-]", "_", req.filename) or "resume"
    return Response(
        content=data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe}.pdf"',
            "X-Page-Count": str(pages),
            "Access-Control-Expose-Headers": "X-Page-Count",
        },
    )
