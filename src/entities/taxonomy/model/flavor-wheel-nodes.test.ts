import { describe, it, expect } from "vitest";
import type { OfferingTaxonomyNode, TaxonomyNode } from "@/shared/api";
import type { FlavorWheelNode } from "@/shared/ui";
import { buildTaxonomyLookup } from "./lookup";
import { buildFlavorWheelNodes } from "./flavor-wheel-nodes";

/**
 * Flavor wheel node mapping tests (design.md D1, D3; spec "Flavor wheel" —
 * "Unresolved or colourless notes are skipped", "Consensus legend", "Empty
 * state"). Written before the implementation (task 2.1): the
 * `./flavor-wheel-nodes` import fails to resolve and the `@/shared/ui`
 * `FlavorWheelNode` type does not exist until task 2.2, so the file runs and
 * fails as required.
 *
 * `buildFlavorWheelNodes(cataConcordance, lookup, total, countLabel)` keeps
 * only the offering roots whose `type` is `aromatics`, resolves each `ref`
 * through the lookup built for the chosen locale, skips a node with its
 * subtree when its ref resolves nothing or the lookup entry's colour is
 * empty, orders siblings by the lookup's insertion order (the order of
 * `GET /taxonomies`), takes `level` from the offering node's own level and
 * fills `countLabel` with `countLabel(count, total)`.
 */

const T_FRUTAL = "01JTAXN0DE0000000000000001";
const T_CITRIC = "01JTAXN0DE0000000000000002";
const T_FLORAL = "01JTAXN0DE0000000000000003";
const T_BAYA = "01JTAXN0DE0000000000000004";
const T_MORA = "01JTAXN0DE0000000000000005";
const T_HIERBA = "01JTAXN0DE0000000000000006";
const T_DESCONOCIDO = "01JTAXN0DE00000000000000FF";

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
      {
        ulid: T_CITRIC,
        level: 1,
        nameEn: "Citrus",
        nameEs: "Cítrico",
        nameCa: "Cítric",
        descriptionEn: "Notes of citrus fruit.",
        descriptionEs: "Notas de fruta cítrica.",
        descriptionCa: "Notes de fruita cítrica.",
        color: "#E8A33D",
      },
    ],
  },
  {
    ulid: T_FLORAL,
    level: 0,
    nameEn: "Floral",
    nameEs: "Floral",
    nameCa: "Floral",
    descriptionEn: "Notes of flowers.",
    descriptionEs: "Notas de flores.",
    color: "#8A4FBF",
  },
  {
    ulid: T_HIERBA,
    level: 0,
    nameEn: "Herb",
    nameEs: "Hierba",
    nameCa: "Herba",
    descriptionEn: "Notes of fresh herbs.",
    descriptionEs: "Notas de hierbas frescas.",
  },
];

/** The legend the host composes: the note's `count` over the total (4/5). */
const countOverTotal = (count: number, total: number) => `${count}/${total}`;

describe("buildFlavorWheelNodes (design.md D3)", () => {
  it("keeps only the roots whose type is aromatics (design.md D3)", () => {
    const cataConcordance: OfferingTaxonomyNode[] = [
      {
        ref: T_CITRIC,
        type: "main_tastes",
        level: 0,
        count: 3,
        children: [{ ref: T_MORA, type: "main_tastes", level: 1, count: 1 }],
      },
      { ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 },
      {
        ref: T_BAYA,
        type: "defects",
        level: 0,
        count: 2,
        children: [{ ref: T_MORA, type: "defects", level: 1, count: 1 }],
      },
    ];
    const expected: FlavorWheelNode[] = [
      {
        id: T_FRUTAL,
        name: "Frutal",
        description: "Aromas que recuerdan a fruta fresca, seca o cocida.",
        color: "#D9345A",
        level: 0,
        count: 5,
        countLabel: "5/7",
        children: [],
      },
    ];
    expect(
      buildFlavorWheelNodes(
        cataConcordance,
        buildTaxonomyLookup(TREE, "es"),
        7,
        countOverTotal,
      ),
    ).toEqual(expected);
  });

  it("skips a node and its subtree when its ref resolves nothing (spec: Unresolved or colourless notes are skipped)", () => {
    const cataConcordance: OfferingTaxonomyNode[] = [
      {
        ref: T_DESCONOCIDO,
        type: "aromatics",
        level: 0,
        count: 2,
        children: [{ ref: T_BAYA, type: "aromatics", level: 1, count: 1 }],
      },
      { ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 },
    ];
    const expected: FlavorWheelNode[] = [
      {
        id: T_FRUTAL,
        name: "Frutal",
        description: "Aromas que recuerdan a fruta fresca, seca o cocida.",
        color: "#D9345A",
        level: 0,
        count: 5,
        countLabel: "5/7",
        children: [],
      },
    ];
    expect(
      buildFlavorWheelNodes(
        cataConcordance,
        buildTaxonomyLookup(TREE, "es"),
        7,
        countOverTotal,
      ),
    ).toEqual(expected);
  });

  it("skips a node and its subtree when its lookup entry has an empty colour (spec: Unresolved or colourless notes are skipped)", () => {
    const cataConcordance: OfferingTaxonomyNode[] = [
      {
        ref: T_HIERBA,
        type: "aromatics",
        level: 0,
        count: 2,
        children: [{ ref: T_MORA, type: "aromatics", level: 1, count: 1 }],
      },
      { ref: T_FRUTAL, type: "aromatics", level: 0, count: 5 },
    ];
    const expected: FlavorWheelNode[] = [
      {
        id: T_FRUTAL,
        name: "Frutal",
        description: "Aromas que recuerdan a fruta fresca, seca o cocida.",
        color: "#D9345A",
        level: 0,
        count: 5,
        countLabel: "5/7",
        children: [],
      },
    ];
    expect(
      buildFlavorWheelNodes(
        cataConcordance,
        buildTaxonomyLookup(TREE, "es"),
        7,
        countOverTotal,
      ),
    ).toEqual(expected);
  });

  it("orders siblings by the lookup's insertion order whatever the order of cataConcordance (spec: the notes keep the order of GET /taxonomies)", () => {
    const cataConcordance: OfferingTaxonomyNode[] = [
      { ref: T_FLORAL, type: "aromatics", level: 0, count: 2 },
      {
        ref: T_FRUTAL,
        type: "aromatics",
        level: 0,
        count: 5,
        children: [
          { ref: T_CITRIC, type: "aromatics", level: 1, count: 2 },
          { ref: T_BAYA, type: "aromatics", level: 1, count: 3 },
        ],
      },
    ];
    const expected: FlavorWheelNode[] = [
      {
        id: T_FRUTAL,
        name: "Frutal",
        description: "Aromas que recuerdan a fruta fresca, seca o cocida.",
        color: "#D9345A",
        level: 0,
        count: 5,
        countLabel: "5/7",
        children: [
          {
            id: T_BAYA,
            name: "Baya",
            description: "Notas de frutos del bosque.",
            color: "#B02A4A",
            level: 1,
            count: 3,
            countLabel: "3/7",
            children: [],
          },
          {
            id: T_CITRIC,
            name: "Cítrico",
            description: "Notas de fruta cítrica.",
            color: "#E8A33D",
            level: 1,
            count: 2,
            countLabel: "2/7",
            children: [],
          },
        ],
      },
      {
        id: T_FLORAL,
        name: "Floral",
        description: "Notas de flores.",
        color: "#8A4FBF",
        level: 0,
        count: 2,
        countLabel: "2/7",
        children: [],
      },
    ];
    expect(
      buildFlavorWheelNodes(
        cataConcordance,
        buildTaxonomyLookup(TREE, "es"),
        7,
        countOverTotal,
      ),
    ).toEqual(expected);
  });
});
