import { getApiBaseUrl } from "./apiConfig";
import { generateVectorPdfBlob } from "./vectorPdfGenerator";

export interface PdfPreviewResult {
  url: string;
  pageCount: number;
  isFallback?: boolean;
}

/**
 * Downloads the resume PDF with multi-layer resilience:
 * 1. Tries local/deployed Next.js route `/api/exports/pdf` or backend `/exports/pdf`.
 * 2. If the remote compiler times out or is cold, automatically falls back to client-side vector ATS PDF.
 */
export async function downloadResumePdf(tex: string, name = "tailored_resume") {
  const cleanName = name.replace(/\.pdf$/i, "");
  let blob: Blob | null = null;

  // Try endpoints: first local Next.js proxy/export, then direct backend API
  const endpoints = ["/api/exports/pdf", `${getApiBaseUrl()}/exports/pdf`];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex, filename: cleanName, max_pages: 1, enforce: true, fit: true }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        blob = await res.blob();
        break;
      }
    } catch {
      // Continue to next endpoint or client fallback
    }
  }

  // Resilient Client-Side Fallback if remote compiler is sleeping or offline
  if (!blob) {
    try {
      blob = generateVectorPdfBlob(tex, { filename: cleanName });
    } catch (fallbackErr) {
      console.error("Vector PDF fallback error:", fallbackErr);
    }
  }

  if (!blob) {
    throw new Error("Unable to generate PDF resume. Please verify LaTeX formatting.");
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Fetches or generates a PDF preview Blob URL for iframe rendering.
 * Never throws 504 / "LaTeX compilation took too long" - automatically uses vector preview
 * if compiler is warming up, ensuring instantaneous 0-error UX.
 */
export async function fetchResumePdfBlobUrl(
  tex: string,
  autoFit = false,
  options?: { candidateName?: string; candidateEmail?: string }
): Promise<PdfPreviewResult> {
  const endpoints = ["/api/exports/pdf", `${getApiBaseUrl()}/exports/pdf`];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      // 10s budget for real Tectonic render before falling back to instant vector preview
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tex, filename: "preview", max_pages: 1, enforce: false, fit: autoFit }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const pageCount = Number(res.headers.get("X-Page-Count") ?? 1);
        const isFallback = res.headers.get("X-Fallback-Compiled") === "true";
        const blob = await res.blob();
        return {
          url: URL.createObjectURL(blob),
          pageCount,
          isFallback,
        };
      }
    } catch {
      // Endpoint timed out or unreachable; try next or fall back
    }
  }

  // Instant Client-Side Vector ATS Preview Fallback
  const fallbackBlob = generateVectorPdfBlob(tex, {
    candidateName: options?.candidateName,
    candidateEmail: options?.candidateEmail,
    filename: "preview",
  });

  return {
    url: URL.createObjectURL(fallbackBlob),
    pageCount: 1,
    isFallback: true,
  };
}
