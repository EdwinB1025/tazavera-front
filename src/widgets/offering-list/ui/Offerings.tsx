import type { ReactNode } from "react";
import {
  buildTasteNoteTree,
  buildTaxonomyLookup,
  fetchTaxonomies,
} from "@/entities/taxonomy";
import { fetchOfferings } from "../api/offerings";
import type { OfferingsQuery } from "../lib/query";
import { OfferingList } from "./OfferingList";
import type {
  OfferingListItem,
  OfferingListResult,
  OfferingListTexts,
} from "./OfferingList";

// ─── UI-specific types (declared before the component) ───

export type OfferingsProps = {
  locale: string;
  /** The kept query the request carries (add-offering-catalog design.md D1). */
  query: OfferingsQuery;
  texts: OfferingListTexts;
  /**
   * The pagination's address. When passed, the pagination keeps `query` and
   * replaces only `page`; omitted, the list pages at landing's `/${locale}`.
   */
  path?: string;
  /** Keys added to the pagination's query only, never to the request (add-coffeeshop-directory design.md D17). */
  paginationQuery?: OfferingsQuery;
  /** Replaces the grid classes; landing's grid by default. */
  gridClassName?: string;
  /** Rendered below the empty message (add-offering-facets design.md D9). */
  emptyAction?: ReactNode;
};

/**
 * The offerings block for a query as a thin async Server Component
 * (add-offering-catalog design.md D2, D8). It holds only the two fetches and
 * the result mapping — success with the resolved taxonomy badges per item,
 * empty on a page without offerings, and the one error result for a failure of
 * either request — and delegates every branch to the sync presentation.
 */
export async function Offerings({
  locale,
  query,
  texts,
  path,
  paginationQuery,
  gridClassName,
  emptyAction,
}: OfferingsProps): Promise<ReactNode> {
  let result: OfferingListResult;
  try {
    const offerings = await fetchOfferings(query);
    const taxonomies = await fetchTaxonomies();
    const lookup = buildTaxonomyLookup(taxonomies.data, locale);
    const items: OfferingListItem[] = offerings.data.map((offering) => ({
      offering,
      taxonomies: buildTasteNoteTree(offering, lookup),
    }));
    result =
      items.length === 0
        ? { state: "empty" }
        : { state: "success", items, meta: offerings.meta };
  } catch {
    result = { state: "error" };
  }

  return (
    <OfferingList
      result={result}
      locale={locale}
      texts={texts}
      path={path}
      query={path === undefined ? undefined : { ...query, ...paginationQuery }}
      gridClassName={gridClassName}
      emptyAction={emptyAction}
    />
  );
}
