"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, BrainCircuit, GitCompare, DownloadCloud, CheckCircle2, ShieldCheck, Terminal } from "lucide-react";
import { EvidenceChip } from "../ui/EvidenceChip";

const steps = [
  {
    id: "upload",
    stepNumber: "01",
    title: "Upload Master LaTeX Resume",
    tagline: "One master document. Infinite truthful versions.",
    description:
      "Upload your existing .tex file once. Our tolerant parser inspects custom commands, extracts content slots, and initializes your Evidence Bank with full round-trip verification.",
    icon: UploadCloud,
    mockup: {
      header: "STEP 1 // PARSER & EVIDENCE BANK INITIALIZED",
      badge: "Round-Trip Validated",
      content: (
        <div className="space-y-3 font-mono text-[12px]">
          <div className="p-3 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
            <div className="text-[11px] text-[var(--ink-2)] mb-1">// Parsed 4 Sections, 8 Item Slots</div>
            <div className="text-[#34c759] font-medium">✓ Round-trip test: Unchanged AST matches source byte-for-byte</div>
          </div>
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line-light)]">
            <span className="text-[var(--ink-2)]">Evidence Record #ev_exp_0:</span>
            <p className="mt-1 text-[var(--ink)]">"Architected distributed caching layer with Redis, reducing p99 API latency by 42%..."</p>
          </div>
        </div>
      ),
    },
  },
  {
    id: "paste",
    stepNumber: "02",
    title: "Paste Job Description & Select Mode",
    tagline: "Deconstructed into structured requirements.",
    description:
      "Paste any job description and pick your target track: Same career, Adjacent career, Career transition, or Internship. The engine parses the JD into Essential, Required, and Preferred qualifications.",
    icon: FileText,
    mockup: {
      header: "STEP 2 // JD ONTOLOGY PARSING",
      badge: "Ontology Extracted",
      content: (
        <div className="space-y-2.5 font-sans text-[12px]">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
            <span className="font-semibold text-[var(--ink)]">Staff Distributed Systems Engineer</span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--blue)]/10 text-[var(--blue)] font-medium">Adjacent Career Mode</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[var(--ink-2)]">
              <span>Essential (4 items)</span>
              <span>Seniority: Senior / Staff</span>
            </div>
            <div className="p-2 rounded bg-[var(--bg)] border border-[var(--line-light)] text-[var(--ink)]">
              • Deep expertise in distributed caching (Redis) & high-concurrency storage.
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: "analyse",
    stepNumber: "03",
    title: "Semantic Analysis & Fit Rubric",
    tagline: "Transparent scoring based on documented proof.",
    description:
      "Every requirement is categorized as Direct, Transferable, or Missing against your Evidence Bank. Unsupported skills are flagged as learning opportunities—never written into your resume.",
    icon: BrainCircuit,
    mockup: {
      header: "STEP 3 // TRI-STATE FIT RUBRIC",
      badge: "Documented Rubric",
      content: (
        <div className="space-y-3 font-sans text-[12px]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759]">
              <div className="text-[16px] font-bold">8</div>
              <div className="text-[10px]">Direct Match</div>
            </div>
            <div className="p-2 rounded-lg bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 text-[#ff9f0a]">
              <div className="text-[16px] font-bold">2</div>
              <div className="text-[10px]">Transferable</div>
            </div>
            <div className="p-2 rounded-lg bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30]">
              <div className="text-[16px] font-bold">1</div>
              <div className="text-[10px]">Missing (Reported)</div>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)] text-[11px] text-[var(--ink-2)]">
            Fit Estimate: <strong className="text-[var(--ink)]">89%</strong> (Based on evidence coverage, not probability of interview).
          </div>
        </div>
      ),
    },
  },
  {
    id: "review",
    stepNumber: "04",
    title: "Git-Style Diff Review",
    tagline: "Nothing is exported without your explicit consent.",
    description:
      "Review line-by-line before and after proposals with per-bullet character budgets. Accept, Reject, or Edit each suggestion with immediate evidence provenance popovers.",
    icon: GitCompare,
    mockup: {
      header: "STEP 4 // DECISION GATEWAY",
      badge: "Per-Bullet Budget Active",
      content: (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-2 rounded bg-red-500/10 text-red-700 dark:text-red-400 line-through">
            - Developed automated data ingestion pipelines in Python processing 500GB daily log streams...
          </div>
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            + Architected streaming ingestion pipelines in Python/FastAPI processing 500GB daily telemetry...
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 font-sans">
            <span className="text-[var(--blue)] font-medium">evidence_id: ev_exp_1</span>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[var(--bg-alt)] border text-[var(--ink-2)]">Reject</span>
              <span className="px-2 py-0.5 rounded bg-[var(--blue)] text-white">Accept</span>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    id: "export",
    stepNumber: "05",
    title: "Sandboxed Compile & ATS Validation",
    tagline: "Locked-down Tectonic compilation and PyMuPDF text checks.",
    description:
      "Compiled with shell escape disabled, zero network access, and strict resource limits. PyMuPDF inspects reading order, contact integrity, and heading hierarchy to guarantee 100% ATS readability.",
    icon: DownloadCloud,
    mockup: {
      header: "STEP 5 // ATS VALIDATION AUDIT",
      badge: "Tectonic Sandbox Verified",
      content: (
        <div className="space-y-2 font-sans text-[12px]">
          <div className="flex items-center gap-2 text-[#34c759]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Tectonic compile completed with 0 errors (Exit code 0)</span>
          </div>
          <div className="flex items-center gap-2 text-[#34c759]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>PyMuPDF reading order: Clean single-stream hierarchy</span>
          </div>
          <div className="flex items-center gap-2 text-[#34c759]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Exact 1-page budget preserved (0 layout overflow)</span>
          </div>
          <div className="flex items-center gap-2 text-[#34c759]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Contact details intact: Email, Phone & Hyperlinks preserved</span>
          </div>
        </div>
      ),
    },
  },
];

export function StickyHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Deterministic Pipeline
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            How Slang works.
          </h2>
          <p className="section-sub">
            Five deliberate steps designed to preserve truth, protect your LaTeX styling, and guarantee verifiable claims.
          </p>
        </div>

        {/* Step Navigation Pill Bar */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`pill-btn px-4 py-2 text-[13px] border transition-all ${
                  isActive
                    ? "bg-[var(--blue)] text-white border-[var(--blue)] shadow-sm"
                    : "bg-[var(--bg-alt)] text-[var(--ink-2)] border-[var(--line-light)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.stepNumber}. {step.title.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Story Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1100px] mx-auto">
          {/* Left: Step Details */}
          <div className="lg:col-span-5 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
                className="space-y-4"
              >
                <div className="text-[14px] font-mono text-[var(--blue)] font-semibold">
                  Step {steps[activeStep].stepNumber} of 05
                </div>
                <h3 className="text-[28px] font-semibold tracking-tight text-[var(--ink)]">
                  {steps[activeStep].title}
                </h3>
                <p className="text-[15px] font-medium text-[var(--ink)]">
                  {steps[activeStep].tagline}
                </p>
                <p className="body-regular text-[var(--ink-2)]">
                  {steps[activeStep].description}
                </p>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    className="pill-btn px-4 py-1.5 text-[13px] border border-[var(--line-light)] disabled:opacity-30 text-[var(--ink)]"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activeStep === steps.length - 1}
                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="pill-btn pill-btn-primary px-4 py-1.5 text-[13px] disabled:opacity-30"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Device Frame Mockup with Crossfading Step State */}
          <div className="lg:col-span-7">
            <div className="apple-card p-6 border-hairline relative min-h-[340px] flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--line-light)] mb-4 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="ml-2 font-mono text-[11px] text-[var(--ink-2)] truncate max-w-[180px] sm:max-w-none">
                      {steps[activeStep].mockup.header}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--bg-alt)] border border-[var(--line-light)] text-[var(--ink-2)] shrink-0">
                    {steps[activeStep].mockup.badge}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
                  >
                    {steps[activeStep].mockup.content}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line-light)] flex items-center justify-between text-[11px] text-[var(--ink-2)]">
                <span className="flex items-center gap-1.5 text-[#34c759]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sandboxed Execution Guaranteed
                </span>
                <span className="font-mono">Tectonic + PyMuPDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
