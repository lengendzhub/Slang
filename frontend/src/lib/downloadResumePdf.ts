// Replace window.print() on the Download / Export button with this.
// Usage: onClick={() => downloadResumePdf(tailoredTex, "Marimuthu_Resume")}

export async function downloadResumePdf(tex: string, name = "tailored_resume") {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: name, max_pages: 1 }),
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
  a.download = `${name}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function fetchResumePdfBlobUrl(tex: string): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/exports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tex, filename: "preview", max_pages: 1 }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const logSnippet = body?.detail?.log ? ` (${body.detail.log.slice(-150).trim()})` : "";
    throw new Error((body?.detail?.message ?? "Failed to compile preview PDF") + logSnippet);
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
