/**
 * Theme preference (design.md D12, design summary §1).
 *
 * The preference is a cookie, not a browser-storage item: only cookies reach
 * the server, so `app/layout.tsx` reads it while rendering and puts
 * `data-theme` on `<html>` in the server-rendered markup — no flash and no
 * inline script. This module owns reading and writing the cookie and, on a
 * choice, applies `data-theme` to the document root immediately so the change
 * happens without a reload. `add-auth` reads the same cookie to send `theme`
 * to the API.
 *
 * An unreadable or unknown stored choice falls back to the traditional theme,
 * which is also what a first visit gets (`theming` makes it the default).
 */

export type Theme = "traditional" | "dark";

/** Exactly the themes the application offers. */
export const THEMES: readonly Theme[] = ["traditional", "dark"];

/** The cookie the preference is kept in (not sensitive). */
export const THEME_COOKIE = "theme";

const FALLBACK: Theme = "traditional";

/**
 * Resolve the stored preference from a cookie string — the request's `cookie`
 * header on the server, `document.cookie` in the browser. Missing, unreadable
 * and unknown values fall back to the traditional theme without throwing
 * (spec: "Unusable stored choice").
 */
export function readTheme(cookieString: string | null | undefined): Theme {
  if (!cookieString) return FALLBACK;
  for (const part of cookieString.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (name !== THEME_COOKIE) continue;
    try {
      const value = decodeURIComponent(valueParts.join("="));
      return (THEMES as readonly string[]).includes(value)
        ? (value as Theme)
        : FALLBACK;
    } catch {
      return FALLBACK;
    }
  }
  return FALLBACK;
}

/**
 * Choose a theme: keep the preference in the cookie and apply `data-theme` to
 * the document root immediately, without a reload (spec: "Choosing a theme").
 */
export function setTheme(theme: Theme): void {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  document.documentElement.setAttribute("data-theme", theme);
}
