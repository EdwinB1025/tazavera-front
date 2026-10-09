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
 * session state, with the list's entry holding the coffee shop facets in its
 * collapsible sub-section (collapse-sidebar-filters).
 */
export function CoffeeshopsSidebarScreen({ locale, searchParams }: CoffeeshopsSidebarScreenProps): ReactNode {
  const filters = getMessages("filters", locale);
  return (
    <AppSidebar
      listEntry={{
        label: getMessages("shell", locale).exploreCoffeeshops ?? "",
        href: `/${locale}/coffeeshops`,
      }}
      subsection={{
        title: filters.title ?? "",
        content: (
          <CoffeeshopFacets
            values={parseCoffeeshopFilters(searchParams)}
            texts={coffeeshopFacetsTexts(getMessages("coffeeshops", locale), filters)}
          />
        ),
      }}
    />
  );
}
