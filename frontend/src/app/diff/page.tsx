"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { EvidenceChip } from "@/components/ui/EvidenceChip";
import { initialDiffs, DiffItemState } from "@/lib/store";
import {
  Check,
  X,
  Edit3,
  Lock,
  Unlock,
  Info,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function DiffReviewPage() {
  const router = useRouter();
  const [diffs, setDiffs] = useState<DiffItemState[]>(initialDiffs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [lockedSections, setLockedSections] = useState<Record<string, boolean>>({});

  const handleDecision = (id: string, decision: "accepted" | "rejected") => {
    setDiffs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, decision } : d))
    );
  };

  const handleStartEdit = (diff: DiffItemState) => {
    setEditingId(diff.id);
    setEditText(diff.decision === "edited" && diff.editedText ? diff.editedText : diff.rewrittenText);
  };

  const handleSaveEdit = (id: string) => {
    setDiffs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              decision: "edited",
              editedText: editText,
              newLength: editText.length,
            }
          : d
      )
    );
    setEditingId(null);
  };

  const toggleSectionLock = (section: string) => {
    setLockedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Rule #5: All changes must be reviewed before export
  const pendingCount = diffs.filter((d) => d.decision === "pending").length;
  const canExport = pendingCount === 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--line-light)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)]">
                Git-Style Diff Review
              </span>
              <span className="text-[11px] text-[var(--ink-2)]">•</span>
              <span className="text-[12px] text-[var(--ink-2)]">
                Non-Negotiable Rule #5 Active
              </span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--ink)]">
              Proposed Sentence Modifications
            </h1>
            <p className="text-[14px] text-[var(--ink-2)]">
              Review, accept, edit, or reject proposed rewrites. Nothing is compiled into your final resume without explicit review.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                {pendingCount} item{pendingCount > 1 ? "s" : ""} pending review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                <FileCheck className="w-3.5 h-3.5" />
                All changes reviewed
              </span>
            )}

            <Link
              href="/export"
              className={`pill-btn px-6 py-2 text-[14px] shadow-sm ${
                canExport
                  ? "pill-btn-primary"
                  : "bg-[var(--bg-alt)] text-[var(--ink-2)] border border-[var(--line-light)] opacity-50 cursor-not-allowed pointer-events-none"
              }`}
            >
              Export Validated Resume
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Section and Diff List */}
        <div className="space-y-6">
          {diffs.map((diff) => {
            const isLocked = lockedSections[diff.section] || false;
            const isEditing = editingId === diff.id;

            return (
              <div
                key={diff.id}
                className={`apple-card p-6 border transition-all ${
                  isLocked ? "opacity-60 bg-[var(--bg-alt)]" : ""
                }`}
              >
                {/* Section Header & Lock Toggle */}
                <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[var(--line-light)] gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--ink)]">
                      {diff.section}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--ink-2)]">
                      ({diff.id})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Budget: {diff.newLength}/{diff.originalLength + 15} chars
                    </span>

                    <button
                      onClick={() => toggleSectionLock(diff.section)}
                      className="pill-btn px-2.5 py-1 text-[11px] border border-[var(--line-light)] text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center gap-1"
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-500" />
                          <span>Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 text-[var(--ink-2)]" />
                          <span>Lock Section</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Diff */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 font-mono text-[12px]">
                  {/* Original */}
                  <div className="p-3.5 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300">
                    <div className="text-[11px] font-sans font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
                      Original Master Text ({diff.originalLength} chars)
                    </div>
                    <p className="line-through leading-relaxed">
                      - {diff.originalText}
                    </p>
                  </div>

                  {/* Proposed or Edited */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                    <div className="flex items-center justify-between text-[11px] font-sans font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      <span>
                        {diff.decision === "edited" ? "User Custom Edit" : "Tailored Suggestion"} ({diff.newLength} chars)
                      </span>
                      {diff.fitsBudget && (
                        <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                          ✓ Fits Page Budget
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 font-sans pt-1">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[12px] font-mono text-[var(--ink)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--blue)]"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="pill-btn px-3 py-1 text-[11px] border border-[var(--line-light)] text-[var(--ink)]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(diff.id)}
                            className="pill-btn pill-btn-primary px-3 py-1 text-[11px]"
                          >
                            Save Edit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed">
                        + {diff.decision === "edited" && diff.editedText ? diff.editedText : diff.rewrittenText}
                      </p>
                    )}
                  </div>
                </div>

                {/* Provenance & Decision Action Bar */}
                <div className="pt-3 border-t border-[var(--line-light)] flex flex-wrap items-center justify-between gap-4">
                  {/* Provenance Popover Info */}
                  <div className="flex items-center gap-3 text-[12px] text-[var(--ink-2)]">
                    <EvidenceChip
                      status={diff.status}
                      evidenceId={diff.evidenceId}
                    />
                    <span className="hidden sm:inline-block text-[var(--line)]">|</span>
                    <span className="text-[12px]">
                      <strong>Rationale:</strong> {diff.reason}
                    </span>
                  </div>

                  {/* Decision Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(diff.id, "rejected")}
                      className={`pill-btn px-3 py-1.5 text-[12px] border ${
                        diff.decision === "rejected"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-[var(--bg)] text-[var(--ink-2)] border-[var(--line-light)] hover:text-red-600"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleStartEdit(diff)}
                      className={`pill-btn px-3 py-1.5 text-[12px] border ${
                        diff.decision === "edited"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-[var(--bg)] text-[var(--ink-2)] border-[var(--line-light)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDecision(diff.id, "accepted")}
                      className={`pill-btn px-3.5 py-1.5 text-[12px] border ${
                        diff.decision === "accepted"
                          ? "bg-[#34c759] text-white border-[#34c759] shadow-xs"
                          : "bg-[var(--bg)] text-[var(--ink-2)] border-[var(--line-light)] hover:text-[#34c759]"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
