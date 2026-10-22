"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  Trash2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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
}

const ORIENTATION_OPTIONS = [
  { id: "Same Field", label: "Same Field" },
  { id: "Career Pivot", label: "Career Pivot" },
  { id: "Entry Level", label: "Entry Level" },
];

const ORIENTATION_HELPERS: Record<string, string> = {
  "Same Field": "Optimizes metrics, tool proficiency, and technical depth within your current domain.",
  "Career Pivot": "Reframes transferable achievements across industry boundaries with verifiable evidence.",
  "Entry Level": "Highlights core technical foundations, coursework, and open-source contributions.",
};

export function Step1Input({
  onGenerateDraft,
  candidateName,
  isProcessing = false,
  hasExistingResume = false,
  initialJdText = "",
}: Step1InputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState(initialJdText);
  const [transitionMode, setTransitionMode] = useState<"Same Field" | "Career Pivot" | "Entry Level">("Career Pivot");
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "tex" || ext === "pdf") {
        setSelectedFile(file);
        setValidationError(null);
      } else {
        setValidationError("Please drop a valid .tex or .pdf resume file.");
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const jdCharCount = jdText.trim().length;
  const isJdValid = jdCharCount >= 30;
  const hasResume = Boolean(selectedFile || hasExistingResume);
  const isFormValid = hasResume && isJdValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!hasResume) {
      setValidationError("Please upload your master resume (.tex or .pdf) first.");
      return;
    }

    if (!isJdValid) {
      setValidationError("Please paste a target Job Description (minimum 30 characters).");
      return;
    }

    onGenerateDraft({
      file: selectedFile,
      jdText: jdText.trim(),
      mode: transitionMode,
    });
  };

  return (
    <div className="w-full max-w-[680px] mx-auto py-4">
      {/* Centred Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="apple-h1 text-ink">
          Tailor Your Resume
        </h1>
        <p className="apple-body text-ink-secondary max-w-[480px] mx-auto text-[15px]">
          Upload your LaTeX master file and target job description. Your layout and preamble remain strictly locked.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Validation Alert */}
        {validationError && (
          <div className="p-3.5 rounded-xl bg-status-missing-bg border border-status-missing-text/20 text-status-missing-text text-[13px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Master Resume Upload Dropzone */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-ink flex items-center justify-between">
            <span>Master Resume Source</span>
            <span className="text-[11px] font-mono text-ink-secondary">.tex or .pdf</span>
          </label>

          {selectedFile ? (
            /* Selected File Chip */
            <div className="p-4 rounded-card bg-surface border border-hairline flex items-center justify-between shadow-subtle">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-canvas border border-hairline flex items-center justify-center text-accent shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[12px] text-ink-secondary font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AST parsing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-secondary hover:text-red-500 hover:bg-surface transition-colors cursor-pointer"
                title="Remove file"
                aria-label="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : hasExistingResume ? (
            /* Existing Session Resume Chip */
            <div className="p-4 rounded-card bg-surface border border-hairline flex items-center justify-between shadow-subtle">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-status-supported-bg border border-status-supported-text/20 flex items-center justify-center text-status-supported-text shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    Active Master Resume Cached
                  </p>
                  <p className="text-[12px] text-ink-secondary">
                    {candidateName ? `Candidate: ${candidateName}` : "Master LaTeX AST loaded"}
                  </p>
                </div>
              </div>
              <label
                htmlFor="resume-upload"
                className="pill-btn pill-btn-secondary px-3 py-1.5 text-[12px] cursor-pointer"
              >
                Replace
                <input
                  id="resume-upload"
                  type="file"
                  accept=".tex,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
          ) : (
            /* Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-card p-8 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-hairline bg-surface hover:bg-canvas/50"
              }`}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".tex,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload master resume"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-11 h-11 rounded-full bg-canvas border border-hairline flex items-center justify-center text-ink-secondary mb-1 shadow-subtle">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-[14px] font-semibold text-ink">
                  Click to upload or drag & drop
                </p>
                <p className="text-[12px] text-ink-secondary">
                  LaTeX (.tex) or PDF master resume
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Target Job Description Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="jd-textarea" className="text-[13px] font-semibold text-ink">
              Target Job Description
            </label>
            <span
              className={`text-[12px] font-mono transition-colors ${
                isJdValid ? "text-status-supported-text" : "text-ink-secondary"
              }`}
            >
              {jdCharCount < 30 ? `${jdCharCount} / 30 min chars` : `${jdCharCount} chars`}
            </span>
          </div>

          <textarea
            id="jd-textarea"
            rows={6}
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Paste the target job description here. Include key responsibilities and qualifications to extract requirements..."
            className="w-full p-4 rounded-xl bg-canvas border border-hairline text-[14px] text-ink leading-relaxed placeholder:text-ink-tertiary focus:outline-none apple-focus-ring resize-y min-h-[140px]"
          />
        </div>

        {/* 3. Orientation Mode (Apple Segmented Control) */}
        <div className="space-y-2 pt-1">
          <label className="text-[13px] font-semibold text-ink block">
            Career Orientation Mode
          </label>
          <div className="w-full flex justify-center">
            <SegmentedControl
              options={ORIENTATION_OPTIONS}
              value={transitionMode}
              onChange={(val) => setTransitionMode(val as "Same Field" | "Career Pivot" | "Entry Level")}
              className="w-full justify-between"
              name="orientation-mode"
            />
          </div>
          {/* One-line helper under the selection */}
          <p className="text-[12px] text-ink-secondary text-center min-h-[18px] transition-all duration-150">
            {ORIENTATION_HELPERS[transitionMode]}
          </p>
        </div>

        {/* Submit Action: Primary Pill CTA (disabled until valid) */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid || isProcessing}
            className={`w-full min-h-[48px] rounded-pill font-medium text-[15px] flex items-center justify-center gap-2 transition-all duration-200 ${
              isFormValid && !isProcessing
                ? "bg-accent text-white hover:bg-accent-hover shadow-subtle cursor-pointer active:scale-[0.99]"
                : "bg-surface border border-hairline text-ink-secondary opacity-50 cursor-not-allowed"
            }`}
          >
            <span>{isProcessing ? "Tailoring Draft..." : "Generate Truthful Draft"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet footer reassurance */}
        <div className="text-center text-[12px] text-ink-tertiary font-mono pt-2">
          Preamble locked • Single-page ATS budget enforced • Zero hallucinations
        </div>
      </form>
    </div>
  );
}
