import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/apiConfig";
import { verifyJwtToken } from "@/lib/serverAuth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("slang_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, verify JWT token cryptographically
    const payload = verifyJwtToken(token);
    if (!payload) {
      const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
      response.cookies.set({
        name: "slang_token",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      response.cookies.set({
        name: "slang_user",
        value: "",
        httpOnly: false,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    const localUser = {
      id: payload.sub || "usr_active",
      email: payload.email || "",
      name: payload.name || "User",
      auth_provider: "email",
    };

    // Optionally check with backend if online
    try {
      const apiBase = getApiBaseUrl();
      const backendRes = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      });

      if (backendRes.ok) {
        const user = await backendRes.json();
        return NextResponse.json({ ok: true, user });
      }
    } catch {
      // Backend offline or sleeping: proceed with verified local JWT session
    }

    return NextResponse.json({ ok: true, user: localUser });
  } catch {
    return NextResponse.json(
      { error: "Unable to verify session." },
      { status: 503 }
    );
  }
}
