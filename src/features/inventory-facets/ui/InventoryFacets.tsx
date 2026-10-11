"use client";

import type { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { CoffeeInventoryQuery } from "@/shared/api";
import { clearFiltersHref, useFilterNavigation } from "@/shared/lib/filter-query";
import { FacetPanel, FacetTextField } from "@/shared/ui";
import { appliedInventoryFilters } from "../model/applied";
import { INVENTORY_LIMITS } from "../model/query";
import type { InventoryFilterTexts } from "../model/texts";

// ─── UI-specific types (declared before the component) ───

export type InventoryFacetsProps = {
  values: CoffeeInventoryQuery;
  texts: InventoryFilterTexts;
};

const KEYS = Object.keys(INVENTORY_LIMITS) as (keyof typeof INVENTORY_LIMITS)[];

/**
 * The inventory facet panel (add-coffee-inventory-explorer design.md D5;
 * specs "Inventory facets in the sidebar" and "Applied inventory filters"):
 * six text facets inside the shared facet panel, Coffee name as a search
 * field, each writing its key on commit; the chips remove one key and
 * "Clear all" keeps no key.
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
      {KEYS.map((key) => (
        <FacetTextField
          key={key}
          label={texts[key]}
          type={key === "coffeeName" ? "search" : undefined}
          maxLength={INVENTORY_LIMITS[key]}
          value={values[key] ?? ""}
          onCommit={(value) => navigate({ [key]: value })}
        />
      ))}
    </FacetPanel>
  );
}
