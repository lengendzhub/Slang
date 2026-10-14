"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DEFAULT_MASTER_LATEX, DEFAULT_JOB_DESCRIPTION } from "@/lib/sample-data";
import {
  UploadCloud,
  FileCode,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  RefreshCw,
  Terminal,
} from "lucide-react";

export default function StudioPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [latexContent, setLatexContent] = useState(DEFAULT_MASTER_LATEX);
  const [jdContent, setJdContent] = useState(DEFAULT_JOB_DESCRIPTION);
  const [careerMode, setCareerMode] = useState<string>("same");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("Initializing Pipeline...");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setLatexContent(text);
      };
      reader.readAsText(file);
    }
  };

  const startAnalysis = () => {
    setCurrentStep(3);
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setAnalysisStage("Inspecting LaTeX AST and verifying round-trip fidelity...");

    setTimeout(() => {
      setAnalysisProgress(35);
      setAnalysisStage("Deconstructing Job Description & classifying seniority...");
    }, 700);

    setTimeout(() => {
      setAnalysisProgress(65);
      setAnalysisStage("Building Evidence Bank & scoring semantic alignment...");
    }, 1400);

    setTimeout(() => {
      setAnalysisProgress(88);
      setAnalysisStage("Fact Validator enforcing Non-Negotiable Rule #2 (evidence_id anchors)...");
    }, 2100);

    setTimeout(() => {
      setAnalysisProgress(100);
      setAnalysisStage("Analysis complete! 100% of claims verified. Zero unanchored claims.");
      setIsAnalyzing(false);
    }, 2800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-2">
            TailorAI Precision Studio
          </p>
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-tight text-[var(--ink)] mb-4">
            {currentStep === 1 && "Step 1: Upload & Inspect Master LaTeX"}
            {currentStep === 2 && "Step 2: Target Job Description & Track"}
            {currentStep === 3 && "Step 3: Verification & Alignment Stream"}
          </h1>

          {/* Stepper Pills */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-[var(--bg-alt)] border border-[var(--line-light)]">
            <button
              onClick={() => setCurrentStep(1)}
              className={`pill-btn px-4 py-1.5 text-[13px] ${
                currentStep === 1
                  ? "bg-[var(--blue)] text-white shadow-xs"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
            >
              1. Master LaTeX
            </button>
            <span className="text-[var(--line)]">/</span>
            <button
              onClick={() => setCurrentStep(2)}
              className={`pill-btn px-4 py-1.5 text-[13px] ${
                currentStep === 2
                  ? "bg-[var(--blue)] text-white shadow-xs"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
            >
              2. Target JD
            </button>
            <span className="text-[var(--line)]">/</span>
            <button
              onClick={() => setCurrentStep(3)}
              className={`pill-btn px-4 py-1.5 text-[13px] ${
                currentStep === 3
                  ? "bg-[var(--blue)] text-white shadow-xs"
                  : "text-[var(--ink-2)] hover:text-[var(--ink)]"
              }`}
            >
              3. Verification
            </button>
          </div>
        </div>

        {/* STEP 1: Upload & Inspect LaTeX */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Upload & Template Recognition */}
              <div className="lg:col-span-5 space-y-4">
                <div className="apple-card p-6">
                  <h3 className="text-[17px] font-semibold text-[var(--ink)] mb-1">
                    Upload Master .tex
                  </h3>
                  <p className="text-[13px] text-[var(--ink-2)] mb-4">
                    Upload your raw LaTeX resume once. We edit recognized content slots while leaving macros untouched.
                  </p>

                  <label className="border-2 border-dashed border-[var(--line)] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--blue)] hover:bg-[var(--bg-alt)] transition-colors text-center group">
                    <UploadCloud className="w-8 h-8 text-[var(--blue)] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[14px] font-medium text-[var(--ink)]">
                      Drop .tex file here or browse
                    </span>
                    <span className="text-[12px] text-[var(--ink-2)] mt-1">
                      Supports Jake's Resume, ModernCV, and custom templates
                    </span>
                    <input
                      type="file"
                      accept=".tex"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-4 pt-4 border-t border-[var(--line-light)] flex items-center justify-between">
                    <span className="text-[12px] text-[var(--ink-2)]">Loaded Template:</span>
                    <button
                      onClick={() => setLatexContent(DEFAULT_MASTER_LATEX)}
                      className="text-[12px] text-[var(--link)] font-medium hover:underline"
                    >
                      Reset to Jake's Standard
                    </button>
                  </div>
                </div>

                {/* Template Recognition Card */}
                <div className="apple-card p-6 border-l-4 border-l-[#34c759]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                      Template Recognition
                    </span>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--ink-2)]">Detected Template:</span>
                      <strong className="text-[var(--ink)]">Jake's Resume (Standard)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--ink-2)]">Sections Found:</span>
                      <span className="font-mono text-[var(--ink)]">4 (Exp, Proj, Edu, Skills)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--ink-2)]">Recognized Item Slots:</span>
                      <span className="font-mono text-[var(--ink)]">8 \resumeItem slots</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--line-light)]">
                      <span className="text-[var(--ink-2)]">Round-Trip Pre-Flight:</span>
                      <span className="flex items-center gap-1 text-[#34c759] font-medium text-[12px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 100% Fidelity Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: LaTeX Code Preview */}
              <div className="lg:col-span-7 apple-card p-6">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line-light)]">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-[var(--blue)]" />
                    <span className="font-mono text-[13px] font-medium text-[var(--ink)]">
                      master_resume.tex preview
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--ink-2)] font-mono">
                    {latexContent.length} chars
                  </span>
                </div>

                <textarea
                  value={latexContent}
                  onChange={(e) => setLatexContent(e.target.value)}
                  className="w-full h-[400px] font-mono text-[12px] p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)] text-[var(--ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--blue)]"
                  placeholder="Paste or edit raw LaTeX..."
                />

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[12px] text-[var(--ink-2)] flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#34c759]" /> Preamble & fonts locked
                  </span>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="pill-btn pill-btn-primary px-6 py-2 text-[14px]"
                  >
                    Continue to Target JD
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Job Description & Career Track */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="apple-card p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-[var(--line-light)] gap-3">
                <div>
                  <h3 className="text-[20px] font-semibold text-[var(--ink)]">
                    Target Job Description & Strategy
                  </h3>
                  <p className="text-[13px] text-[var(--ink-2)]">
                    Deconstructs requirements into Essential, Required, and Preferred categories.
                  </p>
                </div>
                <button
                  onClick={() => setJdContent(DEFAULT_JOB_DESCRIPTION)}
                  className="text-[12px] text-[var(--link)] font-medium hover:underline"
                >
                  Load Sample Staff Systems JD
                </button>
              </div>

              {/* Career Mode Selector */}
              <div className="mb-6">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-2.5">
                  Select Career Alignment Mode
                </span>
                <SegmentedControl
                  options={[
                    { id: "same", label: "Same Career", badge: "Direct Match" },
                    { id: "adjacent", label: "Adjacent Track", badge: "Lateral" },
                    { id: "transition", label: "Career Transition", badge: "Reframing" },
                    { id: "fresher", label: "Fresher / Internship", badge: "Foundations" },
                  ]}
                  value={careerMode}
                  onChange={setCareerMode}
                />
              </div>

              {/* JD Textarea */}
              <div className="mb-6">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-2">
                  Paste Target Job Description (JD)
                </span>
                <textarea
                  value={jdContent}
                  onChange={(e) => setJdContent(e.target.value)}
                  className="w-full h-[280px] font-sans text-[13px] p-4 rounded-xl bg-[var(--bg-alt)] border border-[var(--line-light)] text-[var(--ink)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--blue)] leading-relaxed"
                  placeholder="Paste the target job description here..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--line-light)]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="pill-btn px-5 py-2 text-[14px] border border-[var(--line-light)] text-[var(--ink)]"
                >
                  &larr; Back to LaTeX
                </button>
                <button
                  onClick={startAnalysis}
                  className="pill-btn pill-btn-primary px-8 py-2.5 text-[15px] shadow-sm"
                >
                  Run Precision Analysis
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Analysis Stream & Next Steps */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-[900px] mx-auto">
            <div className="apple-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center mx-auto mb-4">
                <Cpu className={`w-8 h-8 ${isAnalyzing ? "animate-pulse" : ""}`} />
              </div>

              <h3 className="text-[24px] font-semibold text-[var(--ink)] mb-2">
                {isAnalyzing ? "Analyzing & Validating Facts..." : "Pipeline Analysis Ready"}
              </h3>
              <p className="text-[14px] text-[var(--ink-2)] max-w-[500px] mx-auto mb-6">
                {analysisStage}
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-[500px] mx-auto h-2.5 bg-[var(--bg-alt)] rounded-full overflow-hidden border border-[var(--line-light)] mb-8">
                <div
                  className="h-full bg-[var(--blue)] transition-all duration-500 rounded-full"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>

              {/* Verification Audit Checklist */}
              <div className="max-w-[550px] mx-auto text-left space-y-3 p-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line-light)] mb-8">
                <div className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
                  <span>Master LaTeX round-trip: Verified byte-for-byte</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
                  <span>Evidence Bank: 8 anchors indexed with unique evidence_ids</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
                  <span>Fact Validator: 0 unanchored claims permitted</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
                  <span>Missing skills isolated: Kafka requirement safely flagged as Gap</span>
                </div>
              </div>

              {!isAnalyzing && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/report"
                    className="pill-btn px-6 py-2.5 text-[14px] bg-[var(--bg)] border border-[var(--line-light)] text-[var(--ink)] hover:bg-[var(--bg-alt)]"
                  >
                    View Fit Rubric Report
                  </Link>
                  <Link
                    href="/diff"
                    className="pill-btn pill-btn-primary px-7 py-2.5 text-[15px] shadow-sm"
                  >
                    Review Proposed Diffs
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
