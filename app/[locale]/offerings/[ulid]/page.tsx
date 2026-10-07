import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { OfferingDetailScreen } from "@/pages/offering-detail";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/offerings/[ulid]">): Promise<Metadata> {
  const { locale } = await params;
  return { description: getMessages("catalog", locale).metaDescription };
}

export default async function OfferingDetailPage({
  params,
  searchParams,
}: PageProps<"/[locale]/offerings/[ulid]">) {
  const { locale, ulid } = await params;
  const { tab } = await searchParams;
  return <OfferingDetailScreen locale={locale} ulid={ulid} tab={tab} />;
}
