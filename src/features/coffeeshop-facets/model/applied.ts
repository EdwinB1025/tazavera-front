import type { FilterChanges } from "@/shared/lib/filter-query";
import type { AppliedFilter } from "@/shared/ui";
import type { CoffeeshopFilterValues } from "./query";
import type { CoffeeshopFilterTexts } from "./texts";

// ─── UI-specific types ───

export type CoffeeshopAppliedFilter = AppliedFilter & { remove: FilterChanges };

/**
 * The applied coffee shop filters in facet order — Name, Postal code, City,
 * "With verified offerings" — each removing only its key (design.md D5). The
 * chips and the trigger count read the same list; the sort is never one.
 */
export function appliedCoffeeshopFilters(
  values: CoffeeshopFilterValues,
  texts: CoffeeshopFilterTexts,
): CoffeeshopAppliedFilter[] {
  const list: CoffeeshopAppliedFilter[] = [];
  const add = (key: string, facet: string, value: string | undefined) => {
    if (value !== undefined) list.push({ id: key, facet, value, remove: { [key]: undefined } });
  };
  add("name", texts.nameFacet, values.name);
  add("postalCode", texts.postalCodeFacet, values.postalCode);
  add("city", texts.cityFacet, values.city);
  add("verified", texts.verifiedFacet, values.verified === "1" ? texts.verifiedOption : undefined);
  return list;
}
