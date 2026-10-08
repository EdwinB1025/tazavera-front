import { describe, it, expect } from "vitest";
import { EVALUATION_GROUPS } from "@/entities/evaluation/model/groups";

/**
 * The eight CVA groups (spec "Evaluation form"; design.md D2, D7; tasks 2.1):
 * their order, the axes of each part and the descriptor block keys. A part a
 * group does not have is `null`; Extrinsic has only its notes field.
 */

function shape(key: string) {
  const group = EVALUATION_GROUPS.find((candidate) => candidate.key === key);
  if (!group) throw new Error(`missing group ${key}`);
  return {
    descriptive: group.descriptive && {
      axes: group.descriptive.axes,
      blocks: group.descriptive.blocks.map((block) => block.key),
    },
    affective: group.affective && {
      axes: group.affective.axes,
      blocks: group.affective.blocks.map((block) => block.key),
    },
    notes: group.notes,
  };
}

describe("EVALUATION_GROUPS (design.md D2)", () => {
  it("lists the eight groups in CVA order", () => {
    expect(EVALUATION_GROUPS.map((group) => group.key)).toEqual([
      "fragranceAroma",
      "flavorAftertaste",
      "acidity",
      "sweetness",
      "mouthfeel",
      "overall",
      "defects",
      "extrinsic",
    ]);
  });

  it("gives Fragrance / Aroma both axes in both parts and the shared aromatics block", () => {
    expect(shape("fragranceAroma")).toEqual({
      descriptive: { axes: ["fragrance", "aroma"], blocks: ["aromatics"] },
      affective: { axes: ["fragrance", "aroma"], blocks: [] },
      notes: null,
    });
  });

  it("gives Flavor / Aftertaste both axes in both parts, the aromatics block and main tastes", () => {
    expect(shape("flavorAftertaste")).toEqual({
      descriptive: { axes: ["flavor", "aftertaste"], blocks: ["aromatics", "main_tastes"] },
      affective: { axes: ["flavor", "aftertaste"], blocks: [] },
      notes: null,
    });
  });

  it("gives Acidity and Sweetness one axis per part and no block", () => {
    expect(shape("acidity")).toEqual({
      descriptive: { axes: ["acidity"], blocks: [] },
      affective: { axes: ["acidity"], blocks: [] },
      notes: null,
    });
    expect(shape("sweetness")).toEqual({
      descriptive: { axes: ["sweetness"], blocks: [] },
      affective: { axes: ["sweetness"], blocks: [] },
      notes: null,
    });
  });

  it("gives Mouthfeel its axis in both parts and the mouthfeel block in its descriptive part", () => {
    expect(shape("mouthfeel")).toEqual({
      descriptive: { axes: ["mouthfeel"], blocks: ["mouthfeel"] },
      affective: { axes: ["mouthfeel"], blocks: [] },
      notes: null,
    });
  });

  it("gives Overall only the affective overall axis", () => {
    expect(shape("overall")).toEqual({
      descriptive: null,
      affective: { axes: ["overall"], blocks: [] },
      notes: null,
    });
  });

  it("gives Defects only the defects block in its affective part", () => {
    expect(shape("defects")).toEqual({
      descriptive: null,
      affective: { axes: [], blocks: ["defects"] },
      notes: null,
    });
  });

  it("gives Extrinsic only the generalObservation notes field", () => {
    expect(shape("extrinsic")).toEqual({
      descriptive: null,
      affective: null,
      notes: "generalObservation",
    });
  });

  it("keeps the two aromatics blocks as separate selections", () => {
    const selections = EVALUATION_GROUPS.flatMap((group) =>
      [group.descriptive, group.affective].flatMap((part) =>
        part ? part.blocks.map((block) => block.selection) : [],
      ),
    );
    expect(selections).toEqual([
      "fragranceAroma",
      "flavorAftertaste",
      "mainTastes",
      "mouthfeel",
      "defects",
    ]);
  });
});
