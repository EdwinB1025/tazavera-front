/**
 * The offerings grid (design.md D14; the landing spec "Grid by viewport"): one
 * column below `md`, two from `md`, three from `xl`, with a 1.5rem gap. Grid
 * items stretch, so the cards of one row share one height. Shared by the list
 * and by the home screen's skeleton fallback, so both lay out alike.
 */
export const OFFERING_GRID_CLASSES = [
  "grid",
  "grid-cols-1",
  "gap-6",
  "md:grid-cols-2",
  "xl:grid-cols-3",
].join(" ");

/**
 * The catalog column (add-offering-catalog design.md D10; spec "Catalog single
 * column"): the cards render in one column at every width, 1.5rem apart. The
 * column takes the width its `PageSection` container leaves, so it is centered
 * with the page background in the side margins.
 */
export const CATALOG_GRID_CLASSES = ["grid", "grid-cols-1", "gap-6"].join(" ");
