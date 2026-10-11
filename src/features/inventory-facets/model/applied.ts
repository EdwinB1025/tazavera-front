import type { CoffeeInventoryQuery } from "@/shared/api";
import type { FilterChanges } from "@/shared/lib/filter-query";
import type { AppliedFilter } from "@/shared/ui";
import { INVENTORY_LIMITS } from "./query";
import type { InventoryFilterTexts } from "./texts";

// ─── UI-specific types ───

export type InventoryAppliedFilter = AppliedFilter & { remove: FilterChanges };

/**
 * The applied inventory filters in facet order, each removing only its key
 * (design.md D5). The chips and the trigger count read the same list.
 */
export function appliedInventoryFilters(
  values: CoffeeInventoryQuery,
  texts: InventoryFilterTexts,
): InventoryAppliedFilter[] {
  return (Object.keys(INVENTORY_LIMITS) as (keyof typeof INVENTORY_LIMITS)[]).flatMap((key) => {
    const value = values[key];
    return value ? [{ id: key, facet: texts[key], value, remove: { [key]: undefined } }] : [];
  });
}
