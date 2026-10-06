import { describe, it, expect } from "vitest";
import { formStateFromEvaluation } from "./load";
import type { EvaluationItem } from "@/shared/api";

/**
 * The read-to-state mapping (design.md D3, D7, D11; spec "Loading an
 * evaluation for edit"; tasks 2.3).
 */

const ITEM: EvaluationItem = {
  ulid: "01JEVAL0000000000000000001",
  offeringId: "01JOFFER000000000000000001",
  status: "open",
  extractionMethod: "chemex",
  descriptive: {
    fragrance: { score: 7, note: "jasmine" },
    aroma: { score: 8, note: null },
    flavor: { score: 9 },
    aftertaste: { score: 6, note: null },
    acidity: { score: 10, note: "bright" },
    sweetness: { score: 5, note: null },
    mouthfeel: { score: 4, note: null },
  },
  affective: {
    fragrance: { score: 6, note: null },
    aroma: { score: 7, note: null },
    flavor: { score: 8, note: "juicy" },
    aftertaste: { score: 5, note: null },
    acidity: { score: 7, note: null },
    sweetness: { score: 6, note: null },
    mouthfeel: { score: 6, note: null },
    overall: { score: 8, note: "lovely" },
  },
  extrinsics: { generalObservation: "Washed station" },
  tastes: [],
};

describe("formStateFromEvaluation (design.md D3)", () => {
  it("maps descriptive and affective scores and notes to their axes", () => {
    const state = formStateFromEvaluation(ITEM, "medium");
    expect(state.roastLevel).toBe("medium");
    expect(state.extractionMethod).toBe("chemex");
    expect(state.descriptive.fragrance).toEqual({ score: 7, note: "jasmine" });
    expect(state.descriptive.flavor).toEqual({ score: 9, note: null });
    expect(state.descriptive.acidity).toEqual({ score: 10, note: "bright" });
    expect(state.affective.flavor).toEqual({ score: 8, note: "juicy" });
    expect(state.affective.overall).toEqual({ score: 8, note: "lovely" });
    expect(state.generalObservation).toBe("Washed station");
    expect(state.fragranceNotEvaluated).toBe(false);
  });

  it("maps missing scores to 0 (descriptive) and unset (affective)", () => {
    const state = formStateFromEvaluation(
      { ...ITEM, descriptive: {}, affective: {}, extrinsics: undefined },
      null,
    );
    expect(state.descriptive.mouthfeel).toEqual({ score: 0, note: null });
    expect(state.affective.overall).toEqual({ score: null, note: null });
    expect(state.generalObservation).toBeNull();
    expect(state.extractionMethod).toBeNull();
  });

  it("maps tastes by type to their block (design.md D7)", () => {
    const state = formStateFromEvaluation(
      {
        ...ITEM,
        tastes: [
          { ref: "01JTAXMAIN000000000000000A", type: "main_tastes" },
          { ref: "01JTAXMOUTH00000000000000B", type: "mouthfeel" },
          { ref: "01JTAXDEFECT0000000000000C", type: "defects" },
          { ref: "01JTAXAROMA00000000000000D", type: "aroma" },
          { ref: "01JTAXFRAG000000000000000E", type: "fragrance" },
          { ref: "01JTAXAROMA00000000000000D", type: "fragrance" },
          { ref: "01JTAXFLAV000000000000000F", type: "flavor" },
          { ref: "01JTAXAFTER00000000000000G", type: "aftertaste" },
        ],
      },
      "medium",
    );
    expect(state.descriptors).toEqual({
      mainTastes: ["01JTAXMAIN000000000000000A"],
      mouthfeel: ["01JTAXMOUTH00000000000000B"],
      defects: ["01JTAXDEFECT0000000000000C"],
      fragranceAroma: ["01JTAXAROMA00000000000000D", "01JTAXFRAG000000000000000E"],
      flavorAftertaste: ["01JTAXFLAV000000000000000F", "01JTAXAFTER00000000000000G"],
    });
  });
});
