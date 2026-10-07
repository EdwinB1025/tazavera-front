import type { ReactNode } from "react";
import { fetchCoffees } from "@/shared/api";
import { fetchTaxonomies } from "@/entities/taxonomy";
import {
  OfferingFacets,
  offeringFacetOptions,
  parseOfferingFilters,
  type OfferingFilterTexts,
} from "@/features/offering-facets";
import type { OfferingsQuery } from "../lib/query";

// ─── UI-specific types (declared before the component) ───

export type FilteredOfferingsFacetsProps = {
  /** The locale of the option names. */
  locale: string;
  /** The address query; the facets show its values. */
  searchParams: OfferingsQuery;
  texts: OfferingFilterTexts;
};

/**
 * The filtered offerings facets (extract-filtered-offerings design.md D4;
 * add-offering-facets design.md D7): a thin async composition that reads the
 * coffees and the taxonomies settled, so one failure disables only the facets
 * it feeds, and renders the facet panel.
 */
export async function FilteredOfferingsFacets({
  locale,
  searchParams,
  texts,
}: FilteredOfferingsFacetsProps): Promise<ReactNode> {
  const [coffees, taxonomies] = await Promise.allSettled([fetchCoffees(), fetchTaxonomies()]);
  return (
    <OfferingFacets
      values={parseOfferingFilters(searchParams)}
      options={offeringFacetOptions(coffees, taxonomies, locale)}
      texts={texts}
    />
  );
}
