import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { ListScreen } from "@/pages/public-evaluations";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/evaluations">): Promise<Metadata> {
  const { locale } = await params;
  return { description: getMessages("public-evaluations", locale).metaDescription };
}

export default async function PublicEvaluationsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/evaluations">) {
  const { locale } = await params;
  return <ListScreen locale={locale} searchParams={await searchParams} />;
}
