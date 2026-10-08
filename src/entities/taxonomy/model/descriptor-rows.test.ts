import { describe, it, expect } from "vitest";
import type { TaxonomyNode } from "@/shared/api";
import { buildDescriptorRows } from "./descriptor-rows";

/**
 * Descriptor-row builder (add-offering-catalog design.md D13, the settled
 * descriptor rule): a level-0 node with level-1 children in the category
 * heads one row whose chips are those children; a childless level-0 node of
 * the category joins the shared row; level 2 is not shown.
 */

const NODES: TaxonomyNode[] = [
  {
    ulid: "01JROOTFERMENTED000000000A",
    level: 0,
    nameEs: "Fermentado",
    nameEn: "Fermented",
    nameCa: "Fermentat",
    color: "#111111",
    categories: ["defects"],
    children: [
      {
        ulid: "01JCHILDVINEGAR0000000000A",
        level: 1,
        nameEs: "Vinagre",
        nameEn: "Vinegar",
        nameCa: "Vinagre",
        color: "#222222",
        categories: ["defects"],
        children: [
          {
            ulid: "01JLEAFACETIC000000000000A",
            level: 2,
            nameEs: "Acético",
            nameEn: "Acetic",
            nameCa: "Acètic",
            color: "#333333",
            categories: ["defects"],
          },
        ],
      },
      {
        ulid: "01JCHILDBERRY000000000000A",
        level: 1,
        nameEs: "Baya",
        nameEn: "Berry",
        nameCa: "Baia",
        color: "#444444",
        categories: ["aromatics"],
      },
    ],
  },
  {
    ulid: "01JROOTPHENOLIC0000000000A",
    level: 0,
    nameEs: "Fenólico",
    nameEn: "Phenolic",
    nameCa: "Fenòlic",
    color: "#555555",
    categories: ["defects"],
    children: [],
  },
  {
    ulid: "01JROOTSWEET0000000000000A",
    level: 0,
    nameEs: "Dulce",
    nameEn: "Sweet",
    nameCa: "Dolç",
    color: "#666666",
    categories: ["main_tastes"],
  },
];

describe("buildDescriptorRows (design.md D13)", () => {
  it("never shows level 2 and leaves out nodes of other categories", () => {
    const values = buildDescriptorRows(NODES, "defects", "en").flatMap((row) =>
      row.options.map((option) => option.value),
    );
    expect(values).not.toContain("01JLEAFACETIC000000000000A");
    expect(values).not.toContain("01JCHILDBERRY000000000000A");
    expect(values).not.toContain("01JROOTSWEET0000000000000A");
  });
});
