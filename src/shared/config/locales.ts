// Brings `next-intl` into the program so its `AppConfig` can be augmented below.
import type {} from "next-intl";
import { defineRouting } from "next-intl/routing";

/**
 * Locale routing of the application (adopt-next-intl-routing design.md D1):
 * every route carries a locale prefix, `es` is the default, and the locale is
 * never taken from the browser — no detection, no locale cookie — nor
 * announced with alternate links (app-shell "Locale routing", "Locale chosen
 * only by the user"). Client-safe: the proxy, the shell and the auth flow
 * import it.
 */
export const routing = defineRouting({
  locales: ["es", "en", "ca"],
  defaultLocale: "es",
  localePrefix: "always",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
  }
}

/**
 * Supported interface locales (design.md D2 and D11).
 *
 * Pure constants and a stateless guard, no runtime state: `proxy.ts` imports
 * this module to prefix bare paths and the shell reads it for the language
 * selector. `es` is the default; a URL whose prefix is not one of these
 * resolves to not-found (spec: "Unsupported locale").
 */

export const LOCALES = ["es", "en", "ca"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export function isSupportedLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The supported locale named by the first segment of a path, or `null`. */
export function localeFromPath(pathname: string): Locale | null {
  const segment = pathname.split("/")[1] ?? "";
  return isSupportedLocale(segment) ? segment : null;
}
