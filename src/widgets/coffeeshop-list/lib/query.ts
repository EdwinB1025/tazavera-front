/**
 * The directory query pass-through (add-coffeeshop-directory design.md D4;
 * spec "Directory query pass-through"). Only the names the contract declares
 * for `GET /coffeeshops` plus `page` are kept, the first value of a repeated
 * key; the directory's own `view` and `focus` keys never reach the API.
 */

// ─── UI-specific types (declared before the function) ───

/** Next's `searchParams` shape. */
export type CoffeeshopsQuery = Record<string, string | string[] | undefined>;

/** The query names `contracts/openapi.yaml` declares for `listCoffeeShops`, plus `page`. */
const COFFEESHOPS_QUERY_NAMES = new Set([
  "name",
  "city",
  "postalCode",
  "verified",
  "orderBy",
  "orderDirection",
  "page",
]);

/** Keeps only the contract's `listCoffeeShops` names plus `page`, one value each. */
export function buildCoffeeshopsQuery(searchParams: CoffeeshopsQuery): Record<string, string> {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (COFFEESHOPS_QUERY_NAMES.has(key) && first !== undefined) {
      query[key] = first;
    }
  }
  return query;
}
