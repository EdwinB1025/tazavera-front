import { headers } from "next/headers";
import { NotFoundScreen } from "@/pages/not-found";
import { DEFAULT_LOCALE } from "@/shared/config/locales";

// Not-found boundary of the locale segment (design.md D2). `not-found.js`
// receives no props, so the locale comes from the `x-locale` request header
// that `proxy.ts` sets, as in the root layout.
export default async function LocaleNotFound() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-locale") ?? DEFAULT_LOCALE;
  return <NotFoundScreen locale={locale} />;
}
