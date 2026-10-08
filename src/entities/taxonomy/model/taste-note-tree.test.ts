import { describe, it, expect } from "vitest";
import type {
  OfferingSummary,
  OfferingTaxonomyNode,
  TaxonomyNode,
} from "@/shared/api";
import { buildTaxonomyLookup } from "./lookup";
import { buildTasteNoteTree } from "./taste-note-tree";

/**
 * Taste note tree tests (nest-card-taste-notes design.md D1; the landing spec
 * "Taxonomy badge trees on the offering card" — "Unresolved reference",
 * "Values from the consensus", "Each value once", "Repeated reference keeps
 * its children", "No consensus"). Moved with the resolver from
 * `src/widgets/offering-list/lib/resolve-taxonomies.test.ts`; the expected
 * values take the tree shape (`ref` and `children`) the spec delta introduces.
 *
 * `buildTasteNoteTree(offering, lookup)` reads the offering's
 * `cataConcordance`, never its `sensoryTaxonomy`, keeps the tree as it
 * arrives, resolves each `ref` through the lookup, renders each value once at
 * its first occurrence with the children of every occurrence, and omits a
 * `ref` that matches no node.
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

/** An offering carrying the given consensus and per-attribute trees. */
function offering(
  cataConcordance: OfferingTaxonomyNode[],
  sensoryTaxonomy: OfferingTaxonomyNode[] = [],
): OfferingSummary {
  return { ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D", cataConcordance, sensoryTaxonomy };
}

describe("buildTasteNoteTree (design.md D1)", () => {
  it("omits a ref that matches no node and renders the remaining badges (spec: Unresolved reference)", () => {
    const concordance: OfferingTaxonomyNode[] = [
      { ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 },
      {
        ref: "01JTAXN0DE0000000000000FFF",
        type: "aromatics",
        level: 1,
        count: 1,
      },
      { ref: T_BAYA, type: "aromatics", level: 1, count: 2 },
    ];
    expect(
      buildTasteNoteTree(offering(concordance), buildTaxonomyLookup(TREE, "es")),
    ).toEqual([
      { ref: T_FRUTAL, label: "Frutal", color: "#D9345A", level: 0, children: [] },
      { ref: T_BAYA, label: "Baya", color: "#B02A4A", level: 1, children: [] },
    ]);
  });

  // fix-production-aut-findings design.md D1 (spec: "Values from the consensus").
  it("takes the badges from the CATA concordance only (spec: Values from the consensus)", () => {
    const result = buildTasteNoteTree(
      offering(
        [{ ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 }],
        [{ ref: T_MORA, type: "flavor", level: 2, count: 3 }],
      ),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([
      { ref: T_FRUTAL, label: "Frutal", color: "#D9345A", level: 0, children: [] },
    ]);
  });

  it("renders a reference repeated in the concordance once (spec: Each value once)", () => {
    const result = buildTasteNoteTree(
      offering([
        { ref: T_BAYA, type: "aromatics", level: 0, count: 2 },
        {
          ref: T_FRUTAL,
          type: "aromatics",
          level: 0,
          count: 5,
          children: [{ ref: T_BAYA, type: "aromatics", level: 1, count: 2 }],
        },
      ]),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([
      { ref: T_BAYA, label: "Baya", color: "#B02A4A", level: 0, children: [] },
      { ref: T_FRUTAL, label: "Frutal", color: "#D9345A", level: 0, children: [] },
    ]);
  });

  it("nests the children of every occurrence under the first one, each once (spec: Repeated reference keeps its children)", () => {
    const result = buildTasteNoteTree(
      offering([
        {
          ref: T_FRUTAL,
          type: "aromatics",
          level: 0,
          count: 5,
          children: [{ ref: T_BAYA, type: "aromatics", level: 1, count: 2 }],
        },
        {
          ref: T_FRUTAL,
          type: "aromatics",
          level: 0,
          count: 5,
          children: [
            {
              ref: T_BAYA,
              type: "aromatics",
              level: 1,
              count: 2,
              children: [{ ref: T_MORA, type: "aromatics", level: 2, count: 1 }],
            },
          ],
        },
      ]),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([
      {
        ref: T_FRUTAL,
        label: "Frutal",
        color: "#D9345A",
        level: 0,
        children: [
          {
            ref: T_BAYA,
            label: "Baya",
            color: "#B02A4A",
            level: 1,
            children: [
              { ref: T_MORA, label: "Mora", color: "#7A1F35", level: 2, children: [] },
            ],
          },
        ],
      },
    ]);
  });

  it("renders no badge without a consensus, whatever the sensory taxonomy holds (spec: No consensus)", () => {
    const result = buildTasteNoteTree(
      offering([], [{ ref: T_FRUTAL, type: "aroma", level: 0, count: 1 }]),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([]);
  });
});
