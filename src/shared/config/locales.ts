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
