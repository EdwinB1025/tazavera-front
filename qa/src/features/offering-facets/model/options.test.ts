import { describe, it, expect } from "vitest";
import type { CoffeeSummary, TaxonomiesPayload, TaxonomyNode } from "@/shared/api";
import { offeringFacetOptions, tasteNoteOptions } from "@/features/offering-facets/model/options";

/**
 * Facet options (add-offering-facets design.md D7; spec "Offering facet
 * options", "Offering facet options unavailable").
 */

const TREE = [
  {
    ulid: "F",
    level: 0,
    nameEs: "Frutal",
    nameEn: "Fruity",
    nameCa: "Fruitat",
    children: [
      {
        ulid: "B",
        level: 1,
        nameEs: "Bayas",
        nameEn: "Berry",
        nameCa: "Baies",
        children: [{ ulid: "S", level: 2, nameEs: "Fresa", nameEn: "Strawberry", nameCa: "Maduixa" }],
      },
      { ulid: "C", level: 1, nameEs: "Cítrico", nameEn: "Citrus", nameCa: "Cítric" },
    ],
  },
  { ulid: "N", level: 0, nameEs: "Nueces", nameEn: "Nutty", nameCa: "Fruits secs" },
] as TaxonomyNode[];

const COFFEES = [
  { country: "Ethiopia", region: "Sidama", process: "natural", variety: "Heirloom", producer: "Bensa" },
  { country: "Colombia", region: "Huila", process: "washed", variety: "Caturra", producer: null },
] as CoffeeSummary[];

function fulfilled<T>(value: T): PromiseSettledResult<T> {
  return { status: "fulfilled", value };
}

describe("tasteNoteOptions (design.md D7)", () => {
  it("lists level-0 nodes in API order with their level-1 children, without level 2", () => {
    expect(tasteNoteOptions(TREE, "en")).toEqual([
      {
        value: "F",
        label: "Fruity",
        children: [
          { value: "B", label: "Berry" },
          { value: "C", label: "Citrus" },
        ],
      },
      { value: "N", label: "Nutty", children: [] },
    ]);
  });

  it.each([
    ["es", "Frutal", "Bayas"],
    ["en", "Fruity", "Berry"],
    ["ca", "Fruitat", "Baies"],
  ])("names the nodes in %s", (locale, parent, child) => {
    const [first] = tasteNoteOptions(TREE, locale);
    expect(first!.label).toBe(parent);
    expect(first!.children![0]!.label).toBe(child);
  });
});

describe("offeringFacetOptions (design.md D1, D7)", () => {
  const taxonomies: TaxonomiesPayload = { data: TREE };

  it("builds the five sorted lists and the taste notes from fulfilled reads", () => {
    const options = offeringFacetOptions(fulfilled(COFFEES), fulfilled(taxonomies), "en");
    expect(options.countries).toEqual(["Colombia", "Ethiopia"]);
    expect(options.regions).toEqual(["Huila", "Sidama"]);
    expect(options.processes).toEqual(["natural", "washed"]);
    expect(options.varieties).toEqual(["Caturra", "Heirloom"]);
    expect(options.producers).toEqual(["Bensa"]);
    expect(options.tasteNotes).toEqual(tasteNoteOptions(TREE, "en"));
  });
});
