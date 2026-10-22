"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How does Slang ensure it never hallucinates skills or metrics?",
    answer:
      "Unlike generic LLM wrappers, Slang maintains an immutable Evidence Bank constructed from your master resume and verified external sources. Every single generated bullet carries an evidence_id. Our Fact Validator strictly blocks and discards any claim without an evidence anchor. Unsupported JD requirements are reported to you as learning gaps—never written into your resume.",
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
    question: "Why do you provide a rubric fit estimate instead of a fake ATS percentage?",
    answer:
      "Because arbitrary ATS score percentages are misleading gimmicks. Real employers configure their applicant tracking systems with widely differing filters, and keyword frequency does not predict shortlists. Slang calculates a transparent, rubric-based fit score based on empirical evidence coverage, and uses PyMuPDF to test actual ATS text stream extraction.",
  },
  {
    question: "How do you handle career transitions (e.g. IT to Product Management)?",
    answer:
      "We classify every target requirement into Direct, Transferable, or Missing using structured occupation ontologies (O*NET, ESCO, and curated role crosswalks). We only reframe the framing of verified work—for example, articulating developer mentorship as leadership—and require explicit candidate sign-off on all transferable claims.",
  },
  {
    question: "How is my personal and career privacy protected?",
    answer:
      "We apply end-to-end HTTPS, per-user isolation, and encryption at rest. Personal contact details (phone, email, address) are automatically redacted before sending bullet content to language model inference endpoints. In accordance with privacy regulations, a 1-click 'Delete All My Data' button instantly purges all your uploaded resumes and evidence records.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 md:py-28 bg-canvas border-t border-hairline">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-[620px] mx-auto mb-14">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-2 block">
            Questions & Answers
          </span>
          <h2 className="apple-h1 text-ink mb-3">
            Frequently Asked Questions
          </h2>
          <p className="apple-body text-ink-secondary">
            Everything you need to know about our evidence architecture, LaTeX safety sandbox, and privacy guarantees.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="apple-card overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-[16px] font-semibold text-ink tracking-tight">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-secondary shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-accent" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.28, 0.11, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-[14px] leading-relaxed text-ink-secondary border-t border-hairline pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
