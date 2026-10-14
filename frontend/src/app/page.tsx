"use client";

import React from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { StickyHowItWorks } from "@/components/landing/StickyHowItWorks";
import { RoleSwitcherDemo } from "@/components/landing/RoleSwitcherDemo";
import { TrustSection } from "@/components/landing/TrustSection";
import { LatexToPdfAnimation } from "@/components/landing/LatexToPdfAnimation";
import { SiblingsSection } from "@/components/landing/SiblingsSection";
import { InterviewPrepTeaser } from "@/components/landing/InterviewPrepTeaser";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--blue)] selection:text-white">
      <FrostedNav />
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <StickyHowItWorks />
        <RoleSwitcherDemo />
        <TrustSection />
        <LatexToPdfAnimation />
        <SiblingsSection />
        <InterviewPrepTeaser />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
