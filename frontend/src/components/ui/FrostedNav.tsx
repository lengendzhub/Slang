"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, X, ArrowRight, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, clearAuthSession, AuthUser } from "@/lib/authStore";

const NAV_LINKS = [
  { label: "Workspace", href: "/workspace" },
  { label: "Library", href: "/library" },
  { label: "Siblings", href: "/siblings" },
  { label: "Evidence", href: "/evidence" },
  { label: "Account", href: "/account" },
];

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
      {/* Skip to Content accessible link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:text-[13px] focus:font-medium focus:rounded-pill focus:shadow-apple focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-40 h-11 md:h-12 frosted-glass px-4 sm:px-6 flex items-center justify-between transition-all duration-200 ${
          scrolled ? "border-b border-hairline shadow-subtle" : "border-b border-transparent"
        }`}
      >
        {/* Brand Wordmark & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          {/* Below md: Hamburger Button (44x44px touch target) */}
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
            <div className="w-6 h-6 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center p-0.5 shadow-sm group-hover:border-accent/50 transition-colors overflow-hidden">
              <img src="/icon.svg" alt="Slang logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-[17px] tracking-tight text-ink group-hover:text-accent transition-colors">
              Slang
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links (exact 5 links: Workspace, Library, Siblings, Evidence, Account) */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] font-normal text-ink-secondary" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 hover:text-ink ${
                  isActive ? "text-ink font-medium" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Theme Toggle + Auth/CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-ink-secondary hover:text-ink hover:bg-surface active:scale-95 transition-all cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <Link
              href="/account"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface border border-hairline text-[12px] font-medium text-ink hover:bg-canvas transition-colors shadow-subtle min-h-[34px]"
            >
              <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <span className="truncate max-w-[90px]">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-pill text-[13px] font-medium text-ink hover:text-accent transition-colors min-h-[34px]"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/workspace"
            onClick={handleTailorClick}
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle min-h-[34px] transition-all duration-200 active:scale-[0.98]"
          >
            Tailor Your Resume
          </Link>
        </div>
      </header>

      {/* Full-Screen Staggered Mobile Menu (Below md) */}
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
            <div className="space-y-6">
              <div className="border-b border-hairline pb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
                  Navigation
                </span>
              </div>

              <nav className="flex flex-col space-y-2">
                {NAV_LINKS.map((link, idx) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.05,
                      ease: [0.28, 0.11, 0.32, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2 text-[20px] font-semibold text-ink hover:text-accent transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-ink-secondary" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Bottom Actions inside Sheet */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25, ease: [0.28, 0.11, 0.32, 1] }}
              className="pt-6 border-t border-hairline space-y-3"
            >
              {user ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-hairline">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-semibold text-[13px]">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-ink leading-tight">{user.name}</p>
                      <p className="text-[11px] text-ink-secondary">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearAuthSession();
                      setMobileMenuOpen(false);
                    }}
                    className="p-2 text-ink-secondary hover:text-red-500 rounded cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[44px] rounded-pill bg-canvas border border-hairline text-ink text-[14px] font-medium inline-flex items-center justify-center hover:bg-surface transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full min-h-[44px] rounded-pill bg-surface border border-hairline text-accent text-[14px] font-medium inline-flex items-center justify-center hover:bg-canvas transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
              <Link
                href="/workspace"
                onClick={handleTailorClick}
                className="w-full min-h-[48px] rounded-pill bg-accent text-white text-[15px] font-medium inline-flex items-center justify-center gap-2 shadow-subtle hover:bg-accent-hover transition-colors"
              >
                <span>Tailor Your Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-center text-[12px] text-ink-secondary">
                Zero hallucinations • Preamble & macros 100% locked
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
