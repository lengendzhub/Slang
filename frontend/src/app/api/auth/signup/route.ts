import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const nameClean = String(name || "").trim();
    const emailClean = String(email || "").trim().toLowerCase();
    const passwordStr = String(password || "");

    if (!nameClean) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (passwordStr.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const backendRes = await fetch(`${apiBase}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameClean, email: emailClean, password: passwordStr }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.detail || "Unable to create account. Please try again." },
        { status: backendRes.status }
      );
    }

    const { token, user } = data;
    const response = NextResponse.json({
      ok: true,
      user,
    });

    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set({
      name: "slang_token",
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    response.cookies.set({
      name: "slang_user",
      value: JSON.stringify(user),
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unable to connect to authentication server. Please try again later." },
      { status: 503 }
    );
  }
}
