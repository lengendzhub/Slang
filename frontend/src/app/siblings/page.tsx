"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { loadUserSession, saveUserSession, SiblingItemState } from "@/lib/store";
import {
  GitBranch,
  FileText,
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

export default function SiblingsPage() {
  const [siblings, setSiblings] = useState<SiblingItemState[]>([]);
  const [masterName, setMasterName] = useState("Master Resume");
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = loadUserSession();
      setSiblings(session.siblings || []);
      setMasterName(session.uploadedFileName || (session.candidateName ? `${session.candidateName}_Resume.pdf` : "Master Resume"));
      setEvidenceCount(session.evidenceBank?.length || 0);
      setIsLoaded(true);
    };
    sync();
    window.addEventListener("slang_session_updated", sync);
    return () => {
      window.removeEventListener("slang_session_updated", sync);
    };
  }, []);

  const handleSync = (id: string) => {
    const updated = siblings.map((s) =>
      s.id === id ? { ...s, masterUpdated: false } : s
    );
    setSiblings(updated);
    saveUserSession({ siblings: updated });
  };

  const handleDelete = (id: string) => {
    const updated = siblings.filter((s) => s.id !== id);
    setSiblings(updated);
    saveUserSession({ siblings: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[980px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-1 block">
              Resume Siblings
            </span>
            <h1 className="apple-h1 text-ink">
              Resume Siblings Tree ({siblings.length})
            </h1>
            <p className="apple-body text-ink-secondary mt-1">
              Track all job-tailored documents derived from your single master LaTeX resume.
            </p>
          </div>

          <Link
            href="/workspace"
            className="pill-btn pill-btn-primary px-4 py-2 text-[13px] gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tailor New Sibling</span>
          </Link>
        </div>

        {/* Master Anchor Status Card */}
        <div className="apple-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-accent shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[16px] text-ink">
                  {masterName}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                  Active Master
                </span>
              </div>
              <p className="text-[12px] text-ink-secondary mt-0.5">
                {evidenceCount > 0 ? `${evidenceCount} verified Evidence Bank records anchored` : "No master resume uploaded yet"}
              </p>
            </div>
          </div>

          <Link
            href="/evidence"
            className="pill-btn pill-btn-secondary px-4 py-1.5 text-[12px]"
          >
            Inspect Evidence Bank
          </Link>
        </div>

        {/* Empty State: Calm illustration-free layout, one headline, one sentence, one primary action */}
        {isLoaded && siblings.length === 0 ? (
          <div className="apple-card p-12 text-center max-w-[540px] mx-auto my-12 space-y-4">
            <h3 className="apple-h2 text-ink">
              No Resume Siblings Found
            </h3>
            <p className="apple-body text-ink-secondary text-[14px]">
              When you tailor resumes for specific job descriptions, each approved version is saved as a tracked sibling linked to your master document.
            </p>
            <div className="pt-2">
              <Link
                href="/workspace"
                className="pill-btn pill-btn-primary px-6 py-2.5 text-[13px] inline-flex items-center gap-1.5"
              >
                <span>Tailor First Sibling in Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Siblings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {siblings.map((sib) => (
              <div key={sib.id} className="apple-card p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                    <span className="text-[11px] font-mono text-ink-secondary flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-accent" />
                      {sib.id}
                    </span>

                    {sib.masterUpdated ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-pill bg-status-transferable-bg text-status-transferable-text border border-warning/30">
                        <AlertCircle className="w-3 h-3" />
                        Master Updated
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text">
                        In Sync
                      </span>
                    )}
                  </div>

                  <h3 className="text-[16px] font-semibold text-ink leading-snug">
                    {sib.role}
                  </h3>
                  <p className="text-[13px] text-ink-secondary mb-3">
                    {sib.company}
                  </p>

                  <div className="p-3 rounded-xl bg-surface border border-hairline space-y-1.5 text-[12px] text-ink-secondary">
                    <div className="flex justify-between">
                      <span>Fit Rubric:</span>
                      <strong className="text-ink">{sib.fitScore ? `${sib.fitScore}%` : "Verified"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Modified Slots:</span>
                      <span className="font-mono text-ink">{sib.tailoredBulletsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compiled:</span>
                      <span>{sib.date}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between text-[12px]">
                  {sib.masterUpdated ? (
                    <button
                      type="button"
                      onClick={() => handleSync(sib.id)}
                      className="pill-btn pill-btn-primary px-3 py-1 text-[12px] gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Review Diff</span>
                    </button>
                  ) : (
                    <Link
                      href="/workspace"
                      className="text-link text-[12px] font-medium"
                    >
                      Open in Workspace →
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(sib.id)}
                    className="text-[11px] text-danger hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
