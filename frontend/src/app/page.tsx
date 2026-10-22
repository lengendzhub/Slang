"use client";

import React from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Hero } from "@/components/landing/Hero";
import { StickyHowItWorks } from "@/components/landing/StickyHowItWorks";
import { TrustSection } from "@/components/landing/TrustSection";
import { LatexToPdfAnimation } from "@/components/landing/LatexToPdfAnimation";
import { RoleSwitcherDemo } from "@/components/landing/RoleSwitcherDemo";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";
import { MobileTabBar } from "@/components/ui/MobileTabBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      {/* Sticky 48px Translucent Glass Navigation */}
      <FrostedNav />

      <main className="flex-1 w-full overflow-hidden">
        {/* 1. Hero: Word reveal, drifting blue orbs, 4s resume crossfade, primary & secondary CTAs */}
        <Hero />

        {/* 2. Pinned Scroll-Linked "How It Works" Story (~300vh) */}
        <div id="how-it-works">
          <StickyHowItWorks />
        </div>

        {/* 3. "Truth First" Section: 3 labels (Supported, Needs confirmation, Missing) */}
        <TrustSection />

        {/* 4. "Your Template Stays Yours": Before & After LaTeX-to-PDF Sandbox Compilation */}
        <LatexToPdfAnimation />

        {/* 5. Career Transitions: Interactive examples (IT to BA, Digital Marketing, Product Ops) */}
        <div id="career-transitions">
          <RoleSwitcherDemo />
        </div>

        {/* 6. 3-Card Bento Grid: Core Non-Negotiable Tenets */}
        <section className="w-full py-16 sm:py-24 bg-surface border-y border-hairline">
          <div className="max-w-[1120px] mx-auto px-4 sm:px-6">
            <div className="text-center max-w-[680px] mx-auto mb-14">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-accent mb-2 block">
                Non-Negotiable Architecture
              </span>
              <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-tight text-ink mb-3">
                Built on Empirical Proof, Never Fabricated Skills.
              </h2>
              <p className="text-[16px] text-ink-muted">
                Every line carries a traceable evidence ID. If you cannot prove it in your Evidence Bank, it is omitted.
              </p>
            </div>
            <BentoGrid />
          </div>
        </section>

        {/* 7. FAQ Accordion: Apple-style expandable answers */}
        <FaqSection />

        {/* 8. Final Call to Action */}
        <FinalCta />
      </main>

      {/* Minimalist Apple Privacy Footer */}
      <Footer />

      {/* Responsive Mobile Bottom Tab Bar (Visible on mobile/tablet < lg) */}
      <MobileTabBar />
    </div>
  );
}
