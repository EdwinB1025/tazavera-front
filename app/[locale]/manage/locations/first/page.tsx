import { FirstLocationScreen } from "@/pages/manage-locations";

export default async function FirstLocationPage({
  params,
}: PageProps<"/[locale]/manage/locations/first">) {
  const { locale } = await params;
  return <FirstLocationScreen locale={locale} />;
}
