import { describe, it, expect } from "vitest";
import { CATALOG_GRID_CLASSES, OFFERING_GRID_CLASSES } from "./grid";

/**
 * Grid class sets (add-offering-catalog design.md D10; spec "Catalog grid by
 * available width"). The catalog grid follows the width of its results region
 * through container variants; landing keeps its viewport variants.
 */

function tokens(classes: string): string[] {
  return classes.split(/\s+/).filter(Boolean);
}

describe("CATALOG_GRID_CLASSES (design.md D10)", () => {
  it("lays the cards out in one column, two from a 768px region and three from 1280px, 1.5rem apart", () => {
    expect(tokens(CATALOG_GRID_CLASSES)).toEqual(
      expect.arrayContaining([
        "grid",
        "grid-cols-1",
        "gap-6",
        "@min-[768px]:grid-cols-2",
        "@min-[1280px]:grid-cols-3",
      ]),
    );
  });

  it("carries no viewport column variant", () => {
    expect(
      tokens(CATALOG_GRID_CLASSES).filter((token) =>
        /^(md|lg|xl):grid-cols-/.test(token),
      ),
    ).toEqual([]);
  });

  it("leaves landing's viewport grid unchanged", () => {
    expect(tokens(OFFERING_GRID_CLASSES)).toEqual([
      "grid",
      "grid-cols-1",
      "gap-6",
      "md:grid-cols-2",
      "xl:grid-cols-3",
    ]);
  });
});
