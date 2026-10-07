import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { CoffeeshopFacets, coffeeshopFacetsTexts, parseCoffeeshopFilters } from "@/features/coffeeshop-facets";
import { AppSidebar } from "@/widgets/app-sidebar";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopsSidebarScreenProps = {
  locale: string;
  /** The route's search params; the facets show their values. */
  searchParams: QueryRecord;
};

/**
 * The directory's slot screen (add-coffeeshop-directory design.md D9;
 * app-shell spec "Shown on the coffee shop directory"): the sidebar for every
 * session state, with no navigation entries, holding the coffee shop facets.
 */
export function CoffeeshopsSidebarScreen({ locale, searchParams }: CoffeeshopsSidebarScreenProps): ReactNode {
  return (
    <AppSidebar>
      <CoffeeshopFacets
        values={parseCoffeeshopFilters(searchParams)}
        texts={coffeeshopFacetsTexts(getMessages("coffeeshops", locale), getMessages("filters", locale))}
      />
    </AppSidebar>
  );
}
