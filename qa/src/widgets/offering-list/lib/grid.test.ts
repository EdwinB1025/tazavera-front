import { describe, it, expect } from "vitest";
import { CATALOG_GRID_CLASSES, OFFERING_GRID_CLASSES } from "@/widgets/offering-list/lib/grid";

/**
 * Grid class sets (add-offering-catalog design.md D10; spec "Catalog single
 * column"). The catalog renders one column at every width; landing keeps its
 * viewport variants.
 */

function tokens(classes: string): string[] {
  return classes.split(/\s+/).filter(Boolean);
}

describe("CATALOG_GRID_CLASSES (design.md D10)", () => {
  it("carries no viewport or container column variant", () => {
    expect(
      tokens(CATALOG_GRID_CLASSES).filter(
        (token) => token.startsWith("@") || /^(sm|md|lg|xl|2xl):grid-cols-/.test(token),
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
