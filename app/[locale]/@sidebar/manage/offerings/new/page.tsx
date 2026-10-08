import { NewOfferingSidebarEntries } from "@/pages/new-offering";

export default async function NewOfferingSidebarPage({
  params,
}: PageProps<"/[locale]/manage/offerings/new">) {
  const { locale } = await params;
  return <NewOfferingSidebarEntries locale={locale} />;
}
