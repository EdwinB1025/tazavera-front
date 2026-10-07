import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { TaxonomyNode } from "@/shared/api";
import { DescriptorBlock } from "./DescriptorBlock";

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

function renderBlock(
  category: "aromatics" | "main_tastes" | "mouthfeel" | "defects",
  locale = "en",
  value: string[] = [],
  onValueChange = vi.fn(),
) {
  render(
    <DescriptorBlock
      legend="Descriptors"
      nodes={TREE}
      category={category}
      locale={locale}
      value={value}
      onValueChange={onValueChange}
    />,
  );
  return onValueChange;
}

function chipLabels(container: HTMLElement): string[] {
  return within(container)
    .getAllByRole("button")
    .map((chip) => chip.textContent ?? "");
}

describe("DescriptorBlock (design.md D7)", () => {
  it("renders a row per level-0 node with matching children and one shared row", () => {
    renderBlock("aromatics");
    const fruity = screen.getByRole("group", { name: "Fruity" });
    expect(chipLabels(fruity)).toEqual(["Berry", "Citrus"]);
    const chips = screen.getAllByRole("button").map((chip) => chip.textContent);
    expect(chips).toEqual(["Berry", "Citrus", "Floral", "Sweet"]);
    expect(screen.queryByText("Strawberry")).toBeNull();
    expect(screen.queryByText("Acetic")).toBeNull();
  });

  it("filters by the block's category and shows a node in every block it matches", () => {
    renderBlock("main_tastes");
    expect(screen.getAllByRole("button").map((chip) => chip.textContent)).toEqual([
      "Citrus",
      "Sweet",
    ]);
    cleanup();
    renderBlock("mouthfeel");
    const texture = screen.getByRole("group", { name: "Texture" });
    expect(chipLabels(texture)).toEqual(["Silky", "Rough"]);
    cleanup();
    renderBlock("defects");
    expect(chipLabels(screen.getByRole("group", { name: "Fruity" }))).toEqual(["Acetic"]);
  });

  it("labels the options with the node name of the route's locale", () => {
    renderBlock("mouthfeel", "es");
    expect(screen.getByRole("group", { name: "Texture (es)" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Silky (es)" })).toBeDefined();
    cleanup();
    renderBlock("mouthfeel", "ca");
    expect(screen.getByRole("button", { name: "Rough (ca)" })).toBeDefined();
  });

  it("selects several options with no limit", () => {
    const onValueChange = renderBlock("aromatics", "en", ["BERRY", "CITRUS", "FLORAL"]);
    fireEvent.click(screen.getByRole("button", { name: "Sweet" }));
    expect(onValueChange).toHaveBeenCalledWith(["BERRY", "CITRUS", "FLORAL", "SWEET"]);
  });

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
