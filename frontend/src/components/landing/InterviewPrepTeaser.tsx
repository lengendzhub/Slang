"use client";

import React, { useState } from "react";
import { MessageSquare, HelpCircle, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

export function InterviewPrepTeaser() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const prepItems = [
    {
      claim: "Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 API query latency by 42%.",
      evidenceId: "ev_exp_nexus_0",
      question: "Can you walk me through the caching invalidation strategy you designed, and how you measured the 42% p99 latency drop under 10M events?",
      whyAsked: "Interviewers want to test whether you personally architected the invalidation semantics or merely wrapped an off-the-shelf client.",
      talkingPoints: [
        "Explain cache-aside vs. write-through tradeoffs you evaluated.",
        "Mention specific Redis Cluster sharding, key TTL jittering to avoid stampedes.",
        "Quote the exact Prometheus/Grafana p99 latency benchmarks before and after deployment.",
      ],
    },
    {
      claim: "Spearheaded product lifecycle for QueryLens developer tool from user research to release, driving adoption across 1,200+ active engineers.",
      evidenceId: "ev_proj_querylens_1",
      question: "How did you validate problem-solution fit with the first 50 engineers, and how did you prioritize conflicting feature requests?",
      whyAsked: "Validates technical product management discovery, customer feedback loops, and prioritization frameworks (RICE/MoSCoW).",
      talkingPoints: [
        "Discuss direct feedback sessions with PostgreSQL developers struggling with N+1 ORM queries.",
        "Highlight how you set telemetry guardrails to measure weekly active query optimizations.",
        "Explain deciding NOT to support MongoDB initially to stay focused on SQL AST precision.",
      ],
    },
  ];

  const current = prepItems[selectedIdx];

  return (
    <section className="py-24 md:py-32 bg-[var(--bg-alt)] border-t border-[var(--line-light)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[760px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Closing the Loop
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            If you claim it on your resume, you must defend it in the interview.
          </h2>
          <p className="section-sub">
            Generic AI resumes get candidates shortlisted, then humiliated in interviews. Slang generates high-conviction interview questions and empirical talking points directly from your verified evidence bank.
          </p>
        </div>

        <div className="max-w-[1050px] mx-auto apple-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between pb-4 mb-6 border-b border-[var(--line-light)] gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[var(--blue)]/10 text-[var(--blue)] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span className="font-semibold text-[15px] text-[var(--ink)]">
                AI Interview Defense Engine (Claim-Anchored)
              </span>
            </div>
            <div className="flex gap-2">
              {prepItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`pill-btn px-3 py-1 text-[12px] border ${
                    selectedIdx === i
                      ? "bg-[var(--blue)] text-white border-[var(--blue)]"
                      : "bg-[var(--bg)] text-[var(--ink-2)] border-[var(--line-light)]"
                  }`}
                >
                  Claim {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Claim Box */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)] mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                Selected Resume Bullet
              </span>
              <span className="text-[11px] font-mono text-[var(--blue)]">
                evidence_id: {current.evidenceId}
              </span>
            </div>
            <p className="text-[14px] text-[var(--ink)] font-mono leading-relaxed">
              "{current.claim}"
            </p>
          </div>

          {/* Generated Question and Defense */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 p-5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2 text-[var(--blue)]">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span className="text-[12px] font-semibold uppercase tracking-wider">
                  Target Interview Question
                </span>
              </div>
              <p className="text-[15px] font-medium text-[var(--ink)] mb-3 leading-snug">
                "{current.question}"
              </p>
              <div className="text-[12px] text-[var(--ink-2)] pt-2 border-t border-[var(--line-light)]">
                <strong>Why the hiring manager asks this:</strong> {current.whyAsked}
              </div>
            </div>

            <div className="md:col-span-6 p-5 rounded-xl bg-[var(--bg)] border border-[var(--line-light)]">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-3">
                Evidence-Anchored Talking Points
              </span>
              <ul className="space-y-2.5">
                {current.talkingPoints.map((tp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[13px] text-[var(--ink)] leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
