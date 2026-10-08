/**
 * Public API of the `coffeeshop-facets` feature slice (Feature-Sliced
 * Design): the coffee shop facet panel, the directory toolbar, the URL
 * parsing and the applied list (add-coffeeshop-directory design.md D4–D6).
 */
export { CoffeeshopFacets } from "./ui/CoffeeshopFacets";
export { CoffeeshopsToolbar } from "./ui/CoffeeshopsToolbar";
export {
  COFFEESHOP_CLEAR_KEEP,
  parseCoffeeshopFilters,
  sanitizeCoffeeshopQuery,
} from "./model/query";
export { appliedCoffeeshopFilters } from "./model/applied";
export { coffeeshopFacetsTexts } from "./model/texts";
