import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { OfferingsScreen } from "@/pages/offerings";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/offerings">): Promise<Metadata> {
  const { locale } = await params;
  return { description: getMessages("catalog", locale).metaDescription };
}

export default async function OfferingsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/offerings">) {
  const { locale } = await params;
  return <OfferingsScreen locale={locale} searchParams={await searchParams} />;
}
