import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)",
        surface: "var(--bg-alt)",
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-2)",
        },
        accent: {
          DEFAULT: "var(--blue)",
          hover: "var(--blue-hover)",
        },
        hairline: "var(--line)",
        status: {
          supported: {
            text: "var(--status-supported-text)",
            bg: "var(--status-supported-bg)",
          },
          transferable: {
            text: "var(--status-transferable-text)",
            bg: "var(--status-transferable-bg)",
          },
          missing: {
            text: "var(--status-missing-text)",
            bg: "var(--status-missing-bg)",
          },
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          "sans-serif",
        ],
        mono: ['"SF Mono"', '"JetBrains Mono"', "monospace"],
      },
      borderRadius: {
        card: "16px",
        pill: "980px",
      },
      boxShadow: {
        subtle: "0 2px 12px rgba(0, 0, 0, 0.04)",
        paper: "0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      transitionDuration: {
        fast: "180ms",
      },
    },
  },
  plugins: [],
};

export default config;
