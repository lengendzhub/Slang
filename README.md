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
7. **Documented Rubric Fit:** Transparent evidence-coverage score ("11 of 14 requirements matched"). Never presented as a shortlist probability or fake ATS percentage.

---

## 2. Authentic Apple Editorial Design Tokens

```css
:root {
  /* Apple Light Mode */
  --bg: #ffffff;
  --bg-alt: #f5f5f7;
  --ink: #1d1d1f;
  --ink-2: #6e6e73;
  --blue: #0071e3;
  --blue-hover: #0077ed;
  --line: #d2d2d7;

  /* Semantic Status Tokens */
  --status-supported-text: #1d7d34;
  --status-supported-bg: #eafbe7;
  --status-transferable-text: #b25000;
  --status-transferable-bg: #fff5eb;
  --status-missing-text: #d70015;
  --status-missing-bg: #ffefee;
}

.dark {
  /* Apple Dark Mode */
  --bg: #000000;
  --bg-alt: #1c1c1e;
  --ink: #f5f5f7;
  --ink-2: #98989d;
  --blue: #2997ff;
  --blue-hover: #40a2ff;
  --line: #38383a;

  --status-supported-text: #30d158;
  --status-supported-bg: rgba(48, 209, 88, 0.14);
  --status-transferable-text: #ff9f0a;
  --status-transferable-bg: rgba(255, 159, 10, 0.14);
  --status-missing-text: #ff453a;
  --status-missing-bg: rgba(255, 69, 58, 0.14);
}
```

---

## 3. Four Core Views

1. **Landing Page (`/`)**:
   - Clear headline and split-screen interface frame.
   - Interactive 3-tab Role Switcher (*Software Engineer* | *Product Manager* | *Business Analyst*).
   - 3-Card Bento Grid (*Zero Fabricated Claims*, *LaTeX Layout Preserved*, *You Have the Final Say*).
   - Minimal privacy footer.
2. **The Workspace (`/workspace`)**:
   - Single linear flow: `[1. Resume & Job] -> [2. Review Changes] -> [3. Download]`.
   - **Step 1**: Multi-format `.tex` / `.pdf` drag-and-drop, template lock recognition, Evidence Bank modal, 3-mode transition switcher (*Same Field*, *Career Pivot*, *Entry Level*).
   - **Step 2**: Split-screen review (65% Paper View with inline diffs, Accept / Reject / Edit, char budget warning, `.tex` source toggle; 35% Honest Match Checklist with collapsible Direct, Transferable, and Missing groups; Sticky review gate bar).
   - **Step 3**: Final compiled PDF preview, 4-item ATS sanity checks, Download PDF and `.tex`, and collapsible 5 Interview Questions accordion.
3. **My Library (`/library`)**:
   - *Tab 1: Tailored Resumes* (job title, match count, download PDF).
   - *Tab 2: Master Resume & Verified Facts* (manage confirmed facts and master templates).
4. **Account & Privacy (`/account`)**:
   - Profile details, Light/Dark appearance toggle, and one-click "Delete All My Data" (zero-retention guarantee).

---

## 4. Setup & Running Locally

### Backend (FastAPI + Llama 3.2 via Ollama)
```bash
# 1. Start Ollama and pull Llama 3.2
ollama run llama3.2:latest

# 2. Start FastAPI Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Next.js 16 + React 19 + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
# Accessible at http://localhost:3000
```

---

## 5. Running Automated Tests

Run the full Python test suite verifying all 7 non-negotiable rules:
```bash
cd backend
python -m pytest -v
```
Tests cover:
- `test_pdf_extractor.py`: Multi-section PDF resume and contact extraction.
- `test_parser_roundtrip.py`: Byte-for-byte LaTeX preamble and macro preservation.
- `test_fact_validator.py`: Rule #2 rejection of unanchored claims.
- `test_length_budget.py`: Per-bullet character budget enforcement.
- `test_constrained_editor.py`: Llama 3.2 structured JSON rewrites.
- `test_end_to_end.py`: Full upload-to-tailor pipeline execution.
