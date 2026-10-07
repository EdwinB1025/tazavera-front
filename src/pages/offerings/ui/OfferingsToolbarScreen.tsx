import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { fetchTaxonomies } from "@/entities/taxonomy";
import {
  OfferingsToolbar,
  appliedOfferingFilters,
  offeringFacetsTexts,
  parseOfferingFilters,
  tasteNoteOptions,
} from "@/features/offering-facets";

// ─── UI-specific types (declared before the component) ───

export type OfferingsToolbarScreenProps = {
  locale: string;
  searchParams: QueryRecord;
};

/**
 * The catalog's toolbar (add-offering-facets design.md D8): a thin async
 * composition that counts the applied values with the same list as the
 * sidebar's chips — the taxonomy read settled, so a failure only leaves the
 * taste notes uncounted — and renders the toolbar.
 */
export async function OfferingsToolbarScreen({
  locale,
  searchParams,
}: OfferingsToolbarScreenProps): Promise<ReactNode> {
  const [taxonomies] = await Promise.allSettled([fetchTaxonomies()]);
  const texts = offeringFacetsTexts(getMessages("filters", locale));
  const values = parseOfferingFilters(searchParams);
  const tasteNotes =
    taxonomies.status === "fulfilled" ? tasteNoteOptions(taxonomies.value.data, locale) : null;
  const count = appliedOfferingFilters(values, { tasteNotes, texts }).length;
  return <OfferingsToolbar count={count} sort={values.sort} texts={texts} />;
}
