"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { loadUserSession, saveUserSession, EvidenceItemState, UserSessionState } from "@/lib/store";
import { getApiBaseUrl } from "@/lib/apiConfig";
import {
  UploadCloud,
  FileText,
  Lock,
  Unlock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Edit2,
  ArrowRight,
  ShieldCheck,
  Check,
  GitBranch,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function MasterResumePage() {
  const [session, setSession] = useState<UserSessionState | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItemState[]>([]);
  const [lockedSections, setLockedSections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Add Fact Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [factMode, setFactMode] = useState<"qa" | "github" | "notes">("qa");
  const [factText, setFactText] = useState("");
  const [factContext, setFactContext] = useState("");
  const [factCategory, setFactCategory] = useState<"Experience" | "Project" | "Skill" | "Education" | "Custom">("Experience");

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadUserSession();
    setSession(s);
    setEvidenceList(s.evidenceBank || []);
    setLockedSections(s.lockedSections || []);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const apiBase = getApiBaseUrl();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBase}/resumes`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to parse resume on backend.");
      }

      const data = await res.json();
      const newEvidence: EvidenceItemState[] = (data.evidence_bank || []).map((ev: any) => ({
        id: ev.id,
        source: ev.source || "master_resume",
        sourceName: ev.source_name || "Master Resume",
        text: ev.raw_text,
        context: ev.context || "Master Resume",
        category: ev.category || "Experience",
        skills: ev.skills || [],
        status: ev.status || "extracted",
        verified: ev.verified ?? true,
        dateAdded: ev.date_added || "Extracted from LaTeX",
      }));

      const updatedSession: Partial<UserSessionState> = {
        candidateName: data.contact_name || file.name.replace(/\.[^/.]+$/, ""),
        candidateEmail: data.contact_email || "",
        uploadedFileName: file.name,
        uploadedFileType: file.name.endsWith(".tex") ? "tex" : "pdf",
        rawResumeText: data.raw_latex || "",
        detectedTemplate: data.template_id || "Standard Template",
        parseConfidence: data.parse_confidence || 1.0,
        requiresSectionMapping: data.requires_section_mapping || false,
        evidenceBank: newEvidence,
      };

      saveUserSession(updatedSession);
      setSession(loadUserSession());
      setEvidenceList(newEvidence);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload and parse resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleLock = (sectionName: string) => {
    const isLocked = lockedSections.includes(sectionName);
    const updated = isLocked
      ? lockedSections.filter((s) => s !== sectionName)
      : [...lockedSections, sectionName];

    setLockedSections(updated);
    saveUserSession({ lockedSections: updated });
  };

  const handleConfirmFact = (id: string) => {
    const updated = evidenceList.map((item) =>
      item.id === id ? { ...item, status: "confirmed" as const, verified: true } : item
    );
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  const handleDeleteFact = (id: string) => {
    const updated = evidenceList.filter((item) => item.id !== id);
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });
  };

  const handleAddFactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factText.trim()) return;

    let sourceName = "Custom Candidate Fact";
    let sourceId = "custom";
    if (factMode === "qa") {
      sourceName = "What did you actually do? Q&A";
      sourceId = "user_qa";
    } else if (factMode === "github") {
      sourceName = "GitHub Repository Fact";
      sourceId = "github";
    } else {
      sourceName = "Project Design Document";
      sourceId = "project_notes";
    }

    const newRecord: EvidenceItemState = {
      id: `ev_user_${Date.now().toString().slice(-5)}`,
      source: sourceId,
      sourceName: sourceName,
      text: factText.trim(),
      context: factContext.trim() || "User Confirmed Evidence",
      category: factCategory,
      skills: [],
      status: "confirmed",
      verified: true,
      dateAdded: "Just now",
    };

    const updated = [newRecord, ...evidenceList];
    setEvidenceList(updated);
    saveUserSession({ evidenceBank: updated });

    setFactText("");
    setFactContext("");
    setShowAddModal(false);
  };

  // Filtered evidence
  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Confirmed" && item.status === "confirmed") ||
      (selectedStatus === "Extracted" && item.status !== "confirmed");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const confirmedCount = evidenceList.filter((e) => e.status === "confirmed").length;
  const extractedCount = evidenceList.filter((e) => e.status !== "confirmed").length;

  const dynamicSections = Array.from(
    new Set(evidenceList.map((e) => e.category || "Experience"))
  ).map((cat) => ({
    id: `sec_${cat.toLowerCase().replace(/\s+/g, "_")}`,
    name: cat,
    count: evidenceList.filter((e) => (e.category || "Experience") === cat).length,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-4 sm:px-6 py-8 pb-28 space-y-10">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                Master Resume & Evidence Bank
              </span>
              <span className="text-[11px] text-ink-muted">•</span>
              <span className="text-[12px] text-ink-muted">Non-Negotiable Rule #1 & #2</span>
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-ink">
              Structured Profile & Proof Anchors
            </h1>
            <p className="text-[14px] text-ink-muted mt-1">
              Lock sections you wish to preserve verbatim and curate the Evidence Bank that powers all tailored drafts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workspace"
              className="min-h-[44px] px-6 py-2.5 rounded-pill bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98]"
            >
              <span>Tailor for Job</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Top Grid: Master Resume Structure & Section Locks (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload / Master AST Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-[16px] font-semibold text-ink">Master Template Status</h2>

            <div className="bg-surface border border-hairline rounded-card p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <div>
                  <h3 className="text-[15px] font-semibold text-ink">
                    {session?.candidateName || "Master Resume Document"}
                  </h3>
                  <p className="text-[12px] text-ink-muted">{session?.candidateEmail || (session?.rawResumeText ? "Verified Document" : "No resume uploaded yet")}</p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20 font-medium">
                  LaTeX AST Active
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-3 bg-canvas border border-hairline rounded-xl">
                  <span className="text-ink-muted block text-[11px]">Detected Template</span>
                  <strong className="text-ink font-semibold mt-0.5 block">{session?.detectedTemplate || "Standard LaTeX"}</strong>
                </div>
                <div className="p-3 bg-canvas border border-hairline rounded-xl">
                  <span className="text-ink-muted block text-[11px]">Parse Confidence</span>
                  <strong className="text-status-supported-text font-semibold mt-0.5 block">
                    {session?.parseConfidence !== undefined ? `${Math.round(session.parseConfidence * 100)}%` : "Verified"}
                  </strong>
                </div>
              </div>

              {/* Upload New Master Resume File */}
              <div className="pt-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-2">
                  Replace Master Resume (.tex / .pdf)
                </label>
                <label className="border border-dashed border-hairline hover:border-accent/60 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-canvas text-center transition-colors">
                  <UploadCloud className="w-5 h-5 text-accent" />
                  <span className="text-[12px] font-medium text-ink">
                    {isUploading ? "Parsing LaTeX AST..." : "Click or drag to upload new master"}
                  </span>
                  <span className="text-[10px] text-ink-muted">Preamble, fonts & spacing 100% locked</span>
                  <input
                    type="file"
                    accept=".tex,.pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <p className="text-[11px] text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Section Locking & Preamble Guarantee (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">Section Lock Controls</h2>
                <p className="text-[12px] text-ink-muted">
                  Locked sections are preserved verbatim—the AI will never reword or omit items in locked sections.
                </p>
              </div>
            </div>

            <div className="bg-surface border border-hairline rounded-card divide-y divide-hairline shadow-subtle overflow-hidden">
              {dynamicSections.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-[13px] text-ink-muted">
                    No sections identified yet. Upload your LaTeX or PDF master resume to detect and lock sections.
                  </p>
                </div>
              ) : (
                dynamicSections.map((sec) => {
                  const isLocked = lockedSections.includes(sec.name);
                  return (
                    <div
                      key={sec.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-canvas/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-medium text-ink">{sec.name}</span>
                          {isLocked ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-pill bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked Verbatim
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
                              Available for Tailoring
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-muted">
                          {sec.count} recognized content items in master document
                        </p>
                      </div>

                    <button
                      type="button"
                      onClick={() => handleToggleLock(sec.name)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-pill text-[12px] font-medium border inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLocked
                          ? "bg-canvas border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          : "bg-canvas border-hairline text-ink-muted hover:text-ink hover:bg-surface"
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Section</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Lock Section</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Comprehensive Evidence Bank Editor */}
        <div className="pt-6 border-t border-hairline space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                  Evidence Bank
                </span>
                <span className="text-[11px] text-ink-muted">•</span>
                <span className="text-[12px] text-ink-muted">
                  {evidenceList.length} total facts ({confirmedCount} confirmed, {extractedCount} extracted)
                </span>
              </div>
              <h2 className="text-[22px] font-semibold text-ink">
                Candidate Fact Anchors
              </h2>
              <p className="text-[13px] text-ink-muted">
                Every line generated by TailorAI must cite an immutable evidence ID from this bank.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="min-h-[42px] px-5 py-2 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fact to Evidence Bank</span>
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-2 rounded-2xl border border-hairline">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {["All", "Experience", "Project", "Skill", "Education"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-pill text-[12px] font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-canvas text-ink shadow-subtle border border-hairline"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-[280px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search facts or evidence ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-hairline rounded-pill text-[12px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {/* Evidence Fact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvidence.map((ev) => {
              const isConfirmed = ev.status === "confirmed";
              return (
                <div
                  key={ev.id}
                  className="p-5 bg-surface border border-hairline rounded-card shadow-subtle space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-accent px-2 py-0.5 rounded bg-accent/10">
                          {ev.id}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-canvas border border-hairline text-ink">
                          {ev.category || "Experience"}
                        </span>
                      </div>

                      {isConfirmed ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-pill bg-canvas border border-hairline text-ink-muted">
                          Extracted
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-ink font-normal leading-relaxed">
                      "{ev.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2 text-[11px] text-ink-muted">
                    <span className="truncate max-w-[200px]">{ev.sourceName || ev.context}</span>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleConfirmFact(ev.id)}
                          className="px-2.5 py-1 rounded-pill bg-status-supported-bg text-status-supported-text hover:opacity-80 font-medium inline-flex items-center gap-1 cursor-pointer transition-opacity"
                        >
                          <Check className="w-3 h-3" /> Confirm
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteFact(ev.id)}
                        className="p-1 text-ink-muted hover:text-red-500 rounded cursor-pointer transition-colors"
                        title="Delete fact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Add Fact Wizard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-canvas border border-hairline rounded-card shadow-paper max-w-[560px] w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-[17px] font-semibold text-ink">
                Add Fact to Evidence Bank
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink text-[13px]"
              >
                Cancel
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-surface rounded-xl border border-hairline">
              <button
                type="button"
                onClick={() => setFactMode("qa")}
                className={`py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
                  factMode === "qa" ? "bg-canvas text-ink shadow-subtle" : "text-ink-muted hover:text-ink"
                }`}
              >
                What did you do?
              </button>
              <button
                type="button"
                onClick={() => setFactMode("github")}
                className={`py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
                  factMode === "github" ? "bg-canvas text-ink shadow-subtle" : "text-ink-muted hover:text-ink"
                }`}
              >
                GitHub README
              </button>
              <button
                type="button"
                onClick={() => setFactMode("notes")}
                className={`py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
                  factMode === "notes" ? "bg-canvas text-ink shadow-subtle" : "text-ink-muted hover:text-ink"
                }`}
              >
                Project Notes
              </button>
            </div>

            <form onSubmit={handleAddFactSubmit} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                  {factMode === "qa"
                    ? "What did you actually achieve or build?"
                    : factMode === "github"
                    ? "Paste README Achievement / Feature Description"
                    : "Paste Project Specification / Design Note"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={factText}
                  onChange={(e) => setFactText(e.target.value)}
                  placeholder={
                    factMode === "qa"
                      ? "e.g. Led weekly cross-team design review for billing APIs, reducing discrepancy tickets by 30%."
                      : "Paste factual text describing tools, scale, and accomplishments..."
                  }
                  className="w-full p-3 bg-surface border border-hairline rounded-xl text-[13px] text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={factCategory}
                    onChange={(e: any) => setFactCategory(e.target.value)}
                    className="w-full p-2.5 bg-surface border border-hairline rounded-xl text-[12px] text-ink"
                  >
                    <option value="Experience">Experience</option>
                    <option value="Project">Project</option>
                    <option value="Skill">Skill</option>
                    <option value="Education">Education</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1">
                    Context / Employer
                  </label>
                  <input
                    type="text"
                    value={factContext}
                    onChange={(e) => setFactContext(e.target.value)}
                    placeholder="e.g. Nexus Cloud Systems"
                    className="w-full p-2.5 bg-surface border border-hairline rounded-xl text-[12px] text-ink placeholder:text-ink-muted"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] text-ink-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-white rounded-pill text-[13px] font-medium hover:bg-accent-hover shadow-subtle cursor-pointer"
                >
                  Save to Evidence Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileTabBar />
    </div>
  );
}
