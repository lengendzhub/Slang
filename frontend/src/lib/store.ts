"use client";

import { DEFAULT_MASTER_LATEX, DEFAULT_JOB_DESCRIPTION } from "./sample-data";

export interface DiffItemState {
  id: string;
  section: string;
  originalText: string;
  rewrittenText: string;
  reason: string;
  evidenceId: string;
  claimType: string;
  status: "supported" | "needs_confirmation" | "missing";
  decision: "pending" | "accepted" | "rejected" | "edited";
  editedText?: string;
  originalLength: number;
  newLength: number;
  fitsBudget: boolean;
}

export interface RequirementItemState {
  id: string;
  text: string;
  category: "Essential" | "Required" | "Preferred" | "Responsibilities";
  classification: "Direct" | "Transferable" | "Missing";
  matchedEvidenceId?: string;
  matchedText?: string;
  learningTip?: string;
}

export interface AppState {
  masterLatex: string;
  targetJd: string;
  careerMode: "Same career" | "Adjacent career" | "Career transition" | "Fresher or internship";
  diffs: DiffItemState[];
  requirements: RequirementItemState[];
  fitScore: number;
  isProcessing: boolean;
  progressPercent: number;
  currentStage: string;
}

export const initialDiffs: DiffItemState[] = [
  {
    id: "diff_1",
    section: "Experience // Nexus Cloud Systems",
    originalText: "Architected distributed caching layer with Redis, reducing p99 API query latency by 42% across 10M daily requests.",
    rewrittenText: "Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 API query latency by 42%.",
    reason: "Emphasized multi-region scale and p99 query latency constraints specified in JD.",
    evidenceId: "ev_sec_exp_0",
    claimType: "bullet",
    status: "supported",
    decision: "accepted",
    originalLength: 114,
    newLength: 110,
    fitsBudget: true,
  },
  {
    id: "diff_2",
    section: "Experience // Nexus Cloud Systems",
    originalText: "Spearheaded migration of core billing microservices to Go and PostgreSQL, improving transaction throughput by 3.5x.",
    rewrittenText: "Spearheaded core microservice refactoring to Go and PostgreSQL, increasing distributed transaction throughput by 3.5x.",
    reason: "Highlighted high-throughput PostgreSQL and Go microservices engineering.",
    evidenceId: "ev_sec_exp_1",
    claimType: "bullet",
    status: "supported",
    decision: "accepted",
    originalLength: 115,
    newLength: 117,
    fitsBudget: true,
  },
  {
    id: "diff_3",
    section: "Experience // Nexus Cloud Systems",
    originalText: "Mentored 4 junior engineers on distributed consensus, design patterns, and automated testing practices.",
    rewrittenText: "Led and mentored 4 software engineers on distributed consensus patterns and system architecture reviews.",
    reason: "Directly satisfies the senior engineering mentorship and architectural review requirement.",
    evidenceId: "ev_sec_exp_2",
    claimType: "bullet",
    status: "needs_confirmation",
    decision: "pending",
    originalLength: 104,
    newLength: 105,
    fitsBudget: true,
  },
];

export const initialRequirements: RequirementItemState[] = [
  {
    id: "req_1",
    text: "Deep expertise in distributed caching (Redis, Memcached) and relational databases (PostgreSQL)",
    category: "Essential",
    classification: "Direct",
    matchedEvidenceId: "ev_sec_exp_0",
    matchedText: "Architected distributed caching layer with Redis...",
  },
  {
    id: "req_2",
    text: "Demonstrated experience writing concurrent, memory-safe backend services in Go, Rust, or Python",
    category: "Essential",
    classification: "Direct",
    matchedEvidenceId: "ev_sec_exp_1",
    matchedText: "Migration of core billing microservices to Go and PostgreSQL...",
  },
  {
    id: "req_3",
    text: "Proven track record mentoring engineers and conducting architectural design reviews",
    category: "Essential",
    classification: "Transferable",
    matchedEvidenceId: "ev_sec_exp_2",
    matchedText: "Mentored 4 junior engineers on distributed consensus...",
    learningTip: "Highlight architectural consensus sessions in addition to 1-on-1 code reviews.",
  },
  {
    id: "req_4",
    text: "Solid understanding of distributed consensus protocols (Raft, Paxos)",
    category: "Required",
    classification: "Direct",
    matchedEvidenceId: "ev_sec_proj_0",
    matchedText: "Built distributed key-value store implementing Raft consensus in Rust...",
  },
  {
    id: "req_5",
    text: "5+ years experience with Kafka or event-driven streaming architectures",
    category: "Preferred",
    classification: "Missing",
    learningTip: "Candidate has Redis & Snowflake telemetry; suggest completing a fast Kafka Streams crash course to discuss in interview.",
  },
];
