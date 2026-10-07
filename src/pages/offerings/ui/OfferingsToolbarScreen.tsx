import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { offeringFacetsTexts } from "@/features/offering-facets";
import { FilteredOfferingsToolbar } from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type OfferingsToolbarScreenProps = {
  locale: string;
  searchParams: QueryRecord;
};

/**
 * The catalog's toolbar (add-offering-facets design.md D8;
 * extract-filtered-offerings design.md D5): a thin caller that loads the
 * `filters` texts of the route's locale and renders the filtered offerings
 * toolbar.
 */
export function OfferingsToolbarScreen({
  locale,
  searchParams,
}: OfferingsToolbarScreenProps): ReactNode {
  return (
    <FilteredOfferingsToolbar
      locale={locale}
      searchParams={searchParams}
      texts={offeringFacetsTexts(getMessages("filters", locale))}
    />
  );
}
