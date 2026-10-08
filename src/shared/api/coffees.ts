import { publicRequest, REFERENCE_READ_INIT } from "./client";
import type { ApiResult } from "./result";
import type { operations } from "./schema";

/**
 * The public coffee catalog read (add-offering-facets design.md D1). The
 * contract attaches no security scheme, so it runs on the server through
 * `publicRequest`, with no credential header, and is served from the server
 * cache refreshed every hour (`REFERENCE_READ_INIT`). Any non-2xx
 * status or transport failure is an error result; the facets map it to
 * "Options unavailable".
 */

type ListCoffeesResponse =
  operations["listCoffees"]["responses"][200]["content"]["application/json"];

/** One item of `GET /coffees` `data`; the facets read `country`, `region`, `process`, `variety`, `producer`. */
export type CoffeeSummary = NonNullable<ListCoffeesResponse["data"]>[number];

/** The coffee fields the facets list. */
export type CoffeeFacetField = "country" | "region" | "process" | "variety" | "producer";

/** Every coffee of the catalog: `GET /coffees` `data`. */
export async function fetchCoffees(): Promise<ApiResult<CoffeeSummary[]>> {
  try {
    const response = await publicRequest("/coffees", REFERENCE_READ_INIT);
    if (!response.ok) return { ok: false, kind: "error" };
    const payload: { data?: CoffeeSummary[] } = await response.json();
    return { ok: true, data: payload.data ?? [] };
  } catch {
    return { ok: false, kind: "error" };
  }
}

/** The distinct non-empty values of one field, sorted alphabetically. */
export function distinctCoffeeValues(
  coffees: readonly CoffeeSummary[],
  field: CoffeeFacetField,
): string[] {
  const values = new Set<string>();
  for (const coffee of coffees) {
    const value = coffee[field];
    if (typeof value === "string" && value !== "") values.add(value);
  }
  return [...values].sort((a, b) => a.localeCompare(b));
}
