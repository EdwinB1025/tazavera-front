import { NewEvaluationScreen } from "@/pages/evaluation-form";

export default async function NewEvaluationPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/evaluations/new">) {
  const { locale } = await params;
  const { offering } = await searchParams;
  return <NewEvaluationScreen locale={locale} offering={offering} />;
}
