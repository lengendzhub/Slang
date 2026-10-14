"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, Clock, AlertCircle, FileText, ArrowRight, ShieldCheck } from "lucide-react";

export function SiblingsSection() {
  const siblings = [
    {
      role: "Staff Infrastructure Engineer",
      company: "CloudScale Inc.",
      date: "Oct 12, 2026",
      fitScore: 94,
      masterUpdated: true,
      diffCount: "3 bullets tailored",
      template: "Jake's Resume (Tectonic)",
    },
    {
      role: "Technical Product Manager",
      company: "DataPulse DevTools",
      date: "Oct 10, 2026",
      fitScore: 88,
      masterUpdated: true,
      diffCount: "5 bullets reframed",
      template: "Jake's Resume (Tectonic)",
    },
    {
      role: "Senior Distributed Systems Lead",
      company: "Apex HyperScale",
      date: "Oct 04, 2026",
      fitScore: 91,
      masterUpdated: false,
      diffCount: "4 bullets tailored",
      template: "Jake's Resume (Tectonic)",
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[760px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Sibling Architecture
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            One master resume. An organized tree of truthful siblings.
          </h2>
          <p className="section-sub">
            Never duplicate resumes into messy folders. TailorAI connects every child resume back to your single master .tex file. When your master gains new experience, siblings flag updates—never overwriting your tailored versions silently.
          </p>
        </div>

        <div className="max-w-[1050px] mx-auto space-y-4">
          {/* Master Resume Header Card */}
          <div className="apple-card p-6 border-l-4 border-l-[var(--blue)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[17px] text-[var(--ink)]">
                    Master_Resume_2026.tex
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)]">
                    Single Source of Truth
                  </span>
                </div>
                <p className="text-[12px] text-[var(--ink-2)]">
                  Contains 18 verified Evidence Records • 4 Sections • Last edited 2 hours ago
                </p>
              </div>
            </div>

            <Link
              href="/studio"
              className="pill-btn pill-btn-primary px-4 py-1.5 text-[13px]"
            >
              Tailor New Sibling
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Child Siblings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {siblings.map((sib, i) => (
              <div key={i} className="apple-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-[var(--ink-2)] flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-[var(--blue)]" />
                      Sibling {i + 1}
                    </span>
                    {sib.masterUpdated ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertCircle className="w-3 h-3" /> Master Updated
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                        In Sync
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-[16px] text-[var(--ink)] mb-1">
                    {sib.role}
                  </h4>
                  <p className="text-[13px] font-medium text-[var(--ink-2)] mb-4">
                    {sib.company}
                  </p>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)] space-y-1.5 text-[11px] text-[var(--ink-2)] mb-4">
                    <div className="flex justify-between">
                      <span>Fit Rubric:</span>
                      <strong className="text-[var(--ink)]">{sib.fitScore}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Tailored Diff:</span>
                      <span className="text-[var(--ink)]">{sib.diffCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engine:</span>
                      <span className="text-[var(--ink)]">{sib.template}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--line-light)] flex items-center justify-between text-[11px]">
                  <span className="text-[var(--ink-2)] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sib.date}
                  </span>
                  <Link
                    href="/diff"
                    className="text-[var(--link)] font-medium hover:underline flex items-center gap-0.5"
                  >
                    View Diff &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
