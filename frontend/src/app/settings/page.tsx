"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-ink">
      <div className="flex items-center gap-2 text-[14px] text-ink-muted">
        <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        Redirecting to Account & Privacy...
      </div>
    </div>
  );
}
