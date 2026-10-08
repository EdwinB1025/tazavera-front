import { RegisterScreen } from "@/pages/register";

export default async function RegisterCoffeeshopPage({
  params,
}: PageProps<"/[locale]/register/coffeeshop">) {
  const { locale } = await params;
  return <RegisterScreen locale={locale} role="coffeeshop" />;
}
