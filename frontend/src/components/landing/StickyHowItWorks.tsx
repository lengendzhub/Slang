"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, ShieldCheck, Sliders, FileCode, CheckCheck, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Step {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  description: string;
  details: string[];
}

const steps: Step[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Upload & Extract",
    tagline: "Your LaTeX source and target job description.",
    description:
      "Upload your master .tex resume and paste the target job description. Slang parses LaTeX commands, identifies content slots, and maps required skills across three orientation tracks: Same Field, Career Pivot, or Entry Level.",
    details: [
      "Deterministic LaTeX AST parsing preserves preamble and styling",
      "Job description parsed into Essential, Required, and Preferred qualifications",
      "Contact block and sensitive personal information locked and protected",
    ],
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Human Verification Gateway",
    tagline: "Per-bullet inline diffs with live character-budget tracking.",
    description:
      "Export stays strictly blocked until every single change is reviewed. Accept, reject, or edit bullet proposals in place. The live character budget prevents awkward word-wrap and preserves single-page layout.",
    details: [
      "Every bullet proposal is anchored to a traceable Evidence ID",
      "Tri-state categorization: Direct Match, Transferable, or Missing",
      "Missing skills are surfaced as interview talking points, never fabricated",
    ],
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Verified ATS Compilation & Export",
    tagline: "Dual export in PDF and compiled .tex format.",
    description:
      "Run the 4-item ATS Sanity Checklist to ensure font readability, layout single-page budget, and text extractability. Download your publication-ready PDF and clean .tex source file.",
    details: [
      "Automated PyMuPDF text stream extraction verification",
      "Auto-Fit algorithm guarantees exact single-page constraint",
      "5 anchored interview preparation questions derived from your master records",
    ],
  },
];

export function StickyHowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface border-t border-hairline">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-[620px] mx-auto mb-14">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-2 block">
            The Workflow
          </span>
          <h2 className="apple-h1 text-ink mb-4">
            How Slang Works in Three Steps
          </h2>
          <p className="apple-body text-ink-secondary">
            A deterministic, human-in-the-loop pipeline designed specifically for LaTeX users.
          </p>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {steps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`text-left p-5 rounded-card border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-canvas border-accent/40 shadow-apple"
                    : "bg-surface border-hairline hover:bg-canvas/60 text-ink-secondary"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`font-mono text-[12px] font-semibold px-2 py-0.5 rounded-pill ${
                      isSelected
                        ? "bg-accent text-white"
                        : "bg-surface border border-hairline text-ink-secondary"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-accent" />
                  )}
                </div>
                <h3 className={`text-[17px] font-semibold mb-1 ${isSelected ? "text-ink" : "text-ink"}`}>
                  {step.title}
                </h3>
                <p className="text-[13px] text-ink-secondary line-clamp-2">
                  {step.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Step Showcase Card */}
        <div className="rounded-card border border-hairline bg-canvas p-6 sm:p-9 shadow-apple">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
                <div>
                  <span className="text-[12px] font-mono text-accent font-semibold uppercase tracking-wider block mb-1">
                    Step {activeStep.stepNumber} of 03
                  </span>
                  <h3 className="apple-h2 text-ink">
                    {activeStep.title}
                  </h3>
                </div>
                <Link
                  href="/workspace"
                  className="pill-btn pill-btn-primary px-4 py-2 text-[13px] self-start sm:self-auto gap-1.5"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="apple-body text-ink-secondary leading-relaxed">
                {activeStep.description}
              </p>

              <div className="pt-2">
                <h4 className="text-[13px] font-semibold text-ink uppercase tracking-wider mb-3">
                  Key Verification Guarantees
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeStep.details.map((detail, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-surface border border-hairline flex items-start gap-2.5 text-[13px] text-ink leading-snug"
                    >
                      <CheckCircle2 className="w-4 h-4 text-status-supported-text shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
