"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, ShieldCheck, FileCheck, Sparkles, Terminal } from "lucide-react";

const headlineWords = "One resume. Every role.".split(" ");

interface MockVersion {
  role: string;
  badge: string;
  targetRequirement: string;
  evidenceAnchor: string;
  originalText: string;
  tailoredText: string;
  rationale: string;
  evidenceId: string;
  fitPercent: number;
}

const mockVersions: MockVersion[] = [
  {
    role: "Developer",
    badge: "Staff Distributed Systems Engineer",
    targetRequirement: "Architect distributed caching tier with Redis & handle multi-region scaling.",
    evidenceAnchor: "master.tex:Experience:L56",
    originalText: "- Built internal streaming and caching services handling database records.",
    tailoredText: "+ Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 query latency by 42% with sub-millisecond reliability.",
    rationale: "Emphasizes multi-region scale while locking to verified 42% latency reduction proof.",
    evidenceId: "ev_exp_0",
    fitPercent: 94,
  },
  {
    role: "Analyst",
    badge: "Senior Business & Data Analyst",
    targetRequirement: "Audit high-volume ETL query bottlenecks and quantify business cost reduction.",
    evidenceAnchor: "master.tex:Experience:L84",
    originalText: "- Collaborated with data science teams to optimize SQL queries on recurring schedules.",
    tailoredText: "+ Audited multi-department data queries and automated ETL runtime bottlenecks, delivering a 20% recurring cloud infrastructure cost reduction.",
    rationale: "Reframes SQL performance tuning into executive bottom-line cloud spend savings.",
    evidenceId: "ev_exp_1",
    fitPercent: 92,
  },
  {
    role: "Marketing",
    badge: "Technical Marketing Lead",
    targetRequirement: "Drive grassroots developer advocacy and organic community developer adoption.",
    evidenceAnchor: "master.tex:Projects:L112",
    originalText: "- Engineered open-source developer tooling and received community stars.",
    tailoredText: "+ Built developer grassroots marketing campaign for QueryLens open-source engine, organically acquiring 1,200+ developer champions across Reddit, HN, and GitHub.",
    rationale: "Reframes open-source software release around authentic community growth metrics.",
    evidenceId: "ev_proj_0",
    fitPercent: 89,
  },
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mockVersions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const active = mockVersions[activeIndex];

  return (
    <section className="relative pt-20 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-canvas">
      {/* Two Drifting Blurred Blue Orbs (#0071E3 at 10-14% opacity) */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-[480px] h-[360px] bg-[#0071E3] opacity-10 dark:opacity-14 rounded-full blur-[140px] pointer-events-none -z-10"
            animate={{
              x: [0, 60, -40, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-[520px] h-[380px] bg-[#0071E3] opacity-10 dark:opacity-14 rounded-full blur-[160px] pointer-events-none -z-10"
            animate={{
              x: [0, -50, 40, 0],
              y: [0, 45, -35, 0],
              scale: [1, 0.95, 1.12, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          />
        </>
      )}

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill border border-hairline bg-surface shadow-subtle mb-6 animate-in fade-in duration-300">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-[12px] font-medium tracking-tight text-ink-muted">
            Evidence-Only LaTeX Tailoring • Zero Hallucinations
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-[44px] sm:text-[60px] md:text-[76px] font-semibold tracking-[-0.03em] leading-[1.05] text-ink max-w-[840px] mb-6">
          One resume. Every role.
        </h1>

        {/* Sub-headline */}
        <p className="text-[19px] sm:text-[21px] leading-[1.38] text-ink-muted max-w-[680px] mb-9 font-normal">
          Tailor your LaTeX resume to any job, using only what is true about you. Original formatting and preamble 100% locked.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14 w-full sm:w-auto">
          <Link
            href="/workspace"
            className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-pill bg-accent text-white text-[17px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center justify-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98]"
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-pill text-[17px] font-medium text-accent hover:opacity-80 inline-flex items-center justify-center gap-1 transition-all"
          >
            <span>See how it works</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* 3-Role Crossfade Switcher Pills */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-pill bg-surface border border-hairline shadow-subtle">
          {mockVersions.map((item, idx) => (
            <button
              key={item.role}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-1.5 rounded-pill text-[13px] font-medium transition-all duration-fast ease-apple cursor-pointer ${
                activeIndex === idx
                  ? "bg-canvas text-ink shadow-subtle"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {item.role}
            </button>
          ))}
        </div>

        {/* Crossfading Resume Mockup (Apple Card with 20px radius) */}
        <div className="w-full max-w-[1040px] bg-canvas border border-hairline rounded-card shadow-paper p-4 sm:p-6 text-left relative overflow-hidden">
          {/* Window Chrome Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-hairline mb-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-[12px] text-ink-muted truncate max-w-[200px] sm:max-w-none">
                master.tex → {active.role.toLowerCase()}_tailored.pdf
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                <FileCheck className="w-3 h-3" /> Tectonic Sandboxed
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-accent/10 text-accent border border-accent/20">
                JD Alignment: {active.fitPercent}%
              </span>
            </div>
          </div>

          {/* Crossfading Content Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.role}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start text-left"
            >
              {/* Left Column: Target Requirement & Verified Anchor */}
              <div className="lg:col-span-5 space-y-3.5">
                <div className="p-4 rounded-xl bg-surface border border-hairline">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Target Role & Requirement
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-pill bg-canvas border border-hairline font-medium text-ink">
                      {active.badge}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-ink leading-snug">
                    "{active.targetRequirement}"
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text text-[11px] font-medium">
                      ✓ Supported by Evidence
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface border border-hairline">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Evidence Bank Anchor
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted">
                      {active.evidenceAnchor}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-ink-muted leading-relaxed">
                    Locked to user profile. Zero fabricated skills or dates.
                  </p>
                </div>
              </div>

              {/* Right Column: Inline Diff Preview */}
              <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-canvas border border-hairline shadow-subtle space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="text-[12px] font-semibold text-ink">
                    LaTeX Slot Review
                  </span>
                  <span className="text-[11px] font-mono text-status-supported-text bg-status-supported-bg px-2 py-0.5 rounded-pill">
                    Character Budget: OK
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[12px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-status-missing-bg/60 border border-status-missing-bg text-status-missing-text line-through">
                    {active.originalText}
                  </div>
                  <div className="p-2.5 rounded-lg bg-status-supported-bg border border-status-supported-text/20 text-status-supported-text font-medium">
                    {active.tailoredText}
                  </div>
                </div>

                <div className="pt-2 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-ink-muted">
                  <span>{active.rationale}</span>
                  <span className="font-semibold text-accent shrink-0">{active.evidenceId}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
