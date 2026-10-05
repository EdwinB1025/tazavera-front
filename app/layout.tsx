import type { Metadata } from "next";
import { headers } from "next/headers";
import { nunito, lora } from "@/app/fonts";
import { DEFAULT_LOCALE } from "@/shared/config/locales";
import { getMessages } from "@/shared/lib/i18n";
import { readTheme } from "@/shared/lib/theme";
import "@/app/styles/globals.css";

// Page metadata (design.md D13): the title is exactly `Tazavera` and the
// description is the metadata description text of the `landing` catalog of
// the route's locale (spec "Metadata by locale"), which arrives on the
// request from `proxy.ts` as `x-locale`.
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const lang = requestHeaders.get("x-locale") ?? DEFAULT_LOCALE;
  return {
    title: "Tazavera",
    description: getMessages("landing", lang).metaDescription,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const requestHeaders = await headers();
  // The route's locale arrives on the request from `proxy.ts`, which routes
  // on it (design.md D2). The theme preference cookie is read on the server,
  // so the page renders in the right theme with no flash and with no inline
  // script (design.md D12).
  const lang = requestHeaders.get("x-locale") ?? DEFAULT_LOCALE;
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
