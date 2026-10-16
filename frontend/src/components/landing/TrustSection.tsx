"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileSpreadsheet, Lock } from "lucide-react";

export function TrustSection() {
  const pillars = [
    {
      status: "supported" as const,
      color: "#34c759",
      title: "Supported",
      tagline: "Direct Evidence Found",
      badge: "Verified Anchor",
      icon: CheckCircle2,
      description:
        "Requirements that directly match verified lines in your Master Resume or GitHub/project repositories. These are tailored to match job description keywords while maintaining exact empirical truth.",
      rules: [
        "Carries an immutable evidence_id (e.g. #ev_exp_01)",
        "Retains exact metrics, dates, and technology constraints",
        "Subject to strict length-budget to avoid page overflow",
      ],
      example: "Master has: 'Built Redis cache with 42% latency drop' → Tailored for Staff Infra: 'Architected Redis caching tier reducing p99 API latency by 42%'.",
    },
    {
      status: "needs_confirmation" as const,
      color: "#ff9f0a",
      title: "Needs Confirmation",
      tagline: "Transferable Skill Framing",
      badge: "User Approval Required",
      icon: AlertTriangle,
      description:
        "Skills or capabilities reframed from adjacent work (e.g., framing engineering mentorship as people management or developer tooling as product discovery). Never exported without your sign-off.",
      rules: [
        "Requires explicit user Accept or Edit click",
        "Flags cross-industry boundary limits",
        "Includes interview talking-point rationale",
      ],
      example: "Master has: 'Mentored 4 junior engineers' → Tailored for Engineering Lead: 'Led and mentored 4 software engineers on distributed consensus'.",
    },
    {
      status: "missing" as const,
      color: "#ff3b30",
      title: "Missing / Gap",
      tagline: "Reported, Never Injected",
      badge: "Zero-Hallucination Law",
      icon: XCircle,
      description:
        "Essential or preferred job requirements for which you have zero verified background. Standard AI engines invent experience here; Slang explicitly isolates them in your Gap Report.",
      rules: [
        "Never written into your LaTeX document",
        "Included in the pre-interview skill gap checklist",
        "Includes rapid 2-week learning pathways",
      ],
      example: "Job asks for: '5+ years Kafka event streaming'. You have: None → Outcome: Flagged in Gap Report as Missing; omitted from resume.",
    },
  ];

  return (
    <section id="trust-matrix" className="py-24 md:py-32 bg-[var(--bg)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[760px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            The Tri-State Truth Matrix
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            How we eliminate fabricated claims forever.
          </h2>
          <p className="section-sub">
            Every candidate fear in AI tailoring comes from silent hallucinations. Here is how our architecture treats every requirement with mathematical accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="apple-card p-7 flex flex-col justify-between border-t-4"
                style={{ borderTopColor: pillar.color }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color: pillar.color }} />
                      <span className="font-semibold text-[18px] text-[var(--ink)]">
                        {pillar.title}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        color: pillar.color,
                        borderColor: `${pillar.color}33`,
                        backgroundColor: `${pillar.color}14`,
                      }}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <p className="text-[14px] font-medium text-[var(--ink)] mb-2">
                    {pillar.tagline}
                  </p>
                  <p className="text-[13px] text-[var(--ink-2)] mb-6 leading-relaxed">
                    {pillar.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block">
                      Enforced System Invariants
                    </span>
                    {pillar.rules.map((rule, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2 text-[12px] text-[var(--ink)]">
                        <span className="text-[var(--blue)] font-bold">•</span>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--line-light)]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-1">
                    Live Engine Example
                  </span>
                  <div className="p-2.5 rounded-lg bg-[var(--bg-alt)] border border-[var(--line-light)] text-[12px] text-[var(--ink)] font-mono leading-relaxed">
                    {pillar.example}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rubric Disclaimer Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line-light)] max-w-[980px] mx-auto flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[var(--blue)] shrink-0 mt-0.5" />
          <div className="text-[13px] text-[var(--ink-2)] leading-relaxed">
            <strong className="text-[var(--ink)] font-semibold block mb-0.5">
              Documented Fit Rubric vs. ATS Myth
            </strong>
            Slang will never promise an "ATS Pass Rate" or "Shortlist Probability". Employers configure ATS filters differently, and keyword stuffing does not guarantee human interviews. Instead, our fit score reflects pure requirement and evidence coverage according to a transparent mathematical rubric.
          </div>
        </div>
      </div>
    </section>
  );
}
