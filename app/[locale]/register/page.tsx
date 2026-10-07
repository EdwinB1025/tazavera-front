import { RegisterScreen } from "@/pages/register";

export default async function RegisterPage({
  params,
}: PageProps<"/[locale]/register">) {
  const { locale } = await params;
  return <RegisterScreen locale={locale} role="specialist" />;
}
