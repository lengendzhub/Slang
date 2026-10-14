"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { initialRequirements } from "@/lib/store";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  BookOpen,
  Filter,
} from "lucide-react";

export default function MatchReportPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredRequirements = filterCategory === "all"
    ? initialRequirements
    : initialRequirements.filter((r) => r.category.toLowerCase() === filterCategory.toLowerCase());

  const directCount = initialRequirements.filter((r) => r.classification === "Direct").length;
  const transferableCount = initialRequirements.filter((r) => r.classification === "Transferable").length;
  const missingCount = initialRequirements.filter((r) => r.classification === "Missing").length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        {/* Top Header Card */}
        <div className="apple-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[var(--line-light)]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)]">
                  Job Match Evaluation
                </span>
                <span className="text-[11px] text-[var(--ink-2)]">•</span>
                <span className="text-[12px] font-medium text-[var(--ink-2)]">
                  Target: Staff / Senior Distributed Systems Engineer
                </span>
              </div>
              <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--ink)]">
                Match Report & Rubric Fit Breakdown
              </h1>
              <p className="text-[14px] text-[var(--ink-2)] mt-1">
                Company: CloudScale Infrastructure • Seniority: Staff / Principal • Mode: Same Career Track
              </p>
            </div>

            <div className="flex items-center gap-6 self-center md:self-auto">
              <ProgressRing
                progress={88}
                size={110}
                strokeWidth={7}
                label="Fit Rubric"
                sublabel="Evidence Coverage"
              />
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#34c759]">
                  Direct Matches
                </span>
                <div className="text-[22px] font-bold text-[#34c759] mt-0.5">{directCount}</div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-[#34c759] opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ff9f0a]">
                  Transferable Skills
                </span>
                <div className="text-[22px] font-bold text-[#ff9f0a] mt-0.5">{transferableCount}</div>
              </div>
              <AlertTriangle className="w-6 h-6 text-[#ff9f0a] opacity-80" />
            </div>

            <div className="p-4 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ff3b30]">
                  Missing / Gaps
                </span>
                <div className="text-[22px] font-bold text-[#ff3b30] mt-0.5">{missingCount}</div>
              </div>
              <XCircle className="w-6 h-6 text-[#ff3b30] opacity-80" />
            </div>
          </div>

          {/* Rubric Disclaimer */}
          <div className="mt-6 p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)] flex items-start gap-3 text-[12px] text-[var(--ink-2)]">
            <ShieldCheck className="w-4 h-4 text-[var(--blue)] shrink-0 mt-0.5" />
            <span>
              <strong>Documented Rubric Guarantee:</strong> This 88% score is derived from verified evidence item coverage across essential and required criteria. It is an internal readiness rubric, never a shortlist or ATS pass guarantee. Unsupported requirements are isolated below and omitted from your resume.
            </span>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--ink-2)]" />
            <span className="text-[13px] font-medium text-[var(--ink)]">Filter Category:</span>
            {["all", "essential", "required", "preferred"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`pill-btn px-3 py-1 text-[12px] capitalize border ${
                  filterCategory === cat
                    ? "bg-[var(--blue)] text-white border-[var(--blue)]"
                    : "bg-[var(--bg-alt)] text-[var(--ink-2)] border-[var(--line-light)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <Link
            href="/diff"
            className="pill-btn pill-btn-primary px-5 py-2 text-[14px]"
          >
            Review Proposed Diffs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Requirements List */}
        <div className="space-y-4">
          {filteredRequirements.map((req) => (
            <div
              key={req.id}
              className="apple-card p-5 border-l-4"
              style={{
                borderLeftColor:
                  req.classification === "Direct"
                    ? "#34c759"
                    : req.classification === "Transferable"
                    ? "#ff9f0a"
                    : "#ff3b30",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-alt)] border border-[var(--line-light)] text-[var(--ink)]">
                    {req.category}
                  </span>
                  <span className="text-[12px] font-mono text-[var(--ink-2)]">
                    {req.id}
                  </span>
                </div>
                <EvidenceChip
                  status={
                    req.classification === "Direct"
                      ? "supported"
                      : req.classification === "Transferable"
                      ? "needs_confirmation"
                      : "missing"
                  }
                  label={req.classification}
                  evidenceId={req.matchedEvidenceId}
                />
              </div>

              <h4 className="text-[15px] font-medium text-[var(--ink)] mb-3 leading-snug">
                "{req.text}"
              </h4>

              {/* Matched Evidence */}
              {req.matchedText && (
                <div className="p-3 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)] text-[12px] font-mono text-[var(--ink-2)] mb-2">
                  <span className="text-[11px] uppercase tracking-wider font-sans font-semibold text-[var(--ink)] block mb-1">
                    Matched Evidence Anchor ({req.matchedEvidenceId}):
                  </span>
                  "{req.matchedText}"
                </div>
              )}

              {/* Learning tip if missing */}
              {req.learningTip && (
                <div className="p-3 rounded-lg bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-[12px] text-[var(--ink)] flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--blue)] shrink-0 mt-0.5" />
                  <span>
                    <strong>Preparation Suggestion:</strong> {req.learningTip}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
