import type { ReactNode } from "react";
import type { CoffeeshopDetail } from "@/shared/api";
import { Badge } from "@/shared/ui";
import type { CoffeeshopDetailTexts } from "./texts";

export type CoffeeshopHeaderProps = {
  coffeeshop: CoffeeshopDetail;
  texts: CoffeeshopDetailTexts;
};

const COUNTS_SEPARATOR = " · ";
const HEADER_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");

function withCount(text: string, count: number | undefined): string {
  return text.replace("{count}", String(count ?? 0));
}

/**
 * The detail's header (add-coffeeshop-directory design.md D8; spec "Coffee
 * shop detail page" — "Header"): the verified badge when it has a verified
 * offering, the name as the page heading and the two captions.
 */
export function CoffeeshopHeader({ coffeeshop, texts }: CoffeeshopHeaderProps): ReactNode {
  const counts = [
    withCount(texts.offeringsCount, coffeeshop.offeringsCount),
    withCount(texts.verifiedCount, coffeeshop.verifiedOfferingsCount),
  ].join(COUNTS_SEPARATOR);
  return (
    <div className={HEADER_CLASSES}>
      {(coffeeshop.verifiedOfferingsCount ?? 0) > 0 ? (
        <Badge variant="verified">{texts.verifiedBadge}</Badge>
      ) : null}
      <h1 className="type-heading">{coffeeshop.name}</h1>
      <p className="type-label">{withCount(texts.locationsCount, coffeeshop.locationsCount)}</p>
      <p className="type-label">{counts}</p>
    </div>
  );
}
