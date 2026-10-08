import { describe, it, expect } from "vitest";
import type {
  OfferingSummary,
  OfferingTaxonomyNode,
  TaxonomyNode,
} from "@/shared/api";
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
 * `resolveTaxonomies(offering, lookup)` walks the
 * offering's `cataConcordance` including its `children`, never its
 * `sensoryTaxonomy` (fix-production-aut-findings design.md D1), resolves each `ref`
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

/** An offering carrying the given consensus and per-attribute trees. */
function offering(
  cataConcordance: OfferingTaxonomyNode[],
  sensoryTaxonomy: OfferingTaxonomyNode[] = [],
): OfferingSummary {
  return { ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D", cataConcordance, sensoryTaxonomy };
}

describe("resolveTaxonomies (design.md D5)", () => {
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
      resolveTaxonomies(offering(concordance), buildTaxonomyLookup(TREE, "es")),
    ).toEqual([
      { label: "Frutal", color: "#D9345A", level: 0 },
      { label: "Baya", color: "#B02A4A", level: 1 },
    ]);
  });

  // fix-production-aut-findings design.md D1 (spec: "Values from the consensus").
  it("takes the badges from the CATA concordance only (spec: Values from the consensus)", () => {
    const result = resolveTaxonomies(
      offering(
        [{ ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 }],
        [{ ref: T_MORA, type: "flavor", level: 2, count: 3 }],
      ),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([{ label: "Frutal", color: "#D9345A", level: 0 }]);
  });

  it("renders a reference repeated in the concordance once (spec: Each value once)", () => {
    const result = resolveTaxonomies(
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
      { label: "Baya", color: "#B02A4A", level: 0 },
      { label: "Frutal", color: "#D9345A", level: 0 },
    ]);
  });

  it("renders no badge without a consensus, whatever the sensory taxonomy holds (spec: No consensus)", () => {
    const result = resolveTaxonomies(
      offering([], [{ ref: T_FRUTAL, type: "aroma", level: 0, count: 1 }]),
      buildTaxonomyLookup(TREE, "es"),
    );
    expect(result).toEqual([]);
  });
});
