---
name: Slang
description: Precision LaTeX Resume Tailoring Engine in Apple Design Language
colors:
  canvas: "#f5f5f7"
  surface: "#ffffff"
  ink: "#1d1d1f"
  ink-muted: "#86868b"
  accent: "#0071e3"
  accent-hover: "#0077ed"
  status-supported-text: "#1d7d34"
  status-supported-bg: "#eafbe7"
  status-transferable-text: "#b25000"
  status-transferable-bg: "#fff5eb"
  status-missing-text: "#d70015"
  status-missing-bg: "#ffefee"
  dark-canvas: "#000000"
  dark-surface: "#1c1c1e"
  dark-ink: "#f5f5f7"
  dark-ink-muted: "#86868b"
  line: "rgba(0, 0, 0, 0.1)"
  line-light: "rgba(0, 0, 0, 0.06)"
typography:
  display:
    fontFamily: "\"SF Pro Display\", -apple-system, BlinkMacSystemFont, \"Inter\", sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.5rem)"
    fontWeight: 700
    letterSpacing: "-0.03em"
  body:
    fontFamily: "\"SF Pro Text\", -apple-system, BlinkMacSystemFont, \"Inter\", sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "\"SF Mono\", Menlo, Consolas, Monaco, monospace"
    fontSize: "13px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  card: "20px"
  pill: "980px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "48px"
  card-apple:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
---

## Overview

Slang's design system is modeled after Apple's editorial product presentation: airy, disciplined, and high-legibility. The interface uses generous whitespace, subtle translucent glass (`backdrop-filter: blur(20px)`), refined rounded corners, and tactile micro-interactions to create an authoritative, calm environment for engineering-grade resume tailoring.

## Colors

### Light Palette
- **Canvas / Background**: `#F5F5F7` — Soft off-white providing natural contrast with pure white cards.
- **Card / Surface**: `#FFFFFF` — Crisp elevated surfaces with ultra-subtle border lines.
- **Primary Text**: `#1D1D1F` — High-contrast near-black typography.
- **Secondary Text**: `#86868B` — Refined mid-gray for captions, labels, and metadata.
- **Accent / CTA**: `#0071E3` (Apple Blue) — Intentional interactive color for primary actions.

### Dark Mode
- **Canvas**: `#000000` — Pure deep black.
- **Surface**: `#1C1C1E` — Apple system dark gray with `rgba(255, 255, 255, 0.1)` hairline borders.
- **Text**: `#F5F5F7` (Primary) and `#86868B` (Secondary).

### Semantic Status Colors
- **Supported / Verified**: Text `#1D7D34`, Fill `#EAFBE7` (Dark: Text `#30D158`, Fill `rgba(48, 209, 88, 0.14)`).
- **Needs Review / Transferable**: Text `#B25000`, Fill `#FFF5EB` (Dark: Text `#FF9F0A`, Fill `rgba(255, 159, 10, 0.14)`).
- **Missing / Omitted**: Text `#D70015`, Fill `#FFEFEB` (Dark: Text `#FF453A`, Fill `rgba(255, 69, 58, 0.14)`).

## Typography

- **Headings**: `SF Pro Display`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`. Weight 600 or 700 with tighter letter-spacing (`-0.03em` for heroes, `-0.5px` for section headers).
- **Body**: `SF Pro Text`, `Inter`, `sans-serif`. Font size 17px, line height 1.6, weight 400.
- **Labels & Micro-Copy**: 12px–13px, uppercase tracking where appropriate (`tracking-wide` or `tracking-wider`).
- **Code & Citations**: `SF Mono`, `Menlo`, `monospace`. Reserved for `.tex` source snippets, line coordinates (`master.tex:Experience:L56`), and keyboard shortcut tags.

## Layout

- **Desktop Max Width**: `1120px` for landing and workspace pages, ensuring optimal reading line length.
- **Fluid Spacing Tokens**: Responsive section paddings using CSS clamps (`clamp(56px, 10vw, 140px)`).
- **Mobile First**: All touch targets meet minimum 44px height. Margins collapse smoothly from 40px desktop gutters to 16px on mobile viewports.

## Elevation & Depth

- **Hairline Borders**: `1px solid rgba(0, 0, 0, 0.08)` (Light) / `1px solid rgba(255, 255, 255, 0.1)` (Dark).
- **Subtle Elevation**: `box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04)`.
- **Raised Elevation**: `box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08)`.
- **Frosted Glass**: Translucent layers with `backdrop-filter: blur(20px)` and background opacity `0.72` (e.g. Navigation Header).

## Shapes

- **Buttons & Chips**: Fully rounded pill shapes (`border-radius: 980px`).
- **Cards & Dialogs**: Large Apple curvature (`border-radius: 20px` on desktop, `16px` on tablet).
- **Inputs & Form Controls**: Rounded corners (`border-radius: 10px` to `12px`), height 48px.

## Components

- **FrostedNav**: Sticky 48px glass header with logo, centered navigation links, theme toggle, and auth pill buttons.
- **SplitScreenReview**: Side-by-side LaTeX diff viewer with inline diff markers (red `-` for deletions, green `+` for additions, and verified evidence badges).
- **Step3Export Preview**: Sandboxed real PDF iframe preview accompanied by ATS Sanity Checklist, interview prep cards, and one-click export actions.
- **BentoGrid**: Dense, gapless information architecture showcasing core tenets with subtle hover translation (`translateY(-3px)`).

## Do's and Don'ts

### Do:
- Anchor all claims and bullet edits to verifiable evidence IDs.
- Preserve 100% of the candidate's LaTeX preamble, margins, and custom command macros.
- Use fluid, clamp-based typography so headlines wrap naturally without awkward line breaks.
- Ensure all interactive controls have minimum 44x44px touch targets on mobile viewports.

### Don't:
- Never use garish, over-saturated primary backgrounds or busy gradients.
- Never wrap headings past 2–3 lines.
- Never use generic, unstyled alert dialogs or raw browser popups.
- Never fabricate experience or skills to artificially boost an ATS match score.
