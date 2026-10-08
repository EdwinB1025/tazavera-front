import type { Metadata } from "next";
import { ViewScreen, viewMetadata } from "@/pages/public-evaluation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/evaluations/[ulid]">): Promise<Metadata> {
  const { locale } = await params;
  return viewMetadata(locale);
}

export default async function PublicEvaluationPage({
  params,
}: PageProps<"/[locale]/evaluations/[ulid]">) {
  const { locale, ulid } = await params;
  return <ViewScreen locale={locale} ulid={ulid} />;
}
