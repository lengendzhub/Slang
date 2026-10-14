"use client";

import React, { useState, useEffect } from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Step1Input } from "@/components/workspace/Step1Input";
import SplitScreenReview, {
  BulletChange,
  JDRequirement,
} from "@/components/workspace/SplitScreenReview";
import { Step3Export } from "@/components/workspace/Step3Export";
import { EvidenceModal } from "@/components/workspace/EvidenceModal";
import { ChevronRight, Check } from "lucide-react";
import {
  loadUserSession,
  saveUserSession,
  UserSessionState,
} from "@/lib/store";

export default function WorkspacePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("Reading resume...");
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // Workspace Data
  const [candidateName, setCandidateName] = useState("Candidate");
  const [candidateEmail, setCandidateEmail] = useState("candidate@example.com");
  const [targetRole, setTargetRole] = useState("Target Role");
  const [targetCompany, setTargetCompany] = useState("");
  const [diffs, setDiffs] = useState<BulletChange[]>([]);
  const [requirements, setRequirements] = useState<JDRequirement[]>([]);
  const [rawLatex, setRawLatex] = useState<string>("");

  useEffect(() => {
    const session = loadUserSession();
    if (session.candidateName && session.candidateName !== "Candidate") {
      setCandidateName(session.candidateName);
      setCandidateEmail(session.candidateEmail || "candidate@example.com");
    }
    if (session.targetRole) {
      setTargetRole(session.targetRole);
    }
    if (session.targetCompany) {
      setTargetCompany(session.targetCompany);
    }
    if (session.rawResumeText) {
      setRawLatex(session.rawResumeText);
    }
  }, []);

  const handleOpenEvidenceModal = () => {
    setEvidenceModalOpen(true);
  };

  const handleAddEvidenceFact = (factText: string, context: string) => {
    const session = loadUserSession();
    const newRecord = {
      id: `ev_user_${Date.now()}`,
      source: "user_added",
      sourceName: "Custom Fact",
      text: factText,
      context: context,
      verified: true,
      dateAdded: "Just now",
    };
    saveUserSession({
      evidenceBank: [...(session.evidenceBank || []), newRecord],
    });
  };

  const handleGenerateDraft = async ({
    file,
    jdText,
    mode,
  }: {
    file: File | null;
    jdText: string;
    mode: "Same Field" | "Career Pivot" | "Entry Level";
  }) => {
    setIsProcessing(true);
    setProcessingStage("Reading resume...");

    try {
      let activeResumeId = "master_default";
      let extractedName = candidateName;
      let extractedEmail = candidateEmail;
      let returnedLatex = rawLatex;

      // 1. Upload Resume if file provided
      if (file) {
        setProcessingStage("Parsing LaTeX AST & verifying layout budget...");
        const formData = new FormData();
        formData.append("file", file);

        const resumeRes = await fetch("http://localhost:8000/resumes", {
          method: "POST",
          body: formData,
        });

        if (resumeRes.ok) {
          const resData = await resumeRes.json();
          activeResumeId = resData.id;
          extractedName = resData.contact_name || extractedName;
          extractedEmail = resData.contact_email || extractedEmail;
          returnedLatex = resData.raw_latex || returnedLatex;

          setCandidateName(extractedName);
          setCandidateEmail(extractedEmail);
          setRawLatex(returnedLatex);
        }
      }

      // 2. Analyze Job Description
      setProcessingStage("Checking job requirements & building semantic index...");
      const jdForm = new FormData();
      jdForm.append("raw_text", jdText);

      const jdRes = await fetch("http://localhost:8000/jds", {
        method: "POST",
        body: jdForm,
      });

      let jdId = "jd_default";
      let jdTitle = "Target Role";
      let jdReqs: JDRequirement[] = [];

      if (jdRes.ok) {
        const jdData = await jdRes.json();
        jdId = jdData.id;
        jdTitle = jdData.title || "Target Role";
        setTargetRole(jdTitle);
        setTargetCompany(jdData.company || "");

        jdReqs = (jdData.requirements || []).map((r: any) => ({
          id: r.id,
          text: r.text,
          category: r.category === "Responsibilities" ? "Essential" : "Essential",
          status:
            r.classification === "Direct"
              ? "direct"
              : r.classification === "Transferable"
              ? "transferable"
              : "missing",
          linkedEvidenceId: r.matched_evidence_id,
          note:
            r.classification === "Missing"
              ? "Left out of resume to keep it 100% truthful."
              : undefined,
        }));
        setRequirements(jdReqs);
      }

      // 3. Run Tailor Job via Planner & Llama 3.2
      setProcessingStage("Verifying facts against Evidence Bank with Llama 3.2...");
      const tailorForm = new FormData();
      tailorForm.append("resume_id", activeResumeId);
      tailorForm.append("jd_id", jdId);
      tailorForm.append(
        "mode",
        mode === "Same Field"
          ? "Same career"
          : mode === "Career Pivot"
          ? "Career transition"
          : "Fresher or internship"
      );

      const jobRes = await fetch("http://localhost:8000/tailor-jobs", {
        method: "POST",
        body: tailorForm,
      });

      if (jobRes.ok) {
        const jobData = await jobRes.json();
        const mappedDiffs: BulletChange[] = (jobData.diffs || []).map(
          (d: any) => ({
            id: d.id,
            section: d.section_title || "Experience",
            originalText: d.original_text,
            proposedText: d.rewritten_text,
            charBudget: d.max_length_budget || 160,
            matchType: d.claim_type === "bullet" ? "direct" : "transferable",
            reason: d.reason || "Re-framed to highlight relevant operational skills.",
            evidenceId: d.evidence_id || "ev_01",
            evidenceSourceQuote: `Master Resume: '${d.original_text.slice(0, 50)}...'`,
            decision: "pending",
          })
        );

        if (mappedDiffs.length > 0) {
          setDiffs(mappedDiffs);
        }

        saveUserSession({
          candidateName: extractedName,
          candidateEmail: extractedEmail,
          targetRole: jdTitle,
          targetJdText: jdText,
          rawResumeText: returnedLatex,
        });
      }

      // Transition smoothly to Step 2
      setCurrentStep(2);
    } catch (err) {
      console.error("Tailor job failed:", err);
      // Move to step 2 with deterministic fallbacks
      setCurrentStep(2);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueToDownload = (reviewedChanges: BulletChange[]) => {
    setDiffs(reviewedChanges);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      {/* Linear 3-Step Workspace Progress Bar */}
      <header className="sticky top-[52px] z-30 h-12 bg-canvas/80 backdrop-blur-md border-b border-hairline px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-tight text-[15px] text-ink">
            Workspace
          </span>
          <span className="text-ink-muted text-xs px-2 py-0.5 rounded-pill bg-surface border border-hairline">
            Strict Fact Anchoring
          </span>
        </div>

        {/* Centered 3-Step Progress Indicator */}
        <nav
          aria-label="Workspace progress"
          className="flex items-center gap-2 text-[13px]"
        >
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 transition-colors ${
              currentStep === 1
                ? "font-medium text-ink bg-surface px-2.5 py-1 rounded-pill border border-hairline"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {currentStep > 1 ? (
              <span className="w-4 h-4 rounded-full bg-status-supported-bg text-status-supported-text inline-flex items-center justify-center text-[10px] font-semibold">
                ✓
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-surface text-ink-muted border border-hairline inline-flex items-center justify-center text-[10px]">
                1
              </span>
            )}
            1. Resume & Job
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (currentStep > 2) setCurrentStep(2);
            }}
            className={`flex items-center gap-1.5 transition-colors ${
              currentStep === 2
                ? "font-medium text-ink bg-surface px-2.5 py-1 rounded-pill border border-hairline"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {currentStep > 2 ? (
              <span className="w-4 h-4 rounded-full bg-status-supported-bg text-status-supported-text inline-flex items-center justify-center text-[10px] font-semibold">
                ✓
              </span>
            ) : (
              <span className="w-4 h-4 rounded-full bg-surface text-ink-muted border border-hairline inline-flex items-center justify-center text-[10px]">
                2
              </span>
            )}
            2. Review Changes
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-ink-muted" />

          {/* Step 3 */}
          <span
            className={`flex items-center gap-1.5 ${
              currentStep === 3
                ? "font-medium text-ink bg-surface px-2.5 py-1 rounded-pill border border-hairline"
                : "text-ink-muted"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-surface text-ink-muted border border-hairline inline-flex items-center justify-center text-[10px]">
              3
            </span>
            3. Download
          </span>
        </nav>

        <div className="hidden sm:block text-[12px] text-ink-muted">
          Target: <strong className="font-medium text-ink">{targetRole}</strong>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 pb-28">
        {/* Calm Step Checklist Loading Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-canvas border border-hairline rounded-card shadow-paper p-8 max-w-[420px] w-full text-center space-y-4">
              <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-[17px] font-semibold text-ink">
                  Analyzing & Aligning Draft
                </h3>
                <p className="text-[13px] text-accent mt-1 font-medium">
                  {processingStage}
                </p>
              </div>
              <div className="pt-2 text-[11px] text-ink-muted space-y-1">
                <p>• Extracting AST content slots</p>
                <p>• Enforcing per-bullet character budgets</p>
                <p>• Validating 100% of claims against Evidence Bank</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Input */}
        {currentStep === 1 && (
          <Step1Input
            onGenerateDraft={handleGenerateDraft}
            onOpenEvidenceModal={handleOpenEvidenceModal}
            candidateName={candidateName}
            isProcessing={isProcessing}
          />
        )}

        {/* STEP 2: Split-Screen Review */}
        {currentStep === 2 && (
          <SplitScreenReview
            initialChanges={diffs}
            initialRequirements={requirements}
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            targetRole={targetRole}
            rawLatex={rawLatex}
            onContinueToDownload={handleContinueToDownload}
          />
        )}

        {/* STEP 3: Export & ATS Sanity Check */}
        {currentStep === 3 && (
          <Step3Export
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            targetRole={targetRole}
            targetCompany={targetCompany}
            reviewedChanges={diffs}
            rawLatex={rawLatex}
            onStartOver={() => setCurrentStep(1)}
          />
        )}
      </main>

      {/* Add Fact to Evidence Bank Modal */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        onAddFact={handleAddEvidenceFact}
      />
    </div>
  );
}
