import { describe, it, expect } from "vitest";
import type { EvaluationItem } from "@/shared/api";
import { isReadyForClosing } from "./closing";

/**
 * The contract's close rule (refine-evaluation-flow design.md D3; spec "Row
 * actions"): the 15 sensory scores > 0 and a main taste, a mouthfeel and an
 * aromatic taste.
 */

const AXES = ["fragrance", "aroma", "flavor", "aftertaste", "acidity", "sweetness", "mouthfeel"];

function complete(): EvaluationItem {
  const scores = (score: number, axes: string[]) =>
    Object.fromEntries(axes.map((axis) => [axis, { score, note: null }]));
  return {
    ulid: "01JEVAL0000000000000000001",
    status: "open",
    descriptive: scores(5, AXES),
    affective: scores(6, [...AXES, "overall"]),
    tastes: [
      { ref: "01JTAXSWEET00000000000000C", type: "main_tastes" },
      { ref: "01JTAXSILKY00000000000000D", type: "mouthfeel" },
      { ref: "01JTAXFLORAL0000000000000A", type: "aroma" },
    ],
  } as EvaluationItem;
}

const without = (type: string): EvaluationItem => {
  const evaluation = complete();
  return { ...evaluation, tastes: evaluation.tastes?.filter((taste) => taste.type !== type) };
};

describe("isReadyForClosing (refine-evaluation-flow D3)", () => {
  it("accepts a complete evaluation", () => {
    expect(isReadyForClosing(complete())).toBe(true);
  });

  it("refuses an evaluation with one score 0", () => {
    const evaluation = complete();
    evaluation.affective = { ...evaluation.affective, overall: { score: 0, note: null } };
    expect(isReadyForClosing(evaluation)).toBe(false);
  });

  it("refuses an evaluation with no main taste", () => {
    expect(isReadyForClosing(without("main_tastes"))).toBe(false);
  });

  it("refuses an evaluation with no mouthfeel", () => {
    expect(isReadyForClosing(without("mouthfeel"))).toBe(false);
  });

  it("refuses an evaluation whose only other taste is a defect", () => {
    const evaluation = without("aroma");
    evaluation.tastes = [...(evaluation.tastes ?? []), { ref: "01JTAXMOULD00000000000000E", type: "defects" }];
    expect(isReadyForClosing(evaluation)).toBe(false);
  });
});
