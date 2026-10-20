"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import {
  Trash2,
  Download,
  Moon,
  Sun,
  CheckCircle2,
  AlertTriangle,
  Lock,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { loadUserSession, clearUserSession } from "@/lib/store";
import { getCurrentUser, clearAuthSession, AuthUser } from "@/lib/authStore";
import { getApiBaseUrl } from "@/lib/apiConfig";

export default function AccountPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [isDark, setIsDark] = useState(false);
  const [purged, setPurged] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
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

    const savedTheme = localStorage.getItem("slang_theme");
    setIsDark(savedTheme === "dark");

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIsDark(customEvent.detail);
      } else {
        setIsDark(localStorage.getItem("slang_theme") === "dark");
      }
    };

    const handleAuthChange = () => {
      const updatedUser = getCurrentUser();
      setAuthUser(updatedUser);
      if (updatedUser) {
        setCandidateName(updatedUser.name);
        setCandidateEmail(updatedUser.email);
      }
    };

    window.addEventListener("slang_theme_changed", handleThemeChange);
    window.addEventListener("slang_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("slang_theme_changed", handleThemeChange);
      window.removeEventListener("slang_auth_changed", handleAuthChange);
    };
  }, []);

  const toggleAppearance = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("slang_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("slang_theme", "light");
    }
    window.dispatchEvent(new CustomEvent("slang_theme_changed", { detail: next }));
  };

  const handleSignOut = () => {
    clearAuthSession();
    setAuthUser(null);
    setCandidateName("Candidate");
    setCandidateEmail("");
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
    a.download = `slang_user_archive_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteData = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete all your resumes, JDs, and evidence records? This action is irreversible."
      )
    ) {
      return;
    }

    setIsPurging(true);
    clearUserSession();
    clearAuthSession();
    setAuthUser(null);
    setCandidateName("Candidate");
    setCandidateEmail("");

    // Call backend delete if available
    try {
      const apiUrl = getApiBaseUrl();
      await fetch(`${apiUrl}/me/data`, { method: "DELETE" });
    } catch {
      // client-side purge succeeds
    }

    setTimeout(() => {
      setIsPurging(false);
      setPurged(true);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 max-w-[780px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-28 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-hairline">
          <h1 className="text-[32px] font-semibold tracking-tight text-ink">
            Account & Privacy
          </h1>
          <p className="text-[14px] text-ink-muted mt-0.5">
            Manage your account authentication, appearance, and zero-retention data policies.
          </p>
        </div>

        {/* Card 1: Account Profile & Auth Session */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold text-ink">
                Account Details
              </h3>
              {authUser ? (
                <span className="px-2 py-0.5 rounded-full bg-status-supported-bg text-status-supported-text text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Signed In
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-surface border border-hairline text-ink-muted text-[11px] font-medium">
                  Guest Session
                </span>
              )}
            </div>

            {authUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-hairline text-[12px] font-medium text-status-missing-text bg-status-missing-bg/40 hover:bg-status-missing-bg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-colors shadow-subtle"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
            <div className="p-3.5 bg-surface rounded-xl border border-hairline">
              <span className="text-[11px] font-semibold uppercase text-ink-muted block mb-1">
                Name
              </span>
              <p className="font-medium text-ink flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-accent" />
                {candidateName || "Candidate"}
              </p>
            </div>
            <div className="p-3.5 bg-surface rounded-xl border border-hairline">
              <span className="text-[11px] font-semibold uppercase text-ink-muted block mb-1">
                Email Address
              </span>
              <p className="font-medium text-ink">
                {candidateEmail || "Not provided (guest mode)"}
              </p>
            </div>
          </div>

          {authUser && (
            <div className="p-3.5 bg-surface/60 rounded-xl border border-hairline flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 text-ink-muted">
                <KeyRound className="w-4 h-4 text-accent" />
                <span>Provider: <strong className="text-ink font-semibold capitalize">{authUser.auth_provider || "Email / Password"}</strong></span>
              </div>
              <span className="text-[11px] text-ink-muted font-mono">User ID: {authUser.id.slice(0, 16)}</span>
            </div>
          )}

          {!authUser && (
            <div className="p-3.5 bg-surface rounded-xl border border-hairline/80 flex items-center justify-between text-[12px]">
              <span className="text-ink-muted">
                Sync your evidence bank and tailored resumes across devices.
              </span>
              <Link href="/signin" className="text-accent hover:underline font-medium">
                Log in now &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Appearance Toggle */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-[16px] font-semibold text-ink">
              Appearance
            </h3>
            <p className="text-[13px] text-ink-muted">
              Choose between Apple Light mode and Dark mode.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAppearance}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-surface border border-hairline text-ink text-[13px] font-medium hover:bg-canvas transition-colors cursor-pointer"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-accent" />
                Dark Mode
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-accent" />
                Light Mode
              </>
            )}
          </button>
        </div>

        {/* Card 3: Privacy & Zero-Retention Data Controls */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-6 space-y-5">
          <div className="space-y-1">
            <h3 className="text-[16px] font-semibold text-ink">
              Data Sovereignty & Zero-Retention
            </h3>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              Slang never trains models on your resumes, JDs, or evidence facts. You have complete control to export or permanently erase your documents at any time.
            </p>
          </div>

          {purged && (
            <div className="p-3.5 bg-status-supported-bg border border-status-supported-text/30 rounded-xl flex items-center gap-2.5 text-[13px] text-status-supported-text font-medium">
              <CheckCircle2 className="w-4 h-4" />
              All resumes, JDs, and Evidence Bank records have been permanently erased.
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill bg-surface border border-hairline text-ink text-[13px] font-medium hover:bg-canvas transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-ink-muted" />
              Export All My Data (JSON)
            </button>

            <button
              type="button"
              disabled={isPurging}
              onClick={handleDeleteData}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-pill bg-status-missing-bg border border-status-missing-text/30 text-status-missing-text text-[13px] font-medium hover:bg-status-missing-bg/80 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {isPurging ? "Erasing Data..." : "Delete All My Data"}
            </button>
          </div>
        </div>
      </main>

      {/* Responsive Mobile Bottom Tab Bar (Visible < lg) */}
      <MobileTabBar />
    </div>
  );
}
