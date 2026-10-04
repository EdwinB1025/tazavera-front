import { AppShell } from "@/app/shell";

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  return <AppShell locale={locale}>{children}</AppShell>;
}
