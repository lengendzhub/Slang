"use client";

export interface DiffItemState {
  id: string;
  section: string;
  originalText: string;
  rewrittenText: string;
  reason: string;
  evidenceId: string;
  claimType: string;
  status: "supported" | "needs_confirmation" | "missing";
  decision: "pending" | "accepted" | "rejected" | "edited";
  editedText?: string;
  originalLength: number;
  newLength: number;
  fitsBudget: boolean;
}

export interface RequirementItemState {
  id: string;
  text: string;
  category: "Essential" | "Required" | "Preferred" | "Responsibilities";
  classification: "Direct" | "Transferable" | "Missing";
  matchedEvidenceId?: string;
  matchedText?: string;
  learningTip?: string;
}

export interface EvidenceItemState {
  id: string;
  source: string;
  sourceName: string;
  text: string;
  context: string;
  verified: boolean;
  dateAdded: string;
}

export interface SiblingItemState {
  id: string;
  role: string;
  company: string;
  date: string;
  fitScore: number;
  masterUpdated: boolean;
  tailoredBulletsCount: number;
}

export interface UserSessionState {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  uploadedFileName: string;
  uploadedFileType: "pdf" | "tex";
  rawResumeText: string;
  targetRole: string;
  targetCompany: string;
  targetJdText: string;
  careerMode: "Same career" | "Adjacent career" | "Career transition" | "Fresher or internship";
  diffs: DiffItemState[];
  requirements: RequirementItemState[];
  evidenceBank: EvidenceItemState[];
  siblings: SiblingItemState[];
  fitScore: number;
}

const STORAGE_KEY = "tailorai_user_session_v1";

export function loadUserSession(): UserSessionState {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error reading user session from localStorage:", e);
    }
  }

  // Clean empty state (no hardcoded mock data)
  return {
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    uploadedFileName: "",
    uploadedFileType: "pdf",
    rawResumeText: "",
    targetRole: "",
    targetCompany: "",
    targetJdText: "",
    careerMode: "Same career",
    diffs: [],
    requirements: [],
    evidenceBank: [],
    siblings: [],
    fitScore: 0,
  };
}

export function saveUserSession(session: Partial<UserSessionState>) {
  if (typeof window !== "undefined") {
    try {
      const current = loadUserSession();
      const updated = { ...current, ...session };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("tailorai_session_updated"));
    } catch (e) {
      console.error("Error saving user session to localStorage:", e);
    }
  }
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("tailorai_session_updated"));
    } catch (e) {
      console.error("Error clearing user session:", e);
    }
  }
}
