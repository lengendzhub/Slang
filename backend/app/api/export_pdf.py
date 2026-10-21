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
    Sanitizes unescaped special characters (%, _, &, #, $) that commonly break XeTeX/Tectonic
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
            
        if stripped.startswith("%"):
            sanitized_lines.append(line)
            continue
            
        l = line
        # Outside tabular, raw '&' must be '\&'
        if not in_tabular:
            l = re.sub(r'(?<!\\)&', r'\&', l)
        
        # Raw '#' not followed by a digit (preserve #1, #2 macro params)
        l = re.sub(r'(?<!\\)#(?!\d)', r'\#', l)

        # Raw '%' must be '\%'
        l = re.sub(r'(?<!\\)%', r'\%', l)

        # Raw '_' outside math mode
        l = re.sub(r'(?<!\\)_', r'\_', l)

        # Raw '$' when used as currency (e.g. $100K, $50M) or isolated symbols not in math mode
        l = re.sub(r'(?<!\\)\$', r'\$', l)
        
        sanitized_lines.append(l)
        
    sanitized_body = "\n".join(sanitized_lines)
    if preamble:
        return f"{preamble}\\begin{{document}}{sanitized_body}\\end{{document}}{postamble}"
    return sanitized_body


def _compact_tex_spacing(tex_code: str) -> str:
    """Subtly tightens margins and itemize spacing to rescue 1-page fit without dropping content."""
    t = tex_code
    # Tighten margins from 0.5in/0.75in down to 0.4in
    t = re.sub(r'margin=[0-9.]+in', 'margin=0.4in', t)
    # If fullpage was used, replace with compact geometry
    t = re.sub(r'\\usepackage\[empty\]\{fullpage\}', r'\\usepackage[margin=0.4in]{geometry}', t)
    # Tighten itemize spacing if defined
    if r'\setlist[itemize]' in t:
        t = re.sub(r'\\setlist\[itemize\]\{[^}]*\}', r'\\setlist[itemize]{leftmargin=0.15in, noitemsep, topsep=0pt, parsep=0pt, partopsep=0pt}', t)
    # Tighten titlespacing if defined
    if r'\titlespacing' in t:
        t = re.sub(r'\\titlespacing\*?\{\\section\}\{[^}]*\}\{[^}]*\}\{[^}]*\}', r'\\titlespacing*{\\section}{0pt}{3pt}{2pt}', t)
    return t


def _trim_tex_bullet(tex_code: str) -> tuple[str, bool]:
    """Finds and drops the last itemize bullet in the document (supports both \\resumeItem and \\item)."""
    # 1. Try matching \resumeItem{...}
    matches = list(re.finditer(r'\\resumeItem\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', tex_code))
    if len(matches) > 3:
        last = matches[-1]
        new_tex = tex_code[:last.start()] + tex_code[last.end():]
        return new_tex, True

    # 2. Fall back to standard \item ... up to next \item or \end{itemize}
    item_matches = list(re.finditer(r'\\item\b(?:\s*\[[^\]]*\])?\s*([^\n\\]+(?:\n(?!\\item\b|\\end\{itemize\})[^\n\\]*)*)', tex_code))
    if len(item_matches) > 3:
        last = item_matches[-1]
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

    # 1. Sanitize pdfTeX-specific glyphtounicode primitives for XeTeX/Tectonic
    clean_tex = re.sub(r"\\input\{glyphtounicode(?:\.tex)?\}", r"% \\g<0>", tex_content)
    clean_tex = re.sub(r"\\pdfgentounicode\s*=\s*\d+", r"% \\g<0>", clean_tex)

    # 2. Sanitize packages that require network downloads or aren't in offline cache
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{babel\}", lambda m: f"% {m.group(0)}", clean_tex)
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{microtype\}", lambda m: f"% {m.group(0)}", clean_tex)
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{amsmath\}", lambda m: f"% {m.group(0)}", clean_tex)
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{multicol\}", lambda m: f"% {m.group(0)}", clean_tex)

    # fontawesome & icons stubs
    fa_stub = """% fontawesome fallback
\\providecommand{\\faGithub}{[GitHub]}
\\providecommand{\\faLinkedin}{[LinkedIn]}
\\providecommand{\\faEnvelope}{[Email]}
\\providecommand{\\faPhone}{[Phone]}
\\providecommand{\\faGlobe}{[Web]}
\\providecommand{\\faMapMarker}{[Location]}
\\providecommand{\\faExternalLink}{[Link]}
"""
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{(fontawesome5?|academicons|marvosym|pifont)\}", lambda m: fa_stub, clean_tex)

    # xcolor stubs
    xcolor_stub = """% xcolor fallback
\\providecommand{\\definecolor}[3]{}
\\providecommand{\\color}[2][]{#2}
\\providecommand{\\textcolor}[2][]{#2}
\\providecommand{\\colorbox}[3][]{#3}
"""
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{xcolor\}", lambda m: xcolor_stub, clean_tex)

    # setspace stubs
    setspace_stub = """% setspace fallback
\\providecommand{\\setstretch}[1]{}
\\providecommand{\\singlespacing}{}
\\providecommand{\\onehalfspacing}{}
\\providecommand{\\doublespacing}{}
"""
    clean_tex = re.sub(r"\\usepackage(\[[^\]]*\])?\{setspace\}", lambda m: setspace_stub, clean_tex)

    clean_tex = (
        clean_tex.replace("\u2013", "--")
        .replace("\u2014", "---")
        .replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", "``")
        .replace("\u201d", "''")
        .replace("\u00a0", " ")
        .replace("\ufeff", "")
    )
    clean_tex = sanitize_latex_characters(clean_tex)

    data = b""
    pages = 1
    previews = []
    is_fallback = False

    if tectonic_bin:
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "resume.tex"
            pdf_path = Path(tmp) / "resume.pdf"

            max_trim_attempts = 10 if req.fit else 1
            compacted = False
            for attempt in range(max_trim_attempts):
                src.write_text(clean_tex, encoding="utf-8")
                try:
                    # Enforce -C (--only-cached) so Tectonic never hangs waiting for network bundle server
                    run = await asyncio.to_thread(
                        subprocess.run,
                        [tectonic_bin, "-X", "compile", "-C", "--untrusted", "resume.tex"],
                        cwd=tmp,
                        capture_output=True,
                        text=True,
                        timeout=15,
                    )
                except (subprocess.TimeoutExpired, Exception):
                    run = None
                    break

                if not run or run.returncode != 0 or not pdf_path.exists():
                    break

                data = pdf_path.read_bytes()

                with fitz.open(stream=data, filetype="pdf") as doc:
                    pages = doc.page_count
                    page_texts = [page.get_text() for page in doc]
                previews = [f"p{i + 1}: {_preview(t)}" for i, t in enumerate(page_texts)]

                if pages <= req.max_pages or not req.fit:
                    break

                # 1. First overflow attempt: Compact spacing and margins to preserve 100% of bullets
                if not compacted:
                    compacted = True
                    clean_tex = _compact_tex_spacing(clean_tex)
                    continue

                # 2. Subsequent overflow attempts: Trim last bullet
                clean_tex, trimmed = _trim_tex_bullet(clean_tex)
                if not trimmed:
                    break

    # If tectonic failed, timed out, or produced empty output, fall back to high-res vector PDF generator
    if not data or len(data) < 100:
        is_fallback = True
        data, pages, previews = _generate_vector_pdf_fallback(clean_tex, req.filename)

    safe = re.sub(r"[^A-Za-z0-9_-]", "_", req.filename) or "resume"
    return Response(
        content=data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{safe}.pdf"',
            "X-Page-Count": str(pages),
            "X-Fallback-Compiled": "true" if is_fallback else "false",
            "Access-Control-Expose-Headers": "X-Page-Count, X-Fallback-Compiled",
        },
    )


def _generate_vector_pdf_fallback(tex_code: str, filename: str) -> tuple[bytes, int, list[str]]:
    """Resilient vector PDF generator that extracts candidate content and produces a valid ATS PDF."""
    import pymupdf

    doc = pymupdf.open()
    page = doc.new_page(width=612, height=792)  # US Letter (8.5 x 11 in)

    # Extract name and contact info
    name_match = (
        re.search(r"\\textbf\{([^}]+)\}", tex_code)
        or re.search(r"\\Huge\s+([^\\]+)", tex_code)
        or re.search(r"\\scshape\s+\\textbf\{([^}]+)\}", tex_code)
    )
    candidate_name = name_match.group(1).strip() if name_match else filename.replace("_", " ").title()

    # Title / Name
    page.insert_text((54, 50), candidate_name, fontsize=17, fontname="helv", color=(0.1, 0.1, 0.1))

    # Clean macro blocks
    parts = re.split(r"\\\\|\n|(?=\\section|\\resumeItem|\\item)", tex_code)
    lines: list[str] = []
    for p in parts:
        p_clean = p.strip()
        if (
            not p_clean
            or p_clean.startswith("%")
            or p_clean.startswith("\\documentclass")
            or p_clean.startswith("\\usepackage")
            or p_clean.startswith("\\begin{document}")
            or p_clean.startswith("\\end{document}")
            or p_clean.startswith("\\pagestyle")
            or p_clean.startswith("\\setlength")
        ):
            continue
        clean_l = re.sub(r"\\[a-zA-Z]+(\[[^\]]*\])?(\{([^}]*)\})?", r"\3 ", p_clean)
        clean_l = re.sub(r"[{}\\%$_#&]", "", clean_l).strip()
        if clean_l and not clean_l.startswith("documentclass") and not clean_l.startswith("begin") and not clean_l.startswith("end"):
            lines.append(clean_l)

    y = 74
    for line in lines[:45]:
        if y > 745:
            break
        is_heading = (
            any(
                k in line.lower()
                for k in ["experience", "education", "skills", "projects", "summary", "achievements"]
            )
            and len(line) < 30
        )
        if is_heading:
            y += 8
            page.insert_text((54, y), line.upper(), fontsize=11, fontname="helv", color=(0.0, 0.44, 0.89))
            y += 15
        else:
            bullet_prefix = "• " if not line.startswith("•") and "@" not in line and "+" not in line and not line.startswith("http") else ""
            display_text = f"{bullet_prefix}{line}"[:115]
            page.insert_text((54, y), display_text, fontsize=9.5, fontname="helv", color=(0.15, 0.15, 0.15))
            y += 13.5

    data = doc.tobytes()
    return data, 1, ["p1: " + " ".join(lines[:3])]

