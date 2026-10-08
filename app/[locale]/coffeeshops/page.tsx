import type { Metadata } from "next";
import { getMessages } from "@/shared/lib/i18n";
import { CoffeeshopsScreen } from "@/pages/coffeeshops";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/coffeeshops">): Promise<Metadata> {
  const { locale } = await params;
  return { description: getMessages("coffeeshops", locale).metaDescription };
}

export default async function CoffeeshopsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/coffeeshops">) {
  const { locale } = await params;
  return <CoffeeshopsScreen locale={locale} searchParams={await searchParams} />;
}
