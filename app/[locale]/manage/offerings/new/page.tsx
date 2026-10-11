import { NewOfferingScreen } from "@/pages/new-offering";

export default async function NewOfferingPage({
  params,
  searchParams,
}: PageProps<"/[locale]/manage/offerings/new">) {
  const { locale } = await params;
  const { inventory } = await searchParams;
  return (
    <NewOfferingScreen
      locale={locale}
      inventory={Array.isArray(inventory) ? inventory[0] : inventory}
    />
  );
}
