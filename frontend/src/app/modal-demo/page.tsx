"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  DraftAligningModal,
  DEFAULT_STEPS,
  ModalStatus,
} from "@/components/workspace/DraftAligningModal";

export default function ModalDemoPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [manualStep, setManualStep] = useState(1);
  const [manualProgress, setManualProgress] = useState(45);
  const [manualStatus, setManualStatus] = useState<ModalStatus>("running");
  const [duration, setDuration] = useState(20000);
  const [deviceFrame, setDeviceFrame] = useState<"desktop" | "mobile">("desktop");
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  const startAutoSimulation = (status: ModalStatus = "running", dur = 20000) => {
    setManualMode(false);
    setManualStatus(status);
    setDuration(dur);
    setIsOpen(true);
  };

  const triggerStepState = (stepIdx: number, progressVal: number) => {
    setManualMode(true);
    setManualStep(stepIdx);
    setManualProgress(progressVal);
    setManualStatus("running");
    setIsOpen(true);
  };

  const triggerSuccessState = () => {
    setManualMode(true);
    setManualStep(3);
    setManualProgress(100);
    setManualStatus("success");
    setIsOpen(true);
  };

  const triggerErrorState = () => {
    setManualMode(true);
    setManualStep(2);
    setManualProgress(68);
    setManualStatus("error");
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <FrostedNav />

      {/* Header Banner */}
      <section className="relative border-b border-white/10 bg-gradient-to-b from-blue-950/20 via-zinc-950/40 to-transparent pt-12 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            UX / UI Redesign Demonstration
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Analyzing & Aligning Draft Modal
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            Transformed a passive, static spinner into an engaging, transparent, and trustworthy
            waiting experience with live claim verification, dynamic time estimation, rotating tips, and interactive skeleton previews.
          </p>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startAutoSimulation("running", 22000)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch 20s Realistic Flow</span>
            </button>

            <button
              onClick={triggerSuccessState}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>View Completion State</span>
            </button>

            <button
              onClick={triggerErrorState}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>View Error / Retry State</span>
            </button>

            <Link
              href="/review-demo"
              className="px-4 py-2.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <span>Test Step 2 Review Screen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/workspace"
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <span>Go to Live Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Interactive Controls & Comparison Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Interactive Testing Matrix */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                State & Flow Controller
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Switch instantly between simulation states or test specific step sequences.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Modal status:</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isOpen
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {isOpen ? "Active on Screen" : "Hidden"}
              </span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="ml-2 text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              >
                {isOpen ? "Hide Modal" : "Show Modal"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 trigger */}
            <button
              onClick={() => triggerStepState(0, 15)}
              className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Step 1 (15%)
              </div>
              <div className="text-sm font-medium text-white group-hover:text-blue-200 mt-1">
                Reading your draft
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                AST parsing without macro changes.
              </p>
            </button>

            {/* Step 2 trigger */}
            <button
              onClick={() => triggerStepState(1, 45)}
              className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Step 2 (45%)
              </div>
              <div className="text-sm font-medium text-white group-hover:text-blue-200 mt-1">
                Fitting each bullet
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                160-char line budget optimization.
              </p>
            </button>

            {/* Step 3 trigger */}
            <button
              onClick={() => triggerStepState(2, 75)}
              className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Step 3 (75%)
              </div>
              <div className="text-sm font-medium text-white group-hover:text-blue-200 mt-1">
                Fact-checking claims
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Rule #2 Evidence Bank anchoring ticker.
              </p>
            </button>

            {/* Step 4 trigger */}
            <button
              onClick={() => triggerStepState(3, 92)}
              className="p-4 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                Step 4 (92%)
              </div>
              <div className="text-sm font-medium text-white group-hover:text-blue-200 mt-1">
                Finalizing ATS PDF
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                Locked sandbox LaTeX compilation.
              </p>
            </button>
          </div>
        </div>

        {/* Requirements Fulfilled Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">1. Real & Engaging Progress</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Replaced the empty circle spinner with a branded gradient ring filling smoothly with live percentage, dynamic time-left countdown, and continuous micro-details.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">2. Plain-Language Stepper</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Demystified technical jargon (AST, slot trees, budgets) into clear benefits: &ldquo;Reading your draft&rdquo;, &ldquo;Fitting bullets to space&rdquo;, and &ldquo;Fact-checking against Evidence Bank&rdquo;.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">3. Live Skeleton & Tips</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Keeps users reassured with rotating actionable resume tips every 5 seconds and an expandable live draft preview showing real bullets and verified badges locking in.
            </p>
          </div>
        </div>

        {/* Before vs After Comparison Section */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Before vs After Comparison</h2>
              <p className="text-xs text-zinc-400">See how the user experience changed directly.</p>
            </div>
            <button
              onClick={() => setShowOriginalModal(!showOriginalModal)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              {showOriginalModal ? "Hide Legacy Modal" : "View Legacy Modal Code"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-black/60 border border-red-500/20 space-y-3">
              <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                Before: The Passive Black Box
              </span>
              <ul className="space-y-1.5 text-zinc-400 list-disc list-inside">
                <li>Static empty circle spinner without percentage</li>
                <li>Jargon-heavy: &ldquo;Extracting AST content slots&rdquo;</li>
                <li>Flat bullet list with no sense of sequence or active state</li>
                <li>No remaining time estimate</li>
                <li>No user control, cancellation, or error recovery</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-black/60 border border-emerald-500/20 space-y-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                After: Transparent & Trustworthy
              </span>
              <ul className="space-y-1.5 text-zinc-300 list-disc list-inside">
                <li>Gradient ring + pulsing orb with live percentage in center</li>
                <li>Vertical stepper with glowing active nodes & pop checks</li>
                <li>Live micro-detail: &ldquo;Checking claim 7 of 12&rdquo;</li>
                <li>Dynamic &ldquo;About 15 seconds left&rdquo; progress estimation</li>
                <li>Rotating tip cards + live transforming skeleton preview</li>
                <li>Celebratory confetti completion & resilient retry controls</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* The Redesigned DraftAligningModal in Action */}
      <DraftAligningModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        onComplete={() => console.log("Draft alignment complete!")}
        onRetry={() => startAutoSimulation("running", 15000)}
        autoSimulate={!manualMode}
        totalDurationMs={duration}
        currentStep={manualMode ? manualStep : undefined}
        progress={manualMode ? manualProgress : undefined}
        status={manualMode ? manualStatus : undefined}
        showDemoControls={true}
      />
    </div>
  );
}
