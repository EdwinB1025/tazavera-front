import { describe, it, expect } from "vitest";
import { completenessOf } from "./completeness";
import { emptyFormState } from "./state";
import type { EvaluationFormState } from "./state";

/**
 * The completeness rule (design.md D10; spec "Completeness indicator"; tasks
 * 2.5): every score of a group > 0 plus its descriptor requirements. Defects
 * and Extrinsic have no indicator and are absent from the result.
 */

function completeState(): EvaluationFormState {
  const state = emptyFormState("medium");
  for (const axis of Object.keys(state.descriptive) as (keyof typeof state.descriptive)[]) {
    state.descriptive[axis] = { score: 5, note: null };
  }
  for (const axis of Object.keys(state.affective) as (keyof typeof state.affective)[]) {
    state.affective[axis] = { score: 6, note: null };
  }
  state.descriptors.fragranceAroma = ["01JTAXFLORAL0000000000000A"];
  state.descriptors.mainTastes = ["01JTAXSWEET00000000000000C"];
  state.descriptors.mouthfeel = ["01JTAXSILKY00000000000000D"];
  return state;
}

describe("completenessOf (design.md D10)", () => {
  it("reports every scored group complete and omits Defects and Extrinsic", () => {
    expect(completenessOf(completeState())).toEqual({
      fragranceAroma: true,
      flavorAftertaste: true,
      acidity: true,
      sweetness: true,
      mouthfeel: true,
      overall: true,
    });
  });

  it("reports a group with a descriptive 0 or an affective null incomplete", () => {
    const zero = completeState();
    zero.descriptive.acidity = { score: 0, note: null };
    expect(completenessOf(zero).acidity).toBe(false);
    const unset = completeState();
    unset.affective.overall = { score: null, note: null };
    expect(completenessOf(unset).overall).toBe(false);
    const affectiveZero = completeState();
    affectiveZero.affective.sweetness = { score: 0, note: null };
    expect(completenessOf(affectiveZero).sweetness).toBe(false);
  });

  it("ignores the fragrance scores of Fragrance / Aroma while the option is checked", () => {
    const state = completeState();
    state.descriptive.fragrance = { score: 0, note: null };
    state.affective.fragrance = { score: null, note: null };
    expect(completenessOf(state).fragranceAroma).toBe(false);
    state.fragranceNotEvaluated = true;
    expect(completenessOf(state).fragranceAroma).toBe(true);
  });

  it("reports both aromatic groups incomplete with no aromatic descriptor, whatever their scores", () => {
    const state = completeState();
    state.descriptors.fragranceAroma = [];
    const result = completenessOf(state);
    expect(result.fragranceAroma).toBe(false);
    expect(result.flavorAftertaste).toBe(false);
  });

  it("shares one aromatic requirement across the two pairs", () => {
    const state = completeState();
    state.descriptors.fragranceAroma = [];
    state.descriptors.flavorAftertaste = ["01JTAXFRUIT00000000000000B"];
    const result = completenessOf(state);
    expect(result.fragranceAroma).toBe(true);
    expect(result.flavorAftertaste).toBe(true);
  });

  it("requires a main tastes descriptor for Flavor / Aftertaste and a mouthfeel one for Mouthfeel", () => {
    const state = completeState();
    state.descriptors.mainTastes = [];
    state.descriptors.mouthfeel = [];
    const result = completenessOf(state);
    expect(result.flavorAftertaste).toBe(false);
    expect(result.mouthfeel).toBe(false);
    expect(result.fragranceAroma).toBe(true);
  });
});
