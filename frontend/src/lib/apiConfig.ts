/**
 * Automatically resolves the backend API URL across development, preview, and production.
 * 
 * Precedence:
 * 1. Explicit NEXT_PUBLIC_API_URL environment variable (if set in .env.local or deployment dashboard).
 * 2. In browser environments running on remote hosts (Vercel, Render, custom domains):
 *    Defaults to the live production backend https://slang-backend.onrender.com.
 * 3. In local environments (localhost, 127.0.0.1, 192.168.x.x):
 *    Defaults to http://localhost:8000.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local");

    if (!isLocal) {
      return "https://slang-backend.onrender.com";
    }
  }

  return "http://localhost:8000";
}
