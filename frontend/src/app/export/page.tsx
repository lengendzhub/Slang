"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import {
  Download,
  FileCode,
  FileCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function ExportPage() {
  const [copied, setCopied] = useState(false);

  const checklist = [
    { label: "Tectonic Sandboxed Compilation", status: "Passed (Exit Code 0, Shell Escape OFF)", verified: true },
    { label: "Documented Sections Identified", status: "4/4 (Experience, Projects, Education, Skills)", verified: true },
    { label: "PyMuPDF Linear Reading Stream", status: "Single-column ATS flow verified", verified: true },
    { label: "Contact Info & Hyperlinks Intact", status: "alex.morgan@email.com / 415-555-0198", verified: true },
    { label: "Page Count Budget Protection", status: "Exactly 1 page (0 overflow)", verified: true },
  ];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "tex" | "pdf") => {
    const dummyBlob = new Blob(
      [format === "tex" ? "% TailorAI Tailored Resume\n\\documentclass{article}\n..." : "Mock PDF content"],
      { type: format === "tex" ? "text/plain" : "application/pdf" }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alex_Morgan_Tailored_Resume.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
      <FrostedNav />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-10">
        {/* Top Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--blue)]">
              Phase 1 Deliverables
            </span>
            <span className="text-[11px] text-[var(--ink-2)]">•</span>
            <span className="text-[12px] text-[var(--ink-2)]">
              Sandbox Compiled & ATS Verified
            </span>
          </div>
          <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[var(--ink)] mb-2">
            Export Tailored Deliverables
          </h1>
          <p className="text-[14px] text-[var(--ink-2)]">
            Your tailored LaTeX and vector PDF have passed locked-down compilation and ATS reading-order audits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: ATS Checklist & Change Audit */}
          <div className="lg:col-span-5 space-y-6">
            {/* ATS Inspection Checklist */}
            <div className="apple-card p-6 border-l-4 border-l-[#34c759]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-[var(--ink)]">
                  PyMuPDF ATS Inspection Audit
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759]">
                  100% Passed
                </span>
              </div>

              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[13px]">
                    <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-[var(--ink)]">{item.label}</div>
                      <div className="text-[11px] font-mono text-[var(--ink-2)]">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line-light)] text-[11px] text-[var(--ink-2)] flex items-center justify-between">
                <span>Evaluator: PyMuPDF 1.24 (fitz)</span>
                <span className="font-semibold text-[#34c759]">ATS Grade: 98/100</span>
              </div>
            </div>

            {/* Change Audit Report */}
            <div className="apple-card p-6">
              <h3 className="text-[14px] font-semibold text-[var(--ink)] mb-3">
                Tailoring Change Audit
              </h3>

              <div className="space-y-2 text-[13px] mb-6">
                <div className="flex justify-between py-1 border-b border-[var(--line-light)]">
                  <span className="text-[var(--ink-2)]">Master Resume:</span>
                  <span className="font-mono text-[var(--ink)]">master_resume.tex</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line-light)]">
                  <span className="text-[var(--ink-2)]">Target Job:</span>
                  <span className="font-mono text-[var(--ink)]">Staff Systems Engineer</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line-light)]">
                  <span className="text-[var(--ink-2)]">Accepted Tailored Bullets:</span>
                  <span className="font-semibold text-[#34c759]">3 / 3</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--line-light)]">
                  <span className="text-[var(--ink-2)]">Evidence Bank Proof Anchors:</span>
                  <span className="font-mono text-[var(--blue)]">ev_sec_exp_0, 1, 2</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[var(--ink-2)]">Missing Requirements Isolated:</span>
                  <span className="font-mono text-[#ff3b30]">1 (Kafka streaming)</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => handleDownload("pdf")}
                  className="pill-btn pill-btn-primary w-full py-2.5 text-[14px] shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Deliverable PDF
                </button>

                <button
                  onClick={() => handleDownload("tex")}
                  className="pill-btn w-full py-2.5 text-[14px] bg-[var(--bg)] border border-[var(--line-light)] text-[var(--ink)] hover:bg-[var(--bg-alt)] flex items-center justify-center gap-2"
                >
                  <FileCode className="w-4 h-4 text-[var(--blue)]" />
                  Download Tailored .tex
                </button>

                <button
                  onClick={handleCopy}
                  className="pill-btn w-full py-2 text-[12px] bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)] flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#34c759]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied LaTeX to clipboard" : "Copy LaTeX Source"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: PDF Preview Mockup */}
          <div className="lg:col-span-7 apple-card p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line-light)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--blue)]" />
                <span className="font-mono text-[13px] font-medium text-[var(--ink)]">
                  Alex_Morgan_Tailored_Resume.pdf
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-alt)] text-[var(--ink-2)]">
                Page 1 of 1 • 612 × 792 pt
              </span>
            </div>

            {/* Simulated Clean Rendered Resume Document */}
            <div className="p-8 bg-white text-black rounded-xl border border-gray-200 shadow-sm font-serif min-h-[580px] text-[12px] leading-relaxed">
              {/* Heading */}
              <div className="text-center pb-4 border-b border-gray-300 mb-4">
                <h2 className="text-[20px] font-bold tracking-tight uppercase">Alex Morgan</h2>
                <div className="text-[11px] text-gray-600 mt-1">
                  415-555-0198 • alex.morgan@email.com • linkedin.com/in/alexmorgan • github.com/alexmorgan
                </div>
              </div>

              {/* Experience */}
              <div className="mb-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-800 pb-0.5 mb-2">
                  Experience
                </h3>
                <div className="flex justify-between font-bold text-[11px]">
                  <span>Senior Software Engineer — Nexus Cloud Systems</span>
                  <span>June 2022 – Present</span>
                </div>
                <div className="italic text-[10px] text-gray-600 mb-1">San Francisco, CA</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li className="text-blue-900 font-medium">
                    Architected multi-region Redis caching layer handling 10M+ daily events, cutting p99 API query latency by 42%.
                  </li>
                  <li className="text-blue-900 font-medium">
                    Spearheaded core microservice refactoring to Go and PostgreSQL, increasing distributed transaction throughput by 3.5x.
                  </li>
                  <li className="text-blue-900 font-medium">
                    Led and mentored 4 software engineers on distributed consensus patterns and system architecture reviews.
                  </li>
                </ul>
              </div>

              {/* Projects */}
              <div className="mb-4">
                <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-800 pb-0.5 mb-2">
                  Projects
                </h3>
                <div className="flex justify-between font-bold text-[11px]">
                  <span>HyperKV Storage Engine (Rust, RocksDB, gRPC, Raft)</span>
                  <span>Jan. 2023 – Present</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Built a high-throughput, distributed key-value store implementing the Raft consensus algorithm in Rust.</li>
                </ul>
              </div>

              {/* Technical Skills */}
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-800 pb-0.5 mb-2">
                  Technical Skills
                </h3>
                <div className="text-[11px] space-y-0.5">
                  <div><strong>Languages:</strong> Python, Go, Rust, TypeScript, JavaScript, SQL, C++</div>
                  <div><strong>Systems:</strong> Redis, PostgreSQL, Docker, Kubernetes, AWS, Linux, Snowflake</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--ink-2)]">
              <span>Ready for submission on Lever, Greenhouse, Workday & Taleo</span>
              <Link href="/siblings" className="text-[var(--link)] hover:underline flex items-center gap-1 font-medium">
                Save to Resume Siblings &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
