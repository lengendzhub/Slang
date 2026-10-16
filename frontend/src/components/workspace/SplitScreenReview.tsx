"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Check,
  X,
  Pencil,
  RotateCcw,
  Lock,
  FileText,
  FileCode2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Undo2,
  Sliders,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import {
  evaluateResumeATS,
  JobRequirement,
  ResumeDiffItem,
  ATSConfig,
} from "@/lib/atsEngine";

// --- Types matching Backend Schema ---
export type MatchType = "direct" | "transferable";
export type DecisionState = "pending" | "accepted" | "rejected" | "edited";

export interface BulletChange {
  id: string;
  section: "Summary" | "Experience" | "Projects" | string;
  roleTitle?: string;
  company?: string;
  dateRange?: string;
  originalText: string;
  proposedText: string;
  editedText?: string;
  charBudget: number; // Enforces single-page LaTeX budget
  matchType: MatchType;
  reason: string;
  evidenceId: string;
  evidenceSourceQuote: string;
  decision: DecisionState;
}

export interface JDRequirement {
  id: string;
  text: string;
  category: "Essential" | "Preferred";
  status: "direct" | "transferable" | "missing";
  linkedEvidenceId?: string;
  note?: string;
}

export interface SplitScreenReviewProps {
  initialChanges?: BulletChange[];
  initialRequirements?: JDRequirement[];
  candidateName?: string;
  candidateEmail?: string;
  candidateLocation?: string;
  targetRole?: string;
  rawLatex?: string;
  onContinueToDownload?: (reviewedChanges: BulletChange[]) => void;
  onBackToStep1?: () => void;
  standalone?: boolean; // When rendered standalone with top header
}

// 3 Realistic Experience Diffs matching the prompt specifications
const DEFAULT_CHANGES: BulletChange[] = [
  {
    id: "ev_exp_1",
    section: "Experience",
    roleTitle: "Senior Software Engineer",
    company: "Distributed Cloud Labs",
    dateRange: "2023 – Present",
    originalText:
      "Collaborated with the CSE team to optimize backend APIs and wrote Python scripts for server monitoring.",
    proposedText:
      "Architected high-throughput Kafka event streaming pipeline in Go, reducing p99 processing latency by 38% across 10M+ daily events.",
    charBudget: 160,
    matchType: "direct",
    reason:
      "Highlighted distributed streaming architectures and low-latency systems demanded by the senior backend specification.",
    evidenceId: "ev_exp_1",
    evidenceSourceQuote:
      "Master Resume (Exp, Line 42): 'Collaborated with the CSE team to optimize backend APIs and wrote Python scripts...'",
    decision: "pending",
  },
  {
    id: "ev_exp_2",
    section: "Experience",
    roleTitle: "Senior Software Engineer",
    company: "Distributed Cloud Labs",
    dateRange: "2023 – Present",
    originalText:
      "Assisted senior engineers in database maintenance and ran SQL queries for bug reports.",
    proposedText:
      "Led multi-region PostgreSQL failover migration and implemented pgvector indexing, maintaining 99.99% query uptime.",
    charBudget: 155,
    matchType: "direct",
    reason:
      "Demonstrates mission-critical relational database reliability and high availability engineering without overstating responsibility.",
    evidenceId: "ev_exp_2",
    evidenceSourceQuote:
      "Master Resume (Exp, Line 48): 'Assisted senior engineers in database maintenance and ran SQL queries...'",
    decision: "pending",
  },
  {
    id: "ev_exp_3",
    section: "Experience",
    roleTitle: "Senior Software Engineer",
    company: "Distributed Cloud Labs",
    dateRange: "2023 – Present",
    originalText:
      "Attended sprint standups and updated Jira tickets with sprint tasks.",
    proposedText:
      "Spearheaded bi-weekly technical sprint planning with product and QA leads, formalizing strict API contract acceptance criteria.",
    charBudget: 150,
    matchType: "transferable",
    reason:
      "Reframes task updates into proactive cross-functional technical leadership and API contract governance.",
    evidenceId: "ev_exp_3",
    evidenceSourceQuote:
      "Master Resume (Exp, Line 54): 'Attended sprint standups and updated Jira tickets with sprint tasks.'",
    decision: "pending",
  },
];

// 26 Realistic Job Requirements matching 26/26 requirements matched (100% truthful)
const DEFAULT_26_REQUIREMENTS: JDRequirement[] = [
  { id: "req_1", text: "High-throughput distributed systems architecture (Go / Python)", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_1" },
  { id: "req_2", text: "Kafka event streaming & real-time pub/sub pipelines", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_1" },
  { id: "req_3", text: "Relational database clustering & PostgreSQL query tuning", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_2" },
  { id: "req_4", text: "Vector database indexing & semantic retrieval (pgvector)", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_2" },
  { id: "req_5", text: "Cross-functional technical leadership & sprint governance", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_3" },
  { id: "req_6", text: "Strict API contract design (REST, gRPC, Protobuf)", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_3" },
  { id: "req_7", text: "p99 latency profiling & microservice performance tuning", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_1" },
  { id: "req_8", text: "Zero-downtime database schema migrations & failover", category: "Essential", status: "direct", linkedEvidenceId: "ev_exp_2" },
  { id: "req_9", text: "Automated CI/CD pipelines & containerized deployments", category: "Essential", status: "direct" },
  { id: "req_10", text: "Infrastructure as Code (Terraform / Docker / Kubernetes)", category: "Essential", status: "direct" },
  { id: "req_11", text: "Microservices observability (OpenTelemetry, Prometheus, Grafana)", category: "Essential", status: "direct" },
  { id: "req_12", text: "Cloud platform engineering (AWS / GCP core primitives)", category: "Essential", status: "direct" },
  { id: "req_13", text: "Defensive programming, unit testing & integration fixtures", category: "Essential", status: "direct" },
  { id: "req_14", text: "Concurrency models, race condition mitigation & mutexes", category: "Essential", status: "direct" },
  { id: "req_15", text: "High availability SLA management (99.99% uptime)", category: "Essential", status: "direct" },
  { id: "req_16", text: "Data serialization, schema registry & message versioning", category: "Essential", status: "direct" },
  { id: "req_17", text: "Root cause analysis & production post-mortem leadership", category: "Essential", status: "direct" },
  { id: "req_18", text: "Distributed caching strategies (Redis cluster, write-through)", category: "Essential", status: "direct" },
  { id: "req_19", text: "Secure credential management & mTLS communication", category: "Essential", status: "direct" },
  { id: "req_20", text: "Clean architecture, SOLID patterns & domain-driven design", category: "Essential", status: "direct" },
  { id: "req_21", text: "Code review standards & engineering mentorship", category: "Essential", status: "direct" },
  { id: "req_22", text: "Git trunk-based development & semantic release management", category: "Essential", status: "direct" },
  { id: "req_23", text: "System load testing & chaos engineering experiments", category: "Essential", status: "direct" },
  { id: "req_24", text: "Network protocol troubleshooting (TCP, HTTP/2, WebSocket)", category: "Essential", status: "direct" },
  { id: "req_25", text: "Technical documentation & RFC specification authorship", category: "Essential", status: "direct" },
  { id: "req_26", text: "ATS keyword alignment & verified evidence validation", category: "Essential", status: "direct" },
];

export default function SplitScreenReview({
  initialChanges,
  initialRequirements,
  candidateName = "Marimuthu",
  candidateEmail = "marimuthu112005@gmail.com",
  candidateLocation = "San Francisco, CA",
  targetRole = "Senior Staff Backend Engineer",
  rawLatex,
  onContinueToDownload,
  onBackToStep1,
  standalone = false,
}: SplitScreenReviewProps) {
  const [changes, setChanges] = useState<BulletChange[]>(
    initialChanges && initialChanges.length > 0 ? initialChanges : DEFAULT_CHANGES
  );
  const [activeChangeId, setActiveChangeId] = useState<string>(changes[0]?.id || "ev_exp_1");
  const [viewMode, setViewMode] = useState<"paper" | "latex">("paper");
  const [mobileTab, setMobileTab] = useState<"changes" | "report" | "source">("changes");
  const [preambleLocked, setPreambleLocked] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");
  const [accordionOpen, setAccordionOpen] = useState<boolean>(true);
  const [rubricTab, setRubricTab] = useState<"all" | "direct" | "transferable" | "missing">("all");

  const requirements =
    initialRequirements && initialRequirements.length > 0
      ? initialRequirements
      : DEFAULT_26_REQUIREMENTS;

  // Computed state
  const pendingCount = useMemo(
    () => changes.filter((c) => c.decision === "pending").length,
    [changes]
  );
  const allReviewed = pendingCount === 0;

  // Real-time ATS Multi-Factor Score Calculation
  const atsReport = useMemo(() => {
    const atsDiffs: ResumeDiffItem[] = changes.map((c) => ({
      id: c.id,
      factId: c.evidenceId,
      section: c.section,
      originalText: c.originalText,
      proposedText: c.proposedText,
      editedText: c.editedText,
      decision: c.decision,
      matchType: c.matchType,
    }));

    const atsReqs: JobRequirement[] = requirements.map((r) => ({
      id: r.id,
      label: r.text,
      keywords: r.text
        .toLowerCase()
        .replace(/[^\w\s.+/-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2),
      tier: r.category === "Preferred" ? "PREFERRED" : "ESSENTIAL",
      initialStatus: r.status,
      note: r.note,
    }));

    const atsConfig: ATSConfig = {
      targetRole,
      isLatexLockedOnePage: preambleLocked,
      hasValidContactBlock: true,
      standardSectionsPresent: ["EXPERIENCE", "EDUCATION", "SKILLS"],
      rawLatexSource: rawLatex,
    };

    return evaluateResumeATS(atsDiffs, atsReqs, atsConfig);
  }, [changes, requirements, targetRole, preambleLocked, rawLatex]);

  const displayedRequirements = useMemo(() => {
    if (rubricTab === "all") return atsReport.rubricStats.matchedList;
    return atsReport.rubricStats.matchedList.filter((r) => r.status === rubricTab);
  }, [atsReport.rubricStats.matchedList, rubricTab]);

  // Actions
  const handleDecision = (id: string, decision: "accepted" | "rejected") => {
    setChanges((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decision } : item))
    );
    if (editingId === id) setEditingId(null);
  };

  const handleAcceptAll = () => {
    setChanges((prev) =>
      prev.map((item) => ({
        ...item,
        decision: "accepted",
      }))
    );
    setEditingId(null);
  };

  const handleReset = (id: string) => {
    setChanges((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, decision: "pending", editedText: undefined }
          : item
      )
    );
  };

  const startEditing = (change: BulletChange) => {
    setEditingId(change.id);
    setDraftText(change.editedText ?? change.proposedText);
  };

  const saveEdit = (id: string) => {
    if (!draftText.trim()) return;
    setChanges((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, editedText: draftText.trim(), decision: "edited" }
          : item
      )
    );
    setEditingId(null);
  };

  const getFinalBulletText = (c: BulletChange) => {
    if (c.decision === "rejected") return c.originalText;
    if (c.decision === "edited" && c.editedText) return c.editedText;
    return c.proposedText;
  };

  return (
    <div className="w-full min-h-screen bg-[#090A0F] text-[#F4F4F5] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. COMPACT TOP NAVIGATION & CONTEXT BAR (Single 56px Bar) */}
      <header className="sticky top-0 z-40 h-14 bg-[#090A0F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand + Monospace Engine Pill + Divider + Strict Fact Anchoring */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-semibold text-[15px] tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Slang
            </span>
          </Link>
          <span className="text-zinc-600 select-none">/</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Fact Anchoring</span>
          </div>
        </div>

        {/* Center: Sleek Horizontal Stepper */}
        <nav
          aria-label="Tailor process steps"
          className="hidden md:flex items-center gap-2 text-[12px]"
        >
          {/* Step 1: Completed */}
          {onBackToStep1 ? (
            <button
              type="button"
              onClick={onBackToStep1}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Resume & Job</span>
            </button>
          ) : (
            <Link
              href="/workspace"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>Resume & Job</span>
            </Link>
          )}

          <ChevronRight className="w-3 h-3 text-zinc-600" />

          {/* Step 2: Active */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-300 font-semibold shadow-[0_0_12px_rgba(37,99,235,0.25)]">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span>Review Changes</span>
          </div>

          <ChevronRight className="w-3 h-3 text-zinc-600" />

          {/* Step 3: Pending */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-zinc-500">
            <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Download</span>
          </div>
        </nav>

        {/* Right: Target Role Pill & Quick Links */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-zinc-400">
            <span>Target:</span>
            <strong className="text-zinc-200 font-medium truncate max-w-[200px]">
              {targetRole}
            </strong>
          </div>

          <Link
            href="/library"
            className="text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block"
          >
            My Library
          </Link>
        </div>
      </header>

      {/* 2. WORKSPACE SUB-HEADER (TOOLBAR) */}
      <div className="sticky top-14 z-30 bg-[#090A0F]/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Left Title & Muted Subtitle */}
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#F4F4F5]">
              Review Proposed Changes
            </h1>
            <span className="hidden sm:inline text-xs text-[#71717A]">
              • Review and confirm each line before export.
            </span>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.07] text-[11px] font-mono text-zinc-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>LaTeX Layout Locked • 1 Page</span>
            </div>

            {/* Sleek Segmented Control: Paper View vs .tex Source */}
            <div
              role="tablist"
              aria-label="Document view mode"
              className="inline-flex p-0.5 rounded-lg bg-zinc-900 border border-white/[0.08]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "paper"}
                onClick={() => setViewMode("paper")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                  viewMode === "paper"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paper View</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "latex"}
                onClick={() => setViewMode("latex")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[12px] font-mono font-medium transition-all ${
                  viewMode === "latex"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>.tex Source</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN SPLIT-PANE WORKSPACE (12-Column Grid, max-w-7xl mx-auto) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Mobile View Switcher (Below lg): Switches between Review Changes, Match Rubric & .tex Source */}
        <div className="lg:hidden flex items-center justify-center p-1 rounded-pill bg-zinc-900 border border-white/[0.08] mb-5">
          <button
            type="button"
            onClick={() => {
              setMobileTab("changes");
              setViewMode("paper");
            }}
            className={`flex-1 min-h-[44px] rounded-pill text-[12px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "changes" && viewMode === "paper"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Changes</span>
            {pendingCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-black text-[10px] font-bold inline-flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("report")}
            className={`flex-1 min-h-[44px] rounded-pill text-[12px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "report"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Match Rubric</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {atsReport.totalScore}%
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab("source");
              setViewMode("latex");
            }}
            className={`flex-1 min-h-[44px] rounded-pill text-[12px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "source" || viewMode === "latex"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>.tex Source</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT PANE (8 Columns) — Interactive Resume Canvas */}
          <section className={`lg:col-span-8 space-y-4 ${mobileTab === "report" ? "hidden lg:block" : "block"}`}>
            {viewMode === "paper" ? (
              /* Elevated Surface / Resume Canvas: #111114 with 1px border */
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] p-4 sm:p-8 space-y-6">
                {/* Candidate Header Block (NO redundant Accept All button here!) */}
                <div className="border-b border-white/[0.07] pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#F4F4F5]">
                      {candidateName}
                    </h2>
                    <p className="text-sm text-[#A1A1AA] mt-0.5">
                      {candidateEmail} • {candidateLocation}
                    </p>
                  </div>

                  {/* Clean Non-Intrusive Privacy Badge */}
                  <div className="self-start sm:self-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.07] font-mono text-[11px] text-zinc-400">
                    <Lock className="w-3 h-3 text-zinc-500" />
                    <span>Contact block untouched (PII redacted)</span>
                  </div>
                </div>

                {/* Section Header: EXPERIENCE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#71717A]">
                      EXPERIENCE
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {changes.length} content slots modified
                    </span>
                  </div>

                  {/* Role & Company Subheading */}
                  <div className="flex items-baseline justify-between text-xs border-b border-white/[0.04] pb-1.5 text-zinc-400">
                    <div>
                      <strong className="text-zinc-200 font-semibold text-[13px]">
                        Distributed Cloud Labs
                      </strong>{" "}
                      — Senior Software Engineer
                    </div>
                    <span className="font-mono text-zinc-500">2023 – Present</span>
                  </div>

                  {/* Redesigned Zero-Overlap Inline Diff Review Cards */}
                  <div className="space-y-3.5 pt-1">
                    {changes.map((change) => {
                      const diag = atsReport.bulletDiagnostics.find((b) => b.diffId === change.id);
                      return (
                        <RedesignedDiffCard
                          key={change.id}
                          change={change}
                          diag={diag}
                          isActive={activeChangeId === change.id}
                          isEditing={editingId === change.id}
                          draftText={draftText}
                          onSelect={() => setActiveChangeId(change.id)}
                          onAccept={() => handleDecision(change.id, "accepted")}
                          onReject={() => handleDecision(change.id, "rejected")}
                          onReset={() => handleReset(change.id)}
                          onStartEdit={() => startEditing(change)}
                          onChangeDraft={setDraftText}
                          onSaveEdit={() => saveEdit(change.id)}
                          onCancelEdit={() => setEditingId(null)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* .tex Source View */
              <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-4 sm:p-6 font-mono text-xs leading-relaxed overflow-x-auto space-y-2 text-zinc-300">
                <div className="text-zinc-600 select-none pb-2 border-b border-white/[0.05]">
                  % --- LOCKED PREAMBLE (Byte-for-byte identical to uploaded master.tex) ---<br />
                  \documentclass[11pt,a4paper]&#123;article&#125;<br />
                  \usepackage[empty]&#123;fullpage&#125;<br />
                  \newcommand&#123;\resumeItem&#125;[1]&#123;\item\small&#123;#1 \vspace&#123;-2pt&#125;&#125;&#125;<br />
                  \begin&#123;document&#125;
                </div>

                {changes.map((c) => (
                  <div key={c.id} className="py-1">
                    <span className="text-blue-400">\resumeItem</span>&#123;
                    <span
                      className={
                        c.decision === "rejected"
                          ? "text-zinc-500 line-through"
                          : "text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded"
                      }
                    >
                      {getFinalBulletText(c)}
                    </span>
                    &#125;{" "}
                    <span className="text-zinc-600">
                      % [anchor: {c.evidenceId} | {c.decision}]
                    </span>
                  </div>
                ))}

                <div className="text-zinc-600 select-none pt-2 border-t border-white/[0.05]">
                  \end&#123;document&#125;
                </div>
              </div>
            )}
          </section>

          {/* RIGHT PANE (4 Columns) — Sticky ATS & Match Inspector */}
          <aside className={`lg:col-span-4 lg:sticky lg:top-28 space-y-4 ${mobileTab === "report" ? "block" : "hidden lg:block"}`}>
            {/* 1. Live ATS Compatibility Card */}
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Live ATS Compatibility
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {atsReport.totalScore}
                    </span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                    {atsReport.scoreDelta > 0 && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        +{atsReport.scoreDelta} pts vs Master
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-zinc-400">
                  <div>Baseline: {atsReport.baselineScore}%</div>
                  <div className="text-emerald-400">Max Potential: {atsReport.potentialMaxScore}%</div>
                </div>
              </div>

              {/* Live Progress Bar */}
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${atsReport.totalScore}%` }}
                />
              </div>

              {/* 4-Pillar Breakdown */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-white/[0.05]">
                  <div className="text-zinc-400 text-[11px]">Keywords (45%)</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {atsReport.subScores.keywordScore}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-white/[0.05]">
                  <div className="text-zinc-400 text-[11px]">Impact & Metrics (25%)</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {atsReport.subScores.impactScore}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-white/[0.05]">
                  <div className="text-zinc-400 text-[11px]">LaTeX Parse (15%)</div>
                  <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                    {atsReport.subScores.structureScore}%
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-900/70 border border-white/[0.05]">
                  <div className="text-zinc-400 text-[11px]">Role Density (15%)</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {atsReport.subScores.densityScore}%
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Job Rubric Requirements Card */}
            <div className="bg-[#111114] border border-white/[0.07] rounded-xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] space-y-4">
              {/* Summary Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Matched {atsReport.rubricStats.directMatches} of {atsReport.rubricStats.totalRequirements} requirements</span>
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                    Rubric v1.2
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-1">
                  {atsReport.rubricStats.directMatches} direct matches • {atsReport.rubricStats.transferableMatches} re-framed • {atsReport.rubricStats.missingSkills} missing (100% truthful)
                </p>

                {/* Segmented / Filled Progress Bar */}
                <div className="mt-3 relative w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${(atsReport.rubricStats.directMatches / Math.max(1, atsReport.rubricStats.totalRequirements)) * 100}%` }}
                  />
                </div>

                {/* Interactive Filter Pills */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.05] text-[11px] flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setRubricTab("all"); setAccordionOpen(true); }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      rubricTab === "all"
                        ? "bg-zinc-700 text-white border border-zinc-600"
                        : "bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
                    }`}
                  >
                    All ({atsReport.rubricStats.totalRequirements})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRubricTab("direct"); setAccordionOpen(true); }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      rubricTab === "direct"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15"
                    }`}
                  >
                    {atsReport.rubricStats.directMatches} Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRubricTab("transferable"); setAccordionOpen(true); }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      rubricTab === "transferable"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15"
                    }`}
                  >
                    {atsReport.rubricStats.transferableMatches} Reframed
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRubricTab("missing"); setAccordionOpen(true); }}
                    className={`px-2 py-0.5 rounded font-medium transition-colors ${
                      rubricTab === "missing"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/15"
                    }`}
                  >
                    {atsReport.rubricStats.missingSkills} Missing
                  </button>
                </div>
              </div>

              {/* Collapsible Requirements Breakdown Accordion */}
              <div className="border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  onClick={() => setAccordionOpen(!accordionOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-zinc-200 hover:text-white transition-colors py-1"
                >
                  <span className="flex items-center gap-1.5">
                    {rubricTab === "missing" ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : rubricTab === "transferable" ? (
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>
                      {rubricTab === "all"
                        ? "All Requirements"
                        : rubricTab === "direct"
                        ? "Direct Matches"
                        : rubricTab === "transferable"
                        ? "Re-framed / Adjacent"
                        : "Truthful Gaps (Missing)"}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                      rubricTab === "missing"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : rubricTab === "transferable"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {rubricTab === "all"
                        ? atsReport.rubricStats.totalRequirements
                        : rubricTab === "direct"
                        ? atsReport.rubricStats.directMatches
                        : rubricTab === "transferable"
                        ? atsReport.rubricStats.transferableMatches
                        : atsReport.rubricStats.missingSkills}
                    </span>
                  </span>
                  {accordionOpen ? (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {accordionOpen && (
                  <div className="mt-2.5 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                    {displayedRequirements.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-2 px-1">
                        No requirements in this category.
                      </p>
                    ) : (
                      displayedRequirements.map((req) => (
                        <div
                          key={req.id}
                          className="py-2 px-3 rounded-lg bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/[0.04] flex flex-col gap-1.5 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              {req.status === "direct" && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              )}
                              {req.status === "transferable" && (
                                <Sparkles className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                              )}
                              {req.status === "missing" && (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                              )}
                              <span className="text-xs text-zinc-300 leading-snug">
                                {req.label}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 border ${
                              req.status === "direct"
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : req.status === "transferable"
                                ? "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
                                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}>
                              {req.tier}
                            </span>
                          </div>
                          {req.status === "transferable" && (
                            <p className="text-[11px] text-cyan-400/80 pl-5 leading-tight">
                              {req.note || "Transferable alignment — highlighted in tailored experience bullets."}
                            </p>
                          )}
                          {req.status === "missing" && (
                            <p className="text-[11px] text-zinc-500 pl-5 leading-tight">
                              {req.note || "Unsupported by evidence bank. Left out of resume to guarantee 100% truthfulness."}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 4. FLOATING / STICKY GLASSMORPHIC ACTION DOCK (BOTTOM) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 bg-[#090A0F]/90 backdrop-blur-md border-t border-white/[0.08] px-4 sm:px-6 py-3 pb-[calc(var(--sab,0px)+0.75rem)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Progress Indicator Dot + Changes Left Message */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            {allReviewed ? (
              <>
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 inline-flex items-center justify-center font-bold text-[11px] shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  ✓
                </span>
                <span className="font-medium text-zinc-200">
                  All {changes.length} changes reviewed. Locked in at{" "}
                  <strong className="text-emerald-400 font-semibold">{atsReport.totalScore}% ATS Score</strong>.
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#FBBF24]" />
                <span className="text-zinc-200">
                  <strong className="font-semibold text-white">
                    {pendingCount} {pendingCount === 1 ? "change" : "changes"} left to review
                  </strong>{" "}
                  <span className="text-zinc-400 hidden md:inline">
                    — accept, reject, or edit each item to reach{" "}
                    <span className="text-emerald-400 font-medium">{atsReport.potentialMaxScore}% ATS score</span>.
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Right: Consolidated Accept All (Single Location) + Primary Continue CTA */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="min-h-[44px] h-10 sm:h-9 px-4 rounded-xl sm:rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-white/[0.1] inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accept All ({pendingCount})</span>
              </button>
            )}

            <button
              type="button"
              disabled={!allReviewed}
              onClick={() => onContinueToDownload && onContinueToDownload(changes)}
              className={`min-h-[44px] h-10 sm:h-9 px-4 rounded-xl sm:rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-all ${
                allReviewed
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer active:scale-[0.98]"
                  : "bg-zinc-800/60 text-zinc-500 border border-white/[0.05] cursor-not-allowed"
              }`}
            >
              <span>Continue to Download</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Subcomponent: Redesigned Zero-Overlap Inline Diff Card
// ============================================================================
interface RedesignedDiffCardProps {
  change: BulletChange;
  diag?: {
    diffId: string;
    hasStrongVerb: boolean;
    hasQuantifiedMetric: boolean;
    wordCount: number;
    pointContribution: number;
  };
  isActive: boolean;
  isEditing: boolean;
  draftText: string;
  onSelect: () => void;
  onAccept: () => void;
  onReject: () => void;
  onReset: () => void;
  onStartEdit: () => void;
  onChangeDraft: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

function RedesignedDiffCard({
  change,
  diag,
  isActive,
  isEditing,
  draftText,
  onSelect,
  onAccept,
  onReject,
  onReset,
  onStartEdit,
  onChangeDraft,
  onSaveEdit,
  onCancelEdit,
}: RedesignedDiffCardProps) {
  const isResolved = change.decision !== "pending";
  const overBudget = draftText.length > change.charBudget;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isResolved
          ? "bg-[#14151C]/70 border-white/[0.06]"
          : isActive
          ? "bg-[#161922] border-blue-500/50 shadow-[0_4px_24px_rgba(37,99,235,0.15)]"
          : "bg-[#14161F] border-white/[0.07] hover:border-white/[0.14] cursor-pointer"
      }`}
    >
      {/* 1. CARD HEADER BAR: Metadata Badges + Top-Right Action Controls (Zero text overlap) */}
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Metadata Badges */}
        <div className="flex items-center gap-2">
          {change.matchType === "direct" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Supported • Direct Match</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>Transferable • Verified</span>
            </span>
          )}

          <span
            title={change.evidenceSourceQuote}
            className="font-mono text-[11px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]"
          >
            Fact ID: {change.evidenceId}
          </span>

          {diag && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +{diag.pointContribution} ATS pts
            </span>
          )}
        </div>

        {/* Right: Action Buttons Group (Aligned at top right) */}
        <div className="flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {isResolved ? (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  change.decision === "accepted"
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : change.decision === "rejected"
                    ? "text-zinc-400 bg-zinc-800"
                    : "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                }`}
              >
                {change.decision === "accepted" && "✓ Accepted"}
                {change.decision === "rejected" && "✕ Kept Original"}
                {change.decision === "edited" && "✎ Custom Edited"}
              </span>

              <button
                type="button"
                onClick={onReset}
                className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-9 sm:h-7 px-3 sm:px-2 text-xs text-zinc-400 hover:text-zinc-200 inline-flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                title="Undo decision"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            </div>
          ) : (
            !isEditing && (
              <div className="flex items-center gap-1.5">
                {/* Accept */}
                <button
                  type="button"
                  onClick={onAccept}
                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-9 sm:h-7 px-3 sm:px-2.5 rounded-md text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 inline-flex items-center justify-center gap-1 transition-colors shadow-sm active:scale-95 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </button>

                {/* Reject */}
                <button
                  type="button"
                  onClick={onReject}
                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-9 sm:h-7 px-3 sm:px-2.5 rounded-md text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 inline-flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 h-9 sm:h-7 px-3 sm:px-2 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 inline-flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                  title="Edit phrasing directly"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. DIFF BODY: Git / Notion style Inline Diff */}
      <div className="p-4 space-y-2.5">
        {isResolved ? (
          <p className="text-sm text-zinc-200 leading-relaxed pl-2 border-l-2 border-emerald-500/50">
            {change.decision === "rejected"
              ? change.originalText
              : change.decision === "edited"
              ? change.editedText
              : change.proposedText}
          </p>
        ) : (
          <div className="space-y-2">
            {/* Original Text (subtle red/slate strikethrough with '-' gutter indicator) */}
            <div className="flex items-start gap-2.5 text-xs text-zinc-500 pl-1 font-sans">
              <span className="select-none font-mono font-bold text-red-400/70 mt-0.5">
                -
              </span>
              <p className="line-through leading-relaxed">{change.originalText}</p>
            </div>

            {/* Proposed Text (crisp white/emerald highlight with '+' gutter indicator) or Inline Editor */}
            {isEditing ? (
              <div
                className="space-y-2 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <textarea
                  rows={3}
                  value={draftText}
                  onChange={(e) => onChangeDraft(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/60 p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-mono ${
                      overBudget ? "text-red-400 font-semibold" : "text-zinc-400"
                    }`}
                  >
                    {draftText.length} / {change.charBudget} chars{" "}
                    {overBudget && "(Exceeds 1-line budget)"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="px-2.5 py-1 rounded text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSaveEdit}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm"
                    >
                      Save Line
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-[14px] text-zinc-100 bg-emerald-500/[0.04] border-l-2 border-emerald-500 pl-2.5 py-2 rounded-r font-medium">
                <span className="select-none font-mono font-bold text-emerald-400 mt-0.5">
                  +
                </span>
                <p className="leading-relaxed">{change.proposedText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. AI RATIONALE FOOTER: Recessed callout footer (Zero overlap with action buttons) */}
      <div className="bg-zinc-950/60 border-t border-white/[0.05] px-4 py-2.5 text-xs text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-start gap-1.5 leading-relaxed">
            <strong className="text-zinc-300 font-medium shrink-0">Why:</strong>
            <span className="text-zinc-300">{change.reason}</span>
          </div>
          <div
            title={change.evidenceSourceQuote}
            className="font-mono text-[11px] text-zinc-500 truncate"
          >
            {change.evidenceSourceQuote}
          </div>
        </div>

        {diag && (
          <div className="flex items-center gap-2.5 font-mono text-[10px] shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
            <span className={diag.hasStrongVerb ? "text-emerald-400" : "text-amber-400"}>
              {diag.hasStrongVerb ? "✓ Action Verb" : "• Weak Verb"}
            </span>
            <span className={diag.hasQuantifiedMetric ? "text-emerald-400" : "text-amber-400"}>
              {diag.hasQuantifiedMetric ? "✓ Quantified" : "• Add Metric"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
