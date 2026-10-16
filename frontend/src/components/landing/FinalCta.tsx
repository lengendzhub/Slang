"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, FileCode } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-28 md:py-40 bg-[var(--bg-alt)] border-t border-[var(--line-light)] text-center relative overflow-hidden">
      {/* Soft blue glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[var(--blue)] opacity-[0.07] dark:opacity-[0.12] rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-[820px] mx-auto px-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--line-light)] text-[12px] font-medium text-[var(--ink-2)] mb-8">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34c759]" />
          Zero Hallucination Guarantee
        </span>

        <h2 className="hero-headline text-[var(--ink)] mb-6">
          Tailor with conviction.
        </h2>

        <p className="body-large text-[var(--ink-2)] max-w-[620px] mx-auto mb-10">
          Upload your master LaTeX resume once. Generate dozens of precision-matched, truth-validated resumes ready for high-stakes interviews.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/studio"
            className="pill-btn pill-btn-primary px-8 py-3.5 text-[17px] shadow-sm"
          >
            Launch Slang Studio
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/evidence"
            className="pill-btn px-6 py-3.5 text-[17px] bg-[var(--bg)] border border-[var(--line-light)] text-[var(--ink)] hover:bg-[var(--bg-alt)]"
          >
            Manage Evidence Bank
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-[12px] text-[var(--ink-2)]">
          <span>• Tectonic Sandboxed</span>
          <span>• PyMuPDF ATS Extraction</span>
          <span>• Strict Privacy Isolation</span>
        </div>
      </div>
    </section>
  );
}
