import { ManageInventoryScreen } from "@/pages/manage-inventory";

export default async function ManageInventoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/inventory">) {
  const { locale } = await params;
  return <ManageInventoryScreen locale={locale} searchParams={await searchParams} />;
}
