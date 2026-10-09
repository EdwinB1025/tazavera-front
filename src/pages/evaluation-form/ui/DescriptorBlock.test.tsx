import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import type { TaxonomyNode } from "@/shared/api";
import { DescriptorBlock } from "./DescriptorBlock";

/**
 * One descriptor block over the `GET /taxonomies` tree (design.md D7; spec
 * "Descriptor blocks"; cascade-evaluation-descriptors D5): the category's
 * nodes as a cascade down to level 2, a node offered only when its parent is,
 * labels in the route's locale, multiple selection.
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
  node("TEXTURE", 0, "Texture", ["mouthfeel"], [
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
  it("shows the category's level-0 chips and each chosen node's children, down to level 2", () => {
    renderBlock("aromatics");
    expect(screen.getAllByRole("button").map((chip) => chip.textContent)).toEqual([
      "Fruity",
      "Floral",
      "Sweet",
    ]);
    cleanup();
    renderBlock("aromatics", "en", ["FRUITY"]);
    expect(chipLabels(screen.getByRole("group", { name: "Fruity" }))).toEqual(["Berry", "Citrus"]);
    cleanup();
    renderBlock("aromatics", "en", ["FRUITY", "BERRY"]);
    expect(chipLabels(screen.getByRole("group", { name: "Berry" }))).toEqual(["Strawberry"]);
  });

  it("filters by the block's category and offers no node whose parent is not offered", () => {
    renderBlock("main_tastes");
    expect(screen.getAllByRole("button").map((chip) => chip.textContent)).toEqual(["Sweet"]);
    cleanup();
    renderBlock("mouthfeel", "en", ["TEXTURE"]);
    const texture = screen.getByRole("group", { name: "Texture" });
    expect(chipLabels(texture)).toEqual(["Silky", "Rough"]);
    cleanup();
    renderBlock("defects");
    expect(screen.queryByText("Acetic")).toBeNull();
  });

  it("labels the options with the node name of the route's locale", () => {
    renderBlock("mouthfeel", "es", ["TEXTURE"]);
    expect(screen.getByRole("group", { name: "Texture (es)" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Silky (es)" })).toBeDefined();
    cleanup();
    renderBlock("mouthfeel", "ca", ["TEXTURE"]);
    expect(screen.getByRole("button", { name: "Rough (ca)" })).toBeDefined();
  });

  it("selects several options with no limit", () => {
    const onValueChange = renderBlock("aromatics", "en", ["FRUITY", "BERRY", "CITRUS", "FLORAL"]);
    fireEvent.click(screen.getByRole("button", { name: "Sweet" }));
    expect(onValueChange).toHaveBeenCalledWith(["FRUITY", "BERRY", "CITRUS", "FLORAL", "SWEET"]);
  });
});
