import { ManageLocationsSidebarEntries } from "@/pages/manage-locations";

export default async function ManageLocationsSidebarPage({
  params,
}: PageProps<"/[locale]/manage/locations">) {
  const { locale } = await params;
  return <ManageLocationsSidebarEntries locale={locale} />;
}
