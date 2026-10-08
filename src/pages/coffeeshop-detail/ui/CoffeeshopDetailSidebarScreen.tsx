import type { ReactNode } from "react";
import { getMessages } from "@/shared/lib/i18n";
import type { QueryRecord } from "@/shared/lib/filter-query";
import { offeringFacetsTexts } from "@/features/offering-facets";
import { AppSidebar } from "@/widgets/app-sidebar";
import { toCoffeeshopTab } from "@/widgets/coffeeshop-detail";
import { FilteredOfferingsFacets } from "@/widgets/offering-list";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopDetailSidebarScreenProps = {
  locale: string;
  /** The route's search params: `tab` and the offering keys the facets show. */
  searchParams: QueryRecord;
};

/**
 * The detail's slot screen (add-coffeeshop-directory design.md D9; app-shell
 * spec "Shown on the coffee shop Offerings tab"): the sidebar with the
 * offering facets on the Ofertas tab, and no sidebar on Ubicaciones.
 */
export function CoffeeshopDetailSidebarScreen({
  locale,
  searchParams,
}: CoffeeshopDetailSidebarScreenProps): ReactNode {
  if (toCoffeeshopTab(searchParams.tab) !== "offerings") return null;
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
