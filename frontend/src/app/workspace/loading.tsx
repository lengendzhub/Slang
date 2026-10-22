import React from "react";

export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      {/* Workspace Header Skeleton */}
      <div className="h-12 border-b border-hairline px-6 flex items-center justify-between bg-canvas/60">
        <div className="w-24 h-5 rounded-md bg-separator/40 animate-pulse" />
        <div className="hidden sm:flex items-center gap-4">
          <div className="w-20 h-6 rounded-pill bg-separator/30 animate-pulse" />
          <div className="w-20 h-6 rounded-pill bg-separator/30 animate-pulse" />
          <div className="w-20 h-6 rounded-pill bg-separator/30 animate-pulse" />
        </div>
        <div className="w-16 h-4 rounded bg-separator/30 animate-pulse" />
      </div>

      {/* Centred Column Skeleton */}
      <div className="flex-1 max-w-[680px] w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-48 h-8 rounded-xl bg-separator/40 mx-auto animate-pulse" />
          <div className="w-72 h-4 rounded bg-separator/30 mx-auto animate-pulse" />
        </div>

        {/* Dropzone Skeleton */}
        <div className="h-44 rounded-card border-2 border-dashed border-hairline bg-surface flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-separator/30 animate-pulse" />
          <div className="w-36 h-4 rounded bg-separator/30 animate-pulse" />
        </div>

        {/* Textarea Skeleton */}
        <div className="space-y-2">
          <div className="w-32 h-4 rounded bg-separator/30 animate-pulse" />
          <div className="h-32 rounded-xl border border-hairline bg-canvas animate-pulse" />
        </div>

        {/* Button Skeleton */}
        <div className="w-full h-12 rounded-pill bg-separator/40 animate-pulse" />
      </div>
    </div>
  );
}
