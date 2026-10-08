import type { ReactNode } from "react";
import { LANDING_PAGE_SIZE } from "../api/offerings";
import { Offerings } from "./Offerings";
import type { OfferingListTexts } from "./OfferingList";

// ─── UI-specific types (declared before the component) ───

export type VerifiedOfferingsProps = {
  locale: string;
  page: number;
  texts: OfferingListTexts;
};

/**
 * The verified-offerings block (design.md D9; the D4 fetching rule places both
 * public reads on the server). It delegates to the query-driven `Offerings`
 * with `verified=1` and the requested page (add-offering-catalog design.md
 * D2): the same fetches, the same result mapping — the one error result for a
 * failure of either request — and landing's pagination address and grid.
 */
export function VerifiedOfferings({
  locale,
  page,
  texts,
}: VerifiedOfferingsProps): ReactNode {
  return (
    <Offerings
      locale={locale}
      query={{
        verified: "1",
        page: String(page),
        perPage: String(LANDING_PAGE_SIZE),
      }}
      texts={texts}
    />
  );
}
