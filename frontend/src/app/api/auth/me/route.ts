import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("slang_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const backendRes = await fetch(`${apiBase}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendRes.ok) {
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
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

    const user = await backendRes.json();
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json(
      { error: "Unable to verify session." },
      { status: 503 }
    );
  }
}
