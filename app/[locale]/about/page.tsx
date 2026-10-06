import { AboutScreen } from "@/pages/about";

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  return <AboutScreen locale={locale} />;
}
