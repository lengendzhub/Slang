"use client";

import React from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Hero } from "@/components/landing/Hero";
import { StickyHowItWorks } from "@/components/landing/StickyHowItWorks";
import { BentoGrid } from "@/components/landing/BentoGrid";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      {/* 44-48px Sticky Translucent Frosted Glass Nav */}
      <FrostedNav />

      <main id="main-content" className="flex-1 w-full overflow-hidden">
        {/* Section 1: Hero (White / bg-canvas) */}
        <Hero />

        {/* Section 2: How It Works in 3 Steps (#F5F5F7 / bg-surface) */}
        <StickyHowItWorks />

        {/* Section 3: The Seven Invariants (Black / bg-black) */}
        <BentoGrid />

        {/* Section 4: FAQ Accordion (White / bg-canvas) */}
        <FaqSection />

        {/* Section 5: Final Call to Action (#F5F5F7 / bg-surface) */}
        <FinalCta />
      </main>

      {/* Minimal 12px Grey Text Footer */}
      <Footer />
    </div>
  );
}
