"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  FileText,
  ShieldCheck,
  Download,
  Trash2,
  Lock,
  ArrowRight,
  Search,
} from "lucide-react";
import { loadUserSession, saveUserSession, EvidenceItem } from "@/lib/store";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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
  const [templateName, setTemplateName] = useState("");
  const [hasMaster, setHasMaster] = useState(false);
  const [resumes, setResumes] = useState<TailoredResumeRecord[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = () => {
    const session = loadUserSession();
    setCandidateName(session.candidateName || "Candidate");
    setHasMaster(Boolean(session.rawResumeText && session.rawResumeText.trim()));
    setTemplateName(
      session.uploadedFileName ||
        session.detectedTemplate ||
        (session.rawResumeText ? "Master LaTeX Document" : "No Master Uploaded")
    );

    setEvidenceList(session.evidenceBank || []);

    const tailored: TailoredResumeRecord[] = (session.siblings || []).map((s, idx) => ({
      id: s.id || `res_${idx}`,
      jobTitle: s.role || "Tailored Resume",
      company: s.company || "Target Company",
      date: s.date || "Recently",
      matchedCount: s.fitScore ? `${s.fitScore}% fit rubric` : "Verified export",
      status: "Approved & Exported",
    }));
    setResumes(tailored);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("slang_session_updated", loadData);
    return () => {
      window.removeEventListener("slang_session_updated", loadData);
    };
  }, []);

  const handleDeleteFact = (id: string) => {
    const updated = evidenceList.filter((ev) => ev.id !== id);
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  const filteredResumes = resumes.filter(
    (r) =>
      r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFacts = evidenceList.filter(
    (f) =>
      f.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[980px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-1 block">
              Library
            </span>
            <h1 className="apple-h1 text-ink">
              Documents & Proof
            </h1>
            <p className="apple-body text-ink-secondary mt-1">
              Access your master document, job-tailored siblings, and verified evidence bank.
            </p>
          </div>

          <Link
            href="/workspace"
            className="pill-btn pill-btn-primary px-4 py-2 text-[13px] gap-1.5"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Master Resume Anchor Status Card */}
        <div className="apple-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-accent shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[16px] text-ink">
                  {templateName}
                </span>
                {hasMaster && (
                  <span className="px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text text-[11px] font-semibold">
                    AST Parsed
                  </span>
                )}
              </div>
              <p className="text-[12px] text-ink-secondary font-mono mt-0.5">
                {candidateName} • Preamble & Layout Locked
              </p>
            </div>
          </div>

          <Link
            href="/workspace"
            className="pill-btn pill-btn-secondary px-4 py-1.5 text-[12px] shrink-0"
          >
            {hasMaster ? "Re-upload in Workspace" : "Upload Master"}
          </Link>
        </div>

        {/* Tab Controls: Resumes vs Evidence Facts */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SegmentedControl
            options={[
              { id: "resumes", label: `Tailored Resumes (${resumes.length})` },
              { id: "facts", label: `Evidence Bank (${evidenceList.length})` },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val as "resumes" | "facts")}
            name="library-tab"
          />

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..."
              className="w-full pl-9 pr-3 py-1.5 text-[12px] rounded-pill border border-hairline bg-canvas text-ink apple-focus-ring"
            />
          </div>
        </div>

        {/* Tab 1: Tailored Resumes */}
        {activeTab === "resumes" && (
          <div>
            {isLoaded && resumes.length === 0 ? (
              /* Honest Apple Empty State */
              <div className="apple-card p-12 text-center max-w-[520px] mx-auto my-6 space-y-4">
                <h3 className="apple-h2 text-ink">
                  No Tailored Resumes Yet
                </h3>
                <p className="apple-body text-ink-secondary text-[14px]">
                  Generate a tailored resume in the workspace to save job-specific children to your library.
                </p>
                <div className="pt-2">
                  <Link
                    href="/workspace"
                    className="pill-btn pill-btn-primary px-6 py-2.5 text-[13px] inline-flex items-center gap-1.5"
                  >
                    <span>Start Tailoring in Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResumes.map((item) => (
                  <div key={item.id} className="apple-card p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-hairline">
                      <div>
                        <h4 className="font-semibold text-[15px] text-ink leading-snug">
                          {item.jobTitle}
                        </h4>
                        <p className="text-[12px] text-ink-secondary">{item.company}</p>
                      </div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20 shrink-0">
                        {item.matchedCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-secondary font-mono pt-1">
                      <span>Exported {item.date}</span>
                      <Link
                        href="/workspace"
                        className="text-link text-[12px] font-sans font-medium hover:underline"
                      >
                        Open Draft →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Evidence Bank Records */}
        {activeTab === "facts" && (
          <div>
            {isLoaded && evidenceList.length === 0 ? (
              <div className="apple-card p-12 text-center max-w-[520px] mx-auto my-6 space-y-4">
                <h3 className="apple-h2 text-ink">
                  No Evidence Facts Saved
                </h3>
                <p className="apple-body text-ink-secondary text-[14px]">
                  Add verified accomplishments or upload your master resume to populate your evidence bank.
                </p>
                <div className="pt-2">
                  <Link
                    href="/evidence"
                    className="pill-btn pill-btn-primary px-6 py-2.5 text-[13px] inline-flex items-center gap-1.5"
                  >
                    <span>Manage Evidence Bank</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFacts.map((fact) => (
                  <div key={fact.id} className="apple-card p-4 space-y-1.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-hairline">
                      <span className="font-mono text-[11px] font-semibold text-accent">
                        {fact.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFact(fact.id)}
                        className="text-ink-secondary hover:text-danger p-1"
                        title="Delete fact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[13px] text-ink leading-relaxed">
                      "{fact.text}"
                    </p>
                    <p className="text-[11px] font-mono text-ink-secondary">
                      Source: {fact.sourceName} • {fact.context}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
