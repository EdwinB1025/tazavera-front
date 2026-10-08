import { EvaluationsSidebar } from "@/pages/public-evaluations";

export default async function PublicEvaluationsSidebarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/evaluations">) {
  const { locale } = await params;
  return <EvaluationsSidebar locale={locale} searchParams={await searchParams} />;
}
