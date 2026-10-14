"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  GitBranch,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  Trash2,
  Download,
  ExternalLink,
} from "lucide-react";

interface SiblingItem {
  id: string;
  role: string;
  company: string;
  date: string;
  fitScore: number;
  masterUpdated: boolean;
  tailoredBulletsCount: number;
}

export default function SiblingsPage() {
  const [siblings, setSiblings] = useState<SiblingItem[]>([
    {
      id: "sib_1",
      role: "Staff Infrastructure Engineer",
      company: "CloudScale Inc.",
      date: "Oct 12, 2026",
      fitScore: 94,
      masterUpdated: true,
      tailoredBulletsCount: 3,
    },
    {
      id: "sib_2",
      role: "Technical Product Manager",
      company: "DataPulse DevTools",
      date: "Oct 10, 2026",
      fitScore: 88,
      masterUpdated: true,
      tailoredBulletsCount: 5,
    },
    {
      id: "sib_3",
      role: "Senior Distributed Systems Lead",
      company: "Apex HyperScale",
      date: "Oct 04, 2026",
      fitScore: 91,
      masterUpdated: false,
      tailoredBulletsCount: 4,
    },
  ]);

  const handleSync = (id: string) => {
    setSiblings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, masterUpdated: false } : s))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--line-light)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)]">
                Sibling Management
              </span>
              <span className="text-[11px] text-[var(--ink-2)]">•</span>
              <span className="text-[12px] text-[var(--ink-2)]">Never Overwrites Silently</span>
            </div>
            <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--ink)]">
              Resume Siblings Tree
            </h1>
            <p className="text-[14px] text-[var(--ink-2)]">
              Track all job-tailored children created from your single master LaTeX resume.
            </p>
          </div>

          <Link
            href="/studio"
            className="pill-btn pill-btn-primary px-5 py-2 text-[14px] shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tailor New Sibling
          </Link>
        </div>

        {/* Master Anchor Card */}
        <div className="apple-card p-6 border-l-4 border-l-[var(--blue)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[17px] text-[var(--ink)]">
                  Master_Resume_2026.tex
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--blue)]/10 text-[var(--blue)]">
                  Active Master
                </span>
              </div>
              <p className="text-[13px] text-[var(--ink-2)] mt-0.5">
                Last modified 2 hours ago • 18 verified Evidence Bank records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[13px]">
            <Link
              href="/evidence"
              className="pill-btn px-4 py-1.5 border border-[var(--line-light)] bg-[var(--bg)] text-[var(--ink)] hover:bg-[var(--bg-alt)]"
            >
              Inspect Evidence Bank
            </Link>
          </div>
        </div>

        {/* Siblings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siblings.map((sib) => (
            <div key={sib.id} className="apple-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] font-mono text-[var(--ink-2)] flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-[var(--blue)]" />
                    {sib.id}
                  </span>

                  {sib.masterUpdated ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <AlertCircle className="w-3 h-3" />
                      Master Updated
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                      In Sync
                    </span>
                  )}
                </div>

                <h3 className="text-[18px] font-semibold text-[var(--ink)] mb-0.5">
                  {sib.role}
                </h3>
                <p className="text-[14px] text-[var(--ink-2)] font-medium mb-4">
                  {sib.company}
                </p>

                <div className="p-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)] space-y-1.5 text-[12px] text-[var(--ink-2)] mb-4">
                  <div className="flex justify-between">
                    <span>Fit Rubric Score:</span>
                    <strong className="text-[var(--ink)]">{sib.fitScore}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tailored Content Slots:</span>
                    <span className="font-mono text-[var(--ink)]">{sib.tailoredBulletsCount} modified</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Compiled:</span>
                    <span>{sib.date}</span>
                  </div>
                </div>

                {sib.masterUpdated && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 mb-4">
                    Master resume gained new bullet points. Review proposed updates without overwriting this version.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--line-light)] flex items-center justify-between text-[12px]">
                {sib.masterUpdated ? (
                  <button
                    onClick={() => handleSync(sib.id)}
                    className="pill-btn px-3 py-1 bg-[var(--blue)] text-white text-[12px] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Review Master Diff
                  </button>
                ) : (
                  <Link
                    href="/export"
                    className="text-[var(--link)] hover:underline flex items-center gap-1 font-medium"
                  >
                    Download Sibling &rarr;
                  </Link>
                )}

                <span className="text-[11px] font-mono text-[var(--ink-2)]">
                  PDF & .tex
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
