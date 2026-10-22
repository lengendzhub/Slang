"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, ArrowRight, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, clearAuthSession, AuthUser } from "@/lib/authStore";

export function FrostedNav() {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Sync auth state
  useEffect(() => {
    setUser(getCurrentUser());
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener("slang_auth_changed", handleAuthChange);
    return () => window.removeEventListener("slang_auth_changed", handleAuthChange);
  }, []);

  // Sync and toggle theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("slang_theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setIsDark(customEvent.detail);
      } else {
        setIsDark(localStorage.getItem("slang_theme") === "dark");
      }
    };

    window.addEventListener("slang_theme_changed", handleThemeChange);
    return () => window.removeEventListener("slang_theme_changed", handleThemeChange);
  }, []);

  // Track scroll position: gain hairline border after 8px of scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Handle 'Tailor Your Resume' click: if already on /workspace, trigger a clean draft reset
  const handleTailorClick = (e: React.MouseEvent) => {
    if (pathname === "/workspace") {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("slang:reset-workspace"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("slang_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("slang_theme", "light");
    }
    window.dispatchEvent(new CustomEvent("slang_theme_changed", { detail: next }));
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-[48px] px-4 sm:px-6 flex items-center justify-between transition-all duration-200 backdrop-blur-[20px] bg-[rgba(255,255,255,0.72)] dark:bg-[rgba(0,0,0,0.72)] border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]`}
      >
        {/* Brand Wordmark & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          {/* Below md: Hamburger Button (at least 44x44px touch target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            className="md:hidden w-11 h-11 -ml-2 rounded-full inline-flex items-center justify-center text-ink hover:text-accent hover:bg-surface active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-0.5 shadow-sm group-hover:border-accent/50 transition-colors overflow-hidden">
              <img src="/icon.svg" alt="Slang logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-[17px] tracking-tight text-ink group-hover:text-accent transition-colors">
              Slang
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links (md and up) */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-normal text-ink-muted">
          <Link
            href="/workspace"
            className={`hover:text-ink transition-colors duration-fast ease-apple ${
              pathname === "/workspace" ? "text-ink font-medium" : ""
            }`}
          >
            The Workspace
          </Link>
          <Link
            href="/type"
            className={`inline-flex items-center gap-1.5 hover:text-ink transition-colors duration-fast ease-apple ${
              pathname === "/type" ? "text-ink font-medium" : ""
            }`}
          >
            <span>Slang Type</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20">
              Live
            </span>
          </Link>
          <Link
            href="/library"
            className={`hover:text-ink transition-colors duration-fast ease-apple ${
              pathname === "/library" ? "text-ink font-medium" : ""
            }`}
          >
            My Library
          </Link>
          <Link
            href="/account"
            className={`hover:text-ink transition-colors duration-fast ease-apple ${
              pathname === "/account" ? "text-ink font-medium" : ""
            }`}
          >
            Account & Privacy
          </Link>
        </nav>

        {/* Actions: Theme Toggle + Auth Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-11 h-11 sm:w-8 sm:h-8 rounded-full inline-flex items-center justify-center text-ink-muted hover:text-ink hover:bg-surface active:scale-95 transition-all cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link
              href="/account"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-hairline text-[12px] font-medium text-ink hover:bg-canvas transition-colors shadow-subtle min-h-[34px]"
            >
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/signin"
                className="text-[13px] text-ink-muted hover:text-ink transition-colors px-2.5 py-1.5 rounded-full"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#0071E3] text-white text-[13px] font-medium hover:bg-[#0077ED] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          <Link
            href="/workspace"
            onClick={handleTailorClick}
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-full bg-surface border border-hairline text-ink text-[12px] font-medium hover:bg-surface-raised min-h-[34px] transition-all duration-fast ease-apple active:scale-[0.98]"
          >
            Tailor Resume
          </Link>
        </div>
      </header>

      {/* Full-Screen Mobile Glass Sheet (Below md) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.28, 0.11, 0.32, 1] }}
            className="fixed inset-0 z-30 pt-16 px-6 pb-8 md:hidden bg-canvas/95 backdrop-blur-2xl flex flex-col justify-between"
            style={{
              paddingTop: "calc(var(--sat, 0px) + 4rem)",
              paddingBottom: "calc(var(--sab, 0px) + 2rem)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.28, 0.11, 0.32, 1] }}
              className="space-y-6"
            >
              <div className="border-b border-hairline pb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Navigation
                </span>
              </div>

              <nav className="flex flex-col space-y-4">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-[22px] font-semibold text-ink hover:text-accent transition-colors"
                >
                  <span>Home</span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </Link>
                <Link
                  href="/workspace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-[22px] font-semibold text-ink hover:text-accent transition-colors"
                >
                  <span>The Workspace</span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </Link>
                <Link
                  href="/type"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-[22px] font-semibold text-ink hover:text-accent transition-colors"
                >
                  <span className="flex items-center gap-2">
                    Slang Type
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20">
                      Live
                    </span>
                  </span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </Link>
                <Link
                  href="/library"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-[22px] font-semibold text-ink hover:text-accent transition-colors"
                >
                  <span>My Library</span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 text-[22px] font-semibold text-ink hover:text-accent transition-colors"
                >
                  <span>Account & Privacy</span>
                  <ArrowRight className="w-5 h-5 text-ink-muted" />
                </Link>
              </nav>
            </motion.div>

            {/* Bottom Actions inside Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.28, 0.11, 0.32, 1] }}
              className="pt-6 border-t border-hairline space-y-3"
            >
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-hairline">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[13px]">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-ink leading-tight">{user.name}</p>
                      <p className="text-[11px] text-ink-muted">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthSession();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-ink-muted hover:text-red-500 rounded cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[42px] rounded-pill bg-canvas border border-hairline text-ink text-[14px] font-medium inline-flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[42px] rounded-pill bg-surface border border-hairline text-accent text-[14px] font-medium inline-flex items-center justify-center hover:bg-canvas transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
              <Link
                href="/workspace"
                onClick={handleTailorClick}
                className="w-full min-h-[48px] rounded-pill bg-accent text-white text-[16px] font-medium inline-flex items-center justify-center gap-2 shadow-subtle hover:bg-accent-hover transition-colors"
              >
                <span>Tailor Your Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[12px] text-ink-muted">
                Zero hallucinations • Preamble & macros 100% locked
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

