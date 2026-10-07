import { EvaluationScreen } from "@/pages/evaluation-form";

export default async function EvaluationPage({
  params,
}: PageProps<"/[locale]/manage/evaluations/[ulid]">) {
  const { locale, ulid } = await params;
  return <EvaluationScreen locale={locale} ulid={ulid} />;
}
