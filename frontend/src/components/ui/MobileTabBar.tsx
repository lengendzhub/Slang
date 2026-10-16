"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, FolderArchive, Shield, GitBranch } from "lucide-react";

export function MobileTabBar() {
  const pathname = usePathname();

  // Don't render tab bar on step 2 review screen to avoid clashing with the review action dock
  // We will check if it's currently on a full-screen review
  const tabs = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Workspace",
      href: "/workspace",
      icon: Sparkles,
      isActive: pathname.startsWith("/workspace"),
    },
    {
      name: "Library",
      href: "/library",
      icon: FolderArchive,
      isActive: pathname.startsWith("/library") || pathname.startsWith("/siblings"),
    },
    {
      name: "Account",
      href: "/account",
      icon: Shield,
      isActive: pathname.startsWith("/account") || pathname.startsWith("/settings"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-20 lg:hidden bg-canvas/90 dark:bg-[#121214]/90 backdrop-blur-xl border-t border-hairline pb-[calc(var(--sab,0px)+0.25rem)] shadow-paper"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
                tab.isActive ? "text-accent" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">
                {tab.name}
              </span>
              {tab.isActive && (
                <span className="absolute top-1 w-1 h-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
