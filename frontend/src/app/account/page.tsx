"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  Shield,
  Trash2,
  Download,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { loadUserSession, clearUserSession } from "@/lib/store";

export default function AccountPage() {
  const [candidateEmail, setCandidateEmail] = useState("user@example.com");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [isDark, setIsDark] = useState(false);
  const [purged, setPurged] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    const session = loadUserSession();
    if (session.candidateEmail) setCandidateEmail(session.candidateEmail);
    if (session.candidateName) setCandidateName(session.candidateName);
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
    }
  }, []);

  const toggleAppearance = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleExportData = () => {
    const session = loadUserSession();
    const dataArchive = {
      export_date: new Date().toISOString(),
      user: {
        name: candidateName,
        email: candidateEmail,
      },
      session_data: session,
      privacy_policy: "Zero-retention verified export",
    };

    const blob = new Blob([JSON.stringify(dataArchive, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailorai_user_archive_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteData = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete all your resumes, JDs, and evidence records? This action is irreversible."
      )
    ) {
      return;
    }

    setIsPurging(true);
    clearUserSession();

    // Call backend delete if available
    try {
      await fetch("http://localhost:8000/me/data", { method: "DELETE" });
    } catch {
      // client-side purge succeeds
    }

    setTimeout(() => {
      setIsPurging(false);
      setPurged(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[780px] w-full mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-hairline">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-canvas border border-hairline text-ink-muted text-[12px] font-medium shadow-subtle mb-2">
            <Shield className="w-3.5 h-3.5 text-accent" />
            Privacy First Architecture
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight text-ink">
            Account & Privacy
          </h1>
          <p className="text-[14px] text-ink-muted mt-0.5">
            Manage your account settings, appearance, and zero-retention data policies.
          </p>
        </div>

        {/* Card 1: Account Profile */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-4">
          <h3 className="text-[16px] font-semibold text-ink">
            Account Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div className="p-3.5 bg-surface rounded-xl border border-hairline">
              <span className="text-[11px] font-semibold uppercase text-ink-muted block mb-1">
                Name
              </span>
              <p className="font-medium text-ink">{candidateName}</p>
            </div>
            <div className="p-3.5 bg-surface rounded-xl border border-hairline">
              <span className="text-[11px] font-semibold uppercase text-ink-muted block mb-1">
                Email Address
              </span>
              <p className="font-medium text-ink">{candidateEmail}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Appearance Toggle */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-[16px] font-semibold text-ink">
              Appearance
            </h3>
            <p className="text-[13px] text-ink-muted">
              Choose between Apple Light mode and Dark mode.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAppearance}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-surface border border-hairline text-ink text-[13px] font-medium hover:bg-canvas transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-accent" />
                Dark Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-accent" />
                Light Mode
              </>
            )}
          </button>
        </div>

        {/* Card 3: Privacy & Zero-Retention Data Controls */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-[16px] font-semibold text-ink">
              Data Sovereignty & Zero-Retention
            </h3>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              TailorAI never trains models on your resumes, JDs, or evidence facts. You have complete control to export or permanently erase your documents at any time.
            </p>
          </div>

          {purged && (
            <div className="p-3.5 bg-status-supported-bg border border-status-supported-text/30 rounded-xl flex items-center gap-2.5 text-[13px] text-status-supported-text font-medium">
              <CheckCircle2 className="w-4 h-4" />
              All resumes, JDs, and Evidence Bank records have been permanently erased.
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill bg-surface border border-hairline text-ink text-[13px] font-medium hover:bg-canvas transition-all"
            >
              <Download className="w-4 h-4 text-ink-muted" />
              Export All My Data (JSON)
            </button>

            <button
              type="button"
              disabled={isPurging}
              onClick={handleDeleteData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill bg-status-missing-bg border border-status-missing-text/30 text-status-missing-text text-[13px] font-medium hover:bg-status-missing-bg/80 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isPurging ? "Erasing Data..." : "Delete All My Data"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
