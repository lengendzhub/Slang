"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-16 pb-20 md:pt-28 md:pb-28 overflow-hidden bg-canvas">
      {/* Subtle Apple blue ambient light */}
      {!shouldReduceMotion && (
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-accent opacity-[0.06] dark:opacity-[0.10] rounded-full blur-[140px] pointer-events-none -z-10"
          aria-hidden="true"
        />
      )}

      <div className="max-w-[980px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Verification Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.28, 0.11, 0.32, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill border border-hairline bg-surface shadow-subtle mb-8"
        >
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span className="text-[12px] font-medium tracking-tight text-ink-secondary">
            Verified Evidence Anchors • Preamble & Layout Locked
          </span>
        </motion.div>

        {/* Hero Headline: Exact text from prompt */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.28, 0.11, 0.32, 1] }}
          className="apple-display text-ink max-w-[860px] mb-6"
        >
          One master resume becomes many truthful, job-specific resumes.
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.28, 0.11, 0.32, 1] }}
          className="apple-body text-ink-secondary max-w-[620px] mb-10 text-[17px] sm:text-[19px] leading-relaxed"
        >
          Slang parses your LaTeX master resume into verified evidence records. For every job description,
          it re-ranks claims and generates surgical bullet diffs without ever fabricating skills or breaking your layout.
        </motion.p>

        {/* CTAs: Pill CTA + Text-link CTA with chevron */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24, ease: [0.28, 0.11, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16"
        >
          <Link
            href="/workspace"
            className="pill-btn pill-btn-primary px-7 py-3 text-[15px] font-medium gap-2 min-h-[44px]"
          >
            <span>Tailor Your Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#how-it-works"
            className="text-link text-[15px] font-medium inline-flex items-center gap-1 hover:gap-1.5 transition-all min-h-[44px]"
          >
            <span>See how it works</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Hero Interactive Architecture Preview (Zero fabricated data) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.28, 0.11, 0.32, 1] }}
          className="w-full max-w-[820px] rounded-card border border-hairline bg-surface p-5 sm:p-7 shadow-apple text-left"
        >
          {/* Card Window Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-hairline">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-separator" />
              <span className="w-2.5 h-2.5 rounded-full bg-separator" />
              <span className="w-2.5 h-2.5 rounded-full bg-separator" />
              <span className="text-[12px] font-mono text-ink-secondary ml-2">resume_engine.tex</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                <CheckCircle2 className="w-3 h-3" />
                Evidence Grounded
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-surface text-ink-secondary border border-hairline">
                <Lock className="w-3 h-3" />
                Preamble Locked
              </span>
            </div>
          </div>

          {/* Interactive Inspection Grid */}
          <div className="space-y-3 font-sans">
            <div className="p-3.5 rounded-xl bg-canvas border border-hairline">
              <div className="flex items-center justify-between text-[11px] text-ink-secondary mb-1 font-mono">
                <span>SLOT: \resumeItem[experience_0]</span>
                <span className="text-accent font-sans font-medium">Verified Fact #ev_01</span>
              </div>
              <div className="space-y-1.5 text-[13px]">
                <div className="diff-removed p-2 rounded text-[13px] leading-relaxed">
                  Led backend systems performance testing and database querying for quarterly releases.
                </div>
                <div className="diff-added p-2 rounded text-[13px] leading-relaxed">
                  Architected multi-region Redis caching layer and optimized SQL query execution paths, cutting p99 database latency by 42%.
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 px-1 text-[12px] text-ink-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Target Alignment: Distributed Systems & Scalability
              </span>
              <span className="font-mono text-[11px]">Character Budget: 142 / 160 (Within 1 Page)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
