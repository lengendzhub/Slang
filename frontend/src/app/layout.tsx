import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TailorAI — Precision LaTeX Resume Tailoring Engine",
  description: "One master resume in LaTeX becomes many truthful, job-specific resumes. Verified evidence anchors, locked-down sandboxing, and zero hallucinations.",
  keywords: ["AI resume tailoring", "LaTeX resume", "ATS optimization", "Career transition", "Evidence-based resume"],
  authors: [{ name: "TailorAI Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-[var(--bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
