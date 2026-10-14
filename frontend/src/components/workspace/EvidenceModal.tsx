"use client";

import React, { useState } from "react";
import { X, Plus, ShieldCheck } from "lucide-react";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFact: (factText: string, context: string) => void;
}

export function EvidenceModal({ isOpen, onClose, onAddFact }: EvidenceModalProps) {
  const [factText, setFactText] = useState("");
  const [context, setContext] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factText.trim()) return;
    onAddFact(factText.trim(), context.trim() || "User added project");
    setFactText("");
    setContext("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-[500px] bg-canvas border border-hairline rounded-card shadow-paper p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-status-supported-text" />
            <h3 className="text-[17px] font-semibold text-ink">
              Add Verified Fact to Evidence Bank
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 rounded-full hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[13px] text-ink-muted leading-relaxed">
          Add additional GitHub contributions, hackathons, or unlisted project details. The AI is only permitted to reference claims validated by this Evidence Bank.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5">
              Project / Fact Description
            </label>
            <textarea
              rows={4}
              required
              value={factText}
              onChange={(e) => setFactText(e.target.value)}
              placeholder="e.g. Built an open-source Kafka event pipeline on GitHub with 150+ stars, writing automated benchmark tests in Go."
              className="w-full p-3 rounded-xl border border-hairline bg-surface text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted block mb-1.5">
              Source / Context (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. GitHub Repository, Side Project 2024"
              className="w-full px-3.5 py-2 rounded-xl border border-hairline bg-surface text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill text-[13px] text-ink-muted hover:text-ink hover:bg-surface border border-hairline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-pill bg-accent text-white text-[13px] font-medium hover:bg-accent-hover shadow-subtle"
            >
              <Plus className="w-4 h-4" />
              Add to Bank
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
