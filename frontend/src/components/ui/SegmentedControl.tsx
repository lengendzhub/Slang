"use client";

import React, { useId } from "react";
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
  name?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
  name,
}: SegmentedControlProps) {
  const generatedId = useId();
  const layoutId = name ? `seg-${name}` : `seg-${generatedId}`;

  return (
    <div
      className={`inline-flex p-1 bg-surface rounded-pill border border-hairline max-w-full overflow-x-auto ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={`relative px-3.5 py-1.5 rounded-pill text-[13px] font-medium transition-colors duration-150 whitespace-nowrap z-10 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
              isSelected ? "text-ink font-semibold" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 bg-canvas rounded-pill shadow-subtle border border-hairline -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-pill font-semibold ${
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-surface text-ink-secondary border border-hairline"
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
