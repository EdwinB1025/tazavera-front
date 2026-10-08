import { CoffeeshopDetailSidebarScreen } from "@/pages/coffeeshop-detail";

export default async function CoffeeshopDetailSidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/coffeeshops/[ulid]">) {
  const { locale } = await params;
  return <CoffeeshopDetailSidebarScreen locale={locale} searchParams={await searchParams} />;
}
