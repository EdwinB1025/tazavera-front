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
