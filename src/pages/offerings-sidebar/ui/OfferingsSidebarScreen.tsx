import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { offeringFacetsTexts } from "@/features/offering-facets";
import { AppSidebar } from "@/widgets/app-sidebar";
import { FilteredOfferingsFacets } from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type OfferingsSidebarScreenProps = {
  locale: string;
  /** The route's search params; the facets show their values. */
  searchParams: QueryRecord;
};

/**
 * The offerings slot screen (add-sidebar-slot design.md D9;
 * extract-filtered-offerings design.md D5): the sidebar frame for every
 * session state, with no navigation entries, holding the filtered offerings
 * facets with the `filters` texts of the route's locale.
 */
export function OfferingsSidebarScreen({
  locale,
  searchParams,
}: OfferingsSidebarScreenProps): ReactNode {
  return (
    <AppSidebar>
      <FilteredOfferingsFacets
        locale={locale}
        searchParams={searchParams}
        texts={offeringFacetsTexts(getMessages("filters", locale))}
      />
    </AppSidebar>
  );
}
