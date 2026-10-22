"use client";

import React from "react";
import { ShieldCheck, Lock, CheckSquare, Sparkles, Database, FileCode, Trash2 } from "lucide-react";

interface Invariant {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const SEVEN_INVARIANTS: Invariant[] = [
  {
    id: 1,
    title: "Human Verification Gateway",
    subtitle: "Zero unreviewed exports",
    description:
      "Export stays strictly blocked until every diff is Accepted or Rejected. You maintain complete veto power over every word before any PDF or .tex file leaves your browser.",
    icon: CheckSquare,
    tag: "Non-Negotiable",
  },
  {
    id: 2,
    title: "Live Character-Budget Lock",
    subtitle: "Guaranteed single-page budget",
    description:
      "Inline editing tracks draftText.length against your original bullet character budget in real-time, preventing awkward 2-line wraps and preserving exact 1-page geometry.",
    icon: Sparkles,
    tag: "Layout Safe",
  },
  {
    id: 3,
    title: "Tri-State Requirement Grounding",
    subtitle: "Direct • Transferable • Missing",
    description:
      "Missing skills are surfaced as honest interview talking points and never written into the resume. We never hallucinate or invent qualifications you haven't documented.",
    icon: ShieldCheck,
    tag: "Truth-First",
  },
  {
    id: 4,
    title: "Traceable Evidence Anchors",
    subtitle: "Every claim carries an ID",
    description:
      "Every bullet proposal carries an explicit Evidence Fact ID (#ev_xx). Claims link directly back to verified achievements in your master resume or Evidence Bank.",
    icon: Database,
    tag: "Auditable",
  },
  {
    id: 5,
    title: "Preamble & Macro Freeze",
    subtitle: "Your typography stays untouched",
    description:
      "Your LaTeX document preamble, custom fonts, geometry, and styling macros remain byte-for-byte identical. Only the inner text of content items is tailored.",
    icon: Lock,
    tag: "AST Sandboxed",
  },
  {
    id: 6,
    title: "Deterministic Compilation",
    subtitle: "Dual export: PDF + .tex",
    description:
      "A 4-stage Draft Alignment pipeline compiles through local sandboxing. You always receive both a print-ready PDF and cleanly formatted .tex source files.",
    icon: FileCode,
    tag: "Deterministic",
  },
  {
    id: 7,
    title: "Complete Data Erasure",
    subtitle: "One-click 'Delete All My Data'",
    description:
      "You own your career records. One click securely erases your master resumes, JDs, tailored siblings, and evidence records from all local storage and server caches.",
    icon: Trash2,
    tag: "Privacy First",
  },
];

export function BentoGrid() {
  return (
    <section id="invariants" className="py-24 md:py-32 bg-black text-white border-t border-neutral-900">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-[640px] mx-auto mb-16">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#2997FF] mb-2 block">
            Core Architecture
          </span>
          <h2 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.02em] leading-tight text-[#F5F5F7] mb-4">
            The Seven Invariants
          </h2>
          <p className="text-[17px] text-[#86868B] leading-relaxed">
            The strict engineering rules baked into Slang. They cannot be bypassed or disabled.
          </p>
        </div>

        {/* 7 Invariants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEVEN_INVARIANTS.map((inv, idx) => {
            const Icon = inv.icon;
            const isFullWidthOnLarge = idx === 6; // 7th item spans full width or centers
            return (
              <div
                key={inv.id}
                className={`p-6 sm:p-7 rounded-[20px] bg-[#1D1D1F] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-200 ${
                  isFullWidthOnLarge ? "md:col-span-2 lg:col-span-3" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#2997FF]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#86868B]">
                      {inv.tag}
                    </span>
                  </div>

                  <h3 className="text-[18px] font-semibold text-[#F5F5F7] mb-1">
                    {inv.title}
                  </h3>
                  <p className="text-[13px] text-[#2997FF] font-medium mb-3">
                    {inv.subtitle}
                  </p>
                  <p className="text-[14px] text-[#A1A1A6] leading-relaxed">
                    {inv.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-[#86868B] font-mono">
                  <span>Invariant 0{inv.id}</span>
                  <span className="text-[#30D158]">Enforced</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
