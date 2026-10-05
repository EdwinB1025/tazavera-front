import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { fetchTaxonomies, fetchVerifiedOfferings } from "../api/offerings";
import {
  buildTaxonomyLookup,
  resolveTaxonomies,
} from "../lib/resolve-taxonomies";
import { OfferingList } from "./OfferingList";
import type {
  OfferingListItem,
  OfferingListResult,
  OfferingListTexts,
} from "./OfferingList";

// ─── UI-specific types (declared before the component) ───

export type VerifiedOfferingsProps = {
  locale: string;
  page: number;
  session: Session;
  texts: OfferingListTexts;
};

/**
 * The verified-offerings block as a thin async Server Component (design.md D9;
 * the D4 fetching rule places both public reads on the server). It holds only
 * the two fetches and the result mapping — success with the resolved taxonomy
 * badges per item, empty on a page without offerings, and the one error result
 * for a failure of either request (design.md D4) — and delegates every branch
 * to the sync presentation component, so it stays free of rendering logic (the
 * testing rule: async Server Components are untestable in Vitest).
 */
export async function VerifiedOfferings({
  locale,
  page,
  session,
  texts,
}: VerifiedOfferingsProps): Promise<ReactNode> {
  let result: OfferingListResult;
  try {
    const offerings = await fetchVerifiedOfferings(page);
    const taxonomies = await fetchTaxonomies();
    const lookup = buildTaxonomyLookup(taxonomies.data, locale);
    const items: OfferingListItem[] = offerings.data.map((offering) => ({
      offering,
      taxonomies: resolveTaxonomies(offering.sensoryTaxonomy ?? [], lookup),
    }));
    result =
      items.length === 0
        ? { state: "empty" }
        : { state: "success", items, meta: offerings.meta };
  } catch {
    result = { state: "error" };
  }

  return (
    <OfferingList result={result} locale={locale} session={session} texts={texts} />
  );
}
