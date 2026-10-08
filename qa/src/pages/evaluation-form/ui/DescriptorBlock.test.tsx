import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { TaxonomyNode } from "@/shared/api";
import { DescriptorBlock } from "@/pages/evaluation-form/ui/DescriptorBlock";

/**
 * One descriptor block over the `GET /taxonomies` tree (design.md D7; spec
 * "Descriptor blocks"; tasks 5.1): one row per level-0 node with matching
 * level-1 children, one shared row for the matching level-0 nodes without
 * one, level 2 never, labels in the route's locale, multiple selection.
 */

afterEach(cleanup);

function node(
  ulid: string,
  level: number,
  name: string,
  categories: string[],
  children: TaxonomyNode[] = [],
): TaxonomyNode {
  return {
    ulid,
    level,
    nameEn: name,
    nameEs: `${name} (es)`,
    nameCa: `${name} (ca)`,
    color: "#aa3355",
    categories,
    children: children as never,
  };
}

const TREE: TaxonomyNode[] = [
  node("FRUITY", 0, "Fruity", ["aromatics"], [
    node("BERRY", 1, "Berry", ["aromatics"], [node("STRAWBERRY", 2, "Strawberry", ["aromatics"])]),
    node("CITRUS", 1, "Citrus", ["aromatics", "main_tastes"]),
    node("ACETIC", 1, "Acetic", ["defects"]),
  ]),
  node("FLORAL", 0, "Floral", ["aromatics"]),
  node("SWEET", 0, "Sweet", ["main_tastes", "aromatics"]),
  node("TEXTURE", 0, "Texture", [], [
    node("SILKY", 1, "Silky", ["mouthfeel"]),
    node("ROUGH", 1, "Rough", ["mouthfeel"]),
  ]),
];

describe("DescriptorBlock (design.md D7)", () => {
  it("renders the chosen options only when read-only", () => {
    render(
      <DescriptorBlock
        legend="Descriptors"
        nodes={TREE}
        category="aromatics"
        locale="en"
        value={["FLORAL"]}
        readOnly
      />,
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText("Floral")).toBeDefined();
    expect(screen.queryByText("Berry")).toBeNull();
  });
});
