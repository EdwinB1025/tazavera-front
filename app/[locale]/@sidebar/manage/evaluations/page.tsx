import { EvaluationsSidebarScreen } from "@/pages/evaluations-list";

export default async function EvaluationsSidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/evaluations">) {
  const { locale } = await params;
  return <EvaluationsSidebarScreen locale={locale} searchParams={await searchParams} />;
}
