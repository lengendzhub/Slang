"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FrostedNav } from "@/components/ui/FrostedNav";
import { Footer } from "@/components/landing/Footer";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink selection:bg-accent selection:text-white">
      <FrostedNav />

      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.28, 0.11, 0.32, 1] }}
          className="max-w-[480px] mx-auto space-y-6"
        >
          {/* Large light-grey 404 numeral */}
          <div className="text-[96px] sm:text-[128px] font-semibold tracking-tighter text-ink/10 select-none leading-none font-mono">
            404
          </div>

          <div className="space-y-2 -mt-4">
            <h1 className="apple-h1 text-ink">
              We can't find that page.
            </h1>
            <p className="apple-body text-ink-secondary text-[15px] sm:text-[17px]">
              The link you followed may be broken, or the page may have been removed.
            </p>
          </div>

          {/* Primary pill "Back to Slang" + Secondary text link to Workspace */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="pill-btn pill-btn-primary px-7 py-3 text-[15px] font-medium min-h-[44px]"
            >
              <span>Back to Slang</span>
            </Link>

            <Link
              href="/workspace"
              className="text-link text-[15px] font-medium inline-flex items-center gap-1 hover:gap-1.5 transition-all min-h-[44px]"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
