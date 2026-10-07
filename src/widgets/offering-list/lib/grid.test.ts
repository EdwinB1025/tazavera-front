import { describe, it, expect } from "vitest";
import { CATALOG_GRID_CLASSES } from "./grid";

/**
 * Grid class sets (add-offering-catalog design.md D10; spec "Catalog single
 * column"). The catalog renders one column at every width; landing keeps its
 * viewport variants.
 */

function tokens(classes: string): string[] {
  return classes.split(/\s+/).filter(Boolean);
}

describe("CATALOG_GRID_CLASSES (design.md D10)", () => {
  it("lays the cards out in one column at every width, 1.5rem apart", () => {
    expect(tokens(CATALOG_GRID_CLASSES)).toEqual([
      "grid",
      "grid-cols-1",
      "gap-6",
    ]);
  });
});
