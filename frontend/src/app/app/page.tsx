"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { loadUserSession, UserSessionState } from "@/lib/store";
import {
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
  GitCompare,
  FileCheck2,
} from "lucide-react";

export default function AppDashboardPage() {
  const [session, setSession] = useState<UserSessionState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSession(loadUserSession());
      setIsLoaded(true);
    };
    sync();
    window.addEventListener("slang_session_updated", sync);
    window.addEventListener("tailorai_session_updated", sync);
    return () => {
      window.removeEventListener("slang_session_updated", sync);
      window.removeEventListener("tailorai_session_updated", sync);
    };
  }, []);

  const hasMaster = Boolean(session?.rawResumeText && session.rawResumeText.trim());
  const evidenceCount = session?.evidenceBank?.length || 0;
  const siblings = session?.siblings || [];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-8 pb-28">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                TailorAI Dashboard
              </span>
              <span className="text-[11px] text-ink-muted">•</span>
              <span className="text-[12px] text-ink-muted">Evidence-Anchored Workflows</span>
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-ink">
              My Resumes & Evidence
            </h1>
            <p className="text-[14px] text-ink-muted mt-1">
              Manage your master LaTeX resume, verified evidence anchors, and tailored job variants.
            </p>
          </div>

          <Link
            href="/workspace"
            className="min-h-[44px] px-6 py-2.5 rounded-pill bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Tailored Resume</span>
          </Link>
        </div>

        {/* Master Resume Card */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-semibold text-ink">Master Resume</h2>
            <Link
              href="/app/master"
              className="text-[13px] text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Manage Master & Evidence Bank</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-surface border border-hairline rounded-card p-6 shadow-subtle hover:border-ink-muted/30 transition-all">
            {hasMaster ? (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-canvas border border-hairline flex items-center justify-center shrink-0 shadow-subtle">
                    <FileText className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[17px] font-semibold text-ink">
                        {session?.candidateName || "Candidate Master Resume"}
                      </h3>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                        AST Parsed & Verified
                      </span>
                    </div>
                    <p className="text-[13px] text-ink-muted">
                      Template: <strong className="text-ink font-medium">{session?.detectedTemplate || "Jake's Resume"}</strong> •{" "}
                      Parse Confidence: <strong className="text-status-supported-text font-medium">{Math.round((session?.parseConfidence || 0.95) * 100)}%</strong> •{" "}
                      Evidence Bank: <strong className="text-ink font-medium">{evidenceCount} facts</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link
                    href="/app/master"
                    className="flex-1 md:flex-none min-h-[40px] px-5 py-2 rounded-pill bg-canvas border border-hairline text-[13px] font-medium text-ink hover:bg-surface text-center inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Structure & Facts</span>
                  </Link>
                  <Link
                    href="/workspace"
                    className="flex-1 md:flex-none min-h-[40px] px-5 py-2 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover text-center inline-flex items-center justify-center gap-1.5 transition-colors shadow-subtle"
                  >
                    <span>Tailor for New Job</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-canvas text-ink-muted border border-hairline mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">No Master Resume Uploaded Yet</h3>
                  <p className="text-[13px] text-ink-muted max-w-[440px] mx-auto mt-1">
                    Upload your master LaTeX (.tex) or PDF once. All formatting and preamble macros remain 100% locked.
                  </p>
                </div>
                <div>
                  <Link
                    href="/app/master"
                    className="min-h-[42px] px-6 py-2 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover inline-flex items-center gap-1.5 shadow-subtle transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Master Resume</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tailored Resumes & Siblings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[18px] font-semibold text-ink">Tailored Resumes (Siblings)</h2>
              <p className="text-[13px] text-ink-muted">
                Each sibling preserves your original template and quotes verified facts.
              </p>
            </div>
            <Link
              href="/siblings"
              className="text-[13px] text-accent hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>View Lineage & Compare</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {siblings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siblings.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-surface border border-hairline rounded-card shadow-subtle space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-[16px] font-semibold text-ink">{item.role}</h4>
                      <p className="text-[13px] text-ink-muted">{item.company || "Target Company"}</p>
                    </div>
                    <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                      {item.fitScore}% Fit
                    </span>
                  </div>

                  <div className="text-[12px] text-ink-muted pt-2 border-t border-hairline flex items-center justify-between">
                    <span>Tailored: {item.date}</span>
                    <span className="font-mono text-accent">{item.tailoredBulletsCount} reframed bullets</span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href="/workspace"
                      className="flex-1 min-h-[36px] px-3 py-1.5 text-center text-[12px] font-medium bg-canvas border border-hairline text-ink rounded-pill hover:bg-surface transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <span>Review Changes</span>
                    </Link>
                    <Link
                      href="/export"
                      className="flex-1 min-h-[36px] px-3 py-1.5 text-center text-[12px] font-medium bg-accent text-white rounded-pill hover:bg-accent-hover transition-colors shadow-subtle inline-flex items-center justify-center gap-1"
                    >
                      <span>Download PDF</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-hairline rounded-card p-8 text-center space-y-3">
              <p className="text-[14px] text-ink-muted">
                No tailored resumes generated yet. Paste a job description to tailor your first role-specific sibling.
              </p>
              <Link
                href="/workspace"
                className="min-h-[40px] px-5 py-2 rounded-pill bg-canvas border border-hairline text-[13px] font-medium text-ink hover:bg-surface inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-accent" />
                <span>Tailor for your first job</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <MobileTabBar />
    </div>
  );
}
