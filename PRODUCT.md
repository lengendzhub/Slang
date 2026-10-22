# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Software engineers, data analysts, technical project managers, and career-transitioning professionals who maintain a master LaTeX resume and need truthful, job-specific versions tailored to target job descriptions without hallucinated qualifications or broken ATS parsing.

## Product Purpose

Slang is a precision LaTeX resume tailoring engine. It ingests a candidate's master LaTeX resume and a target job description, analyzes alignment, proposes truthful edits backed by verifiable evidence citations, and compiles locked single-page ATS-ready PDFs inside a secure sandbox with automatic vector fallbacks.

## Positioning

Unlike mass-market AI resume builders that hallucinate fictitious achievements or export generic Markdown/HTML templates that wreck formatting, Slang guarantees:
1. **Zero Hallucinations**: Every proposed bullet modification must be anchored to an explicit evidence citation in the candidate's master resume (`master.tex:Section:Line`).
2. **100% Preamble & Layout Lock**: Custom packages, font configurations, margins, and LaTeX macros are preserved untouched.
3. **Guaranteed 1-Page ATS PDF**: Multi-tier compilation budget with automated spacing compaction, bullet trimming, and an instant zero-dependency vector ATS PDF fallback.

## Operating Context

A focused 3-step sequential workflow:
1. **Step 1: Input & Extraction**: Upload/paste master LaTeX and target JD. Confirms parse fidelity, role extraction, and evidence readiness.
2. **Step 2: Split-Screen Diff & Verification**: Line-by-line review. Users can Accept, Reject, or Edit proposed bullets. Real-time Evidence Bank shows source fact anchors and confidence.
3. **Step 3: Export & Sandboxed Compilation**: Real-time PDF preview compiled via Tectonic with 1-page auto-fit guarantee, ATS checklist, interview prep questions, and instant download (`.tex` and `.pdf`).

## Capabilities and Constraints

- **Sandboxed Compilation**: Tectonic XeTeX engine running in locked containers with a 35s hard timeout.
- **Fail-Safe Export**: Zero-dependency client-side and serverless vector PDF generator (<2ms) guaranteeing that users never face a 504 Gateway Timeout or broken export.
- **Deterministic Token Safety**: Specialized sanitizer handling LaTeX special characters (`%`, `_`, `&`, `$`, `#`, smart quotes, em-dashes) to avoid TeX syntax breaks.
- **Session Persistence**: Client-side storage for active resume drafts with optional JWT auth session.

## Brand Commitments

- **Name**: Slang
- **Aesthetic**: Apple Design Language — minimal, airy, high typographic legibility, translucent frosted navigation (`backdrop-filter: blur(20px)`), curated high-contrast status fills, and native-feeling dark mode.
- **Tone**: Direct, factual, engineering-grade, devoid of aggressive marketing hype or gimmicky badges.

## Evidence on Hand

- Master LaTeX templates: `templates/deedy.tex`, `templates/moderncv.tex`, `templates/classic.tex`.
- Automated test suites: `test_fact_validator.py`, `test_render_resume.py`, `test_latex_timeout_bug.py`.
- 31 backend unit and integration tests passing.

## Product Principles

1. **Truth First**: Never fabricate experience, metrics, or technologies. Omission is always preferred over falsehood.
2. **Format Invariance**: The user owns their LaTeX template and formatting; Slang only tailors the content inside existing itemize environments.
3. **Reliability Guaranteed**: Exporting a clean PDF must never fail, timeout, or leave the candidate stranded.
4. **Restraint & Polish**: An Apple-inspired interface prioritizing clarity, whitespace, and high signal-to-noise ratio over visual clutter.

## Accessibility & Inclusion

- WCAG 2.1 AA compliant color contrast ratios across light (`#F5F5F7` / `#1D1D1F`) and dark (`#000000` / `#F5F5F7`) palettes.
- Minimum 44x44px touch targets on all mobile interactive elements.
- Fluid typography using responsive clamps.
- Full keyboard navigation with visible focus rings (`#0071E3`).
- Accessible live regions (`aria-live="polite"`) for async compilation states and alert notices.
