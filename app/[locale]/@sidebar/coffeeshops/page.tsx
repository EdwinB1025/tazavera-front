import { CoffeeshopsSidebarScreen } from "@/pages/coffeeshops";

export default async function CoffeeshopsSidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/coffeeshops">) {
  const { locale } = await params;
  return <CoffeeshopsSidebarScreen locale={locale} searchParams={await searchParams} />;
}
