import { ManageOfferingsSidebarEntries } from "@/pages/manage-offerings";

export default async function ManageOfferingsSidebarPage({
  params,
}: PageProps<"/[locale]/manage/offerings">) {
  const { locale } = await params;
  return <ManageOfferingsSidebarEntries locale={locale} />;
}
