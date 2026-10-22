"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { setAuthSession } from "@/lib/authStore";
import { saveUserSession } from "@/lib/store";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofocus the first field on load
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Safe redirect path validation (prevents open redirects)
  const getSafeRedirectUrl = (): string => {
    const rawRedirect = searchParams.get("redirect");
    if (!rawRedirect) return "/workspace";
    const trimmed = rawRedirect.trim();
    if (
      trimmed.startsWith("/") &&
      !trimmed.startsWith("//") &&
      !trimmed.includes("://") &&
      !trimmed.includes("\\")
    ) {
      return trimmed;
    }
    return "/workspace";
  };

  const validateInputs = (): string | null => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }
    if (!password) {
      return "Please enter your password.";
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientValidationError = validateInputs();
    if (clientValidationError) {
      setError(clientValidationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Generic friendly message for invalid credentials, no user enumeration
        setError(data.error || "Invalid email or password.");
        return;
      }

      // Save user session client-side
      if (data.user) {
        setAuthSession(data.token || "session_cookie", data.user);
        saveUserSession({
          candidateName: data.user.name,
          candidateEmail: data.user.email,
        });
      }

      const destination = getSafeRedirectUrl();
      router.push(destination);
      router.refresh();
    } catch {
      setError("Unable to connect to authentication server. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-[400px] bg-surface border border-hairline rounded-2xl p-7 sm:p-9 shadow-subtle space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="text-[12px] font-semibold tracking-wide text-accent uppercase">
              Slang Account
            </span>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">
              Sign In
            </h1>
            <p className="text-[13px] text-ink-muted">
              Access your master resume, Evidence Bank & tailored siblings.
            </p>
          </div>

          {/* Accessible Error Region */}
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div
                role="alert"
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5 transition-all"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="signin-email"
                className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5"
              >
                Email Address
              </label>
              <input
                ref={emailInputRef}
                id="signin-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all placeholder:text-ink-muted/50"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="signin-password"
                  className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block"
                >
                  Password
                </label>
                {/* TODO: connect to password reset service when available */}
                <button
                  type="button"
                  onClick={() => alert("Password reset service is not configured for this instance. Please contact your administrator.")}
                  className="text-[11px] text-accent hover:underline font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all placeholder:text-ink-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 rounded-md transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] mt-2 rounded-full bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center justify-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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

          {/* Footer link to sign up */}
          <div className="pt-2 text-center text-[13px] text-ink-muted border-t border-hairline">
            Don't have an account yet?{" "}
            <Link
              href={`/signup${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
              className="text-accent font-medium hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
