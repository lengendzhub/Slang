import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      {/* Sticky Header Skeleton */}
      <div className="h-12 border-b border-hairline px-6 flex items-center justify-between bg-canvas/60">
        <div className="w-20 h-5 rounded-md bg-separator/40 animate-pulse" />
        <div className="hidden sm:flex items-center gap-6">
          <div className="w-16 h-4 rounded bg-separator/30 animate-pulse" />
          <div className="w-16 h-4 rounded bg-separator/30 animate-pulse" />
          <div className="w-16 h-4 rounded bg-separator/30 animate-pulse" />
        </div>
        <div className="w-28 h-7 rounded-pill bg-separator/40 animate-pulse" />
      </div>

      {/* Main Skeleton Layout */}
      <div className="flex-1 max-w-[780px] w-full mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="space-y-3 text-center">
          <div className="w-32 h-6 rounded-pill bg-separator/30 mx-auto animate-pulse" />
          <div className="w-3/4 max-w-[480px] h-10 rounded-xl bg-separator/40 mx-auto animate-pulse" />
          <div className="w-1/2 max-w-[320px] h-4 rounded bg-separator/30 mx-auto animate-pulse" />
        </div>

        {/* Card Skeleton */}
        <div className="apple-card p-8 space-y-4">
          <div className="w-40 h-5 rounded bg-separator/40 animate-pulse" />
          <div className="w-full h-32 rounded-xl bg-surface border border-hairline animate-pulse" />
          <div className="w-full h-10 rounded-pill bg-accent/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
