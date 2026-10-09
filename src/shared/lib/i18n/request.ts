import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/shared/config/locales";

/**
 * next-intl v4 request configuration (design.md D10; adopt-next-intl-routing
 * design.md D4).
 *
 * Resolves the locale the middleware of `proxy.ts` forwards against the
 * supported locales; a missing or unsupported locale (`/callback`, which no
 * middleware routes) resolves to the default. It loads no catalogs: screens
 * read an area's catalog through `./messages` and pass the texts down as
 * props, and components never call the translation API.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  return {
    locale: hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale,
  };
});
