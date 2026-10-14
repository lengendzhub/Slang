"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Cpu, CheckCircle2, FileText, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

export function LatexToPdfAnimation() {
  const [compiling, setCompiling] = useState(false);
  const [compiled, setCompiled] = useState(true);

  const triggerRecompile = () => {
    setCompiling(true);
    setCompiled(false);
    setTimeout(() => {
      setCompiling(false);
      setCompiled(true);
    }, 1100);
  };

  return (
    <section className="py-24 md:py-32 bg-[var(--bg-alt)] border-t border-[var(--line-light)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Sandboxed Compilation Pipeline
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            Untrusted LaTeX goes in. Pristine ATS-validated PDF comes out.
          </h2>
          <p className="section-sub">
            Uploaded LaTeX files are untrusted code. We strip dangerous primitives (<code className="text-[14px] bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--line-light)]">\write18</code>, <code className="text-[14px] bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--line-light)]">\openin</code>), compile in an isolated Tectonic container, and inspect the PDF with PyMuPDF.
          </p>
        </div>

        <div className="max-w-[1100px] mx-auto apple-card p-6 md:p-8">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-[var(--line-light)] gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-[12px] text-[var(--ink-2)]">
                tectonic-sandbox // isolated container (net=none, ro-root)
              </span>
            </div>
            <button
              onClick={triggerRecompile}
              disabled={compiling}
              className="pill-btn px-3.5 py-1 text-[12px] bg-[var(--bg)] border border-[var(--line-light)] text-[var(--ink)] flex items-center gap-1.5 hover:bg-[var(--bg-alt)]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${compiling ? "animate-spin text-[var(--blue)]" : ""}`} />
              <span>{compiling ? "Compiling in sandbox..." : "Re-trigger Pipeline"}</span>
            </button>
          </div>

          {/* Interactive Split Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Sanitized LaTeX Input */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line-light)]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                    1. Sanitized LaTeX Input (.tex)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Preamble Untouched
                  </span>
                </div>
                <div className="font-mono text-[11px] text-[var(--ink-2)] space-y-1 leading-relaxed overflow-x-auto">
                  <div className="text-[var(--ink-2)]/60">{"\\documentclass[letterpaper,11pt]{article}"}</div>
                  <div className="text-[var(--ink-2)]/60">{"\\usepackage{titlesec, enumitem, hyperref}"}</div>
                  <div className="text-[var(--ink)]">{"\\section{Experience}"}</div>
                  <div className="text-[var(--ink)]">{"\\resumeSubheading{Senior Engineer}{Nexus Cloud}"}</div>
                  <div className="p-2 rounded bg-[var(--blue)]/10 border border-[var(--blue)]/30 text-[var(--blue)] font-medium">
                    {"\\resumeItem{Architected multi-region Redis caching layer handling 10M+ daily events...}"}
                  </div>
                  <div className="text-[10px] text-red-500 line-through pt-1">
                    {"% STRIPPED: \\write18{...} & \\input{sensitive.conf}"}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line-light)] text-[11px] text-[var(--ink-2)]">
                Security: Shell escape OFF • Memory limit 256MB • Timeout 4.0s
              </div>
            </div>

            {/* Middle: Sandbox Compiler Arrow */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg)] border border-[var(--line-light)] shadow-xs flex items-center justify-center mb-2">
                <Cpu className={`w-6 h-6 ${compiling ? "text-[var(--blue)] animate-pulse" : "text-[var(--ink-2)]"}`} />
              </div>
              <span className="text-[11px] font-mono text-[var(--ink-2)]">
                {compiling ? "Running Tectonic..." : "Locked Container"}
              </span>
              <ArrowRight className="w-4 h-4 text-[var(--blue)] hidden lg:block my-2" />
            </div>

            {/* Right: PyMuPDF Extraction & Verified PDF */}
            <div className="lg:col-span-5 p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line-light)]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                    2. ATS Extraction (PyMuPDF)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#34c759]/10 text-[#34c759]">
                    Page Budget: 1/1
                  </span>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
                    <span className="text-[var(--ink)]">Reading Stream Order</span>
                    <span className="flex items-center gap-1 text-[#34c759] font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Linear Single-Col
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
                    <span className="text-[var(--ink)]">Contact Data Integrity</span>
                    <span className="flex items-center gap-1 text-[#34c759] font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Cleanly Parsed
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
                    <span className="text-[var(--ink)]">Section Heading Recognition</span>
                    <span className="flex items-center gap-1 text-[#34c759] font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 4/4 Verified
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)]">
                    <span className="text-[var(--ink)]">Page Overflow Detection</span>
                    <span className="flex items-center gap-1 text-[#34c759] font-medium text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 0 Spurious Pages
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line-light)] flex items-center justify-between text-[11px] text-[var(--ink-2)]">
                <span className="font-semibold text-[#34c759]">ATS Readability: 100%</span>
                <span className="font-mono">Output: deliverable.pdf</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
