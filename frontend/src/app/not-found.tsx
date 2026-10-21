import type { Metadata } from "next";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight, Compass, FileText, GitBranch, Home, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found • Slang",
  description: "The page you are looking for could not be found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-[560px] mx-auto space-y-8">
          {/* 404 Accent Badge */}
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-hairline/60 border border-hairline text-[12px] font-mono font-medium text-ink-muted">
              <span>HTTP Error 404</span>
            </span>

            {/* Large Typography Accent */}
            <div className="text-[72px] sm:text-[96px] font-bold tracking-tight text-ink/15 font-mono select-none leading-none">
              404
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-tight text-ink leading-tight">
              We couldn’t find that page.
            </h1>

            <p className="text-[15px] sm:text-[16px] text-ink-muted leading-relaxed max-w-[460px] mx-auto">
              The page you are looking for doesn’t exist, has been removed, or is temporarily unavailable.
            </p>
          </div>

          {/* Primary & Secondary Action Pill Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/workspace"
              className="min-h-[44px] px-6 py-2.5 rounded-pill bg-accent text-white text-[14px] font-medium hover:bg-accent-hover shadow-subtle inline-flex items-center gap-2 transition-all duration-fast ease-apple active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>Go to Workspace</span>
            </Link>

            <Link
              href="/"
              className="min-h-[44px] px-6 py-2.5 rounded-pill bg-surface border border-hairline text-ink text-[14px] font-medium hover:bg-canvas transition-colors inline-flex items-center gap-2 active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-ink-muted" />
              <span>Home Overview</span>
            </Link>
          </div>

          {/* Directory of Real App Destinations */}
          <div className="pt-8 border-t border-hairline space-y-4">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block">
              Or jump directly to a verified section
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <Link
                href="/app/master"
                className="p-3.5 rounded-xl bg-surface border border-hairline hover:border-accent/40 hover:bg-canvas transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-4 h-4 text-accent" />
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h2 className="text-[13px] font-medium text-ink">Master Resume</h2>
                <p className="text-[11px] text-ink-muted">View LaTeX AST structure</p>
              </Link>

              <Link
                href="/evidence"
                className="p-3.5 rounded-xl bg-surface border border-hairline hover:border-accent/40 hover:bg-canvas transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-status-supported-text" />
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h2 className="text-[13px] font-medium text-ink">Evidence Bank</h2>
                <p className="text-[11px] text-ink-muted">Inspect verified claims</p>
              </Link>

              <Link
                href="/siblings"
                className="p-3.5 rounded-xl bg-surface border border-hairline hover:border-accent/40 hover:bg-canvas transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <GitBranch className="w-4 h-4 text-accent" />
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h2 className="text-[13px] font-medium text-ink">Sibling Tree</h2>
                <p className="text-[11px] text-ink-muted">Manage tailored variants</p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
