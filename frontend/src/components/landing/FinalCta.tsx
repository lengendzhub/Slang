"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="py-24 md:py-32 bg-surface border-t border-hairline text-center relative overflow-hidden">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-canvas border border-hairline text-[12px] font-medium text-ink-secondary mb-6 shadow-subtle">
          <ShieldCheck className="w-3.5 h-3.5 text-status-supported-text" />
          Zero-Hallucination LaTeX Engine
        </span>

        <h2 className="apple-h1 text-ink mb-4">
          Tailor with absolute conviction.
        </h2>

        <p className="apple-body text-ink-secondary max-w-[580px] mx-auto mb-10 text-[17px]">
          Upload your master LaTeX resume once. Generate dozens of precision-matched, truth-validated resumes ready for high-stakes interviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/workspace"
            className="pill-btn pill-btn-primary px-7 py-3 text-[15px] font-medium gap-2 min-h-[44px]"
          >
            <span>Start Tailoring Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/evidence"
            className="pill-btn pill-btn-secondary px-6 py-3 text-[15px] font-medium min-h-[44px]"
          >
            Review Evidence Bank
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[12px] text-ink-secondary font-mono">
          <span>Tectonic Sandboxed</span>
          <span>•</span>
          <span>PyMuPDF ATS Validated</span>
          <span>•</span>
          <span>Strict Privacy Isolation</span>
        </div>
      </div>
    </section>
  );
}
