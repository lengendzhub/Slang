"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { setAuthSession } from "@/lib/authStore";
import { saveUserSession } from "@/lib/store";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

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
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName) {
      return "Please enter your full name.";
    }
    if (!cleanEmail) {
      return "Please enter your email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    return null;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientValidationError = validateInputs();
    if (clientValidationError) {
      setError(clientValidationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Unable to create account. Please try again.");
        return;
      }

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
              Start Tailoring Truthfully
            </span>
            <h1 className="text-[26px] font-semibold tracking-tight text-ink">
              Create Account
            </h1>
            <p className="text-[13px] text-ink-muted">
              One master resume. Zero fabricated claims.
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
          <form onSubmit={handleSignUp} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5"
              >
                Full Name
              </label>
              <input
                ref={nameInputRef}
                id="signup-name"
                type="text"
                name="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="First and last name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-canvas text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent transition-all placeholder:text-ink-muted/50"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="signup-email"
                className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5"
              >
                Email Address
              </label>
              <input
                id="signup-email"
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
                  htmlFor="signup-password"
                  className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block"
                >
                  Password
                </label>
                <span className="text-[11px] text-ink-muted">Min. 6 characters</span>
              </div>

              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  autoComplete="new-password"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to sign in */}
          <div className="pt-2 text-center text-[13px] text-ink-muted border-t border-hairline">
            Already have an account?{" "}
            <Link
              href={`/signin${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
              className="text-accent font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
