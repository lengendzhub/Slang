# Slang — Precision LaTeX Resume Tailoring Engine

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

---

## 6. Mobile-First Responsive Design Architecture (320px – 2560px)

Slang is built with a single unified codebase that scales fluidly from **320px small phones to 2560px ultra-wide displays**, strictly adhering to Apple Human Interface Guidelines and WCAG 1.4.10 reflow standards.

### 1. Breakpoint Grid
- **`xs` (320px – 479px)**: Small phones (base unprefixed Tailwind layout, single column).
- **`sm` (480px – 767px)**: Large phones.
- **`md` (768px – 1023px)**: Tablet portrait.
- **`lg` (1024px – 1279px)**: Tablet landscape and small laptops.
- **`xl` (1280px – 1535px)**: Desktop workstations.
- **`2xl` (1536px+)**: Ultra-wide displays (content centered and capped at `1120px` marketing / `1440px` workspace).

### 2. Fluid Tokens & Device Insets
- **Fluid Typography**: Dynamic scaling via CSS `clamp()`:
  - Hero Headline: `clamp(38px, 8vw, 80px)`
  - Section Headline: `clamp(28px, 5vw, 48px)`
  - Sub-headline: `clamp(18px, 2.4vw, 21px)`
  - Card Radius: `clamp(18px, 2.5vw, 28px)`
- **Zero Horizontal Overflow**: `overflow-x: clip; max-width: 100vw;` on `html, body`.
- **Safe Area Inset Tokens**: `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, etc., protecting notched devices and home bars.
- **iOS Safari Auto-Zoom Protection**: Inputs, selects, and textareas enforce `font-size: 16px` on `< 768px` to prevent disruptive iOS auto-zooming.
- **Touch-First 44px Minimum Targets**: All buttons, tabs, and interactive triggers enforce `min-height: 44px` and `min-width: 44px` with at least 8px spacing on touch devices.

### 3. Component Behavior by Screen Size
- **Navigation (`FrostedNav`)**:
  - `< md`: Branded wordmark + 44px animated menu button opening a full-screen frosted glass sheet (`backdrop-blur-2xl`) with large links, primary CTA, focus trap, Escape key handling, and background scroll locking.
  - `md+`: Inline navigation links with compact CTA; 48px glass bar gaining hairline border after 8px of scroll.
- **App Shell (`MobileTabBar`)**:
  - `< lg`: Persistent frosted glass bottom tab bar with safe-area padding for *Home*, *Workspace*, *Library*, and *Account*.
- **Workspace Flow (`Step1Input` & `WorkspacePage`)**:
  - `< md`: Progress indicator condenses to `Step X of 3` with an animated progress bar.
  - Mode Selection: Stacked 44px buttons on mobile, 3-column pill on `sm+`.
  - Target JD Textarea: Auto-grows with `min-h-[40dvh]` on mobile devices.
  - Submit Action: Sticky bottom bar with safe-area padding for easy single-thumb reach.
- **Split-Screen Review (`SplitScreenReview`)**:
  - `< lg`: Single-column layout with a top segmented control (*Review Changes*, *Match Rubric*, *.tex Source*) eliminating vertical scroll fatigue.
  - `lg+`: Dual-pane side-by-side layout (65% interactive canvas + 35% sticky rubric inspector).
  - Review Actions: 44px touch targets on *Accept*, *Reject*, *Edit*, and *Undo*.
  - Action Dock: Sticky bottom glass dock with safe-area padding and 44px *Accept All* / *Continue* triggers.
- **Step 3 Export (`Step3Export`)**:
  - PDF Preview: Responsive `min-h-[420px] h-[55dvh] sm:h-[700px]` iframe preventing mobile scroll traps.
  - Export Actions: Full-width 48px pill buttons for real PDF download and `.tex` source inspection.

### 4. Automated Viewport Verification Matrix
Run the Playwright responsive test suite across all target viewports:
```bash
python scratch/test_responsive_viewports.py
```
Verified viewports:
- 320x568 (iPhone 5/SE) — **100% Zero Overflow**
- 375x667 (iPhone SE 2020) — **100% Zero Overflow**
- 390x844 (iPhone 12/13/14) — **100% Zero Overflow**
- 430x932 (iPhone 14 Pro Max) — **100% Zero Overflow**
- 768x1024 (iPad Portrait) — **100% Zero Overflow**
- 1024x768 (iPad Landscape) — **100% Zero Overflow**
- 1440x900 (Desktop) — **100% Zero Overflow**

---

## 7. Milestone Decisions Log

### Milestone 1: Foundations, Design Tokens & Full Animated Landing Page (SHIPPED)
- **Decision M1.1 — Authentic Apple Design System**: Calibrated tokens for light and dark modes with `--blue: #0071E3`, `--hairline: #D2D2D7`, and the three semantic status chips (`Supported #248A3D`, `Needs confirmation #B25000`, `Missing #D70015`). Fluid typography implemented with CSS `clamp()`.
- **Decision M1.2 — Full Landing Page Experience**: Assembled the complete editorial landing page at `/` with:
  1. Sticky 48px translucent frosted navigation (`FrostedNav`) with dark mode switch.
  2. Hero with word-by-word reveal, drifting blue ambient orbs, and a 4-second crossfading resume mock (Developer, Analyst, Marketing).
  3. Pinned 300vh scroll-linked "How it works" story (`StickyHowItWorks`).
  4. "Truth first" matrix showing the 3 verified labels (`TrustSection`).
  5. "Your template stays yours" sandbox compilation comparison (`LatexToPdfAnimation`).
  6. Career transition interactive playground covering IT to BA, PM, and Tech Marketing (`RoleSwitcherDemo`).
  7. 3-card bento grid for non-negotiable principles (`BentoGrid`).
  8. Apple-style FAQ accordion (`FaqSection`).
  9. Final CTA (`FinalCta`) and privacy-first footer (`Footer`).
  10. Full `prefers-reduced-motion` compliance.
- **Decision M1.3 — 10-Table Data Model & Migrations**: Designed and committed the 10 data models (`users`, `master_resumes`, `profile_items`, `evidence`, `job_descriptions`, `requirements`, `matches`, `variants`, `changes`, `compile_runs`) with SQLAlchemy declarative models in `backend/app/models/db_models.py` and raw PostgreSQL with `pgvector` migration in `backend/migrations/init.sql`.
- **Decision M1.4 — Infrastructure & Orchestration**: Updated `docker-compose.yml` to include `postgres` (with `pgvector:pg16`), `redis:7-alpine`, `backend`, `frontend`, and optional `ollama`. Created comprehensive `.env.example`.
- **Decision M1.5 — Sample Seeds**: Added 3 full LaTeX sample templates (`jakes_resume.tex`, `deedy_resume.tex`, `classic_resume.tex`) and 5 sample job descriptions (`software_engineer.txt`, `product_manager.txt`, `business_analyst.txt`, `digital_marketing.txt`, `product_operations.txt`).


