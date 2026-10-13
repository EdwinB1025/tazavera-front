import { distinctCoffeeValues } from "@/shared/api";
import type { ApiResult, CoffeeSummary } from "@/shared/api";

/**
 * Option data of the inventory Country, Region and Process facets
 * (select-inventory-origin-and-process design.md D2): the distinct values of
 * the coffee catalog, as the offering facets list them, plus each country's
 * regions. A failed read gives `null` everywhere; the facets then render
 * disabled with "Options unavailable". Runs on the server only.
 */

// ─── UI-specific types ───

/** `null` = the coffee catalog could not be read. */
export type InventoryFacetOptions = {
  countries: string[] | null;
  regions: string[] | null;
  regionsByCountry: Record<string, string[]> | null;
  processes: string[] | null;
};

/** The options of the three list facets from the coffee catalog read. */
export function inventoryFacetOptions(coffees: ApiResult<CoffeeSummary[]>): InventoryFacetOptions {
  if (!coffees.ok) {
    return { countries: null, regions: null, regionsByCountry: null, processes: null };
  }
  const list = coffees.data;
  const countries = distinctCoffeeValues(list, "country");
  return {
    countries,
    regions: distinctCoffeeValues(list, "region"),
    regionsByCountry: Object.fromEntries(
      countries.map((country) => [
        country,
        distinctCoffeeValues(
          list.filter((coffee) => coffee.country === country),
          "region",
        ),
      ]),
    ),
    processes: distinctCoffeeValues(list, "process"),
  };
}
