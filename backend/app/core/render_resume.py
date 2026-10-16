"""Render structured resume JSON into clean one-page LaTeX, compile, and (optionally) fit to N pages.

    python render_resume.py sample_resume.json -o out --fit

The LLM never writes LaTeX. It returns JSON; this file escapes every value and fills the template.
Requires: pip install jinja2 pymupdf. Compiling needs tectonic or pdflatex on PATH.
"""
import argparse
import copy
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

HERE = Path(__file__).resolve().parent

# Support multiple locations for templates
TEMPLATE_SEARCH_DIRS = [
    HERE,
    HERE / "templates",
    HERE.parent / "templates",
    HERE.parent.parent.parent / "templates",
    Path("d:/Slang/templates"),
]

_TEX = {
    "\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
    "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
    "\u00a0": "~", "\u2192": r"$\rightarrow$", "\u2022": r"\textbullet{}",
    "\u200b": "", "\u2060": "", "\ufeff": "",
}


def tex(value) -> str:
    """Escape text for LaTeX. Use on every value that comes from the user or the LLM."""
    if value is None:
        return ""
    return "".join(_TEX.get(c, c) for c in str(value))


def href(url: str, label: str) -> str:
    safe = url.replace("%", r"\%").replace("#", r"\#")
    return rf"\href{{{safe}}}{{{tex(label)}}}"


def contact_line(h: dict) -> str:
    parts = []
    if h.get("email"):
        parts.append(href("mailto:" + h["email"], h["email"]))
    if h.get("phone"):
        parts.append(tex(h["phone"]))
    if h.get("location"):
        parts.append(tex(h["location"]))
    for link in h.get("links", []):
        url = link["url"] if re.match(r"https?://", link["url"]) else "https://" + link["url"]
        parts.append(href(url, link.get("label") or link["url"]))
    return r" \textbar\ ".join(parts)


def _env() -> Environment:
    search_paths = [str(p) for p in TEMPLATE_SEARCH_DIRS if p.exists()]
    env = Environment(
        loader=FileSystemLoader(search_paths),
        block_start_string=r"\BLOCK{", block_end_string="}",
        variable_start_string=r"\VAR{", variable_end_string="}",
        comment_start_string=r"\#{", comment_end_string="}",
        trim_blocks=True, lstrip_blocks=True, autoescape=False, keep_trailing_newline=True,
    )
    env.filters["tex"] = tex
    return env


def render_tex(data: dict) -> str:
    d = copy.deepcopy(data)
    d["header"]["contact_line"] = contact_line(d["header"])
    return _env().get_template("resume_template.tex.j2").render(**d)


# ---------- compile + fit ----------

def _find_tectonic() -> str | None:
    candidate_paths = [
        shutil.which("tectonic"),
        str(Path("d:/Slang/backend/bin/tectonic.exe")),
        str(HERE.parent.parent / "bin" / "tectonic.exe"),
    ]
    for p in candidate_paths:
        if p and Path(p).exists():
            return str(p)
    return None


def compile_pdf(tex_src: str, workdir: Path) -> tuple[Path, int]:
    workdir.mkdir(parents=True, exist_ok=True)
    (workdir / "resume.tex").write_text(tex_src, encoding="utf-8")
    
    tectonic_bin = _find_tectonic()
    if tectonic_bin:
        cmd = [tectonic_bin, "-X", "compile", "--untrusted", "resume.tex"]
    else:
        cmd = ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "-no-shell-escape", "resume.tex"]
        
    run = subprocess.run(cmd, cwd=workdir, capture_output=True, text=True, timeout=60)
    pdf = workdir / "resume.pdf"
    if run.returncode != 0 or not pdf.exists():
        raise RuntimeError("LaTeX failed:\n" + (run.stdout + run.stderr)[-1500:])
    return pdf, page_count(pdf)


def page_count(pdf: Path) -> int:
    try:
        import pymupdf
        with pymupdf.open(pdf) as doc:
            return doc.page_count
    except ImportError:
        try:
            import fitz
            with fitz.open(pdf) as doc:
                return doc.page_count
        except ImportError:
            out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
            return int(re.search(r"Pages:\s+(\d+)", out).group(1))


def trim_once(d: dict) -> str | None:
    """Drop the lowest-ranked item. Bullets must be ordered best-first, so the last one goes first."""
    entries = [e for sec in ("experience", "projects") for e in d.get(sec, []) if len(e.get("bullets", [])) > 1]
    if entries:
        target = max(reversed(entries), key=lambda e: len(e["bullets"]))
        removed = target["bullets"].pop()
        return f"bullet: {removed['text'][:60]}"
    for key in ("other_projects", "achievements"):
        if d.get(key):
            return f"{key}: {d[key].pop()}"
    return None


def build(data: dict, outdir: Path, max_pages: int = 1, fit: bool = True) -> tuple[int, list]:
    data = copy.deepcopy(data)
    dropped = []
    while True:
        src = render_tex(data)
        with tempfile.TemporaryDirectory() as tmp:
            pdf, pages = compile_pdf(src, Path(tmp))
            if pages <= max_pages or not fit:
                outdir.mkdir(parents=True, exist_ok=True)
                (outdir / "tailored_resume.tex").write_text(src, encoding="utf-8")
                shutil.copy(pdf, outdir / "tailored_resume.pdf")
                return pages, dropped
        removed = trim_once(data)
        if removed is None:
            raise RuntimeError(f"Cannot fit into {max_pages} page(s); nothing left to trim.")
        dropped.append(removed)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("json_file")
    ap.add_argument("-o", "--out", default="out")
    ap.add_argument("--max-pages", type=int, default=1)
    ap.add_argument("--fit", action="store_true", help="drop lowest-ranked bullets until it fits")
    a = ap.parse_args()
    pages, dropped = build(json.loads(Path(a.json_file).read_text(encoding="utf-8")), Path(a.out), a.max_pages, a.fit)
    print(f"OK: {pages} page(s) -> {a.out}/tailored_resume.pdf")
    for d in dropped:
        print("  trimmed", d)
