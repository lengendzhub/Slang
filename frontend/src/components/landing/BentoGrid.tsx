import React from "react";
import { ShieldCheck, Lock, CheckCheck } from "lucide-react";

export function BentoGrid() {
  return (
    <div className="w-full max-w-[1120px] mx-auto">
      <div className="text-center mb-12">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-2 block">
          Guaranteed Integrity
        </span>
        <h2 className="text-[32px] md:text-[38px] font-semibold tracking-tight text-ink">
          Why TailorAI Is Safe for Your Career
        </h2>
        <p className="text-[16px] text-ink-muted mt-2 max-w-[560px] mx-auto">
          Unlike generic generative AI tools that hallucinate skills or break your templates, every change is strictly bounded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Zero Fabricated Claims */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-status-supported-bg flex items-center justify-center text-status-supported-text">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[18px] font-semibold text-ink">
              1. Zero Fabricated Claims
            </h3>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              Every single generated line is anchored to an Evidence ID from your master resume. Missing job requirements are explicitly reported, never injected into your document.
            </p>
          </div>

          <div className="pt-6 space-y-2 border-t border-hairline/60 mt-6">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="w-2 h-2 rounded-full bg-status-supported-text shrink-0" />
              <span className="font-medium text-ink">Supported:</span>
              <span className="text-ink-muted">Directly proven in master</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="w-2 h-2 rounded-full bg-status-transferable-text shrink-0" />
              <span className="font-medium text-ink">Transferable:</span>
              <span className="text-ink-muted">Prompts user confirmation</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="w-2 h-2 rounded-full bg-status-missing-text shrink-0" />
              <span className="font-medium text-ink">Missing:</span>
              <span className="text-ink-muted">Never written to resume</span>
            </div>
          </div>
        </div>

        {/* Card 2: LaTeX Layout Preserved */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center text-ink">
              <Lock className="w-5 h-5 text-status-supported-text" />
            </div>
            <h3 className="text-[18px] font-semibold text-ink">
              2. LaTeX Layout Preserved
            </h3>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              Your preamble, macros, fonts, margins, and spacing remain byte-for-byte identical. We only edit the inner text of content slots (e.g. \resumeItem) inside an AST sandbox.
            </p>
          </div>

          <div className="pt-6 bg-surface/80 p-3.5 rounded-xl border border-hairline font-mono text-[11px] text-ink-muted space-y-1 mt-6">
            <p className="text-status-supported-text font-semibold">✓ Layout & Preamble: Locked</p>
            <p className="text-status-supported-text font-semibold">✓ Page Budget: 1 Page Max</p>
            <p className="text-status-supported-text font-semibold">✓ Fonts & Margins: Untouched</p>
          </div>
        </div>

        {/* Card 3: You Have the Final Say */}
        <div className="bg-canvas border border-hairline rounded-card shadow-subtle p-7 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-full bg-status-supported-bg flex items-center justify-center text-accent">
              <CheckCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[18px] font-semibold text-ink">
              3. You Have the Final Say
            </h3>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              Nothing is ever exported automatically. Our human review gateway blocks downloads until you have accepted, rejected, or custom-edited each proposed line.
            </p>
          </div>

          <div className="pt-6 border-t border-hairline/60 mt-6 flex items-center justify-between text-[13px] text-ink font-medium">
            <span className="inline-flex items-center gap-1.5 text-status-supported-text">
              ✓ Full Human Control
            </span>
            <span className="text-ink-muted font-normal">
              One-click undo anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
