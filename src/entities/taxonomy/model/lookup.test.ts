import { describe, it, expect } from "vitest";
import type { TaxonomyNode } from "@/shared/api";
import { buildTaxonomyLookup } from "./lookup";

/**
 * Taxonomy lookup tests (design.md D1; the landing spec "Taxonomy badges on
 * the offering card" — "Names by locale"), moved from
 * `src/widgets/offering-list/lib/resolve-taxonomies.test.ts` with the same
 * cases and assertions; the `TREE` fixture and its ulid constants are copied
 * because the original file keeps its `resolveTaxonomies` cases.
 *
 * `buildTaxonomyLookup(nodes, locale)` flattens the tree's nested `children`
 * into a lookup by `ulid` whose entries carry the name of the given locale and
 * the data color.
 */

const T_FRUTAL = "01JTAXN0DE0000000000000001";
const T_BAYA = "01JTAXN0DE0000000000000004";
const T_MORA = "01JTAXN0DE0000000000000005";

const TREE: TaxonomyNode[] = [
  {
    ulid: T_FRUTAL,
    level: 0,
    nameEn: "Fruity",
    nameEs: "Frutal",
    nameCa: "Fruitat",
    descriptionEn: "Aromas reminiscent of fresh, dried, or cooked fruit.",
    descriptionEs: "Aromas que recuerdan a fruta fresca, seca o cocida.",
    descriptionCa: "Aromes que recorden la fruita fresca, seca o cuita.",
    color: "#D9345A",
    children: [
      {
        ulid: T_BAYA,
        level: 1,
        nameEn: "Berry",
        nameEs: "Baya",
        nameCa: "Baia",
        descriptionEn: "Notes of berry fruits.",
        descriptionEs: "Notas de frutos del bosque.",
        descriptionCa: "Notes de fruits del bosc.",
        color: "#B02A4A",
        children: [
          {
            ulid: T_MORA,
            level: 2,
            nameEn: "Blackberry",
            nameEs: "Mora",
            nameCa: "Móra",
            descriptionEn: "Specific note of blackberry.",
            descriptionEs: "Nota específica de mora.",
            descriptionCa: "Nota específica de móra.",
            color: "#7A1F35",
          },
        ],
      },
    ],
  },
];

describe("buildTaxonomyLookup (design.md D5)", () => {
  it("picks nameCa for the locale ca (spec: Names by locale)", () => {
    const lookup = buildTaxonomyLookup(TREE, "ca");
    expect(lookup.get(T_FRUTAL)).toEqual({
      label: "Fruitat",
      color: "#D9345A",
      description: "Aromes que recorden la fruita fresca, seca o cuita.",
    });
  });

  it("picks nameEs for the locale es (spec: Names by locale)", () => {
    const lookup = buildTaxonomyLookup(TREE, "es");
    expect(lookup.get(T_FRUTAL)).toEqual({
      label: "Frutal",
      color: "#D9345A",
      description: "Aromas que recuerdan a fruta fresca, seca o cocida.",
    });
  });

  it("picks nameEn for the locale en (spec: Names by locale)", () => {
    const lookup = buildTaxonomyLookup(TREE, "en");
    expect(lookup.get(T_FRUTAL)).toEqual({
      label: "Fruity",
      color: "#D9345A",
      description: "Aromas reminiscent of fresh, dried, or cooked fruit.",
    });
  });

  it("flattens the nested children of the tree into the lookup (design.md D5)", () => {
    const lookup = buildTaxonomyLookup(TREE, "ca");
    expect(lookup.get(T_MORA)).toEqual({
      label: "Móra",
      color: "#7A1F35",
      description: "Nota específica de móra.",
    });
  });

  it("resolves description: null when the chosen locale has no description (design.md D2)", () => {
    const tree: TaxonomyNode[] = [
      {
        ulid: T_FRUTAL,
        level: 0,
        nameEn: "Fruity",
        nameEs: "Frutal",
        nameCa: "Fruitat",
        descriptionEn: "Aromas reminiscent of fresh, dried, or cooked fruit.",
        descriptionEs: "Aromas que recuerdan a fruta fresca, seca o cocida.",
        color: "#D9345A",
      },
    ];
    const lookup = buildTaxonomyLookup(tree, "ca");
    expect(lookup.get(T_FRUTAL)).toEqual({
      label: "Fruitat",
      color: "#D9345A",
      description: null,
    });
  });
});
