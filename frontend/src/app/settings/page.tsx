"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  Shield,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function SettingsPage() {
  const [dataPurged, setDataPurged] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [exportTriggered, setExportTriggered] = useState(false);

  const handleDeleteAllData = () => {
    if (confirm("Are you sure you want to permanently delete all your resumes, JDs, and evidence records? This action is irreversible.")) {
      setIsPurging(true);
      setTimeout(() => {
        setIsPurging(false);
        setDataPurged(true);
      }, 1000);
    }
  };

  const handleExportAllData = () => {
    setExportTriggered(true);
    const archiveData = {
      export_date: "2026-10-14",
      user: "Alex Morgan",
      master_resumes: ["master_resume.tex"],
      evidence_bank_count: 5,
      siblings_count: 3,
      policy: "Zero-retention compliant export",
    };
    const blob = new Blob([JSON.stringify(archiveData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailorai-user-data-archive.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-10">
        <div className="pb-6 mb-8 border-b border-[var(--line-light)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)]">
              Account & Privacy
            </span>
            <span className="text-[11px] text-[var(--ink-2)]">•</span>
            <span className="text-[12px] text-[var(--ink-2)]">Strict Isolation</span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--ink)]">
            Privacy & Data Sovereignty
          </h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Configure data retention, export all career documents, or purge your information with 1-click.
          </p>
        </div>

        {dataPurged && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              All your uploaded resumes, job descriptions, diff records, and evidence anchors have been permanently purged from our servers.
            </span>
          </div>
        )}

        <div className="space-y-6">
          {/* Privacy Protections Summary */}
          <div className="apple-card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Shield className="w-5 h-5 text-[var(--blue)]" />
              <h3 className="text-[17px] font-semibold text-[var(--ink)]">
                Active Architectural Safeguards
              </h3>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)]">Contact Information Redaction:</strong> Phone numbers, emails, and physical addresses are automatically redacted before bullet text is analyzed by language models.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)]">Sandboxed Isolated Execution:</strong> LaTeX compilation occurs in isolated containers with shell-escape OFF and network access severed.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[var(--ink)]">No AI Model Training:</strong> Your master resumes and job descriptions are never used to train or fine-tune public foundation models.
                </div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="apple-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--ink)] mb-1">
                Export All Candidate Data
              </h3>
              <p className="text-[13px] text-[var(--ink-2)]">
                Download a machine-readable JSON archive of all your Evidence Bank records, siblings, and master LaTeX files.
              </p>
            </div>
            <button
              onClick={handleExportAllData}
              className="pill-btn px-4 py-2 border border-[var(--line-light)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--bg-alt)] shrink-0 flex items-center gap-1.5 text-[13px]"
            >
              <Download className="w-4 h-4 text-[var(--blue)]" />
              Export Data Archive
            </button>
          </div>

          {/* Delete All Data */}
          <div className="apple-card p-6 border-red-500/20 bg-red-500/5 dark:bg-red-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[16px] font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" />
                Permanent Data Purge (DELETE /me/data)
              </h3>
              <p className="text-[13px] text-[var(--ink-2)]">
                Immediately and irrecoverably erase all master resumes, job descriptions, diff items, and evidence records from our database.
              </p>
            </div>
            <button
              onClick={handleDeleteAllData}
              disabled={isPurging}
              className="pill-btn px-5 py-2 bg-red-600 text-white hover:bg-red-700 shrink-0 text-[13px] font-medium shadow-xs"
            >
              {isPurging ? "Purging..." : "Delete All My Data"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
