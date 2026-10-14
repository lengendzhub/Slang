# TailorAI — Precision LaTeX Resume Tailoring Engine

> **One master resume in LaTeX becomes many truthful, job-specific resumes.**
> Designed with Apple-inspired visual restraint, verified evidence anchoring, locked-down sandboxing, and zero hallucinations.

---

## 1. Non-Negotiable Architectural Rules

1. **Never create a resume from scratch:** Parse the master into structured data and only select, reorder, and re-phrase what already exists.
2. **Mandatory Evidence ID:** Every generated claim must carry an `evidence_id` that points to the master resume or a user-confirmed evidence record. Any claim without one is rejected by the Fact Validator.
3. **Tri-State Classification:** Every JD requirement is classified as **Direct**, **Transferable**, or **Missing**. Missing requirements are isolated in your report and *never* written into the resume.
4. **Content-Slot Only Editing:** Edit only text inside recognized content slots (`\resumeItem`, `\item`). Preamble, macros, spacing, and fonts remain untouched.
5. **Human Verification Gateway:** Nothing is exported until the user has accepted, rejected, or edited each change.
6. **Compile Sandbox:** Compile user LaTeX only inside a locked-down container (no network, shell escape off, read-only root, memory/CPU limits).
7. **Documented Rubric Fit:** Transparent evidence-coverage score. Never presented as a shortlist probability or fake ATS percentage.

---

## 2. Repository Structure

```text
d:/Slang/
├── frontend/                          # Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx               # Apple-style Landing Page (all 10 sections)
│   │   │   ├── studio/page.tsx        # Step 1: Upload, Step 2: JD & Track, Step 3: Stream
│   │   │   ├── report/page.tsx        # Fit Estimate & JD Rubric breakdown
│   │   │   ├── diff/page.tsx          # Git-style side-by-side review & evidence popover
│   │   │   ├── export/page.tsx        # ATS PyMuPDF checklist & deliverable download
│   │   │   ├── siblings/page.tsx      # Master & tailored child resumes tree
│   │   │   ├── evidence/page.tsx      # Evidence Bank manager & external sources
│   │   │   ├── settings/page.tsx      # Privacy, export all data, permanent purge
│   │   │   ├── (auth)/signin/page.tsx # Sign In
│   │   │   ├── (auth)/signup/page.tsx # Sign Up
│   │   │   ├── layout.tsx             # Root layout with Inter font
│   │   │   └── globals.css            # Apple design tokens, typography, glassmorphism
│   │   ├── components/
│   │   │   ├── landing/               # Hero, ValueProps, StickyHowItWorks, RoleSwitcherDemo, TrustSection, LatexToPdfAnimation, SiblingsSection, InterviewPrepTeaser, FaqSection, FinalCta, Footer
│   │   │   └── ui/                    # SegmentedControl, PillButton, ProgressRing, EvidenceChip, FrostedNav
│   │   └── lib/                       # sample-data.ts, store.ts
├── backend/                           # Python FastAPI Service
│   ├── app/
│   │   ├── main.py                    # REST API & SSE event streaming
│   │   ├── core/
│   │   │   ├── resume_parser.py       # AST/slot extraction & round-trip verification
│   │   │   ├── jd_analyzer.py         # Category classifier & seniority detection
│   │   │   ├── matcher.py             # Direct, Transferable, Missing classifier
│   │   │   ├── planner.py             # Length-budgeted bullet selector & auto-trimmer
│   │   │   ├── fact_validator.py      # Strict evidence_id validator (Rule #2)
│   │   │   ├── latex_renderer.py      # Slot-only renderer preserving macros & preamble
│   │   │   ├── compiler_sandbox.py    # Sandboxed runner & command sanitizer
│   │   │   ├── pdf_validator.py       # PyMuPDF reading order & ATS integrity check
│   │   │   └── report_builder.py      # Rubric-based fit estimator & gap report
│   │   └── models/schemas.py          # Pydantic schemas
│   ├── sandbox/
│   │   └── Dockerfile                 # Locked-down Tectonic container (read-only, net=none)
│   ├── tests/
│   │   ├── test_parser_roundtrip.py   # Round-trip parse/re-render equality check
│   │   ├── test_fact_validator.py     # Unanchored claim rejection verification
│   │   ├── test_length_budget.py      # Character/length budget overflow verification
│   │   └── test_end_to_end.py         # Full pipeline integration test
│   └── requirements.txt
├── templates/                         # Jake's Resume master & sample JDs
│   ├── jakes_resume.tex
│   └── sample_jds/
│       ├── software_engineer.txt
│       └── product_manager.txt
├── pytest.ini                         # Pytest configuration
└── README.md
```

---

## 3. Quickstart & Local Setup

### Prerequisites
* **Node.js**: v18+ (tested on v24.21.0)
* **Python**: 3.10+ (tested on 3.11.9)
* **Docker** (optional for local dev; mandatory for production compilation sandbox)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:3000`.

To build the production bundle:
```bash
npm run build
```

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs are available at `http://localhost:8000/docs`.

---

## 4. Environment Variables (`.env.example`)

Create a `.env` file in `backend/`:

```env
# Server
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]

# Sandbox Security
USE_DOCKER_SANDBOX=false
TECTONIC_MEMORY_LIMIT=256MB
TECTONIC_TIMEOUT_SECONDS=8

# Optional LLM Integration (Uses deterministic local validator by default)
OPENAI_API_KEY=""
GEMINI_API_KEY=""
ANTHROPIC_API_KEY=""
```

---

## 5. Running the Test Suite

All tests enforce the core quality invariants:

```bash
# Run all backend tests
python -m pytest
```

### Automated Test Coverage
1. `test_parser_roundtrip.py`: Verifies that parsing and re-rendering an unmodified master resume preserves the document byte-for-byte.
2. `test_fact_validator.py`: Verifies that any proposed bullet without an `evidence_id` or pointing to a non-existent anchor is rejected immediately.
3. `test_length_budget.py`: Verifies that bullet character counts are budget-constrained to prevent page overflows.
4. `test_end_to_end.py`: Tests the full pipeline from raw master `.tex` and JD input through matching, planning, fact validation, slot rendering, sandbox compiling, and PyMuPDF ATS extraction.

---

## 6. Docker Sandbox Compilation (Production)

To build the locked-down container:
```bash
docker build -t tailorai-sandbox -f backend/sandbox/Dockerfile .
```

To run a compilation in isolation:
```bash
docker run --rm \
  --network none \
  --read-only \
  --memory 256m \
  --cpus 1.0 \
  -v /path/to/input:/sandbox/input:ro \
  -v /path/to/output:/sandbox/output:rw \
  tailorai-sandbox /sandbox/input/resume.tex
```

---

## 7. The Tri-State Truth Matrix

| Status | Color | Visual Icon | Meaning | System Action |
|---|---|---|---|---|
| **Supported** | `#34c759` | `CheckCircle2` | Direct evidence anchor found in Evidence Bank | Rewritten with length budget; tagged with `evidence_id` |
| **Needs Confirmation** | `#ff9f0a` | `AlertTriangle` | Transferable skill framing from adjacent work | Flagged for explicit user confirmation in Diff Review |
| **Missing / Gap** | `#ff3b30` | `XCircle` | Target requirement has no evidence support | Isolated in Gap Report with learning tips; **never written to resume** |

---

## 8. License & Authorship

Built by the TailorAI Engineering Group. MIT License.
