"use client";

export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "slang_theme";
export const THEME_CHANGE_EVENT = "slang_theme_changed";

/**
 * Returns true if the DOM is currently in dark mode
 */
export function isDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("dark") ||
    document.documentElement.getAttribute("data-theme") === "dark"
  );
}

/**
 * Detects system OS color scheme preference
 */
export function getSystemTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Reads user stored theme preference from localStorage
 */
export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return null;
}

/**
 * Determines current effective theme (stored preference or OS preference)
 */
export function getEffectiveTheme(): ThemeMode {
  return getStoredTheme() || getSystemTheme();
}

/**
 * Applies a given theme to the document element, updates localStorage, and notifies listeners
 */
export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isDark = theme === "dark";

  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}

  window.dispatchEvent(
    new CustomEvent(THEME_CHANGE_EVENT, {
      detail: isDark,
    })
  );
}

/**
 * Toggles the theme between light and dark
 */
export function toggleTheme(): ThemeMode {
  const current = getEffectiveTheme();
  const next: ThemeMode = current === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
