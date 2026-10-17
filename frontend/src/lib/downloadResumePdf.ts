import { getApiBaseUrl } from "./apiConfig";

// Replace window.print() on the Download / Export button with this.
// Usage: onClick={() => downloadResumePdf(tailoredTex, "Marimuthu_Resume")}

export interface PdfPreviewResult {
  url: string;
  pageCount: number;
}

export async function downloadResumePdf(tex: string, name = "tailored_resume") {
  const apiUrl = getApiBaseUrl();
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: name, max_pages: 1, enforce: true, fit: true }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    let errorMsg = body?.detail?.message;
    if (!errorMsg) {
      if (res.status === 504 || res.status === 502 || res.status === 503) {
        errorMsg = `Backend server is warming up or busy (HTTP ${res.status}). Please retry in a few seconds.`;
      } else {
        errorMsg = `PDF compilation failed with HTTP ${res.status}.`;
      }
    }
    const logSnippet = body?.detail?.log ? ` (${body.detail.log.slice(-150).trim()})` : "";
    throw new Error(errorMsg + logSnippet);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanName = name.replace(/\.pdf$/i, "");
  a.download = `${cleanName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function fetchResumePdfBlobUrl(tex: string, autoFit = false): Promise<PdfPreviewResult> {
  const apiUrl = getApiBaseUrl();
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: "preview", max_pages: 1, enforce: false, fit: autoFit }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    let errorMsg = body?.detail?.message;
    if (!errorMsg) {
      if (res.status === 504 || res.status === 502 || res.status === 503) {
        errorMsg = `Backend server is warming up or busy (HTTP ${res.status}). Please click Retry Compilation.`;
      } else {
        errorMsg = `LaTeX preview compilation failed (HTTP ${res.status}).`;
      }
    }
    const logSnippet = body?.detail?.log ? ` (${body.detail.log.slice(-150).trim()})` : "";
    throw new Error(errorMsg + logSnippet);
  }

  const pageCount = Number(res.headers.get("X-Page-Count") ?? 1);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), pageCount };
}
