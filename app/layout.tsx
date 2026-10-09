import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { nunito, lora } from "@/app/fonts";
import { getMessages } from "@/shared/lib/i18n";
import { readTheme } from "@/shared/lib/theme";
import "@/app/styles/globals.css";

// Page metadata (design.md D13): the title is exactly `Tazavera` and the
// description is the metadata description text of the `landing` catalog of
// the route's locale (spec "Metadata by locale"), which `getLocale()` reads
// from the request (adopt-next-intl-routing design.md D3).
export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return {
    title: "Tazavera",
    description: getMessages("landing", lang).metaDescription,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const requestHeaders = await headers();
  // The route's locale, which the next-intl middleware of `proxy.ts` resolves
  // and `getLocale()` reads; `es` on `/callback`, which no middleware routes
  // (adopt-next-intl-routing design.md D3). The theme preference cookie is
  // read on the server, so the page renders in the right theme with no flash
  // and with no inline script (design.md D12).
  const lang = await getLocale();
  const dataTheme = readTheme(requestHeaders.get("cookie"));

  return (
    <html
      lang={lang}
      data-theme={dataTheme}
      className={`${nunito.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
