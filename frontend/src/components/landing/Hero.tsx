"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, ShieldCheck, Sparkles, Terminal, FileCheck } from "lucide-react";
import { EvidenceChip } from "../ui/EvidenceChip";

const headlineWords = "Truth in every bullet. Precision in every compile.".split(" ");

export function Hero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      {/* Subtle Apple blue ambient glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[400px] bg-[var(--blue)] opacity-[0.08] dark:opacity-[0.14] rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[1280px] mx-auto px-6 flex flex-col items-center text-center">
        {/* Subtle pill tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.28, 0.11, 0.32, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--line-light)] bg-[var(--bg)] shadow-xs mb-8"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--blue)]" />
          <span className="text-[12px] font-medium tracking-tight text-[var(--ink-2)]">
            Zero Hallucinations • Evidence-Anchored LaTeX Tailoring
          </span>
        </motion.div>

        {/* Hero Headline with word-by-word reveal */}
        <h1 className="hero-headline text-[var(--ink)] max-w-[940px] mb-6">
          {headlineWords.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block mr-[0.25em]"
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: [0.28, 0.11, 0.32, 1],
              }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Body subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.28, 0.11, 0.32, 1] }}
          className="body-large max-w-[660px] mb-10 text-[var(--ink-2)]"
        >
          One master resume in LaTeX becomes many truthful, job-specific resumes. Every claim is strictly validated against your Evidence Bank—never inventing experience, never breaking macros.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.28, 0.11, 0.32, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/studio"
            className="pill-btn pill-btn-primary px-7 py-3 text-[16px] shadow-sm"
          >
            Launch Slang Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="pill-btn pill-btn-secondary px-5 py-3 text-[16px] flex items-center gap-1 text-[var(--link)] hover:opacity-80"
          >
            Explore How It Works
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Product Mockup with Apple Parallax Rise */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.28, 0.11, 0.32, 1] }}
          className="w-full max-w-[1100px] apple-card p-3 md:p-6 text-left relative overflow-hidden"
        >
          {/* Window Chrome */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--line-light)] mb-5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="ml-3 font-mono text-[12px] text-[var(--ink-2)] truncate max-w-[170px] sm:max-w-none">
                slang-studio // master_resume.tex → staff_distributed_systems.pdf
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                <FileCheck className="w-3 h-3" /> Tectonic Sandboxed
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--blue)]/10 text-[var(--blue)] border border-[var(--blue)]/20">
                Fit Rubric: 94%
              </span>
            </div>
          </div>

          {/* Interactive Split Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
            {/* Left: Original Evidence vs Target JD */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                    Target Requirement (JD)
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--ink)]/5 font-medium text-[var(--ink)]">
                    Essential
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[var(--ink)] mb-2">
                  "Architect distributed caching layer with Redis & handle multi-region scaling."
                </p>
                <div className="flex items-center gap-2">
                  <EvidenceChip status="supported" evidenceId="ev_sec_exp_0" label="Direct Match" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                    Evidence Bank Anchor
                  </span>
                  <span className="text-[11px] font-mono text-[var(--ink-2)]">
                    master.tex:L56
                  </span>
                </div>
                <p className="text-[12px] font-mono text-[var(--ink-2)] leading-relaxed">
                  {"\\resumeItem{Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.}"}
                </p>
              </div>
            </div>

            {/* Right: Git-style Diff Preview */}
            <div className="lg:col-span-7 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)] shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line-light)]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-[var(--ink)]">
                    Experience // Nexus Cloud Systems
                  </span>
                  <span className="text-[11px] font-mono text-[#34c759] bg-[#34c759]/10 px-2 py-0.5 rounded">
                    Length: 138/145 chars (Budget OK)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#34c759] text-white">
                    Accepted
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 font-mono text-[12px]">
                {/* Strike-through original */}
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 line-through">
                  - Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.
                </div>
                {/* Proposed focused tailoring */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  + Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 query latency by 42% with sub-millisecond reliability.
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--line-light)] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-[var(--ink-2)]">
                <span>Rationale: Highlighted multi-region scaling while retaining verified 42% latency proof.</span>
                <span className="font-semibold text-[var(--blue)] shrink-0">evidence_id: ev_sec_exp_0</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
