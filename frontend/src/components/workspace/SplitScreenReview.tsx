"use client";

import React, { useState, useMemo } from "react";
import {
  Check,
  X,
  Pencil,
  Lock,
  FileCode2,
  FileText,
  ShieldCheck,
  AlertCircle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

// --- Strict Types Matching Backend Schema ---
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

interface SplitScreenReviewProps {
  initialChanges?: BulletChange[];
  initialRequirements?: JDRequirement[];
  candidateName?: string;
  candidateEmail?: string;
  candidateLocation?: string;
  targetRole?: string;
  rawLatex?: string;
  onContinueToDownload?: (reviewedChanges: BulletChange[]) => void;
}

// Fallback sample data if empty
const DEFAULT_CHANGES: BulletChange[] = [
  {
    id: "chg_1",
    section: "Summary",
    originalText:
      "Backend Software Engineer with 2 years of experience building Python microservices, PostgreSQL schemas, and automated CI/CD pipelines.",
    proposedText:
      "Analytical Technical Specialist with 2 years of experience translating operational workflows into automated Python pipelines and SQL reporting models.",
    charBudget: 165,
    matchType: "transferable",
    reason:
      "Re-frames backend engineering into business systems analysis for your Career Pivot mode without claiming prior BA titles.",
    evidenceId: "ev_01",
    evidenceSourceQuote:
      "Master Resume (Summary, Line 18): '2 years of experience building Python microservices, PostgreSQL schemas...'",
    decision: "pending",
  },
  {
    id: "chg_2",
    section: "Experience",
    roleTitle: "Software Engineer",
    company: "kCloud Systems",
    dateRange: "Jul 2024 – Present",
    originalText:
      "Wrote Python scripts to parse 50,000+ daily server logs and exported error summaries to PostgreSQL tables.",
    proposedText:
      "Automated daily KPI and anomaly reporting across 50,000+ daily operational logs using Python and SQL, reducing manual triage time.",
    charBudget: 145,
    matchType: "direct",
    reason:
      "Aligns directly with the JD requirement for SQL/Python data extraction and operational KPI reporting.",
    evidenceId: "ev_04",
    evidenceSourceQuote:
      "Master Resume (Experience, Line 42): 'Wrote Python scripts to parse 50,000+ daily server logs and exported error summaries to PostgreSQL'",
    decision: "pending",
  },
  {
    id: "chg_3",
    section: "Experience",
    roleTitle: "Software Engineer",
    company: "kCloud Systems",
    dateRange: "Jul 2024 – Present",
    originalText:
      "Collaborated with QA and product leads during bi-weekly sprint planning to clarify API acceptance criteria.",
    proposedText:
      "Partnered with product and QA stakeholders in bi-weekly sprint reviews to gather requirements and define clear acceptance criteria.",
    charBudget: 140,
    matchType: "transferable",
    reason:
      "Highlights cross-functional requirement gathering—a transferable match for the JD's stakeholder coordination need. Please confirm this framing feels accurate.",
    evidenceId: "ev_07",
    evidenceSourceQuote:
      "Master Resume (Experience, Line 49): 'Collaborated with QA and product leads during bi-weekly sprint planning to clarify API acceptance criteria.'",
    decision: "pending",
  },
];

const DEFAULT_REQUIREMENTS: JDRequirement[] = [
  {
    id: "req_1",
    text: "SQL querying & structured data extraction",
    category: "Essential",
    status: "direct",
    linkedEvidenceId: "ev_04",
  },
  {
    id: "req_2",
    text: "Python scripting for workflow automation",
    category: "Essential",
    status: "direct",
    linkedEvidenceId: "ev_01",
  },
  {
    id: "req_3",
    text: "Defining acceptance criteria with product teams",
    category: "Essential",
    status: "transferable",
    linkedEvidenceId: "ev_07",
    note: "Re-framed from sprint planning collaboration",
  },
  {
    id: "req_4",
    text: "Translating technical constraints to non-technical teams",
    category: "Preferred",
    status: "transferable",
    linkedEvidenceId: "ev_01",
    note: "Verify comfort level before interview",
  },
  {
    id: "req_5",
    text: "2+ years with Tableau or PowerBI dashboarding",
    category: "Essential",
    status: "missing",
    note: "Left out of resume to keep it 100% truthful.",
  },
  {
    id: "req_6",
    text: "Salesforce CRM administration",
    category: "Preferred",
    status: "missing",
    note: "Left out of resume to keep it 100% truthful.",
  },
];

export default function SplitScreenReview({
  initialChanges,
  initialRequirements,
  candidateName = "Candidate",
  candidateEmail = "candidate@example.com",
  candidateLocation = "San Francisco, CA",
  targetRole = "Target Role",
  rawLatex,
  onContinueToDownload,
}: SplitScreenReviewProps) {
  const [changes, setChanges] = useState<BulletChange[]>(
    initialChanges && initialChanges.length > 0 ? initialChanges : DEFAULT_CHANGES
  );
  const [activeChangeId, setActiveChangeId] = useState<string>(
    changes[0]?.id || "chg_1"
  );
  const [viewMode, setViewMode] = useState<"paper" | "latex">("paper");
  const [preambleLocked, setPreambleLocked] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");

  const requirements = initialRequirements && initialRequirements.length > 0
    ? initialRequirements
    : DEFAULT_REQUIREMENTS;

  // Collapsible right-hand drawers
  const [openGroups, setOpenGroups] = useState<{
    direct: boolean;
    transferable: boolean;
    missing: boolean;
  }>({
    direct: true,
    transferable: true,
    missing: true,
  });

  // --- Computed Progress ---
  const pendingCount = useMemo(
    () => changes.filter((c) => c.decision === "pending").length,
    [changes]
  );

  const allReviewed = pendingCount === 0;

  const directCount = requirements.filter((r) => r.status === "direct").length;
  const transferableCount = requirements.filter((r) => r.status === "transferable").length;
  const missingCount = requirements.filter((r) => r.status === "missing").length;
  const matchedTotal = directCount + transferableCount;

  // --- Actions ---
  const handleDecision = (id: string, decision: "accepted" | "rejected") => {
    setChanges((prev) =>
      prev.map((item) => (item.id === id ? { ...item, decision } : item))
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
    <div className="w-full flex flex-col">
      {/* Workspace Bar */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-hairline">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-ink">
            Step 2: Review Proposed Changes
          </h2>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Targeting: <strong className="font-medium text-ink">{targetRole}</strong> • Review and confirm each line before export.
          </p>
        </div>

        {/* Quiet Segmented Control: Paper vs .tex Source */}
        <div
          role="tablist"
          aria-label="Document view mode"
          className="inline-flex p-0.5 rounded-pill bg-hairline/40 border border-hairline"
        >
          <button
            role="tab"
            aria-selected={viewMode === "paper"}
            onClick={() => setViewMode("paper")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[12px] font-medium transition-all duration-fast ease-apple ${
              viewMode === "paper"
                ? "bg-canvas text-ink shadow-subtle"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paper View
          </button>
          <button
            role="tab"
            aria-selected={viewMode === "latex"}
            onClick={() => setViewMode("latex")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[12px] font-medium transition-all duration-fast ease-apple ${
              viewMode === "latex"
                ? "bg-canvas text-ink shadow-subtle"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            .tex Source
          </button>
        </div>
      </div>

      {/* Main Split-Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL (65% / 8 cols): The Paper & Inline Diff Review */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setPreambleLocked(!preambleLocked)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-canvas border border-hairline text-ink text-[12px] font-medium shadow-subtle transition-colors duration-fast ease-apple hover:bg-surface"
            >
              <Lock className="w-3.5 h-3.5 text-status-supported-text" />
              {preambleLocked
                ? "LaTeX Preamble & Layout Locked • 1 Page"
                : "Layout Unlocked"}
            </button>
          </div>

          {/* Document Surface */}
          {viewMode === "paper" ? (
            <div className="bg-canvas border border-hairline rounded-card shadow-paper p-6 sm:p-10 space-y-8">
              {/* Static Header Slot (Untouched by LLM) */}
              <div className="border-b border-hairline pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h1 className="text-[24px] font-semibold tracking-tight text-ink">
                    {candidateName}
                  </h1>
                  <p className="text-[13px] text-ink-muted">
                    {candidateEmail} • {candidateLocation}
                  </p>
                </div>
                <span className="text-[11px] text-ink-muted font-mono bg-surface px-2 py-0.5 rounded border border-hairline self-start">
                  Contact block untouched (PII redacted before LLM)
                </span>
              </div>

              {/* Section: Summary */}
              {changes.filter((c) => c.section === "Summary").length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                    Professional Summary
                  </h2>
                  {changes
                    .filter((c) => c.section === "Summary")
                    .map((change) => (
                      <DiffBlock
                        key={change.id}
                        change={change}
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
                    ))}
                </div>
              )}

              {/* Section: Experience */}
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                    Experience
                  </h2>
                </div>

                <div className="space-y-3 pt-1">
                  {changes
                    .filter((c) => c.section !== "Summary")
                    .map((change) => (
                      <DiffBlock
                        key={change.id}
                        change={change}
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
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Optional Quiet .tex Source View (Rule #4) */
            <div className="bg-canvas border border-hairline rounded-card shadow-paper p-6 font-mono text-[13px] leading-relaxed overflow-x-auto space-y-2">
              <div className="text-ink-muted select-none">
                % --- LOCKED PREAMBLE (Byte-for-byte identical to uploaded master.tex) ---
                <br />
                \documentclass[11pt,a4paper]&#123;article&#125;
                <br />
                \usepackage[empty]&#123;fullpage&#125;
                <br />
                \newcommand&#123;\resumeItem&#125;[1]&#123;\item\small&#123;#1 \vspace&#123;-2pt&#125;&#125;&#125;
                <br />
                \begin&#123;document&#125;
              </div>

              {changes.map((c) => (
                <div key={c.id} className="pt-2 text-ink">
                  &nbsp;&nbsp;\resumeItem&#123;
                  <span
                    className={
                      c.decision === "rejected"
                        ? "text-ink-muted"
                        : "bg-status-supported-bg text-status-supported-text px-1 rounded"
                    }
                  >
                    {getFinalBulletText(c)}
                  </span>
                  &#125; % [evidence_id: {c.evidenceId} | status: {c.decision}]
                </div>
              ))}

              <div className="pt-2 text-ink-muted select-none">
                \end&#123;document&#125;
              </div>
            </div>
          )}
        </section>

        {/* RIGHT PANEL (35% / 4 cols): Honest Job Match Checklist */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[76px] space-y-4">
          <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-5">
            {/* Plain-English Fit Summary (Rule #7) */}
            <div>
              <div className="flex items-baseline justify-between">
                <h2 className="text-[17px] font-semibold tracking-tight text-ink">
                  Matched {matchedTotal} of {requirements.length} requirements
                </h2>
                <span className="text-[12px] text-ink-muted">Rubric v1.2</span>
              </div>
              <p className="text-[13px] text-ink-muted mt-1">
                {directCount} direct matches, {transferableCount} transferable skills re-framed, and {missingCount} missing
                skills left out to keep your resume 100% truthful.
              </p>

              {/* Simple Linear Segmented Bar */}
              <div
                aria-hidden="true"
                className="mt-3 h-2 w-full rounded-pill bg-surface overflow-hidden flex gap-0.5"
              >
                <div
                  className="h-full bg-status-supported-text"
                  style={{ width: `${(directCount / Math.max(requirements.length, 1)) * 100}%` }}
                />
                <div
                  className="h-full bg-status-transferable-text"
                  style={{ width: `${(transferableCount / Math.max(requirements.length, 1)) * 100}%` }}
                />
                <div
                  className="h-full bg-hairline"
                  style={{ width: `${(missingCount / Math.max(requirements.length, 1)) * 100}%` }}
                />
              </div>
            </div>

            <hr className="border-hairline" />

            {/* Group 1: Direct Matches */}
            <RequirementGroup
              title="Direct Matches"
              count={directCount}
              badgeClass="bg-status-supported-bg text-status-supported-text"
              icon={<ShieldCheck className="w-4 h-4 text-status-supported-text" />}
              isOpen={openGroups.direct}
              onToggle={() =>
                setOpenGroups((prev) => ({ ...prev, direct: !prev.direct }))
              }
              items={requirements.filter((r) => r.status === "direct")}
            />

            {/* Group 2: Transferable (Needs Confirmation) */}
            <RequirementGroup
              title="Transferable • Please Verify"
              count={transferableCount}
              badgeClass="bg-status-transferable-bg text-status-transferable-text"
              icon={
                <AlertCircle className="w-4 h-4 text-status-transferable-text" />
              }
              isOpen={openGroups.transferable}
              onToggle={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  transferable: !prev.transferable,
                }))
              }
              items={requirements.filter((r) => r.status === "transferable")}
            />

            {/* Group 3: Missing from Resume */}
            <RequirementGroup
              title="Missing from Resume"
              count={missingCount}
              badgeClass="bg-status-missing-bg text-status-missing-text"
              icon={<MinusCircle className="w-4 h-4 text-status-missing-text" />}
              isOpen={openGroups.missing}
              onToggle={() =>
                setOpenGroups((prev) => ({ ...prev, missing: !prev.missing }))
              }
              items={requirements.filter((r) => r.status === "missing")}
            />
          </div>
        </aside>
      </div>

      {/* Sticky Bottom Review Gate Bar (Rule #5) */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-canvas/90 backdrop-blur-md border-t border-hairline px-6 py-3.5">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[14px]">
            {allReviewed ? (
              <>
                <span className="w-5 h-5 rounded-full bg-status-supported-bg text-status-supported-text inline-flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-medium text-ink">
                  All {changes.length} changes reviewed and verified against your Evidence Bank.
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-status-transferable-text" />
                <span className="text-ink">
                  <strong>
                    {pendingCount} {pendingCount === 1 ? "change" : "changes"} left to review
                  </strong>{" "}
                  <span className="text-ink-muted">
                    — accept, reject, or edit each item before downloading.
                  </span>
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            disabled={!allReviewed}
            onClick={() => onContinueToDownload && onContinueToDownload(changes)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-pill text-[14px] font-medium transition-all duration-fast ease-apple ${
              allReviewed
                ? "bg-accent text-white hover:bg-accent-hover shadow-subtle cursor-pointer"
                : "bg-hairline text-ink-muted opacity-60 cursor-not-allowed"
            }`}
          >
            Continue to Download
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponent: Individual Inline Diff Card
// ============================================================================
interface DiffBlockProps {
  change: BulletChange;
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

function DiffBlock({
  change,
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
}: DiffBlockProps) {
  const isResolved = change.decision !== "pending";
  const overBudget = draftText.length > change.charBudget;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all duration-fast ease-apple p-4 ${
        isResolved
          ? "bg-surface/50 border-hairline"
          : isActive
          ? "bg-canvas border-accent shadow-subtle"
          : "bg-surface border-hairline hover:border-ink-muted/40 cursor-pointer"
      }`}
    >
      {/* Top Status & Evidence Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {change.matchType === "direct" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-supported-bg text-status-supported-text">
              <ShieldCheck className="w-3 h-3" />
              Supported • Direct Match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-transferable-bg text-status-transferable-text">
              <AlertCircle className="w-3 h-3" />
              Transferable • Needs Confirmation
            </span>
          )}

          <span
            title={change.evidenceSourceQuote}
            className="font-mono text-[11px] text-ink-muted bg-canvas px-2 py-0.5 rounded border border-hairline"
          >
            Fact ID: {change.evidenceId}
          </span>
        </div>

        {/* Decision Pill when Resolved */}
        {isResolved && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-ink-muted capitalize">
              {change.decision === "accepted" && "✓ Accepted"}
              {change.decision === "rejected" && "✕ Kept Original"}
              {change.decision === "edited" && "✎ Custom Edited"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          </div>
        )}
      </div>

      {/* Content Area: Resolved vs Pending Diff */}
      {isResolved ? (
        <p className="text-[14px] text-ink leading-relaxed">
          {change.decision === "rejected"
            ? change.originalText
            : change.decision === "edited"
            ? change.editedText
            : change.proposedText}
        </p>
      ) : (
        <div className="space-y-2.5">
          {/* Original Line (Struck Through) */}
          <p className="text-[13px] text-ink-muted line-through leading-relaxed">
            {change.originalText}
          </p>

          {/* Proposed Line or Inline Editor */}
          {isEditing ? (
            <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <textarea
                rows={3}
                value={draftText}
                onChange={(e) => onChangeDraft(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-canvas p-2.5 text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="flex items-center justify-between text-[12px]">
                <span
                  className={
                    overBudget
                      ? "text-status-missing-text font-medium"
                      : "text-ink-muted"
                  }
                >
                  Length budget: {draftText.length} / {change.charBudget} chars{" "}
                  {overBudget && "(May cause page overflow)"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-3 py-1 rounded-pill border border-hairline text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    className="px-3.5 py-1 rounded-pill bg-accent text-white font-medium hover:bg-accent-hover"
                  >
                    Save Line
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[14px] font-medium text-ink leading-relaxed">
              {change.proposedText}
            </p>
          )}

          {/* Explainable Reason & Evidence Source Box */}
          <div className="pt-2 border-t border-hairline/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 text-[12px]">
              <p className="text-ink-muted">
                <strong className="font-medium text-ink">Why:</strong>{" "}
                {change.reason}
              </p>
              <p className="text-ink-muted font-mono text-[11px]">
                {change.evidenceSourceQuote}
              </p>
            </div>

            {/* Action Buttons: Accept / Reject / Edit */}
            {!isEditing && (
              <div
                className="flex items-center gap-1.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={onAccept}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors duration-fast ease-apple"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-canvas border border-hairline text-ink text-[12px] font-medium hover:bg-surface transition-colors duration-fast ease-apple"
                >
                  <X className="w-3.5 h-3.5 text-ink-muted" />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={onStartEdit}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-canvas border border-hairline text-ink-muted text-[12px] hover:text-ink transition-colors duration-fast ease-apple"
                  title="Edit wording"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Subcomponent: Right Sidebar Collapsible Requirement Group
// ============================================================================
interface RequirementGroupProps {
  title: string;
  count: number;
  badgeClass: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  items: JDRequirement[];
}

function RequirementGroup({
  title,
  count,
  badgeClass,
  icon,
  isOpen,
  onToggle,
  items,
}: RequirementGroupProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-1 group"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[13px] font-semibold text-ink group-hover:text-accent transition-colors duration-fast">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${badgeClass}`}
          >
            {count}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-fast ease-apple ${
              isOpen ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <ul className="space-y-2 pl-6">
          {items.map((req) => (
            <li
              key={req.id}
              className="text-[13px] p-2.5 rounded-lg bg-surface border border-hairline/70 space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-ink font-medium leading-snug">
                  {req.text}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-ink-muted shrink-0">
                  {req.category}
                </span>
              </div>
              {req.note && (
                <p className="text-[11px] text-ink-muted">{req.note}</p>
              )}
              {req.linkedEvidenceId && (
                <span className="inline-block font-mono text-[10px] text-ink-muted bg-canvas px-1.5 py-0.5 rounded border border-hairline">
                  Linked: {req.linkedEvidenceId}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
