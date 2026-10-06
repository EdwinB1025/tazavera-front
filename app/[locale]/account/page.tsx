import { AccountScreen } from "@/pages/account";

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  return <AccountScreen locale={locale} />;
}
