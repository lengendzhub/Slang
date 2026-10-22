"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root application error:", error?.message);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans p-6 text-center">
        <div className="max-w-[440px] mx-auto space-y-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-[28px] font-semibold tracking-tight">
              An unexpected error occurred.
            </h1>
            <p className="text-[14px] text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
              We encountered a critical runtime issue. Your session data is safely preserved.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
