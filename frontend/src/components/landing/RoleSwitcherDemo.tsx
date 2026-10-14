"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SegmentedControl } from "../ui/SegmentedControl";
import { EvidenceChip } from "../ui/EvidenceChip";
import { Sparkles, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

interface RoleProfile {
  id: string;
  label: string;
  badge?: string;
  roleTitle: string;
  transitionType: string;
  summary: string;
  evidenceAnchor: string;
  evidenceText: string;
  skills: { name: string; category: "Direct" | "Transferable" | "Missing"; status: "supported" | "needs_confirmation" | "missing" }[];
  bulletComparison: {
    original: string;
    reframed: string;
    rationale: string;
  };
}

const roleProfiles: RoleProfile[] = [
  {
    id: "swe",
    label: "Senior Backend (Baseline)",
    roleTitle: "Staff Distributed Systems Engineer",
    transitionType: "Same Career Track",
    summary:
      "Backend systems engineer with 5+ years of experience architecting distributed caching layers, low-latency microservices in Go & Rust, and high-concurrency PostgreSQL data architectures.",
    evidenceAnchor: "master.tex:Experience:Nexus",
    evidenceText: "Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.",
    skills: [
      { name: "Distributed Caching (Redis)", category: "Direct", status: "supported" },
      { name: "Go & Microservices", category: "Direct", status: "supported" },
      { name: "PostgreSQL Architecture", category: "Direct", status: "supported" },
      { name: "Raft Consensus (Rust)", category: "Direct", status: "supported" },
      { name: "Docker & Kubernetes", category: "Direct", status: "supported" },
      { name: "CI/CD & Observability", category: "Direct", status: "supported" },
      { name: "Kafka Event Streaming", category: "Missing", status: "missing" },
    ],
    bulletComparison: {
      original: "Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.",
      reframed: "Architected multi-region Redis caching cluster handling 10M+ daily events, driving p99 API latency down 42% with strict fault tolerance.",
      rationale: "Emphasized scale and fault tolerance required by staff infrastructure specifications.",
    },
  },
  {
    id: "pm",
    label: "Technical Product Manager",
    badge: "Career Transition",
    roleTitle: "Technical Product Manager (Developer Platforms)",
    transitionType: "IT to Product Transition",
    summary:
      "Technically grounded Product Manager combining hands-on engineering background with user discovery, turning complex distributed storage & API architectures into developer-loved products.",
    evidenceAnchor: "master.tex:Projects:QueryLens",
    evidenceText: "Constructed an AST-based query analyzer suggesting index additions... Adopted by 1,200+ GitHub developers with 4.9-star rating.",
    skills: [
      { name: "Developer Discovery & Telemetry", category: "Transferable", status: "needs_confirmation" },
      { name: "API & PRD Specification", category: "Transferable", status: "needs_confirmation" },
      { name: "Cross-Functional Mentorship", category: "Direct", status: "supported" },
      { name: "Technical Feasibility Analysis", category: "Direct", status: "supported" },
      { name: "Product Roadmap Alignment", category: "Transferable", status: "needs_confirmation" },
      { name: "Enterprise Customer P&L", category: "Missing", status: "missing" },
    ],
    bulletComparison: {
      original: "Constructed an AST-based query analyzer suggesting index additions and eliminating N+1 execution bottlenecks. Adopted by 1,200+ GitHub developers.",
      reframed: "Spearheaded product lifecycle for QueryLens developer tool from user research to release, driving adoption across 1,200+ active engineers with 4.9-star satisfaction.",
      rationale: "Reframed open-source engineering project into product ownership and customer adoption metrics without fabricating experience.",
    },
  },
  {
    id: "ba",
    label: "Business / Data Analyst",
    badge: "Adjacent Track",
    roleTitle: "Senior Business & Data Analyst",
    transitionType: "Engineering to Analytics",
    summary:
      "Analytical problem-solver applying SQL optimization, telemetry pipelines, and quantitative incident reduction to solve core operational and financial business bottlenecks.",
    evidenceAnchor: "master.tex:Experience:DataVibe",
    evidenceText: "Collaborated with data science teams to optimize SQL queries, decreasing ETL pipeline execution cost by 20%.",
    skills: [
      { name: "Advanced SQL Optimization", category: "Direct", status: "supported" },
      { name: "ETL Pipeline Telemetry", category: "Direct", status: "supported" },
      { name: "Cost Reduction Analysis", category: "Direct", status: "supported" },
      { name: "Executive KPI Dashboards", category: "Transferable", status: "needs_confirmation" },
      { name: "Business Stakeholder Reporting", category: "Transferable", status: "needs_confirmation" },
      { name: "Tableau Enterprise Admin", category: "Missing", status: "missing" },
    ],
    bulletComparison: {
      original: "Collaborated with data science teams to optimize SQL queries, decreasing ETL pipeline execution cost by 20%.",
      reframed: "Audited multi-department data queries and automated ETL runtime bottlenecks, delivering a 20% recurring cloud infrastructure cost reduction.",
      rationale: "Framed technical SQL optimization around business bottom-line cost reduction.",
    },
  },
  {
    id: "mktg",
    label: "Product Marketing Engineer",
    badge: "Career Transition",
    roleTitle: "Technical Marketing & Developer Advocacy Lead",
    transitionType: "Engineering to Tech Marketing",
    summary:
      "Developer-focused product marketer with deep technical literacy, crafting technical storytelling, tutorials, and community traction for high-performance developer tools.",
    evidenceAnchor: "master.tex:Projects:QueryLens",
    evidenceText: "Adopted by 1,200+ GitHub developers with a 4.9-star rating across developer communities.",
    skills: [
      { name: "Developer Community Engagement", category: "Direct", status: "supported" },
      { name: "Technical Narrative Design", category: "Transferable", status: "needs_confirmation" },
      { name: "Open Source Growth Metrics", category: "Direct", status: "supported" },
      { name: "Developer Educational Content", category: "Transferable", status: "needs_confirmation" },
      { name: "Paid Demand Generation Ad Spend", category: "Missing", status: "missing" },
    ],
    bulletComparison: {
      original: "Adopted by 1,200+ GitHub developers with a 4.9-star rating across developer communities.",
      reframed: "Built developer grassroots marketing campaign for QueryLens open-source engine, organically acquiring 1,200+ developer champions across Reddit, HN, and GitHub.",
      rationale: "Highlights authentic developer community traction rather than corporate marketing spend.",
    },
  },
];

export function RoleSwitcherDemo() {
  const [selectedRole, setSelectedRole] = useState("pm");
  const profile = roleProfiles.find((r) => r.id === selectedRole) || roleProfiles[0];

  return (
    <section id="career-transitions" className="py-24 md:py-32 bg-[var(--bg-alt)] border-t border-[var(--line-light)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[760px] mx-auto mb-14">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Cross-Industry Re-framing Engine
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            Pivot careers with proof. Never with pretension.
          </h2>
          <p className="section-sub">
            Watch how a single engineering master resume pivots across Product Management, Analytics, and Developer Marketing. We reframe real achievements without inventing titles.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex justify-center mb-12">
          <SegmentedControl
            options={roleProfiles.map((r) => ({
              id: r.id,
              label: r.label,
              badge: r.badge,
            }))}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>

        {/* Dynamic Display Card */}
        <div className="max-w-[1100px] mx-auto apple-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-[var(--line-light)] gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-medium text-[var(--blue)] uppercase tracking-wide">
                  {profile.transitionType}
                </span>
                <span className="text-[11px] text-[var(--ink-2)]">•</span>
                <span className="text-[12px] text-[var(--ink-2)]">Evidence-Anchored</span>
              </div>
              <h3 className="text-[24px] font-semibold text-[var(--ink)]">
                Target Role: {profile.roleTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--ink-2)]">Status:</span>
              <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20">
                100% Fact Verified
              </span>
            </div>
          </div>

          {/* Reframed Summary */}
          <div className="mb-8">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-2">
              Generated Professional Summary
            </span>
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)]">
              <p className="text-[15px] text-[var(--ink)] leading-relaxed italic">
                "{profile.summary}"
              </p>
            </div>
          </div>

          {/* Layout-Animated Skills Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)]">
                Skills Realignment (Chips glide to dynamic priority)
              </span>
              <span className="text-[11px] text-[var(--ink-2)]">
                Direct / Transferable / Missing
              </span>
            </div>

            <motion.div layout className="flex flex-wrap gap-2.5">
              {profile.skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                >
                  <EvidenceChip
                    status={skill.status}
                    label={`${skill.name} (${skill.category})`}
                    showId={false}
                    className="text-[13px] py-1.5 px-3"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Line-by-Line Re-framing Comparison */}
          <div className="pt-6 border-t border-[var(--line-light)]">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--ink-2)] block mb-3">
              Real Work Re-framing Breakdown
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line-light)]">
                <span className="text-[11px] font-medium text-[var(--ink-2)] uppercase block mb-1">
                  Master Resume Source ({profile.evidenceAnchor})
                </span>
                <p className="text-[13px] text-[var(--ink-2)] font-mono leading-relaxed">
                  {profile.bulletComparison.original}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <span className="text-[11px] font-medium text-[var(--blue)] uppercase block mb-1">
                  Tailored Bullet for {profile.roleTitle}
                </span>
                <p className="text-[13px] text-[var(--ink)] font-mono leading-relaxed font-medium">
                  {profile.bulletComparison.reframed}
                </p>
                <div className="mt-2.5 text-[11px] text-[var(--ink-2)] border-t border-[var(--line-light)] pt-2">
                  <strong>Why this is truthful:</strong> {profile.bulletComparison.rationale}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
