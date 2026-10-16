"use client";

import React from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { MobileTabBar } from "@/components/ui/MobileTabBar";
import { RoleSwitcher } from "@/components/landing/RoleSwitcher";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ArrowRight, Shield, Lock, FileCheck2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-[1120px] mx-auto px-6 pt-16 md:pt-24 pb-16 text-center">
          <ScrollReveal
            as="h1"
            mode="enter"
            splitBy="words"
            effect="rise"
            stagger={0.05}
            duration={0.7}
            baseOpacity={0.1}
            baseRotation={0}
            baseOffset={20}
            enableBlur={true}
            blurStrength={6}
            containerClassName="my-0"
            textClassName="text-[40px] sm:text-[54px] md:text-[64px] font-semibold tracking-[-0.025em] text-ink leading-[1.08] max-w-[920px] mx-auto block"
          >
            One master resume. Tailored truthfully for every job.
          </ScrollReveal>

          <p className="text-[17px] sm:text-[19px] text-ink-muted mt-5 mb-8 max-w-[620px] mx-auto leading-relaxed font-normal">
            Upload your LaTeX or PDF master resume once. Slang selects, reorders, and reframes your genuine accomplishments—never inventing skills or breaking your layout.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-pill bg-accent text-white text-[15px] font-medium hover:bg-accent-hover shadow-subtle transition-all duration-fast ease-apple w-full sm:w-auto"
            >
              Tailor Your Resume
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/library"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-pill bg-canvas border border-hairline text-ink text-[15px] font-medium hover:bg-surface transition-all duration-fast ease-apple w-full sm:w-auto"
            >
              View My Library
            </Link>
          </div>

          {/* Crisp, Static Frame Showing Split-Screen Interface */}
          <div className="mt-14 max-w-[1040px] mx-auto bg-canvas border border-hairline rounded-card shadow-paper overflow-hidden text-left">
            <div className="h-10 bg-surface border-b border-hairline px-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[12px] font-medium text-ink-muted font-mono truncate max-w-[190px] sm:max-w-none">
                workspace.slang.app — Split-Screen Human Review
              </span>
              <span className="text-[11px] font-mono text-status-supported-text bg-status-supported-bg px-2 py-0.5 rounded shrink-0">
                Single-Page Kept
              </span>
            </div>

            <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-canvas">
              {/* Left Paper Mock */}
              <div className="md:col-span-8 border border-hairline rounded-xl p-4 sm:p-5 bg-canvas space-y-4 shadow-subtle">
                <div className="border-b border-hairline pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
                  <div>
                    <h4 className="font-semibold text-[16px] text-ink">Elena Rostova</h4>
                    <p className="text-[12px] text-ink-muted">Distributed Systems Engineer • elena@example.com</p>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-hairline">
                    LaTeX AST Locked
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[12px] text-ink-muted line-through">
                    Built internal streaming services handling database records.
                  </p>
                  <p className="text-[13px] font-medium text-ink bg-status-supported-bg/40 p-2.5 rounded-lg border border-status-supported-bg">
                    Architected event-driven Kafka streaming platform processing 40M events/sec with sub-10ms P99 latency.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1 text-[11px] text-ink-muted">
                    <span>Evidence: ev_sec_1_exp_0 • Direct Match</span>
                    <span className="text-status-supported-text font-medium">✓ Accepted by user</span>
                  </div>
                </div>
              </div>

              {/* Right Checklist Mock */}
              <div className="md:col-span-4 bg-surface p-4 rounded-xl border border-hairline space-y-3">
                <h5 className="text-[13px] font-semibold text-ink">Requirements Check</h5>
                <p className="text-[11px] text-ink-muted">Matched 11 of 14 requirements truthfully.</p>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex items-center gap-1.5 text-status-supported-text">
                    <span className="w-2 h-2 rounded-full bg-status-supported-text" />
                    <span className="font-medium">8 Direct Matches</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-status-transferable-text">
                    <span className="w-2 h-2 rounded-full bg-status-transferable-text" />
                    <span className="font-medium">3 Transferable Reframed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-status-missing-text">
                    <span className="w-2 h-2 rounded-full bg-status-missing-text" />
                    <span className="font-medium">3 Missing (Reported, Not Written)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROLE SWITCHER SECTION */}
        <section className="w-full py-16 sm:py-20 bg-canvas border-y border-hairline">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6 text-center">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-2 block">
              Career Transition & Domain Pivot
            </span>
            <h2 className="text-[28px] sm:text-[32px] md:text-[38px] font-semibold tracking-tight text-ink mb-3">
              One Experience. Infinite Honest Framings.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-ink-muted max-w-[620px] mx-auto mb-10">
              See how the exact same master achievement is calibrated for engineering, product management, or business analytics without fabricating a single metric.
            </p>

            <RoleSwitcher />
          </div>
        </section>

        {/* EDITORIAL MANIFESTO SCROLL REVEAL SECTION */}
        <section className="w-full py-20 sm:py-28 bg-surface border-b border-hairline overflow-hidden text-center">
          <div className="max-w-[960px] mx-auto px-6">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-3 inline-block">
              The Slang Truth Standard
            </span>
            <ScrollReveal
              mode="scrub"
              splitBy="words"
              effect="fade"
              stagger={0.04}
              duration={0.8}
              smoothing={0.2}
              baseOpacity={0.15}
              baseRotation={2}
              baseOffset={8}
              enableBlur={true}
              blurStrength={8}
              highlightColor="#3b82f6"
              containerClassName="my-4 max-w-[860px] mx-auto"
              textClassName="text-[clamp(1.75rem,3.8vw,2.85rem)] font-semibold tracking-tight text-ink leading-[1.35]"
            >
              A resume fails when achievements are fabricated. Truthful relevance wins the shortlist—anchored to verified evidence, locked to one page, trusted by hiring engineers.
            </ScrollReveal>
            <p className="text-[14px] text-ink-muted mt-5 max-w-[540px] mx-auto">
              Every word is grounded in your evidence bank. What you cannot prove is never invented.
            </p>
          </div>
        </section>

        {/* 3-CARD BENTO GRID SECTION */}
        <section className="w-full py-16 sm:py-24 bg-canvas">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <BentoGrid />
          </div>
        </section>
      </main>

      {/* MINIMAL FOOTER with safe-area spacing */}
      <footer className="w-full bg-canvas border-t border-hairline py-10 px-4 sm:px-6 pb-24 lg:pb-10">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-[13px] text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">Slang</span>
            <span>•</span>
            <span>Your data is encrypted and never used to train public AI models.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/workspace" className="hover:text-ink transition-colors">
              Workspace
            </Link>
            <Link href="/library" className="hover:text-ink transition-colors">
              My Library
            </Link>
            <Link href="/account" className="hover:text-ink transition-colors">
              Account & Privacy
            </Link>
          </div>
        </div>
      </footer>

      {/* Responsive Mobile Bottom Tab Bar (Visible < lg) */}
      <MobileTabBar />
    </div>
  );
}
