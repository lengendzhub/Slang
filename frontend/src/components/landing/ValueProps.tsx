"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Compass, Code2, Check, Lock, Database } from "lucide-react";

export function ValueProps() {
  const cards = [
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#34c759]" />,
      badge: "Non-Negotiable Rule #2",
      title: "Truthful by Architecture",
      desc: "Every generated line carries an immutable evidence_id. Our fact validator immediately rejects unanchored claims. Unsupported JD requirements are reported as gaps—never fabricated into your resume.",
      details: ["Evidence Bank anchoring", "Strict zero-hallucination gateway", "Explicit missing-skills report"],
    },
    {
      icon: <Compass className="w-6 h-6 text-[var(--blue)]" />,
      badge: "Cross-Industry Engine",
      title: "Cross-Industry Fluency",
      desc: "Pivot from IT to Product Management or Analytics with confidence. Requirements are strictly classified as Direct, Transferable, or Missing, reframing real accomplishments without pretending to hold unearned titles.",
      details: ["O*NET & ESCO ontology mapping", "Transferable impact re-framing", "Mandatory user confirmation gates"],
    },
    {
      icon: <Code2 className="w-6 h-6 text-[#5856d6]" />,
      badge: "LaTeX Sandbox",
      title: "LaTeX-Native Reliability",
      desc: "Never lose custom preamble macros or formatting. We parse your .tex into a tolerant slot tree, edit only recognized text nodes, enforce bullet character budgets, and compile inside a locked-down Tectonic sandbox.",
      details: ["Round-trip parser verification", "Shell escape strictly disabled", "PyMuPDF reading-order checks"],
    },
  ];

  return (
    <section id="value-props" className="py-24 md:py-32 bg-[var(--bg-alt)] border-t border-[var(--line-light)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--blue)] mb-3">
            Architected for Integrity
          </p>
          <h2 className="section-title text-[var(--ink)] mb-4">
            Built to eliminate the biggest risks in AI resume tailoring.
          </h2>
          <p className="section-sub">
            Standard AI resume generators hallucinate credentials, break LaTeX files, and invent ATS scores. Slang replaces guesswork with deterministic evidence verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.28, 0.11, 0.32, 1] }}
              className="apple-card p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-alt)] border border-[var(--line-light)] flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-medium tracking-tight px-2.5 py-1 rounded-full bg-[var(--bg-alt)] text-[var(--ink-2)] border border-[var(--line-light)]">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-[21px] font-semibold tracking-tight text-[var(--ink)] mb-3">
                  {card.title}
                </h3>
                <p className="body-regular text-[var(--ink-2)] mb-6 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <ul className="space-y-2.5 pt-6 border-t border-[var(--line-light)]">
                {card.details.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
                    <Check className="w-4 h-4 text-[#34c759] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
