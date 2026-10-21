"use client";

import React, { useEffect, useState } from "react";
import SplitScreenReview from "@/components/workspace/SplitScreenReview";
import { loadUserSession, UserSessionState } from "@/lib/store";

export default function ReviewDemoPage() {
  const [session, setSession] = useState<UserSessionState | null>(null);

  useEffect(() => {
    setSession(loadUserSession());
  }, []);

  return (
    <SplitScreenReview
      candidateName={session?.candidateName || ""}
      candidateEmail={session?.candidateEmail || ""}
      targetRole={session?.targetRole || "Target Role"}
      onContinueToDownload={() => {
        window.location.href = "/export";
      }}
      onBackToStep1={() => {
        window.location.href = "/workspace";
      }}
    />
  );
}
