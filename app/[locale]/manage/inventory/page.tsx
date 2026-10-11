import { ManageInventoryScreen } from "@/pages/manage-inventory";

export default async function ManageInventoryPage({
  params,
}: PageProps<"/[locale]/manage/inventory">) {
  const { locale } = await params;
  return <ManageInventoryScreen locale={locale} />;
}
