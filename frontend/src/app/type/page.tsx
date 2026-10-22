"use client";

import React from "react";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { SlangTypeEngine } from "@/components/type/SlangTypeEngine";
import { Sparkles } from "lucide-react";

export default function SlangTypeDedicatedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans antialiased transition-colors duration-300">
      {/* Sticky Frosted Glass Navigation */}
      <FrostedNav />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16 max-w-5xl mx-auto w-full">
        {/* Header / Sub-badge */}
        <div className="text-center space-y-2 mb-8 animate-apple-fade">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span className="text-[12px] font-semibold text-[#0071E3] tracking-wide uppercase">
              Gen-Z Typing Engine
            </span>
          </div>

          <h1 className="text-[36px] sm:text-[44px] font-bold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
            Slang Type
          </h1>

          <p className="text-[17px] text-[#86868B] max-w-md mx-auto">
            Test your keyboard velocity with modern internet vernacular. Designed with Apple precision.
          </p>
        </div>

        {/* Central Typing Test Engine */}
        <div className="w-full flex justify-center animate-apple-fade">
          <SlangTypeEngine initialMode="slang" initialTime={30} />
        </div>
      </main>
    </div>
  );
}
