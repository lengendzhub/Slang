"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  FileText,
  ShieldCheck,
  Download,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { loadUserSession, saveUserSession, EvidenceItem } from "@/lib/store";

interface TailoredResumeRecord {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  matchedCount: string;
  status: string;
}

export default function MyLibraryPage() {
  const [activeTab, setActiveTab] = useState<"resumes" | "facts">("resumes");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [newFactText, setNewFactText] = useState("");
  const [newFactSource, setNewFactSource] = useState("");

  const sampleResumes: TailoredResumeRecord[] = [
    {
      id: "res_1",
      jobTitle: "Technical Business Analyst",
      company: "Apex Enterprise",
      date: "Oct 14, 2026",
      matchedCount: "11 of 14 matched",
      status: "Approved & Exported",
    },
    {
      id: "res_2",
      jobTitle: "Distributed Systems Lead",
      company: "CloudScale Systems",
      date: "Oct 10, 2026",
      matchedCount: "13 of 15 matched",
      status: "Approved & Exported",
    },
    {
      id: "res_3",
      jobTitle: "Platform Systems Architect",
      company: "Nexus Grid",
      date: "Oct 04, 2026",
      matchedCount: "10 of 12 matched",
      status: "Approved & Exported",
    },
  ];

  useEffect(() => {
    const session = loadUserSession();
    if (session.candidateName) {
      setCandidateName(session.candidateName);
    }
    if (session.evidenceBank && session.evidenceBank.length > 0) {
      setEvidenceList(session.evidenceBank);
    } else {
      // Clean default facts based on candidate
      setEvidenceList([
        {
          id: "ev_01",
          source: "master_resume.tex",
          sourceName: "Master Resume",
          text: "2 years of experience building Python microservices, PostgreSQL schemas, and automated CI/CD pipelines.",
          context: "Summary, Line 18",
          verified: true,
          dateAdded: "Oct 14, 2026",
        },
        {
          id: "ev_02",
          source: "master_resume.tex",
          sourceName: "Master Resume",
          text: "Wrote Python scripts to parse 50,000+ daily server logs and exported error summaries to PostgreSQL tables.",
          context: "Experience, Line 42",
          verified: true,
          dateAdded: "Oct 14, 2026",
        },
        {
          id: "ev_03",
          source: "master_resume.tex",
          sourceName: "Master Resume",
          text: "Collaborated with QA and product leads during bi-weekly sprint planning to clarify API acceptance criteria.",
          context: "Experience, Line 49",
          verified: true,
          dateAdded: "Oct 14, 2026",
        },
      ]);
    }
  }, []);

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;

    const newRecord: EvidenceItem = {
      id: `ev_${Date.now()}`,
      source: newFactSource.trim() || "User Added Fact",
      sourceName: "Verified Fact",
      text: newFactText.trim(),
      context: newFactSource.trim() || "Manual Entry",
      verified: true,
      dateAdded: "Just now",
    };

    const updated = [newRecord, ...evidenceList];
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
    setNewFactText("");
    setNewFactSource("");
  };

  const handleDeleteFact = (id: string) => {
    const updated = evidenceList.filter((ev) => ev.id !== id);
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-canvas border border-hairline text-ink-muted text-[12px] font-medium shadow-subtle mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-status-supported-text" />
              Verified Knowledge Base
            </div>
            <h1 className="text-[32px] font-semibold tracking-tight text-ink">
              My Library
            </h1>
            <p className="text-[14px] text-ink-muted mt-0.5">
              Manage your master templates, verified facts, and tailored versions.
            </p>
          </div>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Tailor New Resume
          </Link>
        </div>

        {/* 2-Tab Segmented Control */}
        <div className="flex">
          <div
            role="tablist"
            className="inline-flex p-1 rounded-pill bg-hairline/40 border border-hairline"
          >
            <button
              role="tab"
              aria-selected={activeTab === "resumes"}
              onClick={() => setActiveTab("resumes")}
              className={`px-5 py-2 rounded-pill text-[13px] font-medium transition-all duration-fast ease-apple ${
                activeTab === "resumes"
                  ? "bg-canvas text-ink shadow-subtle"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Tailored Resumes ({sampleResumes.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "facts"}
              onClick={() => setActiveTab("facts")}
              className={`px-5 py-2 rounded-pill text-[13px] font-medium transition-all duration-fast ease-apple ${
                activeTab === "facts"
                  ? "bg-canvas text-ink shadow-subtle"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Master Resume & Verified Facts ({evidenceList.length})
            </button>
          </div>
        </div>

        {/* TAB 1: Tailored Resumes List */}
        {activeTab === "resumes" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sampleResumes.map((item) => (
                <div
                  key={item.id}
                  className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 flex flex-col justify-between space-y-4 hover:border-ink-muted/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                        {item.company}
                      </span>
                      <span className="text-[11px] font-mono text-ink-muted">
                        {item.date}
                      </span>
                    </div>
                    <h3 className="text-[17px] font-semibold text-ink">
                      {item.jobTitle}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text text-[12px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.matchedCount}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-hairline flex items-center justify-between text-[13px]">
                    <Link
                      href="/workspace"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Duplicate
                    </Link>
                    <button
                      type="button"
                      onClick={() => alert(`Downloading ${item.jobTitle} PDF...`)}
                      className="inline-flex items-center gap-1 text-ink-muted hover:text-ink"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Master Resume & Evidence Bank */}
        {activeTab === "facts" && (
          <div className="space-y-8">
            {/* Master Template Card */}
            <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-status-supported-bg text-status-supported-text flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">
                    Master LaTeX Template: jakes_resume.tex
                  </h3>
                  <p className="text-[12px] text-ink-muted">
                    Formatting locked • Single-page geometry • {evidenceList.length} verified facts extracted
                  </p>
                </div>
              </div>

              <Link
                href="/workspace"
                className="px-4 py-2 rounded-pill bg-surface border border-hairline text-ink text-[13px] font-medium hover:bg-canvas transition-colors self-start sm:self-auto"
              >
                Replace Master .tex
              </Link>
            </div>

            {/* Add Fact Form */}
            <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-4">
              <h3 className="text-[16px] font-semibold text-ink">
                Add Verified Project or Fact
              </h3>
              <p className="text-[13px] text-ink-muted">
                The AI is strictly restricted to facts registered here. Never invented.
              </p>

              <form onSubmit={handleAddFact} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={newFactText}
                  onChange={(e) => setNewFactText(e.target.value)}
                  placeholder="Describe a project, metric, open-source repository, or accomplishment..."
                  className="w-full p-3 rounded-xl border border-hairline bg-surface text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <input
                    type="text"
                    value={newFactSource}
                    onChange={(e) => setNewFactSource(e.target.value)}
                    placeholder="Source / Context (e.g. GitHub repo, side project, certification)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-hairline bg-surface text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle"
                  >
                    <Plus className="w-4 h-4" />
                    Register Fact
                  </button>
                </div>
              </form>
            </div>

            {/* Registered Facts List */}
            <div className="space-y-3">
              <h3 className="text-[15px] font-semibold text-ink">
                Active Evidence Bank ({evidenceList.length})
              </h3>

              <div className="space-y-3">
                {evidenceList.map((fact) => (
                  <div
                    key={fact.id}
                    className="bg-canvas border border-hairline rounded-xl p-4 flex items-start justify-between gap-4 shadow-subtle"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-accent bg-surface px-2 py-0.5 rounded border border-hairline">
                          {fact.id}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          {fact.context || fact.source}
                        </span>
                        <span className="text-[11px] text-status-supported-text font-medium">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-[14px] text-ink leading-relaxed">
                        {fact.text}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFact(fact.id)}
                      className="text-ink-muted hover:text-status-missing-text p-1.5 rounded-lg hover:bg-surface transition-colors"
                      title="Remove fact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
