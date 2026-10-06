import { describe, it, expect } from "vitest";
import type { OfferingTaxonomyNode, TaxonomyNode } from "@/shared/api";
import { buildTaxonomyLookup } from "@/entities/taxonomy";
import { resolveTaxonomies } from "./resolve-taxonomies";

/**
 * Taxonomy resolution tests (design.md D5; the landing spec "Taxonomy badges
 * on the offering card" — "Names by locale", "Unresolved reference"). Written
 * before the implementation (task 5.2): the import fails to resolve until
 * `src/widgets/offering-list/lib/resolve-taxonomies.ts` exists, so the file
 * runs and fails as required.
 *
 * The lookup comes from `buildTaxonomyLookup` of `@/entities/taxonomy`, whose
 * cases live in `src/entities/taxonomy/model/lookup.test.ts`.
 * `resolveTaxonomies(nodes, lookup)` walks an
 * offering's `sensoryTaxonomy` including its `children`, resolves each `ref`
 * through the lookup and omits a `ref` that matches no node (spec: "Unresolved
 * reference"). The badge's `level` — the row the card renders it in — comes
 * from the offering node's own `level`, not from the taxonomy node (design.md
 * D5).
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
    color: "#D9345A",
    children: [
      {
        ulid: T_BAYA,
        level: 1,
        nameEn: "Berry",
        nameEs: "Baya",
        nameCa: "Baia",
        color: "#B02A4A",
        children: [
          {
            ulid: T_MORA,
            level: 2,
            nameEn: "Blackberry",
            nameEs: "Mora",
            nameCa: "Móra",
            color: "#7A1F35",
          },
        ],
      },
    ],
  },
];

describe("resolveTaxonomies (design.md D5)", () => {
  it("resolves the offering's nested children and takes each row from the offering node's own level", () => {
    const sensory: OfferingTaxonomyNode[] = [
      {
        ref: T_FRUTAL,
        type: "aromatics",
        level: 0,
        count: 5,
        children: [
          // The taxonomy node sits at level 2 in the tree; the offering node's
          // own level is what picks the row (design.md D5).
          { ref: T_MORA, type: "aromatics", level: 1, count: 4 },
        ],
      },
    ];
    expect(resolveTaxonomies(sensory, buildTaxonomyLookup(TREE, "ca"))).toEqual([
      { label: "Fruitat", color: "#D9345A", level: 0 },
      { label: "Móra", color: "#7A1F35", level: 1 },
    ]);
  });

  it("omits a ref that matches no node and renders the remaining badges (spec: Unresolved reference)", () => {
    const sensory: OfferingTaxonomyNode[] = [
      { ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 },
      {
        ref: "01JTAXN0DE0000000000000FFF",
        type: "aromatics",
        level: 1,
        count: 1,
      },
      { ref: T_BAYA, type: "aromatics", level: 1, count: 2 },
    ];
    expect(resolveTaxonomies(sensory, buildTaxonomyLookup(TREE, "es"))).toEqual([
      { label: "Frutal", color: "#D9345A", level: 0 },
      { label: "Baya", color: "#B02A4A", level: 1 },
    ]);
  });
});
