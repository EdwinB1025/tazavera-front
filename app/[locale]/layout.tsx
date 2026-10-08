import { AppShell } from "@/app/shell";

export default async function LocaleLayout({
  children,
  sidebar,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  return (
    <AppShell locale={locale} sidebar={sidebar}>
      {children}
    </AppShell>
  );
}
