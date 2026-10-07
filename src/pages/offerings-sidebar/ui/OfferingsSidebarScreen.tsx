import type { ReactNode } from "react";
import { fetchCoffees } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { fetchTaxonomies } from "@/entities/taxonomy";
import {
  offeringFacetOptions,
  offeringFacetsTexts,
  parseOfferingFilters,
} from "@/features/offering-facets";
import { OfferingsSidebar } from "./OfferingsSidebar";

// ─── UI-specific types (declared before the component) ───

export type OfferingsSidebarScreenProps = {
  locale: string;
  /** The route's search params; the facets show their values. */
  searchParams: QueryRecord;
};

/**
 * The offerings slot screen (add-offering-facets design.md D7): a thin async
 * composition that reads the `filters` texts and the settled coffees and
 * taxonomy reads, so one failure disables only the facets it feeds, and
 * renders the sidebar with the facets.
 */
export async function OfferingsSidebarScreen({
  locale,
  searchParams,
}: OfferingsSidebarScreenProps): Promise<ReactNode> {
  const [coffees, taxonomies] = await Promise.allSettled([fetchCoffees(), fetchTaxonomies()]);
  return (
    <OfferingsSidebar
      values={parseOfferingFilters(searchParams)}
      options={offeringFacetOptions(coffees, taxonomies, locale)}
      texts={offeringFacetsTexts(getMessages("filters", locale))}
    />
  );
}
