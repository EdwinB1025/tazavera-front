/**
 * The locale of the page for the auth flows (adopt-next-intl-routing
 * design.md D7). `useSession()` records the locale `useLocale()` reads under
 * the provider; the authorization request's `lang` and the sign-out landing
 * read it here, so a flow started outside React (the API client's
 * `onUnrecoverable` seam) reads the same value. Until a locale is recorded
 * the default locale applies.
 */
import type { Locale } from "next-intl";
import { routing } from "@/shared/config/locales";

let recorded: Locale | null = null;

/** Records the locale of the page; `useSession()` calls it on every render. */
export function recordLocale(locale: Locale): void {
  recorded = locale;
}

/** The recorded locale of the page, or the default locale. */
export function activeLocale(): Locale {
  return recorded ?? routing.defaultLocale;
}
