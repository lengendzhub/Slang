"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";

export type EvidenceStatus = "supported" | "needs_confirmation" | "missing" | "unsupported";

interface EvidenceChipProps {
  status: EvidenceStatus;
  evidenceId?: string;
  label?: string;
  showId?: boolean;
  className?: string;
}

export function EvidenceChip({
  status,
  evidenceId,
  label,
  showId = true,
  className = "",
}: EvidenceChipProps) {
  const normStatus = status === "unsupported" ? "missing" : status;

  const config = {
    supported: {
      label: label || "Supported",
      color: "text-[#34c759] dark:text-[#30d158]",
      bg: "bg-[#34c759]/10 border-[#34c759]/20",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759] dark:text-[#30d158]" />,
    },
    needs_confirmation: {
      label: label || "Needs Confirmation",
      color: "text-[#ff9f0a] dark:text-[#ff9f0a]",
      bg: "bg-[#ff9f0a]/10 border-[#ff9f0a]/20",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#ff9f0a]" />,
    },
    missing: {
      label: label || "Missing / Gap",
      color: "text-[#ff3b30] dark:text-[#ff453a]",
      bg: "bg-[#ff3b30]/10 border-[#ff3b30]/20",
      icon: <XCircle className="w-3.5 h-3.5 text-[#ff3b30] dark:text-[#ff453a]" />,
    },
  }[normStatus];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors ${config.bg} ${config.color} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showId && evidenceId && (
        <span className="opacity-60 text-[11px] font-mono border-l pl-1.5 border-current/20">
          {evidenceId}
        </span>
      )}
    </span>
  );
}
