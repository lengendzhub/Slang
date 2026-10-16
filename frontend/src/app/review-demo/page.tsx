"use client";

import React from "react";
import SplitScreenReview from "@/components/workspace/SplitScreenReview";

export default function ReviewDemoPage() {
  return (
    <SplitScreenReview
      candidateName="Marimuthu"
      candidateEmail="marimuthu112005@gmail.com"
      candidateLocation="San Francisco, CA"
      targetRole="Senior Staff Backend Engineer"
      onContinueToDownload={(reviewed) => {
        alert(
          `Review complete! All ${reviewed.length} changes reviewed and ready for download.`
        );
      }}
      onBackToStep1={() => {
        window.location.href = "/workspace";
      }}
    />
  );
}
