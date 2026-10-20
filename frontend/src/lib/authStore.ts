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

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
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
  window.dispatchEvent(new CustomEvent("slang_auth_changed", { detail: { isAuthenticated: false, user: null } }));
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const user = await res.json();
      setAuthSession(token, user);
      return user;
    } else {
      clearAuthSession();
      return null;
    }
  } catch {
    // If backend is unreachable, keep local cached user
    return getCurrentUser();
  }
}
