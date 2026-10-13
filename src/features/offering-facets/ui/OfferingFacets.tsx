"use client";

import type { ReactNode } from "react";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import {
  asComboboxValue,
  asOptions,
  comboboxTexts,
  FacetPanel,
  FacetTextField,
  PaddedCombobox,
} from "@/shared/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { searchCoffees } from "@/entities/coffee";
import { searchRoasteries } from "../api/search-roasteries";
import { appliedOfferingFilters } from "../model/applied";
import type { OfferingFacetOptions } from "../model/options";
import type { OfferingFilterValues } from "../model/query";
import type { OfferingFilterTexts } from "../model/texts";
import {
  OfferingListFacets,
  OfferingScoreFacet,
  OfferingTasteNotesFacet,
  OfferingVerificationFacet,
} from "./OfferingFacetParts";

// ─── UI-specific types (declared before the component) ───

export type OfferingFacetsProps = {
  values: OfferingFilterValues;
  options: OfferingFacetOptions;
  /** `loading` is the comboboxes' loading text (lazy-load-facet-controls design.md D3). */
  texts: OfferingFilterTexts & { loading?: string };
};

/** The sort keys "Clear all" keeps (design.md D5). */
export const OFFERING_SORT_KEYS = ["orderBy", "orderDirection"] as const;

/**
 * The offering facet panel (design.md D7; spec "Offering facets in the
 * sidebar"): the eleven facets in the spec order inside the shared facet
 * panel, each writing its query key on commit. A facet whose options failed
 * renders disabled with "Options unavailable". Coffee and Roastery are the
 * same search-as-you-type combobox (search-coffee-facet design.md D4). The
 * comboboxes load on the sub-section's first opening
 * (lazy-load-facet-controls design.md D1). Its facets and helpers render
 * from `OfferingFacetParts` (split-oversized-facets design.md D6).
 */
export function OfferingFacets({ values, options, texts }: OfferingFacetsProps): ReactNode {
  const { navigate, navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applied = appliedOfferingFilters(values, { tasteNotes: options.tasteNotes, texts });
  const loaderTexts = comboboxTexts(texts);
  const facet = { values, texts, navigate };

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
            OFFERING_SORT_KEYS,
          ),
        )
      }
      texts={{ clearAll: texts.clearAll, removeFilter: texts.removeFilter }}
    >
      <PaddedCombobox
        label={texts.coffeeName}
        variant="inverse"
        search={searchCoffees}
        value={asComboboxValue(values.coffeeName)}
        onChange={(option) => navigate({ coffeeName: option?.value })}
        texts={loaderTexts}
        maxLength={150}
        placeholder={texts.coffeeNamePlaceholder}
      />
      <OfferingVerificationFacet {...facet} />
      <OfferingScoreFacet {...facet} />
      <OfferingTasteNotesFacet {...facet} tasteNotes={options.tasteNotes} />
      <OfferingListFacets {...facet} options={options} />
      <PaddedCombobox
        label={texts.producer}
        variant="inverse"
        options={asOptions(options.producers)}
        value={asComboboxValue(values.producer)}
        onChange={(option) => navigate({ producer: option?.value })}
        texts={loaderTexts}
        maxLength={150}
        help={options.producers === null ? texts.optionsUnavailable : undefined}
        disabled={options.producers === null}
      />
      <PaddedCombobox
        label={texts.roastery}
        variant="inverse"
        search={searchRoasteries}
        value={asComboboxValue(values.roasteryName)}
        onChange={(option) => navigate({ roasteryName: option?.value })}
        texts={loaderTexts}
        maxLength={150}
      />
      <FacetTextField
        label={texts.city}
        maxLength={90}
        help={texts.cityHelp}
        value={values.city ?? ""}
        onCommit={(value) => navigate({ city: value })}
      />
    </FacetPanel>
  );
}
