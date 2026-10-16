import sys
from pathlib import Path

# Add backend directory to path so imports work seamlessly
sys.path.insert(0, str(Path(__file__).parent / "backend"))

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

if __name__ == "__main__":
    import argparse
    import json

    ap = argparse.ArgumentParser(description="Render structured resume JSON to clean 1-page LaTeX/PDF")
    ap.add_argument("json_file", help="Path to resume JSON")
    ap.add_argument("-o", "--out", default="out", help="Output directory")
    ap.add_argument("--max-pages", type=int, default=1, help="Max page limit (default: 1)")
    ap.add_argument("--fit", action="store_true", help="Drop lowest-ranked bullets until it fits on max_pages")
    a = ap.parse_args()

    data = json.loads(Path(a.json_file).read_text(encoding="utf-8"))
    pages, dropped = build(data, Path(a.out), a.max_pages, a.fit)
    print(f"OK: {pages} page(s) -> {a.out}/tailored_resume.pdf")
    for d in dropped:
        print("  trimmed", d)
