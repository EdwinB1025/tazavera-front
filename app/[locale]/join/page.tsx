import { RegisterLandingScreen } from "@/pages/register";

export default async function JoinPage({
  params,
}: PageProps<"/[locale]/join">) {
  const { locale } = await params;
  return <RegisterLandingScreen locale={locale} />;
}
