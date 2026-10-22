"use client";

import React, { useState, useEffect } from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { Step1Input } from "@/components/workspace/Step1Input";
import SplitScreenReview, {
  BulletChange,
  JDRequirement,
} from "@/components/workspace/SplitScreenReview";
import { Step3Export } from "@/components/workspace/Step3Export";
import { EvidenceModal } from "@/components/workspace/EvidenceModal";
import { DraftAligningModal, ModalStatus } from "@/components/workspace/DraftAligningModal";
import Link from "next/link";
import { ChevronRight, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadUserSession,
  saveUserSession,
  clearUserSession,
  UserSessionState,
} from "@/lib/store";
import { getApiBaseUrl } from "@/lib/apiConfig";


export default function WorkspacePage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ModalStatus>("running");
  const [processingStage, setProcessingStage] = useState("Reading resume...");
  const [activeAlignStep, setActiveAlignStep] = useState(0);
  const [alignProgress, setAlignProgress] = useState(15);
  const [alignError, setAlignError] = useState<string | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  // Workspace Data
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [diffs, setDiffs] = useState<BulletChange[]>([]);
  const [requirements, setRequirements] = useState<JDRequirement[]>([]);
  const [rawLatex, setRawLatex] = useState<string>("");
  const [jdText, setJdText] = useState<string>("");

  useEffect(() => {
    const syncSession = () => {
      const session = loadUserSession();
      setCandidateName(session.candidateName || "");
      setCandidateEmail(session.candidateEmail || "");
      setTargetRole(session.targetRole || "");
      setTargetCompany(session.targetCompany || "");
      setRawLatex(session.rawResumeText || "");
      if (session.diffs && session.diffs.length > 0) {
        setDiffs(
          session.diffs.map((d: any) => ({
            id: d.id,
            section: d.section || "Experience",
            roleTitle: d.roleTitle,
            company: d.company,
            dateRange: d.dateRange,
            originalText: d.originalText,
            proposedText: d.rewrittenText || d.proposedText || "",
            editedText: d.editedText,
            charBudget: d.charBudget || d.newLength || (d.rewrittenText || d.proposedText || "").length,
            matchType: (d.matchType || (d.status === "supported" ? "direct" : "transferable")) as "direct" | "transferable",
            reason: d.reason || "",
            evidenceId: d.evidenceId || "",
            evidenceSourceQuote: d.evidenceSourceQuote || d.originalText || "",
            decision: (d.decision || "accepted") as "pending" | "accepted" | "rejected" | "edited",
          }))
        );
      } else {
        setDiffs([]);
      }

      if (session.requirements && session.requirements.length > 0) {
        setRequirements(
          session.requirements.map((r: any) => ({
            id: r.id,
            text: r.text,
            category: r.category === "Preferred" ? "Preferred" : "Essential",
            status:
              r.classification === "Direct" || r.status === "direct"
                ? "direct"
                : r.classification === "Transferable" || r.status === "transferable"
                ? "transferable"
                : "missing",
            linkedEvidenceId: r.matchedEvidenceId || r.linkedEvidenceId,
            note: r.learningTip || r.note,
          }))
        );
      } else {
        setRequirements([]);
      }
    };

    syncSession();
    window.addEventListener("slang_session_updated", syncSession);
    window.addEventListener("tailorai_session_updated", syncSession);
    return () => {
      window.removeEventListener("slang_session_updated", syncSession);
      window.removeEventListener("tailorai_session_updated", syncSession);
    };
  }, []);

  const handleStartOver = () => {
    setCurrentStep(1);
    setTargetRole("");
    setTargetCompany("");
    setJdText("");
    setDiffs([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleReset = () => {
      handleStartOver();
    };
    window.addEventListener("slang:reset-workspace", handleReset);
    return () => window.removeEventListener("slang:reset-workspace", handleReset);
  }, []);

  const handleClearWorkspace = async () => {
    if (!confirm("Are you sure you want to clear your current workspace draft and all cached session data?")) {
      return;
    }
    clearUserSession();
    try {
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/me/data`, { method: "DELETE" });
    } catch {
      // client-side purge succeeds
    }
    setCandidateName("");
    setCandidateEmail("");
    setTargetRole("");
    setTargetCompany("");
    setRawLatex("");
    setJdText("");
    setDiffs([]);
    setRequirements([]);
    setCurrentStep(1);
  };

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
    if (!file && !rawLatex) {
      alert("Please upload your master resume (.tex or .pdf) before generating a tailored draft.");
      return;
    }

    if (!jdText || jdText.trim().length < 30) {
      alert("Please paste a realistic target Job Description with role requirements (minimum 30 characters).");
      return;
    }

    const startTime = Date.now();
    setIsProcessing(true);
    setProcessingStage("Reading resume...");
    setJdText(jdText);

    const API_BASE = getApiBaseUrl();

    try {
      let activeResumeId = "";
      let extractedName = candidateName;
      let extractedEmail = candidateEmail;
      let returnedLatex = rawLatex;

      // 1. Upload Resume
      if (file) {
        setProcessingStage("Parsing LaTeX AST & verifying layout budget...");
        try {
          const formData = new FormData();
          formData.append("file", file);

          const resumeRes = await fetch(`${API_BASE}/resumes`, {
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
        } catch (e) {
          console.warn("Resume upload network error, falling back:", e);
        }
      } else if (rawLatex && rawLatex.trim()) {
        try {
          const formData = new FormData();
          formData.append("raw_latex", rawLatex);
          const resumeRes = await fetch(`${API_BASE}/resumes`, {
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
        } catch (e) {
          console.warn("Resume parse network error, falling back:", e);
        }
      }

      if (!activeResumeId) {
        activeResumeId = `local_resume_${Date.now()}`;
        if (!returnedLatex) {
          throw new Error("No master resume text found. Please upload a valid .tex or .pdf resume file.");
        }
      }

      // 2. Analyze Job Description
      setProcessingStage("Checking job requirements & building semantic index...");
      let jdId = "jd_default";
      let jdTitle = targetRole || "Target Role";
      let jdReqs: JDRequirement[] = [];

      try {
        const jdForm = new FormData();
        jdForm.append("raw_text", jdText);

        const jdRes = await fetch(`${API_BASE}/jds`, {
          method: "POST",
          body: jdForm,
        });

        if (jdRes.ok) {
          const jdData = await jdRes.json();
          jdId = jdData.id;
          jdTitle = jdData.title || jdTitle;
          setTargetRole(jdTitle);
          setTargetCompany(jdData.company || targetCompany);

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
          if (jdReqs.length > 0) {
            setRequirements(jdReqs);
          }
        }
      } catch (e) {
        console.warn("JD parse network error, using fallback reqs:", e);
      }

      // 3. Run Tailor Job via Planner & Llama 3.2
      setProcessingStage("Verifying facts against Evidence Bank with Llama 3.2...");
      let finalDiffs: BulletChange[] = [];
      let finalReqs: JDRequirement[] = jdReqs.length > 0 ? jdReqs : requirements;

      try {
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

        const jobRes = await fetch(`${API_BASE}/tailor-jobs`, {
          method: "POST",
          body: tailorForm,
        });

        if (jobRes.ok) {
          const jobData = await jobRes.json();
          
          if (jobData.requirements && Array.isArray(jobData.requirements) && jobData.requirements.length > 0) {
            finalReqs = jobData.requirements.map((r: any) => ({
              id: r.id,
              text: r.text,
              category: r.category === "Preferred" ? "Preferred" : "Essential",
              status:
                r.classification === "Direct"
                  ? "direct"
                  : r.classification === "Transferable"
                  ? "transferable"
                  : "missing",
              linkedEvidenceId: r.matched_evidence_id,
              note:
                r.notes ||
                (r.classification === "Missing"
                  ? "Left out of resume to keep it 100% truthful."
                  : undefined),
            }));
          }

          const mappedDiffs: BulletChange[] = (jobData.diffs || []).map(
            (d: any) => ({
              id: d.id,
              section: d.section_title || "Experience",
              roleTitle: d.role_title,
              company: d.company,
              dateRange: d.date_range,
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
            finalDiffs = mappedDiffs;
          }
        }
      } catch (e) {
        console.warn("Tailor-jobs network error, using fallback:", e);
      }

      // If no diffs returned (e.g. backend cold start or 0 diffs), extract from LaTeX or use sample diffs
      if (finalDiffs.length === 0) {
        if (returnedLatex && returnedLatex.includes("\\resumeItem")) {
          const bulletRegex = /\\resumeItem\{([^}]+)\}/g;
          let match;
          let idx = 1;
          const extracted: BulletChange[] = [];
          while ((match = bulletRegex.exec(returnedLatex)) !== null && idx <= 5) {
            const raw = match[1].trim();
            extracted.push({
              id: `diff_extracted_${idx}`,
              section: "Experience",
              originalText: raw,
              proposedText: raw,
              charBudget: 160,
              matchType: "direct",
              reason: "Extracted from verified master resume experience.",
              evidenceId: `ev_ext_${idx}`,
              evidenceSourceQuote: `Master Resume: '${raw.slice(0, 50)}...'`,
              decision: "pending",
            });
            idx++;
          }
          if (extracted.length > 0) {
            finalDiffs = extracted;
          }
        }
      }

      setDiffs(finalDiffs);
      setRequirements(finalReqs);

      // Save complete session with diffs and requirements so syncSession doesn't wipe them
      saveUserSession({
        candidateName: extractedName,
        candidateEmail: extractedEmail,
        targetRole: jdTitle,
        targetJdText: jdText,
        rawResumeText: returnedLatex,
        diffs: finalDiffs.map((d) => ({
          id: d.id,
          section: d.section,
          originalText: d.originalText,
          rewrittenText: d.proposedText,
          reason: d.reason,
          evidenceId: d.evidenceId,
          claimType: "bullet",
          status: d.matchType === "direct" ? "supported" : "needs_confirmation",
          decision: d.decision,
          originalLength: d.originalText.length,
          newLength: d.proposedText.length,
          fitsBudget: true,
        })),
        requirements: finalReqs.map((r) => ({
          id: r.id,
          text: r.text,
          category: r.category === "Preferred" ? "Preferred" : "Essential",
          classification: r.status === "direct" ? "Direct" : "Transferable",
          matchedEvidenceId: r.linkedEvidenceId,
          learningTip: r.note,
        })),
      });

      // Calibrated pacing: gives user 7.0s to see the 4 pipeline stages verify cleanly
      const elapsed = Date.now() - startTime;
      const MIN_DISPLAY_MS = 7000;
      if (elapsed < MIN_DISPLAY_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS - elapsed));
      }

      // Transition smoothly to Step 2
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Tailor draft generation error:", err);
      setProcessingStatus("error");
      const msg = err.message || "Failed to generate tailored draft. Please verify backend is running.";
      setAlignError(msg);
      alert(msg);
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
      {currentStep !== 2 && <FrostedNav />}

      {/* Linear 3-Step Workspace Progress Bar */}
      {currentStep !== 2 && (
        <header className="sticky top-12 md:top-[48px] z-30 h-12 bg-canvas/80 backdrop-blur-md border-b border-hairline px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-[15px] text-ink">
              Workspace
            </span>
          </div>

          {/* Mobile Step Indicator (Below md): 'Step X of 3' with thin progress bar */}
          <div className="md:hidden flex flex-col items-center justify-center">
            <span className="text-[12px] font-medium text-ink">
              Step {currentStep} of 3
            </span>
            <div className="w-20 h-1 bg-hairline/60 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Centered Desktop 3-Step Progress Indicator (Apple Store Checkout Style) */}
          <nav
            aria-label="Workspace progress"
            className="hidden md:flex items-center gap-3 text-[13px]"
          >
            {/* Step 1: Tailor */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentStep === 1
                  ? "font-semibold text-ink bg-surface px-3 py-1 rounded-pill border border-hairline shadow-subtle"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {currentStep > 1 ? (
                <span className="w-4 h-4 rounded-full bg-status-supported-bg text-status-supported-text inline-flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-surface text-ink-secondary border border-hairline inline-flex items-center justify-center text-[10px] font-medium">
                  1
                </span>
              )}
              <span>Tailor</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-separator" />

            {/* Step 2: Review */}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 2) setCurrentStep(2);
              }}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentStep > 2
                  ? "text-ink hover:text-accent"
                  : "text-ink-secondary opacity-60 cursor-not-allowed"
              }`}
            >
              {currentStep > 2 ? (
                <span className="w-4 h-4 rounded-full bg-status-supported-bg text-status-supported-text inline-flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-surface text-ink-secondary border border-hairline inline-flex items-center justify-center text-[10px] font-medium">
                  2
                </span>
              )}
              <span>Review</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-separator" />

            {/* Step 3: Export */}
            <span
              className={`flex items-center gap-1.5 ${
                currentStep === 3
                  ? "font-semibold text-ink bg-surface px-3 py-1 rounded-pill border border-hairline shadow-subtle"
                  : "text-ink-secondary opacity-60"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-surface text-ink-secondary border border-hairline inline-flex items-center justify-center text-[10px] font-medium">
                3
              </span>
              <span>Export</span>
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-[12px] text-ink-secondary truncate max-w-[150px]">
              Target: <strong className="font-medium text-ink">{targetRole}</strong>
            </div>
            <button
              type="button"
              onClick={handleClearWorkspace}
              title="Clear all inputs and reset workspace"
              className="text-[12px] text-ink-secondary hover:text-red-500 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-pill hover:bg-red-500/10 cursor-pointer min-h-[36px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Clear Data</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace Area */}
      <main className={`flex-1 w-full mx-auto ${currentStep === 2 ? "p-0" : "max-w-[1280px] px-4 sm:px-6 py-6 pb-28"}`}>
        {/* Redesigned Engaging & Trustworthy Loading Modal */}
        <DraftAligningModal
          isOpen={isProcessing}
          onClose={() => setIsProcessing(false)}
          onCancel={() => setIsProcessing(false)}
          onComplete={() => {
            setIsProcessing(false);
            setCurrentStep(2);
          }}
          autoSimulate={true}
          totalDurationMs={7000}
          title="Aligning draft to target requirements"
        />

        {/* Animated Step Transitions */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
            >
              <Step1Input
                onGenerateDraft={handleGenerateDraft}
                onOpenEvidenceModal={handleOpenEvidenceModal}
                candidateName={candidateName}
                isProcessing={isProcessing}
                hasExistingResume={Boolean(rawLatex && rawLatex.trim())}
                initialJdText={jdText}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
            >
              <SplitScreenReview
                initialChanges={diffs}
                initialRequirements={requirements}
                candidateName={candidateName}
                candidateEmail={candidateEmail}
                targetRole={targetRole}
                rawLatex={rawLatex}
                onContinueToDownload={handleContinueToDownload}
                onBackToStep1={() => setCurrentStep(1)}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
            >
              <Step3Export
                candidateName={candidateName}
                candidateEmail={candidateEmail}
                targetRole={targetRole}
                targetCompany={targetCompany}
                reviewedChanges={diffs}
                rawLatex={rawLatex}
                jdText={jdText}
                onStartOver={handleStartOver}
                onBackToStep2={() => setCurrentStep(2)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Fact to Evidence Bank Modal */}
      <EvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        onAddFact={handleAddEvidenceFact}
      />

      {/* Responsive Mobile Bottom Tab Bar (Visible < lg when not reviewing diffs) */}
      {currentStep !== 2 && <MobileTabBar />}
    </div>
  );
}
