"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does TailorAI ensure it never hallucinates skills or metrics?",
    answer:
      "Unlike generic LLM wrappers, TailorAI maintains an immutable Evidence Bank constructed from your master resume and verified external sources. Every single generated bullet carries an evidence_id. Our Fact Validator strictly blocks and discards any claim without an evidence anchor. Unsupported JD requirements are reported to you as learning gaps—never written into your resume.",
  },
  {
    question: "Is compiling user-uploaded LaTeX files safe on your servers?",
    answer:
      "Yes. LaTeX files are untrusted code. We compile user documents inside a locked-down container with zero network access, shell escape permanently disabled, a read-only root file system, and strict memory/CPU limits. Furthermore, all potentially malicious TeX primitives (such as \\write18, \\openin, and \\input) are aggressively stripped before compilation.",
  },
  {
    question: "Will tailored bullet points push my resume onto an accidental second page?",
    answer:
      "No. We enforce strict per-bullet character budgets based on your original line lengths. After compilation, our PyMuPDF inspection engine verifies the exact page count. If page overflow occurs, our planner automatically applies subtle layout trims to lowest-ranked secondary items while preserving your primary achievements.",
  },
  {
    question: "Why do you provide a 'Fit Estimate' instead of an 'ATS Probability Score'?",
    answer:
      "Because ATS score percentages are misleading marketing gimmicks. Real employers configure their applicant tracking systems with widely differing filters, and keyword frequency does not predict shortlists. TailorAI calculates a transparent, rubric-based fit score based on empirical evidence coverage, and uses PyMuPDF to test actual ATS text stream extraction.",
  },
  {
    question: "How do you handle career transitions (e.g. IT to Product Management)?",
    answer:
      "We classify every target requirement into Direct, Transferable, or Missing using structured occupation ontologies (O*NET, ESCO, and curated role crosswalks). We only reframe the framing of verified work—for example, articulating developer mentorship as leadership—and require explicit candidate sign-off on all transferable claims.",
  },
  {
    question: "How is my personal and career privacy protected?",
    answer:
      "We apply end-to-end HTTPS, per-user isolation, and encryption at rest. Personal contact details (phone, email, address) are automatically redacted before sending bullet content to language model inference endpoints. In accordance with privacy regulations, a 1-click 'Delete My Data' button instantly purges all your uploaded resumes and evidence records.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 md:py-32 bg-[var(--bg)]">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="text-center max-w-[680px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Questions & Answers
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="section-sub">
            Everything you need to know about our evidence architecture, LaTeX safety sandbox, and privacy guarantees.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="apple-card overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="text-[17px] font-semibold text-[var(--ink)] tracking-tight">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[var(--ink-2)] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[var(--blue)]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-[15px] leading-relaxed text-[var(--ink-2)] border-t border-[var(--line-light)] mt-2 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
