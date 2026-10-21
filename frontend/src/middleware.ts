import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/workspace",
  "/app",
  "/diff",
  "/evidence",
  "/export",
  "/siblings",
  "/report",
  "/library",
  "/account",
  "/settings",
  "/studio",
];

const AUTH_PAGES = ["/signin", "/signup", "/login"];

/**
 * Validates that a redirect path is strictly a relative, same-origin path.
 * Blocks absolute URLs (e.g. https://evil.com) and protocol-relative URLs (//evil.com).
 */
export function sanitizeRedirectUrl(redirectParam: string | null): string {
  if (!redirectParam) return "/workspace";
  const trimmed = redirectParam.trim();
  // Must start with a single slash, not double slash (//) and not contain scheme (://)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("://") && !trimmed.includes("\\")) {
    return trimmed;
  }
  return "/workspace";
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Support /login alias redirecting to /signin
  if (pathname === "/login") {
    const signinUrl = req.nextUrl.clone();
    signinUrl.pathname = "/signin";
    return NextResponse.redirect(signinUrl);
  }

  const token = req.cookies.get("slang_token")?.value;
  const isAuthenticated = Boolean(token);

  // If already authenticated and visiting auth pages (/signin, /signup), redirect to /workspace
  if (isAuthenticated && AUTH_PAGES.some((authPath) => pathname === authPath)) {
    const redirectParam = searchParams.get("redirect");
    const target = sanitizeRedirectUrl(redirectParam);
    const destinationUrl = new URL(target, req.url);
    return NextResponse.redirect(destinationUrl);
  }

  // If unauthenticated and visiting a protected page, redirect to /signin with safe redirect param
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isAuthenticated && isProtected) {
    const signinUrl = new URL("/signin", req.url);
    const originalPath = pathname + (req.nextUrl.search || "");
    signinUrl.searchParams.set("redirect", originalPath);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, etc.)
     * - api routes other than /api/auth
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
