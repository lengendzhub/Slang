"use client";

import React from "react";
import Link from "next/link";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { SlangTypeEngine } from "@/components/type/SlangTypeEngine";
import {
  Sparkles,
  Zap,
  Cpu,
  Keyboard,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sliders,
  Volume2,
  FileText
} from "lucide-react";

export default function SlangTypeHomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] selection:bg-[#0071E3] selection:text-white transition-colors duration-300">
      {/* 1. Translucent Apple Frosted Header */}
      <FrostedNav />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* 2. ATTENTION: Cinematic Hero Section with Central Interactive Typing Engine */}
        <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Subtle Top Indicator Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.04)] mb-6 animate-apple-fade">
            <Sparkles className="w-4 h-4 text-[#0071E3]" />
            <span className="text-[12px] font-semibold text-[#0071E3] tracking-wide uppercase">
              Gen-Z Typing Engine
            </span>
          </div>

          {/* Wide Hero Typography - Strictly 2 Lines */}
          <h1 className="text-[38px] sm:text-[54px] md:text-[64px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-[1.08] max-w-4xl mb-5 animate-apple-fade">
            Slang Type. Lightning speed in modern vernacular.
          </h1>

          {/* Sub-headline */}
          <p className="text-[17px] sm:text-[20px] text-[#86868B] max-w-2xl mx-auto mb-10 leading-relaxed font-normal animate-apple-fade">
            Test your keyboard velocity with real internet culture. Engineered with authentic Apple minimalism, zero distractions, and pure tactile feedback.
          </p>

          {/* Central Interactive Typing Test Stage */}
          <div className="w-full flex justify-center animate-apple-fade">
            <SlangTypeEngine initialMode="slang" initialTime={30} />
          </div>
        </section>

        {/* 3. INTEREST: The Gapless Bento Grid */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 bg-white dark:bg-[#121214] border-y border-black/5 dark:border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#0071E3] mb-2 block">
                Engineered for Performance
              </span>
              <h2 className="text-[32px] sm:text-[42px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight mb-3">
                Precision down to the millisecond.
              </h2>
              <p className="text-[17px] text-[#86868B]">
                Everything you need to calibrate typing rhythm, reflex accuracy, and fingerspeed.
              </p>
            </div>

            {/* Gapless Dense Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] grid-flow-dense">
              {/* Card 1: 2-column Gen-Z Lexicon */}
              <div className="md:col-span-2 p-8 sm:p-10 rounded-[16px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 dark:bg-[#0071E3]/20 flex items-center justify-center text-[#0071E3]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    The Living Lexicon
                  </h3>
                  <p className="text-[15px] text-[#86868B] max-w-lg leading-relaxed">
                    Dynamically populated with authentic slang: <em>rizz, no cap, bussing, skibidi, delulu, sigma, cooked,</em> and <em>aura</em>. Switch seamlessly to standard English at any second.
                  </p>
                </div>

                {/* Interactive Slang Tags */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {["#rizz", "#no-cap", "#bussing", "#skibidi", "#delulu", "#cooked", "#aura"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 text-[13px] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card 2: 1-column Keystroke Telemetry */}
              <div className="p-8 rounded-[16px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#34C759]/10 dark:bg-[#34C759]/20 flex items-center justify-center text-[#34C759]">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Real-Time WPM
                  </h3>
                  <p className="text-[15px] text-[#86868B] leading-relaxed">
                    Continuously computed character cadences with instantaneous accuracy scoring.
                  </p>
                </div>

                <div className="pt-4 flex items-baseline gap-2">
                  <span className="text-[44px] font-bold font-mono text-[#1D1D1F] dark:text-[#F5F5F7] leading-none">
                    120+
                  </span>
                  <span className="text-[13px] text-[#86868B] uppercase font-semibold">
                    Target Velocity
                  </span>
                </div>
              </div>

              {/* Card 3: 1-column Tactile Acoustics */}
              <div className="p-8 rounded-[16px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#0071E3]/10 dark:bg-[#0071E3]/20 flex items-center justify-center text-[#0071E3]">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Tactile Audio
                  </h3>
                  <p className="text-[15px] text-[#86868B] leading-relaxed">
                    Subtle synthetic mechanical switch acoustics generated client-side via the Web Audio API. Zero delay, zero network load.
                  </p>
                </div>

                <div className="pt-4 text-[13px] text-[#0071E3] font-medium flex items-center gap-1">
                  <span>Toggle anytime via the speaker icon</span>
                </div>
              </div>

              {/* Card 4: 2-column Apple Minimalist Flow */}
              <div className="md:col-span-2 p-8 sm:p-10 rounded-[16px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <h3 className="text-[22px] sm:text-[24px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Airy, Distraction-Free Flow
                  </h3>
                  <p className="text-[15px] text-[#86868B] max-w-lg leading-relaxed">
                    Calibrated with Apple&apos;s SF Pro font hierarchy, smooth 0.2s transitions, and responsive dark mode that respects system preferences automatically.
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 text-[13px] text-[#86868B]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                    <span>Ad-Free</span>
                  </span>
                  <span>•</span>
                  <span>Low latency</span>
                  <span>•</span>
                  <span>Mobile & Desktop ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DESIRE & ACTION: Resume Engine Workspace Bridging Banner */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="p-8 sm:p-12 rounded-[20px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2 max-w-md">
              <span className="text-[12px] font-semibold text-[#0071E3] uppercase tracking-wide">
                Also part of Slang
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                AI LaTeX Resume Tailoring Engine
              </h3>
              <p className="text-[14px] text-[#86868B]">
                Transform your master resume into job-specific LaTeX documents with verified evidence anchors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/workspace"
                className="w-full sm:w-auto h-[48px] px-6 rounded-full bg-[#0071E3] text-white text-[15px] font-semibold hover:bg-[#0077ED] hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resume"
                className="w-full sm:w-auto h-[48px] px-5 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] text-[15px] font-medium hover:bg-neutral-200 dark:hover:bg-[#3A3A3C] inline-flex items-center justify-center transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Minimal Apple Footer */}
      <footer className="border-t border-black/5 dark:border-white/10 py-10 px-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#000000] text-[13px] text-[#86868B]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Slang Type</span>
            <span>—</span>
            <span>Gen-Z Speed Test & Resume Intelligence</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/type" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
              Speed Test
            </Link>
            <Link href="/workspace" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
              Workspace
            </Link>
            <Link href="/signin" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
