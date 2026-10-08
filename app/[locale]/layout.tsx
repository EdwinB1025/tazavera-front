import { headers } from "next/headers";
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
  return (
    <AppShell locale={locale} sidebar={sidebar} theme={theme}>
      {children}
    </AppShell>
  );
}
