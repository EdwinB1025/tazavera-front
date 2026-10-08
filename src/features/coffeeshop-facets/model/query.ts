import type { QueryRecord } from "@/shared/lib/filter-query";

/**
 * Coffee shop filter state in the URL (add-coffeeshop-directory design.md D4;
 * specs "Coffee shop filter state in the URL" and "Coffee shop sort"). Values
 * beyond the contract's limits are dropped before the request and never shown.
 */

// ─── UI-specific types (design.md D2) ───

export type CoffeeshopSortId = "name-asc" | "name-desc";

export type CoffeeshopFilterValues = {
  name?: string;
  postalCode?: string;
  city?: string;
  verified?: "1";
  sort: CoffeeshopSortId;
};

/** The sort options; `name-asc` is the default and writes no keys. */
export const COFFEESHOP_SORT_OPTIONS = [
  { id: "name-asc", orderBy: undefined, orderDirection: undefined, textKey: "sortNameAsc" },
  { id: "name-desc", orderBy: "name", orderDirection: "desc", textKey: "sortNameDesc" },
] as const;

/** The keys "Clear all" keeps: the sort and the view (design.md D5). */
export const COFFEESHOP_CLEAR_KEEP = ["orderBy", "orderDirection", "view"] as const;

/** The contract's limits of the text filters of `listCoffeeShops`. */
const TEXT_LIMITS = { name: 150, city: 90, postalCode: 12 } as const;

type TextKey = keyof typeof TEXT_LIMITS;

const FILTER_KEYS = ["name", "city", "postalCode", "verified", "orderBy", "orderDirection"];

function firstValue(params: URLSearchParams | QueryRecord, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseText(raw: string | undefined, limit: number): string | undefined {
  const value = raw?.trim();
  return value && value.length <= limit ? value : undefined;
}

/** The facet values and the sort the address carries, out-of-range values dropped. */
export function parseCoffeeshopFilters(params: URLSearchParams | QueryRecord): CoffeeshopFilterValues {
  const text = (key: TextKey) => parseText(firstValue(params, key), TEXT_LIMITS[key]);
  const descending =
    firstValue(params, "orderBy") === "name" && firstValue(params, "orderDirection") === "desc";
  return {
    name: text("name"),
    postalCode: text("postalCode"),
    city: text("city"),
    verified: firstValue(params, "verified") === "1" ? "1" : undefined,
    sort: descending ? "name-desc" : "name-asc",
  };
}

/** The request query with the facet and sort keys replaced by their parsed values. */
export function sanitizeCoffeeshopQuery(query: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (!FILTER_KEYS.includes(key)) sanitized[key] = value;
  }
  const values = parseCoffeeshopFilters(query);
  for (const key of ["name", "city", "postalCode", "verified"] as const) {
    const value = values[key];
    if (value !== undefined) sanitized[key] = value;
  }
  if (values.sort === "name-desc") {
    sanitized.orderBy = "name";
    sanitized.orderDirection = "desc";
  }
  return sanitized;
}
