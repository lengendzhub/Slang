"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { loadUserSession, saveUserSession, EvidenceItemState } from "@/lib/store";
import {
  ShieldCheck,
  Plus,
  GitBranch,
  FileText,
  CheckCircle2,
  Trash2,
  Search,
  ArrowRight,
} from "lucide-react";

export default function EvidenceBankPage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItemState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newSource, setNewSource] = useState<"github" | "project_report">("github");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const sync = () => {
      const session = loadUserSession();
      setEvidenceList(session.evidenceBank || []);
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

  const handleDelete = (id: string) => {
    const updated = evidenceList.filter((item) => item.id !== id);
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  const handleToggleVerify = (id: string) => {
    const updated = evidenceList.map((item) =>
      item.id === id ? { ...item, verified: !item.verified } : item
    );
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newRecord: EvidenceItemState = {
      id: `ev_ext_${Date.now().toString().slice(-4)}`,
      source: newSource,
      sourceName: newSource === "github" ? "GitHub Repository Import" : "Project Report Import",
      text: newText.trim(),
      context: newContext.trim() || "External Candidate Proof",
      verified: true,
      dateAdded: "Just now",
    };

    const updated = [newRecord, ...evidenceList];
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
    setNewText("");
    setNewContext("");
    setShowAddForm(false);
  };

  const filtered = evidenceList.filter(
    (e) =>
      e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[980px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-hairline">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-1 block">
              Evidence Bank
            </span>
            <h1 className="apple-h1 text-ink">
              Verified Evidence Records ({evidenceList.length})
            </h1>
            <p className="apple-body text-ink-secondary mt-1">
              Every tailored bullet points to an immutable empirical proof record.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="pill-btn pill-btn-primary px-4 py-2 text-[13px] gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Close Form" : "Add Evidence Fact"}</span>
          </button>
        </div>

        {/* Add Evidence Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddEvidence}
            className="apple-card p-6 mb-8 space-y-4"
          >
            <h3 className="text-[16px] font-semibold text-ink">
              Add Verified Fact Anchor
            </h3>
            <p className="text-[13px] text-ink-secondary">
              Index verified achievements from earlier project whitepapers, GitHub READMEs, or master records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-ink-secondary block mb-1">
                  Source Type
                </label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-hairline bg-canvas text-[13px] text-ink apple-focus-ring"
                >
                  <option value="github">GitHub Repository</option>
                  <option value="project_report">Project Report / Whitepaper</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-ink-secondary block mb-1">
                  Context / Repository Name
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="e.g. org/repo-name or Q3 Report"
                  className="w-full p-2.5 rounded-xl border border-hairline bg-canvas text-[13px] text-ink apple-focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-ink-secondary block mb-1">
                Verifiable Achievement Metric
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Paste the empirical achievement..."
                className="w-full p-3 rounded-xl border border-hairline bg-canvas text-[13px] text-ink apple-focus-ring"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="pill-btn pill-btn-secondary px-4 py-1.5 text-[12px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pill-btn pill-btn-primary px-4 py-1.5 text-[12px]"
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        {/* Empty State: Calm illustration-free layout, one headline, one sentence, one primary action */}
        {isLoaded && evidenceList.length === 0 ? (
          <div className="apple-card p-12 text-center max-w-[540px] mx-auto my-12 space-y-4">
            <h3 className="apple-h2 text-ink">
              No Evidence Records Found
            </h3>
            <p className="apple-body text-ink-secondary text-[14px]">
              Upload your master LaTeX resume in the workspace to automatically extract your achievements into verified anchors.
            </p>
            <div className="pt-2">
              <Link
                href="/workspace"
                className="pill-btn pill-btn-primary px-6 py-2.5 text-[13px] inline-flex items-center gap-1.5"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Input with Floating Hairline Ring */}
            <div className="relative">
              <Search className="w-4 h-4 text-ink-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                aria-label="Search evidence records"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records by keyword or fact ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-canvas text-[13px] text-ink apple-focus-ring"
              />
            </div>

            {/* Quiet Card List */}
            <div className="space-y-3">
              {filtered.map((ev) => (
                <div key={ev.id} className="apple-card p-5 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-hairline">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-accent px-2 py-0.5 rounded-pill bg-canvas border border-hairline">
                        {ev.id}
                      </span>
                      <span className="text-[12px] text-ink-secondary flex items-center gap-1 font-mono">
                        {ev.source === "github" ? (
                          <GitBranch className="w-3.5 h-3.5 text-accent" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        {ev.sourceName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleVerify(ev.id)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-pill border cursor-pointer ${
                          ev.verified
                            ? "bg-status-supported-bg text-status-supported-text border-status-supported-text/20"
                            : "bg-surface text-ink-secondary border-hairline"
                        }`}
                      >
                        {ev.verified ? "✓ Verified" : "Unverified"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="text-ink-secondary hover:text-danger p-1 cursor-pointer"
                        title="Delete anchor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[14px] text-ink leading-relaxed">
                    "{ev.text}"
                  </p>

                  <div className="text-[11px] font-mono text-ink-secondary pt-1">
                    Context: {ev.context} • Added: {ev.dateAdded}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
