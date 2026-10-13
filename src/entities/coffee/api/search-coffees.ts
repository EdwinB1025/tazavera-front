import type { CoffeeSummary } from "@/shared/api";
import type { ComboboxOption } from "@/shared/ui";
import { searchByName } from "./search-by-name";

/** Separator of the coffee row's second line (add-filter-controls Open 16). */
const ORIGIN_SEPARATOR = " · ";

function coffeeOption(coffee: CoffeeSummary): ComboboxOption {
  const name = coffee.name ?? "";
  const detail = [coffee.country, coffee.region, coffee.process, coffee.variety]
    .filter((part) => part != null && part !== "")
    .join(ORIGIN_SEPARATOR);
  return detail ? { value: name, label: name, detail } : { value: name, label: name };
}

/**
 * Coffee search of the Coffee combobox (search-coffee-facet design.md D2,
 * D3): `GET /coffees?name=` through the shared name search; one option per
 * distinct name, the first coffee of each name in the API's order, with
 * `country · region · process · variety` as the second line.
 */
export const searchCoffees = searchByName<CoffeeSummary>("/coffees", (coffees) => {
  const options = new Map<string, ComboboxOption>();
  for (const coffee of coffees) {
    const option = coffeeOption(coffee);
    if (!options.has(option.value)) options.set(option.value, option);
  }
  return [...options.values()];
});
