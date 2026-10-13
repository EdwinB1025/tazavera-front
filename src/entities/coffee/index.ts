/**
 * Public API of the `entities/coffee` slice (Feature-Sliced Design): the
 * coffee search of the facet comboboxes and the shared `?name=` search it
 * is built on (suggest-inventory-coffee-names design.md D1).
 */
export { searchByName } from "./api/search-by-name";
export { searchCoffees } from "./api/search-coffees";
