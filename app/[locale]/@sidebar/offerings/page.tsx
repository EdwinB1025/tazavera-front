import { OfferingsSidebarScreen } from "@/pages/offerings-sidebar";

export default async function OfferingsSidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/offerings">) {
  const { locale } = await params;
  return <OfferingsSidebarScreen locale={locale} searchParams={await searchParams} />;
}
