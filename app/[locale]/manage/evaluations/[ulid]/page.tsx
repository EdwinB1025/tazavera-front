import { EvaluationScreen } from "@/pages/evaluation-form";

export default async function EvaluationPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/evaluations/[ulid]">) {
  const { locale, ulid } = await params;
  const { mode } = await searchParams;
  return <EvaluationScreen locale={locale} ulid={ulid} viewOnly={mode === "view"} />;
}
