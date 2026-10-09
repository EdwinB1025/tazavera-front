import { getLocale } from "next-intl/server";
import { NotFoundScreen } from "@/pages/not-found";

// Not-found boundary of the locale segment (design.md D2). `not-found.js`
// receives no props, so the locale comes from `getLocale()`, as in the root
// layout (adopt-next-intl-routing design.md D3).
export default async function LocaleNotFound() {
  const locale = await getLocale();
  return <NotFoundScreen locale={locale} />;
}
