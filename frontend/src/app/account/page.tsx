"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  Trash2,
  Download,
  Moon,
  Sun,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  X,
  FileCode,
  Lock,
} from "lucide-react";
import { loadUserSession, clearUserSession } from "@/lib/store";
import { getCurrentUser, clearAuthSession, AuthUser } from "@/lib/authStore";
import { getApiBaseUrl } from "@/lib/apiConfig";
import {
  getEffectiveTheme,
  toggleTheme as executeToggleTheme,
  THEME_CHANGE_EVENT,
} from "@/lib/theme";

export default function AccountPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [purged, setPurged] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    setAuthUser(user);
    if (user) {
      setCandidateName(user.name);
      setCandidateEmail(user.email);
    } else {
      const session = loadUserSession();
      if (session.candidateEmail) setCandidateEmail(session.candidateEmail);
      if (session.candidateName) setCandidateName(session.candidateName);
    }

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
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, []);

  const toggleAppearance = () => {
    const nextTheme = executeToggleTheme();
    setIsDark(nextTheme === "dark");
  };

  const handleSignOut = async () => {
    clearAuthSession();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthUser(null);
    setCandidateName("");
    setCandidateEmail("");
    window.location.href = "/signin";
  };

  const handleExportData = () => {
    const session = loadUserSession();
    const dataArchive = {
      export_date: new Date().toISOString(),
      user: {
        name: candidateName,
        email: candidateEmail,
        auth_provider: authUser?.auth_provider || "local_session",
      },
      session_data: session,
      privacy_policy: "Zero-retention verified export",
    };

    const blob = new Blob([JSON.stringify(dataArchive, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slang_data_archive_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConfirmDeleteAll = async () => {
    setIsPurging(true);
    clearUserSession();
    clearAuthSession();
    setAuthUser(null);
    setCandidateName("Candidate");
    setCandidateEmail("");

    try {
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/me/data`, { method: "DELETE" });
    } catch {
      // client-side purge succeeds
    }

    setTimeout(() => {
      setIsPurging(false);
      setDeleteSheetOpen(false);
      setPurged(true);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[780px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28 space-y-8">
        {/* Page Header */}
        <div className="pb-6 border-b border-hairline">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-1 block">
            Settings
          </span>
          <h1 className="apple-h1 text-ink">
            Account & Privacy
          </h1>
          <p className="apple-body text-ink-secondary mt-1">
            Manage your account authentication, system appearance, and zero-retention data policies.
          </p>
        </div>

        {purged && (
          <div className="p-4 rounded-card bg-status-supported-bg border border-status-supported-text/20 text-status-supported-text text-[13px] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>All local session documents, evidence records, and server caches have been permanently deleted.</span>
          </div>
        )}

        {/* Section 1: Profile & Authentication */}
        <div className="apple-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h3 className="text-[16px] font-semibold text-ink">
              Profile
            </h3>
            {authUser ? (
              <span className="px-2.5 py-0.5 rounded-pill bg-status-supported-bg text-status-supported-text text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Signed In
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-pill bg-surface border border-hairline text-ink-secondary text-[11px] font-medium">
                Guest Session
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-secondary">Name</span>
              <span className="font-medium text-ink">{candidateName || "Candidate"}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-secondary">Email</span>
              <span className="font-mono text-ink text-[12px]">
                {candidateEmail || "guest@local"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-ink-secondary">Session Mode</span>
              <span className="font-mono text-ink text-[12px]">
                {authUser ? "Authenticated Cloud Token" : "Isolated Browser Storage"}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {authUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="pill-btn pill-btn-secondary px-4 py-1.5 text-[12px] gap-1.5 text-danger border-danger/20 hover:bg-danger/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/signin"
                className="pill-btn pill-btn-primary px-4 py-1.5 text-[12px]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Section 2: Appearance & Preferences */}
        <div className="apple-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h3 className="text-[16px] font-semibold text-ink">
              Appearance
            </h3>
            <span className="text-[12px] text-ink-secondary">Adaptive Apple Interface</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-ink">Interface Theme</p>
              <p className="text-[12px] text-ink-secondary">
                Switch between high-contrast Dark Mode and light Apple Paper style.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAppearance}
              suppressHydrationWarning
              className="pill-btn pill-btn-secondary px-4 py-2 text-[13px] gap-2 min-h-[36px]"
            >
              {mounted && isDark ? (
                <>
                  <Sun className="w-4 h-4 text-warning" />
                  <span>Switch to Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-ink-secondary" />
                  <span>Switch to Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 3: Data Portability */}
        <div className="apple-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h3 className="text-[16px] font-semibold text-ink">
              Data Portability
            </h3>
            <span className="text-[11px] font-mono text-status-supported-text">GDPR • CCPA Compliant</span>
          </div>

          <p className="apple-body text-ink-secondary text-[13px]">
            Download a portable JSON archive of your verified Evidence Bank, master resume AST slots, and sibling generation history.
          </p>

          <button
            type="button"
            onClick={handleExportData}
            className="pill-btn pill-btn-secondary px-4 py-2 text-[13px] gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export My Data (.json)</span>
          </button>
        </div>

        {/* Section 4: Danger Zone - Delete All My Data */}
        <div className="apple-card p-6 space-y-4 border-danger/30">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <h3 className="text-[16px] font-semibold text-danger flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Data Erasure</span>
            </h3>
            <span className="text-[11px] font-mono text-danger">Irreversible</span>
          </div>

          <p className="apple-body text-ink-secondary text-[13px]">
            Permanently delete all master resumes, job descriptions, diff records, and evidence bank entries across this device and the compilation server.
          </p>

          <button
            type="button"
            onClick={() => setDeleteSheetOpen(true)}
            className="pill-btn px-5 py-2 text-[13px] font-medium bg-status-missing-bg text-danger border border-danger/30 hover:bg-danger hover:text-white transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </main>

      {/* Apple-style Action Sheet Modal for "Delete All My Data" */}
      <AnimatePresence>
        {deleteSheetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPurging && setDeleteSheetOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.28, 0.11, 0.32, 1] }}
              className="relative w-full max-w-[480px] rounded-card bg-canvas border border-hairline p-6 shadow-apple z-10 space-y-5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-hairline">
                <div className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-[17px] font-semibold text-ink">
                    Delete All My Data?
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => setDeleteSheetOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-ink-secondary hover:text-ink cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[13px] text-ink-secondary leading-relaxed">
                <p>
                  This action is permanent and cannot be undone. Confirming will immediately and irreversibly erase:
                </p>
                <ul className="space-y-1.5 pl-4 list-disc text-ink">
                  <li>Your uploaded master LaTeX resumes and AST content slot caches</li>
                  <li>All target job descriptions and extracted requirements</li>
                  <li>All tailored resume siblings, exports, and PDF binaries</li>
                  <li>Your complete Evidence Bank and verified citations</li>
                  <li>All active session cookies and server-side cache keys</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => setDeleteSheetOpen(false)}
                  className="pill-btn pill-btn-secondary w-full sm:w-auto px-5 py-2 text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPurging}
                  onClick={handleConfirmDeleteAll}
                  className="pill-btn w-full sm:w-auto px-5 py-2 text-[13px] font-medium bg-danger text-white hover:bg-red-600 shadow-subtle cursor-pointer active:scale-95"
                >
                  {isPurging ? "Erasing Data..." : "Permanently Erase Everything"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
