import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/shared/config/locales";
import { getCatalogs } from "./messages";

/**
 * next-intl v4 request configuration (design.md D10).
 *
 * Resolves the locale of the request against the supported locales and loads
 * its catalogs; a locale the application does not support resolves to the
 * default. Components never call the translation API: screens read an area's
 * catalog through `./messages` and pass the texts down as props.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested != null && isSupportedLocale(requested)
      ? requested
      : DEFAULT_LOCALE;
  return {
    locale,
    messages: getCatalogs(locale),
  };
});
