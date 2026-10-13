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
import { INVENTORY_LIMITS } from "../model/query";
import type { InventoryFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type InventoryFacetsProps = {
  values: CoffeeInventoryQuery;
  /** `loading` is the combobox's loading text (suggest-inventory-coffee-names design.md D3). */
  texts: InventoryFilterTexts & { loading?: string };
};

/** The text facets, every key but Coffee name, in the limits' order. */
const TEXT_KEYS = (Object.keys(INVENTORY_LIMITS) as (keyof typeof INVENTORY_LIMITS)[]).filter(
  (key) => key !== "coffeeName",
);

/**
 * The inventory facet panel (add-coffee-inventory-explorer design.md D5;
 * specs "Inventory facets in the sidebar" and "Applied inventory filters"):
 * Coffee name as the coffee combobox of the offering facets
 * (suggest-inventory-coffee-names design.md D2), then five text facets, each
 * writing its key on commit, inside the shared facet panel; the chips remove
 * one key and "Clear all" keeps no key.
 */
export function InventoryFacets({ values, texts }: InventoryFacetsProps): ReactNode {
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
