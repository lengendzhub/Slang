"use client";

import React from "react";
import { motion } from "framer-motion";

interface Option {
  id: string;
  label: string;
  badge?: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div
      className={`inline-flex p-1 bg-[var(--bg-alt)] rounded-full border border-[var(--line-light)] max-w-full overflow-x-auto ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap z-10 flex items-center gap-1.5 ${
              isSelected ? "text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="segmentedIndicator"
                className="absolute inset-0 bg-[var(--bg)] rounded-full shadow-sm border border-[var(--line-light)] -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isSelected
                    ? "bg-[var(--blue)] text-white"
                    : "bg-[var(--bg)] text-[var(--ink-2)] border border-[var(--line-light)]"
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
