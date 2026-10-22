"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface text-[12px] text-ink-secondary py-10 pb-20 md:pb-12">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-hairline">
          <div>
            <span className="font-semibold text-ink text-[13px] block mb-1">
              Slang
            </span>
            <p className="max-w-[420px] text-ink-secondary leading-relaxed">
              Precision LaTeX resume tailoring engine. Evidence-anchored claims, guaranteed ATS layout preservation, and zero fabrication.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[12px]">
            <Link href="/workspace" className="text-ink-secondary hover:text-ink transition-colors">
              Workspace
            </Link>
            <Link href="/library" className="text-ink-secondary hover:text-ink transition-colors">
              Library
            </Link>
            <Link href="/siblings" className="text-ink-secondary hover:text-ink transition-colors">
              Siblings
            </Link>
            <Link href="/evidence" className="text-ink-secondary hover:text-ink transition-colors">
              Evidence
            </Link>
            <Link href="/account" className="text-ink-secondary hover:text-ink transition-colors">
              Account
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-ink-tertiary">
            © {new Date().getFullYear()} Slang. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-ink-tertiary">
            <span>Deterministic Tectonic Compilation</span>
            <span>·</span>
            <Link href="/account" className="hover:text-ink transition-colors">
              Privacy & Data Erasure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
