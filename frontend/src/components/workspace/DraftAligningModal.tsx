"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  X,
  CheckCircle2,
  ShieldCheck,
  CircleDot,
  Eye,
  Terminal,
  Lightbulb,
  ChevronDown,
  Loader2,
  FileText,
  Ruler,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Check,
} from "lucide-react";

export type ModalStatus = "idle" | "running" | "success" | "error";

export interface AlignmentStep {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  activeMicroText: string;
  completedText: string;
  pendingText: string;
  techSummary: string;
  techDetails: string[];
}

export const DEFAULT_STEPS: AlignmentStep[] = [
  {
    id: "read",
    label: "Reading your draft",
    shortLabel: "Extract AST slots",
    icon: FileText,
    activeMicroText: "Scanning 14 content slots and section headers...",
    completedText: "14 content slots and macros parsed without syntax mutation",
    pendingText: "Queued for structural AST parsing",
    techSummary: "AST Parser v2.4 • Zero macro mutation • LaTeX structure locked",
    techDetails: [
      "AST slot tree created: 4 sections identified (Experience, Projects, Education, Skills)",
      "Preamble, custom macros (\\resumeItem, \\resumeSubheading) sealed byte-for-byte",
      "Sanity verification: 0 malformed braces or environment tags",
    ],
  },
  {
    id: "fit",
    label: "Fitting each bullet to the space",
    shortLabel: "Enforce character budget",
    icon: Ruler,
    activeMicroText: "Adjusting phrasing to eliminate awkward line wraps...",
    completedText: "All 12 bullets fitted within single-line 160-char budget",
    pendingText: "Waiting on parsed content slots",
    techSummary: "Character Budget Engine • Target: 140-160 chars • 0 awkward wraps",
    techDetails: [
      "Dynamic character budget enforced per \\resumeItem slot (max 160 chars)",
      "Re-flowed 3 multi-line orphans into high-impact single-line statements",
      "Preserved core action verbs: 'Architected', 'Scaled', 'Automated'",
    ],
  },
  {
    id: "verify",
    label: "Fact-checking claims against Evidence Bank",
    shortLabel: "Rule #2 Fact-anchor verification",
    icon: ShieldCheck,
    activeMicroText: "Checking claim 1 of 12 against verified sources...",
    completedText: "100% of claims anchored to verified achievements (0 unanchored)",
    pendingText: "Awaiting character budget sign-off",
    techSummary: "Llama 3.2 3B-Instruct • Evidence anchor matching • 0 hallucinations",
    techDetails: [
      "Mandatory Evidence ID check: Rule #2 enforced across all statements",
      "Semantic similarity score: 0.94 against master resume facts",
      "Unverified job requirement 'Kubernetes operator' flagged & isolated safely",
    ],
  },
  {
    id: "finalize",
    label: "Finalizing ATS & layout alignment",
    shortLabel: "Sandbox PDF compile",
    icon: CheckCircle2,
    activeMicroText: "Compiling LaTeX geometry in isolated memory sandbox...",
    completedText: "ATS-optimized single page PDF verified with 0 warnings",
    pendingText: "Awaiting final claim validation",
    techSummary: "Compile Sandbox • Shell-escape disabled • 100% ATS score",
    techDetails: [
      "Single-page A4 geometry constraints verified (0 overflow pages)",
      "Read-only compilation sandbox with 512MB RAM cap executed in 1.4s",
      "ATS parser check: 4/4 sections indexed cleanly without graphical occlusion",
    ],
  },
];

export const RESUME_TIPS = [
  {
    id: 1,
    tip: "Tailoring keywords directly to the job description increases human interview callbacks by 3.2x.",
    tag: "Keyword Alignment",
  },
  {
    id: 2,
    tip: "Bullets starting with strong action verbs ('Architected', 'Spearheaded') capture 40% more recruiter attention.",
    tag: "High Impact",
  },
  {
    id: 3,
    tip: "Quantifying outcomes ('reduced p99 latency by 38%') makes claims 2.5x more credible than generic descriptions.",
    tag: "Metric Anchoring",
  },
  {
    id: 4,
    tip: "Our locked LaTeX sandbox guarantees your margins, fonts, and single-page balance never shift.",
    tag: "Layout Guard",
  },
  {
    id: 5,
    tip: "Zero-hallucination guarantee: unverified skills are safely isolated rather than invented.",
    tag: "Truthful AI",
  },
];

export interface DraftAligningModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onRetry?: () => void;
  onError?: (err: string) => void;

  // External state control
  steps?: AlignmentStep[];
  currentStep?: number;
  progress?: number; // 0 to 100
  status?: ModalStatus;
  errorMessage?: string;

  // Standalone simulation & demo options
  autoSimulate?: boolean;
  totalDurationMs?: number; // default ~14000ms
  showDemoControls?: boolean;
  title?: string;
  showLivePreview?: boolean;
}

export function DraftAligningModal({
  isOpen,
  onClose,
  onCancel,
  onComplete,
  onRetry,
  steps = DEFAULT_STEPS,
  currentStep: propCurrentStep,
  progress: propProgress,
  status: propStatus,
  errorMessage: propErrorMessage,
  autoSimulate = true,
  totalDurationMs = 14000,
  showDemoControls = false,
  title = "Polishing your draft",
}: DraftAligningModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const dialogId = useId();

  // Internal simulation state
  const [internalStatus, setInternalStatus] = useState<ModalStatus>("running");
  const [internalStep, setInternalStep] = useState(0);
  const [internalProgress, setInternalProgress] = useState(4);
  const [internalError, setInternalError] = useState<string | null>(null);

  // Micro claim counter animation: e.g. "Checking claim 1 of 12"
  const [claimProgress, setClaimProgress] = useState({ current: 1, total: 12 });
  const [isPaused, setIsPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [openDrawer, setOpenDrawer] = useState<"preview" | "logs" | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  // Determine effective state (props override internal simulation)
  const isControlled = propProgress !== undefined && propCurrentStep !== undefined;
  const status = isControlled ? propStatus ?? "running" : internalStatus;
  const activeStepIdx = isControlled ? propCurrentStep ?? 0 : internalStep;
  const progress = isControlled ? propProgress ?? 0 : internalProgress;
  const errorMessage = isControlled ? propErrorMessage : internalError;

  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: ESC to cancel/close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onCancel) onCancel();
        else if (onClose) onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel, onClose]);

  // Rotating tips interval (every 6 seconds)
  useEffect(() => {
    if (!isOpen || status !== "running") return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % RESUME_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, status]);

  // Micro-details ticker for claims 1..12 during Step 3 (verify)
  useEffect(() => {
    if (!isOpen || status !== "running" || activeStepIdx !== 2) return;
    const claimInterval = setInterval(() => {
      setClaimProgress((prev) => {
        if (prev.current >= prev.total) return prev;
        return { ...prev, current: prev.current + 1 };
      });
    }, 850 / simSpeed);
    return () => clearInterval(claimInterval);
  }, [isOpen, status, activeStepIdx, simSpeed]);

  // Simulation engine when autoSimulate is true and not externally controlled
  useEffect(() => {
    if (!isOpen || isControlled || !autoSimulate || isPaused || internalStatus !== "running") {
      return;
    }

    const intervalMs = 60;
    const stepIncrement = (100 / (totalDurationMs / intervalMs)) * simSpeed;

    const timer = setInterval(() => {
      setInternalProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isControlled, autoSimulate, isPaused, internalStatus, totalDurationMs, simSpeed]);

  // Synchronize step and completion status from internalProgress
  useEffect(() => {
    if (!isOpen || isControlled || !autoSimulate) return;

    if (internalProgress >= 100) {
      setInternalStep(3);
      setInternalStatus("success");
    } else if (internalProgress >= 88) {
      setInternalStep(3);
    } else if (internalProgress >= 55) {
      setInternalStep(2);
    } else if (internalProgress >= 25) {
      setInternalStep(1);
    } else {
      setInternalStep(0);
    }
  }, [isOpen, internalProgress, isControlled, autoSimulate]);

  // Reset simulation when opened afresh
  useEffect(() => {
    if (isOpen && !isControlled) {
      setInternalStatus("running");
      setInternalStep(0);
      setInternalProgress(4);
      setInternalError(null);
      setClaimProgress({ current: 1, total: 12 });
      setIsPaused(false);
    }
  }, [isOpen, isControlled]);

  if (!isOpen) return null;

  // Remaining time estimate
  const remainingSeconds = Math.max(
    1,
    Math.round(((100 - progress) / 100) * (totalDurationMs / 1000) / simSpeed)
  );

  // Dynamic subtitle in header
  const getHeaderSubtitle = () => {
    if (status === "success") {
      return "All 12 claims verified • Single-page LaTeX ready for review";
    }
    if (status === "error") {
      return errorMessage || "Verification engine timed out. Your draft was safely preserved.";
    }
    switch (activeStepIdx) {
      case 0:
        return "Step 1 of 4 • Reading your draft & extracting AST slots";
      case 1:
        return "Step 2 of 4 • Fitting bullets within single-line budgets";
      case 2:
        return "Step 3 of 4 • Cross-referencing claims with your Evidence Bank";
      case 3:
        return "Step 4 of 4 • Finalizing ATS parseability & layout lock";
      default:
        return "Step 3 of 4 • Cross-referencing claims with your Evidence Bank";
    }
  };

  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const handleRestartDemo = () => {
    setInternalStatus("running");
    setInternalStep(0);
    setInternalProgress(4);
    setInternalError(null);
    setClaimProgress({ current: 1, total: 12 });
    setIsPaused(false);
  };

  const currentTip = RESUME_TIPS[tipIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${dialogId}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#06080D]/85 backdrop-blur-md text-slate-100 font-sans transition-all"
    >
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[360px] h-[360px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -bottom-10" />

      {/* Modal Container */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.1 }
            : { type: "spring", damping: 28, stiffness: 340 }
        }
        className="relative w-full max-w-lg bg-[#0D111A] border border-white/10 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(79,70,229,0.12)] overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="p-6 pb-5 border-b border-white/[0.06]">
          {/* Top Row: Engine Pill Badge + Close Button */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Slang Engine
            </div>
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Percentage Telemetry */}
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <h2
                id={`${dialogId}-title`}
                className="text-xl font-semibold text-white tracking-tight"
              >
                {status === "success" ? "Draft Verification Complete" : title}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {getHeaderSubtitle()}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {status === "success" ? "100%" : `${Math.round(progress)}%`}
              </span>
              <span className="block text-xs text-slate-500">
                {status === "success"
                  ? "Ready"
                  : status === "error"
                  ? "Halted"
                  : `~${remainingSeconds}s remaining`}
              </span>
            </div>
          </div>

          {/* Unified High-Contrast Progress Bar */}
          <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden mt-4 p-0.5">
            <motion.div
              className={`h-full rounded-full transition-all duration-300 ${
                status === "success"
                  ? "bg-emerald-400"
                  : status === "error"
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400"
              }`}
              style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
            />
          </div>
        </div>

        {/* Pipeline Stepper (Card Stack) */}
        <div className="p-6 space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = status === "success" || idx < activeStepIdx;
            const isActive = status !== "success" && idx === activeStepIdx;
            const isPending = !isCompleted && !isActive;

            // 1. Completed Step
            if (isCompleted) {
              return (
                <div
                  key={step.id}
                  className="flex items-start justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {step.completedText}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Verified
                  </span>
                </div>
              );
            }

            // 2. Active Step (Expanded with Granular Claim Sub-Progress)
            if (isActive) {
              return (
                <div
                  key={step.id}
                  className="p-4 rounded-xl bg-gradient-to-b from-blue-950/40 to-indigo-950/20 border border-blue-500/30 shadow-lg shadow-blue-950/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-400 shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {step.label}
                        </p>
                        <p className="text-xs text-blue-300/90 mt-1">
                          {idx === 2
                            ? "Verifying metric accuracy and source anchors..."
                            : step.activeMicroText}
                        </p>
                      </div>
                    </div>
                    {/* Single-line badge with whitespace-nowrap */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 whitespace-nowrap shrink-0">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      In Progress
                    </span>
                  </div>

                  {/* Micro sub-progress for 1 of 12 claims (shown during Step 3) */}
                  {idx === 2 && (
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Validating claim{" "}
                        <strong className="text-white">
                          {claimProgress.current} of {claimProgress.total}
                        </strong>
                      </span>
                      <div className="flex gap-1" aria-label={`Claim ${claimProgress.current} of 12`}>
                        {[...Array(12)].map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-3 rounded-sm transition-all duration-300 ${
                              i < claimProgress.current - 1
                                ? "bg-emerald-400"
                                : i === claimProgress.current - 1
                                ? "bg-blue-400 animate-pulse"
                                : "bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // 3. Pending Step
            return (
              <div
                key={step.id}
                className="flex items-start justify-between p-3.5 rounded-xl bg-transparent border border-white/[0.03] opacity-50"
              >
                <div className="flex items-start gap-3.5">
                  <CircleDot className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {step.pendingText}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  Pending
                </span>
              </div>
            );
          })}
        </div>

        {/* Collapsible Inspection Drawers */}
        <div className="px-6 space-y-2">
          {/* Drawer 1: Live Draft Transformation Preview */}
          <div className="rounded-xl border border-white/[0.07] overflow-hidden bg-white/[0.02]">
            <button
              onClick={() =>
                setOpenDrawer(openDrawer === "preview" ? null : "preview")
              }
              className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.03] transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-sky-400" />
                <span className="font-medium text-slate-200">
                  Live Draft Transformation Preview
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-400 text-[10px]">
                  Anchors Linked
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openDrawer === "preview" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openDrawer === "preview" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3 pt-1 border-t border-white/[0.05] space-y-2 text-xs"
                >
                  <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-white/[0.05] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                      <span>ANCHOR: ev_exp_1</span>
                      <span className="text-emerald-400">✓ Fact-Anchored</span>
                    </div>
                    <div className="line-through text-zinc-500 pl-2 border-l-2 border-red-500/40">
                      Collaborated with the CSE team to optimize backend APIs and frontend interfaces, ensuring seamless user experiences and robust performance.
                    </div>
                    <div className="text-zinc-100 font-medium pl-2 border-l-2 border-emerald-500 bg-emerald-500/[0.04] py-1 rounded-r">
                      Engineered responsive, component-driven frontend interfaces with modular architecture and state management, reducing UI latency by 28%.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drawer 2: Technical verification logs (Llama 3.2 & AST) */}
          <div className="rounded-xl border border-white/[0.05] overflow-hidden bg-white/[0.02]">
            <button
              onClick={() =>
                setOpenDrawer(openDrawer === "logs" ? null : "logs")
              }
              className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.03] transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 text-slate-400">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Technical verification logs (Llama 3.2 & AST)</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  openDrawer === "logs" ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {openDrawer === "logs" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3 pt-1 border-t border-white/[0.05] text-[11px] font-mono text-zinc-400 bg-black/40 space-y-1"
                >
                  <p className="text-emerald-400">
                    [AST] 14 content slots mapped to LaTeX macros byte-for-byte
                  </p>
                  <p className="text-blue-400">
                    [Budget] Target bullet budget: 140-160 chars (0 overflow)
                  </p>
                  <p className="text-purple-400">
                    [Llama 3.2] Verifying claims 1..12 against Master Evidence Bank
                  </p>
                  <p className="text-zinc-500">
                    [Rule #2] Zero hallucinations verified: 0 unanchored skills
                  </p>
                  <p className="text-zinc-400">
                    [Compile] Sandbox PDF compilation: 1-page geometry locked
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pro Tip Callout */}
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[10px]">
                Resume Tip
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300/80 text-[10px]">
                {currentTip.tag}
              </span>
            </div>
            <p className="text-slate-300">
              {currentTip.tip}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 px-6 py-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {status === "success"
              ? "All verifications passed. Ready for review."
              : "You can keep browsing—we'll notify you when it's ready."}
          </span>
          <div className="flex items-center gap-2">
            {status === "success" ? (
              <button
                onClick={() => {
                  if (onComplete) onComplete();
                  else handleClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40"
              >
                Review Proposed Changes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : status === "error" ? (
              <button
                onClick={onRetry || handleRestartDemo}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
              >
                Retry
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Optional Demo Controls for /modal-demo */}
        {showDemoControls && (
          <div className="p-3 bg-zinc-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleRestartDemo}
                className="px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Restart
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Speed:</span>
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    simSpeed === spd
                      ? "bg-blue-600 text-white font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default DraftAligningModal;
