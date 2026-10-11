import { InventoryDetailScreen } from "@/pages/inventory-detail";

export default async function InventoryDetailPage({
  params,
}: PageProps<"/[locale]/manage/inventory/[ulid]">) {
  const { locale, ulid } = await params;
  return <InventoryDetailScreen locale={locale} ulid={ulid} />;
}
