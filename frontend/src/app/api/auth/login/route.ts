import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const emailClean = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 400 }
      );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const backendRes = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailClean, password: String(password) }),
    });

    if (!backendRes.ok) {
      // Use ONE generic message for wrong email or wrong password to prevent user enumeration
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const data = await backendRes.json();
    const { token, user } = data;

    const response = NextResponse.json({
      ok: true,
      user,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // Set HttpOnly, Secure, SameSite=Lax cookie for the auth token
    response.cookies.set({
      name: "slang_token",
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    // Set readable user session indicator for client UI
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
