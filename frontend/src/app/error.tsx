"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error internally without exposing to user UI
    console.error("Uncaught application error:", error?.message);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-[480px] mx-auto space-y-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent block">
              Application Error
            </span>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-ink">
              Something went wrong.
            </h1>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              An unexpected issue occurred while rendering this page. Your data in session storage has been preserved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="min-h-[44px] px-6 py-2.5 rounded-pill bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <Link
              href="/workspace"
              className="min-h-[44px] px-6 py-2.5 rounded-pill bg-surface border border-hairline text-ink text-[14px] font-medium hover:bg-canvas transition-colors inline-flex items-center gap-2 active:scale-[0.98]"
            >
              <Home className="w-4 h-4 text-ink-muted" />
              <span>Return to Workspace</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
