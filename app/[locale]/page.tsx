import { HomeScreen } from "@/pages/home";

export default async function LocalePage({
  params,
  searchParams,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  const { page } = await searchParams;
  return <HomeScreen locale={locale} page={page} />;
}
