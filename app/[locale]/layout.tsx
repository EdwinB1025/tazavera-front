import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { AppShell } from "@/app/shell";
import { readTheme } from "@/shared/lib/theme";

export default async function LocaleLayout({
  children,
  sidebar,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  // The theme the root layout also resolves, for the header's theme switch
  // (refine-header-aut D3).
  const theme = readTheme((await headers()).get("cookie"));
  // The client side reads the active locale with `useLocale()`; texts stay
  // props, so no catalog is sent (adopt-next-intl-routing design.md D5).
  return (
    <NextIntlClientProvider messages={null}>
      <AppShell locale={locale} sidebar={sidebar} theme={theme}>
        {children}
      </AppShell>
    </NextIntlClientProvider>
  );
}
