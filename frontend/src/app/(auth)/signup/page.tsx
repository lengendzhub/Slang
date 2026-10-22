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
        <div className="w-full max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-[18px] p-8 sm:p-10 shadow-[0_4px_40px_rgba(0,0,0,0.08)] space-y-6 animate-apple-fade">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="text-[12px] font-semibold tracking-wide text-[#0071E3] uppercase">
              Slang Account
            </span>
            <h1 className="text-[28px] font-bold tracking-tight text-ink">
              Create Account
            </h1>
            <p className="text-[14px] text-ink-muted">
              One master resume. Zero fabricated claims.
            </p>
          </div>

          {/* Accessible Error Region */}
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <div
                role="alert"
                className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[10px] text-[#FF3B30] text-[13px] flex items-center gap-2.5 transition-all"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" />
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
                className="text-[13px] font-medium text-ink-muted block mb-1.5"
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
                className="w-full h-[48px] px-[14px] rounded-[10px] border border-[#D2D2D7] dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] text-[17px] text-ink focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all placeholder:text-ink-muted/40"
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="signup-email"
                className="text-[13px] font-medium text-ink-muted block mb-1.5"
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
                className="w-full h-[48px] px-[14px] rounded-[10px] border border-[#D2D2D7] dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] text-[17px] text-ink focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all placeholder:text-ink-muted/40"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="signup-password"
                  className="text-[13px] font-medium text-ink-muted block"
                >
                  Password
                </label>
                <span className="text-[12px] text-ink-muted">Min. 6 characters</span>
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
                  className="w-full h-[48px] pl-[14px] pr-10 rounded-[10px] border border-[#D2D2D7] dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] text-[17px] text-ink focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all placeholder:text-ink-muted/40"
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

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[50px] rounded-full bg-[#0071E3] text-white text-[16px] font-semibold hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-sm"
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

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D2D2D7] dark:border-[#3A3A3C]" />
              </div>
              <span className="relative bg-white dark:bg-[#1C1C1E] px-3 text-[12px] uppercase text-ink-muted font-medium">
                or
              </span>
            </div>

            {/* Continue with Google button */}
            <button
              type="button"
              onClick={() => alert("Google OAuth is available on enterprise deployment.")}
              className="w-full h-[50px] rounded-full bg-white dark:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#3A3A3C] text-ink text-[15px] font-medium hover:bg-neutral-50 dark:hover:bg-[#3A3A3C] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 transition-all cursor-pointer"
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
          </form>

          {/* Footer link to sign in */}
          <div className="pt-2 text-center text-[13px] text-ink-muted border-t border-hairline">
            Already have an account?{" "}
            <Link
              href={`/signin${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect")!)}` : ""}`}
              className="text-[#0071E3] font-medium hover:underline"
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
