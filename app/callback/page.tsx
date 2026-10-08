import { CallbackScreen } from "@/pages/callback";

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <CallbackScreen searchParams={await searchParams} />;
}
