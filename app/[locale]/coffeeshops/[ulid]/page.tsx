import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { CoffeeshopDetailScreen } from "@/pages/coffeeshop-detail";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/coffeeshops/[ulid]">): Promise<Metadata> {
  const { locale } = await params;
  return { description: getMessages("coffeeshops", locale).metaDescription };
}

export default async function CoffeeshopDetailPage({
  params,
  searchParams,
}: PageProps<"/[locale]/coffeeshops/[ulid]">) {
  const { locale, ulid } = await params;
  return <CoffeeshopDetailScreen locale={locale} ulid={ulid} searchParams={await searchParams} />;
}
