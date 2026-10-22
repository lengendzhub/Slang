"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Footer } from "@/components/landing/Footer";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught in error.tsx:", error?.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
        <div className="max-w-[460px] mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-status-missing-bg border border-danger/20 text-danger mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="apple-h1 text-ink">
              Something went wrong.
            </h1>
            <p className="apple-body text-ink-secondary text-[15px]">
              An unexpected error occurred while rendering this view. Your session data remains preserved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="pill-btn pill-btn-primary px-6 py-2.5 text-[14px] font-medium gap-2 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/workspace"
              className="pill-btn pill-btn-secondary px-6 py-2.5 text-[14px] font-medium min-h-[44px]"
            >
              <Home className="w-4 h-4 text-ink-secondary mr-1.5" />
              <span>Return to Workspace</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
