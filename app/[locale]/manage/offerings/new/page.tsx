import { NewOfferingScreen } from "@/pages/new-offering";

export default async function NewOfferingPage({
  params,
}: PageProps<"/[locale]/manage/offerings/new">) {
  const { locale } = await params;
  return <NewOfferingScreen locale={locale} />;
}
