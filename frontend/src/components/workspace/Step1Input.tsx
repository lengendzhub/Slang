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
  Trash2,
  AlertCircle,
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
  hasExistingResume?: boolean;
  initialJdText?: string;
  onLoadSample?: () => void;
}

export function Step1Input({
  onGenerateDraft,
  onOpenEvidenceModal,
  candidateName,
  isProcessing = false,
  hasExistingResume = false,
  initialJdText = "",
  onLoadSample,
}: Step1InputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState(initialJdText);
  const [transitionMode, setTransitionMode] = useState<"Same Field" | "Career Pivot" | "Entry Level">("Career Pivot");
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialJdText !== undefined) {
      setJdText(initialJdText);
    }
  }, [initialJdText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setValidationError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setValidationError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedFile && !hasExistingResume) {
      setValidationError("Please upload your master resume (.tex or .pdf) first.");
      return;
    }

    if (!jdText.trim() || jdText.trim().length < 30) {
      setValidationError("Please paste a target Job Description with role requirements (minimum 30 characters).");
      return;
    }

    onGenerateDraft({
      file: selectedFile,
      jdText: jdText.trim(),
      mode: transitionMode,
    });
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
        {onLoadSample && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try with 1-Click Sample Resume & Suggestions
            </button>
          </div>
        )}
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
                : validationError && !selectedFile
                ? "border-red-500/80 bg-red-500/5 ring-2 ring-red-500/20"
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
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                      const input = document.getElementById("resume-file-input") as HTMLInputElement;
                      if (input) input.value = "";
                    }}
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded-pill transition-colors cursor-pointer relative z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Selected File
                  </button>
                </div>
              </div>
            ) : hasExistingResume ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-status-supported-bg text-status-supported-text mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-ink">
                    {candidateName && candidateName !== "Candidate" ? `${candidateName}'s Master Resume` : "Master Resume Active"}
                  </h4>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    Ready to tailor for this target role • Drop a new file to change
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-status-supported-bg text-status-supported-text text-[11px] font-medium">
                  <span>✓</span>
                  Master Preamble & Formatting Locked
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
            {jdText && (
              <button
                type="button"
                onClick={() => setJdText("")}
                className="text-[12px] text-ink-muted hover:text-red-500 transition-colors cursor-pointer"
              >
                Clear JD
              </button>
            )}
          </div>

          <textarea
            rows={7}
            required
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              if (validationError && e.target.value.trim().length >= 30) {
                setValidationError(null);
              }
            }}
            placeholder="Paste the target job description requirements, responsibilities, and qualifications (minimum 30 characters)..."
            className={`w-full min-h-[40dvh] sm:min-h-[220px] p-4 rounded-card border bg-canvas text-[16px] sm:text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed resize-y ${
              validationError && (!jdText.trim() || jdText.trim().length < 30)
                ? "border-red-500/80 ring-1 ring-red-500/20"
                : "border-hairline"
            }`}
          />

          {/* Mode Selection: Stacked cards on mobile, grid from sm/md up */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block">
              Orientation Mode
            </label>
            <div
              role="radiogroup"
              aria-label="Transition mode"
              className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 rounded-2xl sm:rounded-pill bg-hairline/30 border border-hairline text-center"
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
                    className={`min-h-[44px] py-2 px-3 rounded-xl sm:rounded-pill text-[13px] font-medium transition-all duration-fast ease-apple flex items-center justify-center cursor-pointer ${
                      isActive
                        ? "bg-canvas text-ink shadow-subtle border sm:border-0 border-hairline"
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

      {/* Primary Submit Button with sticky bottom bar on mobile */}
      <div className="sticky bottom-14 sm:static z-10 bg-surface/90 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none p-3 sm:p-0 pt-4 border-t sm:border-0 border-hairline -mx-4 sm:mx-0 text-center space-y-3">
        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-medium flex items-center justify-center gap-2 max-w-[580px] mx-auto text-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || jdText.trim().length < 30 || isProcessing}
          className={`w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-pill text-[15px] font-medium shadow-subtle transition-all duration-fast ease-apple ${
            selectedFile && jdText.trim().length >= 30 && !isProcessing
              ? "bg-accent text-white hover:bg-accent-hover cursor-pointer active:scale-[0.98]"
              : "bg-hairline text-ink-muted/50 cursor-not-allowed opacity-60"
          }`}
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
