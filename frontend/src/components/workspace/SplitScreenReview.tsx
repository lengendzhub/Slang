"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Check,
  X,
  Lock,
  FileText,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Layers,
  Sun,
  Moon,
} from "lucide-react";
import {
  evaluateResumeATS,
  JobRequirement,
  ResumeDiffItem,
  ATSConfig,
} from "@/lib/atsEngine";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  getEffectiveTheme,
  toggleTheme as executeToggleTheme,
  THEME_CHANGE_EVENT,
} from "@/lib/theme";

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
  standalone?: boolean;
}

export default function SplitScreenReview({
  initialChanges,
  initialRequirements,
  candidateName = "",
  candidateEmail = "",
  targetRole = "Target Role",
  rawLatex,
  onContinueToDownload,
  onBackToStep1,
}: SplitScreenReviewProps) {
  const [changes, setChanges] = useState<BulletChange[]>(initialChanges || []);
  const [prevInitialChanges, setPrevInitialChanges] = useState(initialChanges);
  if (initialChanges !== prevInitialChanges) {
    setPrevInitialChanges(initialChanges);
    setChanges(initialChanges || []);
  }

  const [viewMode, setViewMode] = useState<"paper" | "latex">("paper");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState<string>("");
  const [mobileRubricOpen, setMobileRubricOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(getEffectiveTheme() === "dark");

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIsDark(customEvent.detail);
      } else {
        setIsDark(getEffectiveTheme() === "dark");
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = executeToggleTheme();
    setIsDark(nextTheme === "dark");
  };

  // Collapsible Rubric Groups
  const [directOpen, setDirectOpen] = useState(true);
  const [transferableOpen, setTransferableOpen] = useState(true);
  const [missingOpen, setMissingOpen] = useState(true);

  const requirements = useMemo(() => initialRequirements || [], [initialRequirements]);

  // Computed state
  const pendingCount = useMemo(
    () => changes.filter((c) => c.decision === "pending").length,
    [changes]
  );
  const allReviewed = pendingCount === 0;

  // Real-time ATS Score Calculation
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
      isLatexLockedOnePage: true,
      hasValidContactBlock: true,
      standardSectionsPresent: ["EXPERIENCE", "EDUCATION", "SKILLS"],
      rawLatexSource: rawLatex,
    };

    return evaluateResumeATS(atsDiffs, atsReqs, atsConfig);
  }, [changes, requirements, targetRole, rawLatex]);

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

  const handleUndo = (id: string) => {
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

  const directReqs = requirements.filter((r) => r.status === "direct");
  const transferableReqs = requirements.filter((r) => r.status === "transferable");
  const missingReqs = requirements.filter((r) => r.status === "missing");

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-accent selection:text-white">
      {/* 1. Slim Apple Top Context Header */}
      <header className="sticky top-0 z-40 h-12 frosted-glass px-4 sm:px-6 flex items-center justify-between border-b border-hairline">
        <div className="flex items-center gap-3">
          {onBackToStep1 && (
            <button
              type="button"
              onClick={onBackToStep1}
              className="text-[13px] text-ink-secondary hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Step 1</span>
            </button>
          )}
          <span className="text-separator hidden sm:inline">|</span>
          <span className="font-semibold text-[14px] text-ink truncate max-w-[220px]">
            {targetRole}
          </span>
        </div>

        {/* View Mode Toggle: Paper View vs .tex Source + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface active:scale-95 transition-all cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
          </button>

          <SegmentedControl
            options={[
              { id: "paper", label: "Paper View" },
              { id: "latex", label: ".tex Source" },
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as "paper" | "latex")}
            name="workspace-view-mode"
          />

          {/* Mobile Rubric Sheet Trigger */}
          <button
            type="button"
            onClick={() => setMobileRubricOpen(true)}
            className="lg:hidden pill-btn pill-btn-secondary px-3 py-1 text-[12px] min-h-[32px] gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Rubric ({atsReport.totalScore}%)</span>
          </button>
        </div>
      </header>

      {/* 2. Main 65 / 35 Split Layout */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 65% Paper Canvas (8 Cols out of 12) */}
          <main className="lg:col-span-8 space-y-4">
            {viewMode === "paper" ? (
              /* The Paper Canvas */
              <div className="bg-canvas border border-hairline rounded-card shadow-paper p-6 sm:p-10 space-y-8">
                {/* Locked PII-Redacted Contact Block */}
                <div className="border-b border-hairline pb-5 text-center space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill bg-surface border border-hairline text-[11px] font-mono text-ink-secondary mb-1">
                    <Lock className="w-3 h-3 text-status-supported-text" />
                    <span>Contact Block Locked • PII Redacted</span>
                  </div>
                  <h2 className="text-[22px] font-semibold tracking-tight text-ink">
                    {candidateName || "Candidate Master"}
                  </h2>
                  <p className="text-[12px] font-mono text-ink-secondary">
                    {candidateEmail ? `[Redacted Email: ${candidateEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}]` : "[Email Protected]"} • [Phone Redacted] • [Location Protected]
                  </p>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-hairline pb-2">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-ink font-mono">
                    Experience & Contributions
                  </h3>
                  <span className="text-[11px] font-mono text-ink-secondary">
                    Single-Page Budget Locked
                  </span>
                </div>

                {/* Empty State */}
                {changes.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-ink-secondary mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="text-[16px] font-semibold text-ink">
                      No Diff Proposals Available
                    </h4>
                    <p className="apple-body text-ink-secondary text-[13px] max-w-[340px] mx-auto">
                      Upload your LaTeX resume in Step 1 to generate verifiable sentence modifications.
                    </p>
                  </div>
                ) : (
                  /* Inline Diff Cards */
                  <div className="space-y-4">
                    {changes.map((change) => (
                      <InlineDiffCard
                        key={change.id}
                        change={change}
                        isEditing={editingId === change.id}
                        draftText={draftText}
                        onAccept={() => handleDecision(change.id, "accepted")}
                        onReject={() => handleDecision(change.id, "rejected")}
                        onUndo={() => handleUndo(change.id)}
                        onStartEdit={() => startEditing(change)}
                        onChangeDraft={setDraftText}
                        onSaveEdit={() => saveEdit(change.id)}
                        onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* .tex Source View */
              <div className="bg-canvas border border-hairline rounded-card p-6 font-mono text-[12px] leading-relaxed overflow-x-auto space-y-2 text-ink shadow-paper">
                <div className="text-ink-secondary select-none pb-2 border-b border-hairline text-[11px]">
                  % --- LOCKED PREAMBLE (Byte-for-byte identical to uploaded master.tex) ---<br />
                  \documentclass[11pt,a4paper]&#123;article&#125;<br />
                  \usepackage[empty]&#123;fullpage&#125;<br />
                  \newcommand&#123;\resumeItem&#125;[1]&#123;\item\small&#123;#1 \vspace&#123;-2pt&#125;&#125;&#125;<br />
                  \begin&#123;document&#125;
                </div>

                {changes.map((c) => (
                  <div key={c.id} className="py-1">
                    <span className="text-accent">\resumeItem</span>&#123;
                    <span
                      className={
                        c.decision === "rejected"
                          ? "diff-removed px-1 py-0.5 rounded"
                          : "diff-added px-1 py-0.5 rounded"
                      }
                    >
                      {getFinalBulletText(c)}
                    </span>
                    &#125;{" "}
                    <span className="text-ink-secondary">
                      % [anchor: {c.evidenceId} | {c.decision}]
                    </span>
                  </div>
                ))}

                <div className="text-ink-secondary select-none pt-2 border-t border-hairline text-[11px]">
                  \end&#123;document&#125;
                </div>
              </div>
            )}
          </main>

          {/* RIGHT: 35% Sticky Rubric Panel (4 Cols out of 12) */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-16 space-y-4">
            <RubricPanelContent
              atsReport={atsReport}
              directReqs={directReqs}
              transferableReqs={transferableReqs}
              missingReqs={missingReqs}
              directOpen={directOpen}
              setDirectOpen={setDirectOpen}
              transferableOpen={transferableOpen}
              setTransferableOpen={setTransferableOpen}
              missingOpen={missingOpen}
              setMissingOpen={setMissingOpen}
            />
          </aside>
        </div>
      </div>

      {/* Mobile Rubric Bottom Sheet */}
      <AnimatePresence>
        {mobileRubricOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileRubricOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative max-h-[85vh] overflow-y-auto bg-canvas rounded-t-[28px] border-t border-hairline p-6 shadow-apple z-10 space-y-4"
            >
              <div className="w-10 h-1 bg-separator rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between pb-2 border-b border-hairline">
                <h3 className="text-[17px] font-semibold text-ink">Fit Rubric</h3>
                <button
                  type="button"
                  onClick={() => setMobileRubricOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <RubricPanelContent
                atsReport={atsReport}
                directReqs={directReqs}
                transferableReqs={transferableReqs}
                missingReqs={missingReqs}
                directOpen={directOpen}
                setDirectOpen={setDirectOpen}
                transferableOpen={transferableOpen}
                setTransferableOpen={setTransferableOpen}
                missingOpen={missingOpen}
                setMissingOpen={setMissingOpen}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Floating Glass Action Dock (Bottom) */}
      <footer className="fixed bottom-0 inset-x-0 z-30 frosted-glass px-4 sm:px-6 py-3 pb-[calc(var(--sab,0px)+0.75rem)] shadow-apple">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Message */}
          <div className="flex items-center gap-2.5 text-[13px]" aria-live="polite">
            {allReviewed ? (
              <div className="flex items-center gap-2 text-status-supported-text font-medium">
                <span className="w-4 h-4 rounded-full bg-status-supported-bg inline-flex items-center justify-center text-[11px] font-bold">
                  ✓
                </span>
                <span>
                  All {changes.length} diffs reviewed. Verification Gateway unlocked.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-ink">
                <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                <span>
                  <strong className="font-semibold text-ink">
                    {pendingCount} {pendingCount === 1 ? "change" : "changes"} left to review
                  </strong>{" "}
                  <span className="text-ink-secondary hidden sm:inline">
                    — Accept, reject, or edit each item to proceed.
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Accept All + Primary Continue */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleAcceptAll}
                className="pill-btn pill-btn-secondary px-4 py-2 text-[13px] min-h-[38px] cursor-pointer"
              >
                <span>Accept All ({pendingCount})</span>
              </button>
            )}

            <button
              type="button"
              disabled={!allReviewed}
              onClick={() => onContinueToDownload && onContinueToDownload(changes)}
              className={`pill-btn px-5 py-2 text-[13px] font-medium gap-1.5 min-h-[38px] transition-all ${
                allReviewed
                  ? "pill-btn-primary shadow-subtle cursor-pointer"
                  : "bg-surface border border-hairline text-ink-secondary opacity-50 cursor-not-allowed"
              }`}
            >
              <span>Continue to Export</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================================
// Inline Diff Card Component
// ============================================================================
interface InlineDiffCardProps {
  change: BulletChange;
  isEditing: boolean;
  draftText: string;
  onAccept: () => void;
  onReject: () => void;
  onUndo: () => void;
  onStartEdit: () => void;
  onChangeDraft: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

function InlineDiffCard({
  change,
  isEditing,
  draftText,
  onAccept,
  onReject,
  onUndo,
  onStartEdit,
  onChangeDraft,
  onSaveEdit,
  onCancelEdit,
}: InlineDiffCardProps) {
  const isResolved = change.decision !== "pending";
  const budget = change.charBudget || 160;
  const currentLen = isEditing ? draftText.length : (change.editedText ?? change.proposedText).length;
  const budgetRatio = currentLen / budget;
  const isOverBudget = budgetRatio > 1.0;
  const isNearLimit = budgetRatio >= 0.9 && !isOverBudget;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isResolved
          ? "bg-surface/50 border-hairline"
          : "bg-canvas border-hairline shadow-subtle hover:border-accent/30"
      }`}
    >
      {/* 1. Header Bar: Status Chip + Fact ID + Actions */}
      <div className="px-4 py-2.5 bg-surface/70 border-b border-hairline flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {change.matchType === "direct" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Supported · Direct Match</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-medium bg-status-transferable-bg text-status-transferable-text border border-status-transferable-text/20">
              <AlertCircle className="w-3 h-3" />
              <span>Transferable · Verified</span>
            </span>
          )}

          <span className="font-mono text-[11px] text-ink-secondary bg-canvas px-2 py-0.5 rounded-pill border border-hairline">
            Fact ID: {change.evidenceId}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isResolved ? (
            <div className="flex items-center gap-2">
              <span
                className={`text-[12px] font-medium px-2.5 py-0.5 rounded-pill border ${
                  change.decision === "accepted"
                    ? "bg-status-supported-bg text-status-supported-text border-status-supported-text/20"
                    : change.decision === "rejected"
                    ? "bg-surface text-ink-secondary border-hairline"
                    : "bg-accent/10 text-accent border-accent/20"
                }`}
              >
                {change.decision === "accepted" && "✓ Accepted"}
                {change.decision === "rejected" && "✕ Kept Original"}
                {change.decision === "edited" && "✎ Custom Edited"}
              </span>

              <button
                type="button"
                onClick={onUndo}
                className="text-[12px] text-link hover:underline cursor-pointer"
                title="Undo decision"
              >
                Undo
              </button>
            </div>
          ) : (
            !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onAccept}
                  className="pill-btn pill-btn-primary px-3 py-1 text-[12px] min-h-[28px]"
                >
                  <Check className="w-3 h-3 mr-1" />
                  <span>Accept</span>
                </button>

                <button
                  type="button"
                  onClick={onReject}
                  className="pill-btn pill-btn-secondary px-3 py-1 text-[12px] min-h-[28px]"
                >
                  <X className="w-3 h-3 mr-1" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={onStartEdit}
                  className="text-[12px] text-link hover:underline cursor-pointer ml-1"
                >
                  Edit
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. Diff Body */}
      <div className="p-4 space-y-2.5">
        {isResolved ? (
          /* Gracefully collapsed state */
          <p className="text-[13px] text-ink leading-relaxed">
            {change.decision === "rejected"
              ? change.originalText
              : change.decision === "edited"
              ? change.editedText
              : change.proposedText}
          </p>
        ) : isEditing ? (
          /* Inline Editor with Live Character-Budget Tracking */
          <div className="space-y-2.5">
            <textarea
              rows={3}
              value={draftText}
              autoFocus
              onChange={(e) => onChangeDraft(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-canvas p-3 text-[13px] text-ink leading-relaxed apple-focus-ring resize-y"
            />

            {/* Character Budget Tracking Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span
                  className={
                    isOverBudget
                      ? "text-danger font-semibold"
                      : isNearLimit
                      ? "text-warning font-medium"
                      : "text-ink-secondary"
                  }
                >
                  Character Budget: {draftText.length} / {budget}
                  {isOverBudget && " (Over single-page limit)"}
                </span>
                <span className="text-ink-secondary">
                  {Math.round(budgetRatio * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-hairline">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    isOverBudget
                      ? "bg-danger"
                      : isNearLimit
                      ? "bg-warning"
                      : "bg-accent"
                  }`}
                  style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onCancelEdit}
                className="pill-btn pill-btn-secondary px-3 py-1 text-[12px] min-h-[28px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                className="pill-btn pill-btn-primary px-3 py-1 text-[12px] min-h-[28px]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Normal Diff Presentation */
          <div className="space-y-2 text-[13px]">
            {/* Removed Text (8% danger tint with strikethrough in secondary text) */}
            <div className="diff-removed p-2.5 rounded-lg flex items-start gap-2 leading-relaxed">
              <span className="font-mono font-bold select-none text-danger shrink-0">-</span>
              <span>{change.originalText}</span>
            </div>

            {/* Added Text (10% success tint) */}
            <div className="diff-added p-2.5 rounded-lg flex items-start gap-2 leading-relaxed">
              <span className="font-mono font-bold select-none text-status-supported-text shrink-0">+</span>
              <span>{change.proposedText}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. One-Line "Why" Footer */}
      <div className="bg-surface/50 border-t border-hairline px-4 py-2 text-[12px] text-ink-secondary flex items-baseline gap-1.5">
        <strong className="font-medium text-ink shrink-0">Why:</strong>
        <span className="leading-snug">{change.reason}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Rubric Panel Content Component
// ============================================================================
interface RubricPanelContentProps {
  atsReport: ReturnType<typeof evaluateResumeATS>;
  directReqs: JDRequirement[];
  transferableReqs: JDRequirement[];
  missingReqs: JDRequirement[];
  directOpen: boolean;
  setDirectOpen: (open: boolean) => void;
  transferableOpen: boolean;
  setTransferableOpen: (open: boolean) => void;
  missingOpen: boolean;
  setMissingOpen: (open: boolean) => void;
}

function RubricPanelContent({
  atsReport,
  directReqs,
  transferableReqs,
  missingReqs,
  directOpen,
  setDirectOpen,
  transferableOpen,
  setTransferableOpen,
  missingOpen,
  setMissingOpen,
}: RubricPanelContentProps) {
  return (
    <div className="space-y-4 font-sans">
      {/* Overall Score Card */}
      <div className="apple-card p-5 space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-secondary block">
          ATS Fit Rubric
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-[36px] font-bold text-ink tracking-tight">
            {atsReport.totalScore}
          </span>
          <span className="text-[14px] text-ink-secondary">/ 100</span>
          {atsReport.scoreDelta > 0 && (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text border border-status-supported-text/20">
              +{atsReport.scoreDelta} pts vs Master
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-hairline">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${atsReport.totalScore}%` }}
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[12px]">
          <div className="p-2.5 rounded-xl bg-surface border border-hairline">
            <span className="text-[11px] text-ink-secondary block">Direct Matches</span>
            <span className="text-[15px] font-semibold text-status-supported-text">
              {directReqs.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-surface border border-hairline">
            <span className="text-[11px] text-ink-secondary block">Transferable</span>
            <span className="text-[15px] font-semibold text-status-transferable-text">
              {transferableReqs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Collapsible Direct Matches */}
      <div className="apple-card overflow-hidden">
        <button
          type="button"
          onClick={() => setDirectOpen(!directOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-supported-text" />
            <span className="text-[13px] font-semibold text-ink">
              Direct Matches ({directReqs.length})
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-secondary transition-transform duration-200 ${
              directOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {directOpen && (
          <div className="px-4 pb-4 space-y-2 border-t border-hairline pt-3">
            {directReqs.length === 0 ? (
              <p className="text-[12px] text-ink-secondary">No direct matches identified.</p>
            ) : (
              directReqs.map((req) => (
                <div
                  key={req.id}
                  className="text-[12px] p-2.5 rounded-lg bg-surface border border-hairline space-y-1"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-ink leading-snug">{req.text}</span>
                    {req.linkedEvidenceId && (
                      <span className="font-mono text-[10px] text-accent shrink-0">
                        {req.linkedEvidenceId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Collapsible Transferable */}
      <div className="apple-card overflow-hidden">
        <button
          type="button"
          onClick={() => setTransferableOpen(!transferableOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-transferable-text" />
            <span className="text-[13px] font-semibold text-ink">
              Transferable ({transferableReqs.length})
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-secondary transition-transform duration-200 ${
              transferableOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {transferableOpen && (
          <div className="px-4 pb-4 space-y-2 border-t border-hairline pt-3">
            {transferableReqs.length === 0 ? (
              <p className="text-[12px] text-ink-secondary">No transferable requirements identified.</p>
            ) : (
              transferableReqs.map((req) => (
                <div
                  key={req.id}
                  className="text-[12px] p-2.5 rounded-lg bg-surface border border-hairline space-y-1"
                >
                  <span className="text-ink leading-snug block">{req.text}</span>
                  {req.note && (
                    <span className="text-[11px] text-ink-secondary block italic">
                      {req.note}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Collapsible Missing (visibly marked 'left out to keep your resume truthful') */}
      <div className="apple-card overflow-hidden">
        <button
          type="button"
          onClick={() => setMissingOpen(!missingOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-missing-text" />
            <span className="text-[13px] font-semibold text-ink">
              Missing ({missingReqs.length})
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-secondary transition-transform duration-200 ${
              missingOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {missingOpen && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-hairline pt-3">
            <div className="p-2 rounded-lg bg-status-missing-bg border border-status-missing-text/20 text-status-missing-text text-[11px] leading-snug">
              Left out to keep your resume truthful. Missing items are provided as talking points for interview preparation.
            </div>
            {missingReqs.length === 0 ? (
              <p className="text-[12px] text-ink-secondary">No missing qualifications detected.</p>
            ) : (
              missingReqs.map((req) => (
                <div
                  key={req.id}
                  className="text-[12px] p-2.5 rounded-lg bg-surface border border-hairline space-y-1"
                >
                  <span className="text-ink leading-snug block">{req.text}</span>
                  <span className="text-[11px] text-ink-secondary block">
                    Talking point: {req.note || "Acknowledge in interview as adjacent area of active growth."}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
