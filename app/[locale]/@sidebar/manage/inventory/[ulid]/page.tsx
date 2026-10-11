import { ManageInventorySidebarScreen } from "@/pages/manage-inventory";

export default async function InventoryDetailSidebarPage({
  params,
}: PageProps<"/[locale]/manage/inventory/[ulid]">) {
  const { locale } = await params;
  return <ManageInventorySidebarScreen locale={locale} />;
}
