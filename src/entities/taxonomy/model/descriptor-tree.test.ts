import { describe, it, expect } from "vitest";
import type { TaxonomyNode } from "@/shared/api";
import { buildDescriptorTree } from "./descriptor-tree";

/**
 * Descriptor tree builder (cascade-evaluation-descriptors D4; spec
 * evaluations "Descriptor blocks", scenario "A block's options"): the nodes of
 * one category down to level 2, a node offered only when its parent is.
 */

function node(
  ulid: string,
  level: number,
  categories: string[],
  children: TaxonomyNode[] = [],
): TaxonomyNode {
  return {
    ulid,
    level,
    nameEn: `${ulid} (en)`,
    nameEs: `${ulid} (es)`,
    nameCa: `${ulid} (ca)`,
    color: "#aa3355",
    categories,
    children: children as never,
  };
}

const TREE: TaxonomyNode[] = [
  node("R", 0, ["defects"], [
    node("C", 1, ["defects"], [node("L", 2, ["defects"])]),
    node("X", 1, ["aromatics"]),
  ]),
  node("S", 0, ["main_tastes"], [node("T", 1, ["defects"])]),
];

describe("buildDescriptorTree (design.md D4)", () => {
  it("offers the category's nodes down to level 2, never one whose parent is not offered", () => {
    expect(buildDescriptorTree(TREE, "defects", "en")).toEqual([
      {
        value: "R",
        label: "R (en)",
        color: "#aa3355",
        level: 0,
        children: [
          {
            value: "C",
            label: "C (en)",
            color: "#aa3355",
            level: 1,
            children: [{ value: "L", label: "L (en)", color: "#aa3355", level: 2, children: [] }],
          },
        ],
      },
    ]);
  });
});
