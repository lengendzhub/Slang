"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { setAuthSession } from "@/lib/authStore";
import { saveUserSession } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to sign in. Please check your credentials.");
      }

      // Save auth token & user
      setAuthSession(data.token, data.user);
      saveUserSession({
        candidateName: data.user.name,
        candidateEmail: data.user.email,
      });

      router.push("/workspace");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    setEmail("candidate@example.com");
    setPassword("password123");

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "candidate@example.com",
          password: "password123",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuthSession(data.token, data.user);
        saveUserSession({
          candidateName: data.user.name,
          candidateEmail: data.user.email,
        });
        router.push("/workspace");
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "google.candidate@example.com",
          name: "Elena Rostova",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Google sign in failed.");
      }

      setAuthSession(data.token, data.user);
      saveUserSession({
        candidateName: data.user.name,
        candidateEmail: data.user.email,
      });

      router.push("/workspace");
    } catch (err: any) {
      setError(err.message || "Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-[420px] bg-surface border border-hairline rounded-card p-6 sm:p-8 shadow-paper space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent block">
              TailorAI Account
            </span>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">
              Sign In
            </h1>
            <p className="text-[13px] text-ink-muted">
              Access your master resumes, evidence bank & tailored drafts.
            </p>
          </div>

          {/* Quick Demo Account Sign-in Banner */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full p-3 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-all text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-ink group-hover:text-accent transition-colors">
                  Quick 1-Click Demo Login
                </p>
                <p className="text-[11px] text-ink-muted">
                  Elena Rostova • candidate@example.com
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-[12px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-ink-muted"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Password
                </label>
                <span className="text-[11px] text-accent font-medium">
                  Default: password123
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-ink-muted"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] rounded-pill bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center justify-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-surface px-2.5 text-ink-muted">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full min-h-[44px] rounded-pill bg-canvas border border-hairline text-ink hover:bg-surface text-[14px] font-medium inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer link to sign up */}
          <div className="pt-2 text-center text-[12px] text-ink-muted">
            Don't have an account yet?{" "}
            <Link href="/signup" className="text-accent font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
