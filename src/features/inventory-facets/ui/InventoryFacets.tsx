"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { CoffeeInventoryQuery } from "@/shared/api";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import { searchCoffees } from "@/entities/coffee";
import {
  asComboboxValue,
  comboboxTexts,
  FacetPanel,
  FacetTextField,
  PaddedCombobox,
} from "@/shared/ui";
import { appliedInventoryFilters } from "../model/applied";
import type { InventoryFacetOptions } from "../model/options";
import { INVENTORY_LIMITS } from "../model/query";
import type { InventoryFilterTexts } from "../model/texts";
import { InventoryOriginFacets } from "./InventoryFacetParts";

// ─── UI-specific types (declared before the component) ───

export type InventoryFacetsProps = {
  values: CoffeeInventoryQuery;
  /** Country, Region and Process lists (select-inventory-origin-and-process design.md D2). */
  options: InventoryFacetOptions;
  /** `loading` is the combobox's loading text (suggest-inventory-coffee-names design.md D3). */
  texts: InventoryFilterTexts & { loading?: string };
};

/** The text facets after the list facets (select-inventory-origin-and-process design.md D3). */
const TEXT_KEYS = ["producer", "city"] as const;

/**
 * The inventory facet panel (add-coffee-inventory-explorer design.md D5;
 * specs "Inventory facets in the sidebar" and "Applied inventory filters"):
 * Coffee name as the coffee combobox of the offering facets
 * (suggest-inventory-coffee-names design.md D2), then Country, Region and
 * Process as single-choice facets and Producer and Roastery city as text
 * facets (select-inventory-origin-and-process design.md D3), inside the
 * shared facet panel; the chips remove one key and "Clear all" keeps no key.
 */
export function InventoryFacets({ values, options, texts }: InventoryFacetsProps): ReactNode {
  const { navigate, navigateTo } = useFilterNavigation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const applied = appliedInventoryFilters(values, texts);

  return (
    <FacetPanel
      title={texts.title}
      applied={applied}
      onRemove={(id) => {
        const entry = applied.find((filter) => filter.id === id);
        if (entry) navigate(entry.remove);
      }}
      onClearAll={() =>
        navigateTo(clearFiltersHref(pathname ?? "", new URLSearchParams(searchParams?.toString()), []))
      }
      texts={{ clearAll: texts.clearAll, removeFilter: texts.removeFilter }}
    >
      <PaddedCombobox
        label={texts.coffeeName}
        variant="inverse"
        search={searchCoffees}
        value={asComboboxValue(values.coffeeName ?? undefined)}
        onChange={(option) => navigate({ coffeeName: option?.value })}
        texts={comboboxTexts(texts)}
        maxLength={INVENTORY_LIMITS.coffeeName}
        placeholder={texts.coffeeNamePlaceholder}
      />
      <InventoryOriginFacets values={values} options={options} texts={texts} navigate={navigate} />
      {TEXT_KEYS.map((key) => (
        <FacetTextField
          key={key}
          label={texts[key]}
          maxLength={INVENTORY_LIMITS[key]}
          value={values[key] ?? ""}
          onCommit={(value) => navigate({ [key]: value })}
        />
      ))}
    </FacetPanel>
  );
}
