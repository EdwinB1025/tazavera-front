import type { ReactNode } from "react";
import { fetchTaxonomies } from "@/entities/taxonomy";
import {
  OfferingsToolbar,
  appliedOfferingFilters,
  parseOfferingFilters,
  tasteNoteOptions,
  type OfferingFilterTexts,
} from "@/features/offering-facets";
import type { OfferingsQuery } from "../lib/query";

// ─── UI-specific types (declared before the component) ───

export type FilteredOfferingsToolbarProps = {
  /** The locale of the taste-note names the applied count resolves. */
  locale: string;
  /** The address query, parsed for the applied values and the sort. */
  searchParams: OfferingsQuery;
  texts: OfferingFilterTexts;
};

/**
 * The filtered offerings toolbar (extract-filtered-offerings design.md D2;
 * add-offering-facets design.md D8): a thin async composition that counts the
 * applied values with the same list as the sidebar's chips — the taxonomy
 * read settled, so a failure only leaves the taste notes uncounted — and
 * renders the toolbar.
 */
export async function FilteredOfferingsToolbar({
  locale,
  searchParams,
  texts,
}: FilteredOfferingsToolbarProps): Promise<ReactNode> {
  const [taxonomies] = await Promise.allSettled([fetchTaxonomies()]);
  const values = parseOfferingFilters(searchParams);
  const tasteNotes =
    taxonomies.status === "fulfilled" ? tasteNoteOptions(taxonomies.value.data, locale) : null;
  const count = appliedOfferingFilters(values, { tasteNotes, texts }).length;
  return <OfferingsToolbar count={count} sort={values.sort} texts={texts} />;
}
