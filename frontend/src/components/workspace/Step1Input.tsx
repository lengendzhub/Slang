"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface Step1InputProps {
  onGenerateDraft: (data: {
    file: File | null;
    jdText: string;
    mode: "Same Field" | "Career Pivot" | "Entry Level";
  }) => void;
  onOpenEvidenceModal: () => void;
  candidateName?: string;
  isProcessing?: boolean;
}

export function Step1Input({
  onGenerateDraft,
  onOpenEvidenceModal,
  candidateName,
  isProcessing = false,
}: Step1InputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [transitionMode, setTransitionMode] = useState<"Same Field" | "Career Pivot" | "Entry Level">("Career Pivot");
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) {
      alert("Please paste a target Job Description to tailor against.");
      return;
    }
    onGenerateDraft({
      file: selectedFile,
      jdText: jdText.trim(),
      mode: transitionMode,
    });
  };

  const loadSampleJD = () => {
    setJdText(`Technical Business Analyst & Systems Specialist
Apex Enterprise Solutions

Responsibilities:
- Translate business & operational workflows into technical requirement specifications.
- Query PostgreSQL databases and use Python scripts to extract operational data and anomaly metrics.
- Partner with product managers and QA leads in bi-weekly sprint planning to define acceptance criteria.
- Facilitate cross-functional communication between software engineering and executive stakeholders.

Requirements:
- 2+ years working with relational databases (SQL, data extraction).
- Familiarity with Python scripting for data manipulation or workflow automation.
- Proven track record translating technical constraints into clear documentation.
- Experience with agile sprint ceremonies and user story definitions.`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1120px] mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-ink">
          Step 1: Master Resume & Target Job
        </h2>
        <p className="text-[14px] text-ink-muted max-w-[540px] mx-auto">
          Upload your existing LaTeX (.tex) or PDF resume. Your original styling, margins, and preamble are 100% locked.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload Resume (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
              Master Resume (.tex or .pdf)
            </label>
            <button
              type="button"
              onClick={onOpenEvidenceModal}
              className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add extra projects or GitHub facts
            </button>
          </div>

          {/* Drag & Drop Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-card p-8 text-center transition-all duration-fast ease-apple relative ${
              dragActive
                ? "border-accent bg-accent/5"
                : selectedFile
                ? "border-status-supported-text/50 bg-canvas"
                : "border-hairline bg-canvas hover:border-ink-muted/50"
            }`}
          >
            <input
              type="file"
              accept=".tex,.pdf"
              id="resume-file-input"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-status-supported-bg text-status-supported-text mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-ink">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for precision tailoring
                  </p>
                </div>
                {/* Recognition Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-status-supported-bg text-status-supported-text text-[11px] font-medium">
                  <span>✓</span>
                  Template recognised • 1 page • Formatting locked
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-surface text-ink-muted mx-auto flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-ink">
                    Drop your .tex or .pdf resume here
                  </h4>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    or click to browse your files
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface border border-hairline text-ink-muted text-[11px]">
                  <span>🔒</span>
                  Formatting, preamble & macros never modified
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Paste JD & Transition Mode (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
              Target Job Description
            </label>
            <button
              type="button"
              onClick={loadSampleJD}
              className="text-[12px] text-accent hover:underline"
            >
              Insert Sample JD
            </button>
          </div>

          <textarea
            rows={7}
            required
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the target job description requirements, responsibilities, and qualifications..."
            className="w-full p-4 rounded-card border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
          />

          {/* 3-Option Segmented Control for Transition Mode */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block">
              Orientation Mode
            </label>
            <div
              role="radiogroup"
              aria-label="Transition mode"
              className="grid grid-cols-3 p-1 rounded-pill bg-hairline/40 border border-hairline text-center"
            >
              {(["Same Field", "Career Pivot", "Entry Level"] as const).map((mode) => {
                const isActive = transitionMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setTransitionMode(mode)}
                    className={`py-2 rounded-pill text-[12px] font-medium transition-all duration-fast ease-apple ${
                      isActive
                        ? "bg-canvas text-ink shadow-subtle"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-ink-muted px-1">
              {transitionMode === "Same Field" && "Optimizes keywords and metrics for identical domain seniority."}
              {transitionMode === "Career Pivot" && "Re-frames operational & analytical accomplishments for target domain without inventing titles."}
              {transitionMode === "Entry Level" && "Elevates foundational projects, academic rigor, and verified coursework."}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-4 text-center">
        <button
          type="submit"
          disabled={isProcessing}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-pill bg-accent text-white text-[15px] font-medium hover:bg-accent-hover shadow-subtle transition-all duration-fast ease-apple cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Tailored Draft...
            </>
          ) : (
            <>
              Generate Tailored Draft
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
