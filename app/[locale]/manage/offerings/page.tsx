import { ManageOfferingsScreen } from "@/pages/manage-offerings";

export default async function ManageOfferingsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/offerings">) {
  const { locale } = await params;
  const { page } = await searchParams;
  return <ManageOfferingsScreen locale={locale} page={page} />;
}
