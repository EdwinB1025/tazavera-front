/**
 * Public API of the `offering-facets` feature slice (Feature-Sliced Design):
 * the offering facet panel, its option data, URL parsing and applied list.
 */
export { OfferingFacets, OFFERING_SORT_KEYS } from "./ui/OfferingFacets";
export { OfferingsToolbar } from "./ui/OfferingsToolbar";
export { offeringFacetOptions, tasteNoteOptions } from "./model/options";
export {
  hasOfferingFilters,
  parseOfferingFilters,
  sanitizeOfferingQuery,
} from "./model/query";
export { appliedOfferingFilters } from "./model/applied";
export { offeringFacetsTexts } from "./model/texts";
export type { OfferingFilterTexts } from "./model/texts";
