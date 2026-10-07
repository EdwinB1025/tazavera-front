import type { MessageCatalog } from "@/shared/lib/i18n";

/** Every text of the coffee shop facets and toolbar (design.md D5, D6). */
export type CoffeeshopFilterTexts = {
  title: string;
  nameFacet: string;
  postalCodeFacet: string;
  postalCodeHelp: string;
  cityFacet: string;
  verifiedFacet: string;
  verifiedOption: string;
  sortNameAsc: string;
  sortNameDesc: string;
  any: string;
  seeMore: string;
  seeLess: string;
  clearAll: string;
  removeFilter: string;
  trigger: string;
  triggerWithCount: string;
  sortBy: string;
};

/** The texts from the `coffeeshops` and `filters` catalogs of one locale. */
export function coffeeshopFacetsTexts(
  coffeeshops: MessageCatalog,
  filters: MessageCatalog,
): CoffeeshopFilterTexts {
  return {
    title: coffeeshops.filtersTitle,
    nameFacet: coffeeshops.nameFacet,
    postalCodeFacet: coffeeshops.postalCodeFacet,
    postalCodeHelp: coffeeshops.postalCodeHelp,
    cityFacet: coffeeshops.cityFacet,
    verifiedFacet: coffeeshops.verifiedFacet,
    verifiedOption: coffeeshops.verifiedOption,
    sortNameAsc: coffeeshops.sortNameAsc,
    sortNameDesc: coffeeshops.sortNameDesc,
    any: filters.any,
    seeMore: filters.seeMore,
    seeLess: filters.seeLess,
    clearAll: filters.clearAll,
    removeFilter: filters.removeFilter,
    trigger: filters.trigger,
    triggerWithCount: filters.triggerWithCount,
    sortBy: filters.sortBy,
  };
}
