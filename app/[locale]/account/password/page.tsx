import { AccountPasswordScreen } from "@/pages/account";

export default async function AccountPasswordPage({
  params,
}: PageProps<"/[locale]/account/password">) {
  const { locale } = await params;
  return <AccountPasswordScreen locale={locale} />;
}
