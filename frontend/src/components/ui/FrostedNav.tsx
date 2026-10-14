"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";

export function FrostedNav() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-40 h-[52px] frosted-glass px-6 flex items-center justify-between border-b border-hairline">
      {/* Brand Wordmark */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-semibold text-[16px] tracking-tight text-ink">
            TailorAI
          </span>
          <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-pill bg-surface border border-hairline text-ink-muted">
            Engine
          </span>
        </Link>
      </div>

      {/* 3 Simple Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-[13px] font-normal text-ink-muted">
        <Link href="/workspace" className="hover:text-ink transition-colors duration-fast ease-apple">
          The Workspace
        </Link>
        <Link href="/library" className="hover:text-ink transition-colors duration-fast ease-apple">
          My Library
        </Link>
        <Link href="/account" className="hover:text-ink transition-colors duration-fast ease-apple">
          Account & Privacy
        </Link>
      </nav>

      {/* Actions: Theme Toggle + Blue Pill CTA */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-surface transition-colors duration-fast ease-apple"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          href="/workspace"
          className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle transition-all duration-fast ease-apple"
        >
          Tailor Your Resume
        </Link>
      </div>
    </header>
  );
}
