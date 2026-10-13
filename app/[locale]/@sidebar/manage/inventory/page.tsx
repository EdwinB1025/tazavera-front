import { ManageInventorySidebarScreen } from "@/pages/manage-inventory";

export default async function ManageInventorySidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/inventory">) {
  const { locale } = await params;
  return <ManageInventorySidebarScreen locale={locale} searchParams={await searchParams} />;
}
