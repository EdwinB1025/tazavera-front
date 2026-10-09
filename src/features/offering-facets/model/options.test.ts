import { describe, it, expect } from "vitest";
import type { ApiResult, CoffeeSummary, TaxonomiesPayload, TaxonomyNode } from "@/shared/api";
import { offeringFacetOptions, tasteNoteOptions } from "./options";

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

function fulfilled<T>(value: T): ApiResult<T> {
  return { ok: true, data: value };
}
const rejected = { ok: false, kind: "error" } as const;

describe("offeringFacetOptions (design.md D1, D7)", () => {
  const taxonomies: TaxonomiesPayload = { data: TREE };

  it("gives null for the five coffee lists when the coffees read fails and keeps the taste notes", () => {
    const options = offeringFacetOptions(rejected, fulfilled(taxonomies), "es");
    expect(options.countries).toBeNull();
    expect(options.regions).toBeNull();
    expect(options.processes).toBeNull();
    expect(options.varieties).toBeNull();
    expect(options.producers).toBeNull();
    expect(options.tasteNotes).toEqual(tasteNoteOptions(TREE, "es"));
  });

  it("gives null taste notes when the taxonomy read fails and keeps the five lists", () => {
    const options = offeringFacetOptions(fulfilled(COFFEES), rejected, "es");
    expect(options.tasteNotes).toBeNull();
    expect(options.processes).toEqual(["natural", "washed"]);
    expect(options.producers).toEqual(["Bensa"]);
  });
});
