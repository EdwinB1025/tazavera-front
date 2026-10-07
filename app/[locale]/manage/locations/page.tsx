import { ManageLocationsScreen } from "@/pages/manage-locations";

export default async function ManageLocationsPage({
  params,
}: PageProps<"/[locale]/manage/locations">) {
  const { locale } = await params;
  return <ManageLocationsScreen locale={locale} />;
}
