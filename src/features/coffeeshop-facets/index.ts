/**
 * Public API of the `coffeeshop-facets` feature slice (Feature-Sliced
 * Design): the coffee shop facet panel, the directory toolbar, the URL
 * parsing and the applied list (add-coffeeshop-directory design.md D4–D6).
 */
export { CoffeeshopFacets } from "./ui/CoffeeshopFacets";
export type { CoffeeshopFacetsProps } from "./ui/CoffeeshopFacets";
export { CoffeeshopsToolbar } from "./ui/CoffeeshopsToolbar";
export type { CoffeeshopsToolbarProps } from "./ui/CoffeeshopsToolbar";
export {
  COFFEESHOP_CLEAR_KEEP,
  COFFEESHOP_SORT_OPTIONS,
  parseCoffeeshopFilters,
  sanitizeCoffeeshopQuery,
} from "./model/query";
export type { CoffeeshopFilterValues, CoffeeshopSortId } from "./model/query";
export { appliedCoffeeshopFilters } from "./model/applied";
export type { CoffeeshopAppliedFilter } from "./model/applied";
export { coffeeshopFacetsTexts } from "./model/texts";
export type { CoffeeshopFilterTexts } from "./model/texts";
