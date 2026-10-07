import { EvaluationsListScreen } from "@/pages/evaluations-list";

export default async function EvaluationsListPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/evaluations">) {
  const { locale } = await params;
  return <EvaluationsListScreen locale={locale} searchParams={await searchParams} />;
}
