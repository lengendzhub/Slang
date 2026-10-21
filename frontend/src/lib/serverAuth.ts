import crypto from "crypto";
import { NextResponse } from "next/server";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  auth_provider: string;
}

const SECRET_KEY = process.env.AUTH_SECRET || "tailorai_slang_secret_key_2026_super_secure";

export function createJwtToken(payload: Record<string, any>, expiresInSeconds: number = 86400 * 14): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const data = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    iat: Math.floor(Date.now() / 1000),
  };
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}

export function verifyJwtToken(token: string): Record<string, any> | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const expectedSig = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (expectedSig !== sigB64) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookies(response: NextResponse, token: string, user: ServerUser): void {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: "slang_token",
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
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
}
