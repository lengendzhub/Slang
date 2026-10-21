"use client";

import { getApiBaseUrl } from "./apiConfig";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  auth_provider?: string;
}

const TOKEN_KEY = "slang_auth_token_v1";
const USER_KEY = "slang_auth_user_v1";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY) || getCookie("slang_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(getAuthToken() || getCookie("slang_user") || getCookie("slang_token"));
}

export function setAuthSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent("slang_auth_changed", { detail: { isAuthenticated: true, user } }));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Clear cookies via logout API
  fetch("/api/auth/logout", { method: "POST" }).catch(() => {});

  window.dispatchEvent(new CustomEvent("slang_auth_changed", { detail: { isAuthenticated: false, user: null } }));
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        setAuthSession(getAuthToken() || "cookie_session", data.user);
        return data.user;
      }
    } else if (res.status === 401) {
      clearAuthSession();
      return null;
    }
  } catch {
    // fallback to backend /auth/me if local API route failed
    const token = getAuthToken();
    if (token) {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          setAuthSession(token, user);
          return user;
        } else if (res.status === 401) {
          clearAuthSession();
          return null;
        }
      } catch {
        return getCurrentUser();
      }
    }
  }
  return getCurrentUser();
}
