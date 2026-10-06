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
 * The catalog grid (add-offering-catalog design.md D10; spec "Catalog grid by
 * available width"): the columns follow the width of the results region, not
 * the viewport — one column, two from a 768px region and three from 1280px,
 * with a 1.5rem gap — so content beside the region narrows the columns. An
 * ancestor carries `@container`, since a container cannot query itself.
 */
export const CATALOG_GRID_CLASSES = [
  "grid",
  "grid-cols-1",
  "gap-6",
  "@min-[768px]:grid-cols-2",
  "@min-[1280px]:grid-cols-3",
].join(" ");
