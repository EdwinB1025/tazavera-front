/**
 * Public API of the `inventory-facets` feature slice (Feature-Sliced
 * Design): the inventory facet panel, the list toolbar, the URL parsing and
 * the texts (add-coffee-inventory-explorer design.md D5).
 */
export { InventoryFacets } from "./ui/InventoryFacets";
export { InventoryToolbar } from "./ui/InventoryToolbar";
export { parseInventoryFilters } from "./model/query";
export { inventoryFacetsTexts } from "./model/texts";
