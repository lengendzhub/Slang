import { NextRequest, NextResponse } from "next/server";
import { generateVectorPdfBytes } from "@/lib/vectorPdfGenerator";

const REMOTE_BACKEND = "https://slang-backend.onrender.com";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ detail: { message: "Invalid JSON body" } }, { status: 400 });
  }

  const tex = body.tex || "";
  const filename = body.filename || "tailored_resume";
  const maxPages = body.max_pages ?? 1;
  const enforce = body.enforce ?? false;
  const fit = body.fit ?? false;

  if (!tex || !tex.trim()) {
    return NextResponse.json({ detail: { message: "LaTeX 'tex' string is required" } }, { status: 400 });
  }

  // 1. Try Remote Tectonic Backend (with 12s timeout to avoid Vercel/gateway timeouts)
  const targetBackend = process.env.NEXT_PUBLIC_API_URL || REMOTE_BACKEND;
  const remoteUrl = `${targetBackend.replace(/\/+$/, "")}/exports/pdf`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const remoteRes = await fetch(remoteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tex, filename, max_pages: maxPages, enforce, fit }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (remoteRes.ok) {
      const pdfBuffer = await remoteRes.arrayBuffer();
      const pageCount = remoteRes.headers.get("X-Page-Count") || "1";
      const isFallback = remoteRes.headers.get("X-Fallback-Compiled") || "false";

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          "X-Page-Count": pageCount,
          "X-Fallback-Compiled": isFallback,
        },
      });
    }
  } catch (err: any) {
    // Backend cold-starting, sleeping, or timed out - proceed to resilient vector generation
    console.warn("Remote PDF compilation skipped or timed out, generating vector ATS PDF fallback:", err?.message || err);
  }

  // 2. High-Fidelity Vector ATS PDF Generator Fallback
  try {
    const pdfBytes = generateVectorPdfBytes(tex, { filename });
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "X-Page-Count": "1",
        "X-Fallback-Compiled": "true",
      },
    });
  } catch (fallbackErr: any) {
    console.error("Vector PDF generation error:", fallbackErr);
    return NextResponse.json(
      { detail: { message: fallbackErr.message || "Failed to generate resume PDF." } },
      { status: 500 }
    );
  }
}
