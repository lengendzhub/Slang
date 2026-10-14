"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, ArrowRight, ShieldCheck } from "lucide-react";

export function FrostedNav() {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check initial dark mode preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full frosted-glass transition-all duration-300">
      <div className="max-w-[1280px] mx-auto px-6 h-12 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-semibold text-[17px] tracking-tight text-[var(--ink)]">
            TailorAI
          </span>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[var(--bg-alt)] border border-[var(--line-light)] text-[var(--ink-2)]">
            Engine
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-normal text-[var(--ink-2)]">
          <Link href="#value-props" className="hover:text-[var(--ink)] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-[var(--ink)] transition-colors">
            How it Works
          </Link>
          <Link href="#career-transitions" className="hover:text-[var(--ink)] transition-colors">
            Transitions
          </Link>
          <Link href="#trust-matrix" className="hover:text-[var(--ink)] transition-colors">
            Trust & Evidence
          </Link>
          <Link href="/siblings" className="hover:text-[var(--ink)] transition-colors">
            Siblings
          </Link>
          <Link href="/evidence" className="hover:text-[var(--ink)] transition-colors">
            Evidence Bank
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/studio"
            className="pill-btn pill-btn-primary px-4 py-1.5 text-[13px] h-8 shadow-sm"
          >
            Launch Studio
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
