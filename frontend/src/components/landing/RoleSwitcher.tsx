"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

interface RoleExample {
  title: string;
  originalBullet: string;
  reframedBullet: string;
  matchType: "direct" | "transferable";
  statusBadge: string;
  statusClass: string;
  reason: string;
  evidenceSource: string;
}

const ROLE_DATA: Record<string, RoleExample> = {
  "Software Engineer": {
    title: "Software Engineer",
    originalBullet: "Maintained Python backend services and PostgreSQL database queries for core API.",
    reframedBullet: "Architected high-throughput Python REST services and optimized PostgreSQL queries, reducing p95 latency by 35%.",
    matchType: "direct",
    statusBadge: "Supported • Direct Match",
    statusClass: "bg-status-supported-bg text-status-supported-text",
    reason: "Directly highlights backend throughput and database optimization metrics required by senior engineering roles.",
    evidenceSource: "Master Resume (Experience, Line 24): 'Maintained Python backend services and PostgreSQL database queries...'",
  },
  "Product Manager": {
    title: "Product Manager",
    originalBullet: "Maintained Python backend services and PostgreSQL database queries for core API.",
    reframedBullet: "Defined technical product specs for core API services, partnering with stakeholders to cut query latency by 35%.",
    matchType: "transferable",
    statusBadge: "Transferable • Needs Confirmation",
    statusClass: "bg-status-transferable-bg text-status-transferable-text",
    reason: "Re-frames technical delivery into cross-functional spec definition and stakeholder outcomes without inventing prior PM titles.",
    evidenceSource: "Master Resume (Experience, Line 24): 'Maintained Python backend services and PostgreSQL database queries...'",
  },
  "Business Analyst": {
    title: "Business Analyst",
    originalBullet: "Maintained Python backend services and PostgreSQL database queries for core API.",
    reframedBullet: "Analyzed operational system bottlenecks using SQL and Python, translating database findings into actionable workflow efficiencies.",
    matchType: "transferable",
    statusBadge: "Transferable • Needs Confirmation",
    statusClass: "bg-status-transferable-bg text-status-transferable-text",
    reason: "Emphasizes structured data extraction and business workflow translation for Career Pivot mode.",
    evidenceSource: "Master Resume (Experience, Line 24): 'Maintained Python backend services and PostgreSQL database queries...'",
  },
};

export function RoleSwitcher() {
  const roles = ["Software Engineer", "Product Manager", "Business Analyst"];
  const [activeRole, setActiveRole] = useState<string>("Software Engineer");
  const current = ROLE_DATA[activeRole];

  return (
    <div className="w-full max-w-[840px] mx-auto">
      {/* 3-Tab Segmented Control */}
      <div className="flex justify-center mb-6 overflow-x-auto max-w-full pb-1">
        <div
          role="tablist"
          aria-label="Role preview tabs"
          className="inline-flex p-1 rounded-pill bg-hairline/40 border border-hairline whitespace-nowrap"
        >
          {roles.map((role) => {
            const isActive = activeRole === role;
            return (
              <button
                key={role}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveRole(role)}
                className={`min-h-[40px] px-3.5 sm:px-6 py-2 rounded-pill text-[12px] sm:text-[13px] font-medium transition-all duration-fast ease-apple ${
                  isActive
                    ? "bg-canvas text-ink shadow-subtle"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Single Resume Card Preview */}
      <div className="bg-canvas border border-hairline rounded-card shadow-paper p-4 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4 text-left">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Target Role Orientation
            </span>
            <h3 className="text-[17px] font-semibold text-ink">
              Same Real Experience → Tailored for {current.title}
            </h3>
          </div>
          <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[12px] font-medium ${current.statusClass}`}>
            {current.matchType === "direct" ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            {current.statusBadge}
          </span>
        </div>

        {/* Diff Area */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-ink-muted block mb-1">
              Original Master Line (Untouched Source Fact)
            </span>
            <p className="text-[14px] text-ink-muted line-through bg-surface/60 p-3 rounded-lg border border-hairline">
              {current.originalBullet}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase text-accent font-medium block mb-1">
              Truthfully Re-framed Draft (Zero Invented Skills)
            </span>
            <p className="text-[15px] font-medium text-ink bg-canvas p-3.5 rounded-lg border border-accent/40 shadow-subtle leading-relaxed">
              {current.reframedBullet}
            </p>
          </div>

          <div className="pt-2 text-[12px] text-ink-muted space-y-1">
            <p>
              <strong className="font-medium text-ink">Reason:</strong> {current.reason}
            </p>
            <p className="font-mono text-[11px] text-ink-muted">
              {current.evidenceSource}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
