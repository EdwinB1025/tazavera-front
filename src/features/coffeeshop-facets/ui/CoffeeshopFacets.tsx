"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import { FacetPanel, FacetRadioList, FacetTextField } from "@/shared/ui";
import { appliedCoffeeshopFilters } from "../model/applied";
import { COFFEESHOP_CLEAR_KEEP, type CoffeeshopFilterValues } from "../model/query";
import type { CoffeeshopFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type CoffeeshopFacetsProps = {
  values: CoffeeshopFilterValues;
  texts: CoffeeshopFilterTexts;
};

/**
 * The coffee shop facet panel (add-coffeeshop-directory design.md D5; spec
 * "Coffee shop facets in the sidebar"): Name, Postal code, City and Verified
 * offerings inside the shared facet panel, each writing its key on commit;
 * the chips remove one key and "Clear all" keeps the sort and the view.
 */
export function CoffeeshopFacets({ values, texts }: CoffeeshopFacetsProps): ReactNode {
  const { navigate, navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const applied = appliedCoffeeshopFilters(values, texts);

  return (
    <FacetPanel
      title={texts.title}
      applied={applied}
      onRemove={(id) => {
        const entry = applied.find((filter) => filter.id === id);
        if (entry) navigate(entry.remove);
      }}
      onClearAll={() =>
        navigateTo(
          clearFiltersHref(
            pathname ?? "",
            new URLSearchParams(searchParams?.toString()),
            COFFEESHOP_CLEAR_KEEP,
          ),
        )
      }
      texts={{ clearAll: texts.clearAll, removeFilter: texts.removeFilter }}
    >
      <FacetTextField
        label={texts.nameFacet}
        type="search"
        maxLength={150}
        value={values.name ?? ""}
        onCommit={(value) => navigate({ name: value })}
      />
      <FacetTextField
        label={texts.postalCodeFacet}
        maxLength={12}
        help={texts.postalCodeHelp}
        value={values.postalCode ?? ""}
        onCommit={(value) => navigate({ postalCode: value })}
      />
      <FacetTextField
        label={texts.cityFacet}
        maxLength={90}
        value={values.city ?? ""}
        onCommit={(value) => navigate({ city: value })}
      />
      <FacetRadioList
        legend={texts.verifiedFacet}
        options={[{ value: "1", label: texts.verifiedOption }]}
        value={values.verified}
        onChange={(value) => navigate({ verified: value })}
        anyLabel={texts.any}
        texts={{ seeMore: texts.seeMore, seeLess: texts.seeLess }}
      />
    </FacetPanel>
  );
}
