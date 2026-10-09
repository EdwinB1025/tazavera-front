import { describe, it, expect } from "vitest";
import { formStateFromEvaluation } from "@/entities/evaluation/model/load";
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
      { ...ITEM, extractionMethod: undefined, descriptive: {}, affective: {}, extrinsics: undefined },
      null,
    );
    expect(state.descriptive.mouthfeel).toEqual({ score: 0, note: null });
    expect(state.affective.overall).toEqual({ score: null, note: null });
    expect(state.generalObservation).toBeNull();
    expect(state.extractionMethod).toBeNull();
  });
});
