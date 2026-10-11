import type { CoffeeInventoryFilterKey, CoffeeInventoryQuery } from "@/shared/api";
import type { QueryRecord } from "@/shared/lib/filter-query";

/**
 * Inventory filter state in the URL (add-coffee-inventory-explorer design.md
 * D5; spec "Inventory filter state in the URL"). The parsed record is the
 * read's query: values beyond the contract's limits and any other key never
 * reach the API.
 */

/** The contract's limits of the `listCoffeeInventory` filters, in facet order. */
export const INVENTORY_LIMITS = {
  coffeeName: 150,
  originCountry: 60,
  originRegion: 90,
  process: 60,
  producer: 150,
  city: 90,
} as const satisfies Record<CoffeeInventoryFilterKey, number>;

const KEYS = Object.keys(INVENTORY_LIMITS) as CoffeeInventoryFilterKey[];

function firstValue(params: URLSearchParams | QueryRecord, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** The six filters the address carries, trimmed, out-of-range and empty values dropped. */
export function parseInventoryFilters(params: URLSearchParams | QueryRecord): CoffeeInventoryQuery {
  const values: CoffeeInventoryQuery = {};
  for (const key of KEYS) {
    const value = firstValue(params, key)?.trim();
    if (value && value.length <= INVENTORY_LIMITS[key]) values[key] = value;
  }
  return values;
}
