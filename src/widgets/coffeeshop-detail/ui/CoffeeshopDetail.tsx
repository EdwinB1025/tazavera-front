import type { ReactNode } from "react";
import { fetchCoffeeshop } from "@/entities/coffeeshop";
import type { CoffeeshopTab } from "../lib/tab";
import { CoffeeshopDetailContent } from "./CoffeeshopDetailContent";
import type { CoffeeshopDetailTexts } from "./texts";

export type CoffeeshopDetailProps = {
  locale: string;
  ulid: string;
  tab: CoffeeshopTab;
  /** The Ofertas panel, composed by the page (design.md D10). */
  offerings?: ReactNode;
  texts: CoffeeshopDetailTexts;
};

/**
 * The coffee shop detail block as a thin async Server Component
 * (add-coffeeshop-directory design.md D8): the one public read, mapped into
 * success or the one error result, and the sync presentation.
 */
export async function CoffeeshopDetail({
  locale,
  ulid,
  tab,
  offerings,
  texts,
}: CoffeeshopDetailProps): Promise<ReactNode> {
  const read = await fetchCoffeeshop(ulid);
  return (
    <CoffeeshopDetailContent
      result={read.status === "found" ? { state: "success", coffeeshop: read.coffeeshop } : { state: "error" }}
      locale={locale}
      ulid={ulid}
      tab={tab}
      offerings={offerings}
      texts={texts}
    />
  );
}
