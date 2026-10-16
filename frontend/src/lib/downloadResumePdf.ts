// Replace window.print() on the Download / Export button with this.
// Usage: onClick={() => downloadResumePdf(tailoredTex, "Marimuthu_Resume")}

export interface PdfPreviewResult {
  url: string;
  pageCount: number;
}

export async function downloadResumePdf(tex: string, name = "tailored_resume") {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: name, max_pages: 1, enforce: true, fit: true }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const logSnippet = body?.detail?.log ? ` (${body.detail.log.slice(-150).trim()})` : "";
    throw new Error((body?.detail?.message ?? "PDF export failed") + logSnippet);
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

export async function fetchResumePdfBlobUrl(tex: string): Promise<PdfPreviewResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: "preview", max_pages: 1, enforce: false }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const logSnippet = body?.detail?.log ? ` (${body.detail.log.slice(-150).trim()})` : "";
    throw new Error((body?.detail?.message ?? "Failed to compile preview PDF") + logSnippet);
  }

  const pageCount = Number(res.headers.get("X-Page-Count") ?? 1);
  const blob = await res.blob();
  return { url: URL.createObjectURL(blob), pageCount };
}
