"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, Trash2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--line-light)] text-[12px] text-[var(--ink-2)] py-14">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[var(--line-light)]">
          <div className="col-span-2">
            <span className="font-semibold text-[15px] text-[var(--ink)] block mb-2">
              TailorAI Precision Engine
            </span>
            <p className="max-w-[320px] leading-relaxed text-[var(--ink-2)] mb-4">
              Evidence-anchored resume tailoring for LaTeX-native engineers, managers, and career switchers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[var(--ink-2)]">
              <span className="w-2 h-2 rounded-full bg-[#34c759]" />
              <span>Compilation Sandboxes Operational</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-[13px] text-[var(--ink)] mb-3">Product</h5>
            <ul className="space-y-2">
              <li><Link href="/studio" className="hover:text-[var(--ink)]">Studio</Link></li>
              <li><Link href="/diff" className="hover:text-[var(--ink)]">Diff Review</Link></li>
              <li><Link href="/report" className="hover:text-[var(--ink)]">Fit Rubric</Link></li>
              <li><Link href="/siblings" className="hover:text-[var(--ink)]">Resume Siblings</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[13px] text-[var(--ink)] mb-3">Architecture</h5>
            <ul className="space-y-2">
              <li><Link href="/evidence" className="hover:text-[var(--ink)]">Evidence Bank</Link></li>
              <li><a href="#how-it-works" className="hover:text-[var(--ink)]">Tectonic Sandbox</a></li>
              <li><a href="#trust-matrix" className="hover:text-[var(--ink)]">PyMuPDF ATS Check</a></li>
              <li><a href="#career-transitions" className="hover:text-[var(--ink)]">O*NET & ESCO Mapping</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-[13px] text-[var(--ink)] mb-3">Trust & Privacy</h5>
            <ul className="space-y-2">
              <li><Link href="/settings" className="hover:text-[var(--ink)]">Privacy Isolation</Link></li>
              <li><Link href="/settings" className="hover:text-[var(--ink)]">Export My Data</Link></li>
              <li><Link href="/settings" className="hover:text-red-500 flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Delete All Data
              </Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TailorAI Engineering Group. Built for precision and uncompromised truth.</p>
          <div className="flex items-center gap-6">
            <Link href="/settings" className="hover:text-[var(--ink)]">Privacy Policy</Link>
            <Link href="/settings" className="hover:text-[var(--ink)]">Terms of Service</Link>
            <Link href="/settings" className="hover:text-[var(--ink)]">Data Retention Rubric</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
