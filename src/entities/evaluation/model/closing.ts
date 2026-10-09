import type { EvaluationItem } from "@/shared/api";
import { mapAffectiveAxes, mapDescriptiveAxes } from "./state";

/**
 * The contract's close rule (`PATCH /user/evaluations/{evaluation_ulid}/close`
 * and its `409`; refine-evaluation-flow design.md D3) on the API's evaluation:
 * the 7 descriptive and 8 affective scores > 0, and among `tastes` a main
 * taste, a mouthfeel and an aromatic one (any type but those two and defects).
 */

const NOT_AROMATIC = ["main_tastes", "mouthfeel", "defects"];

export function isReadyForClosing(evaluation: EvaluationItem): boolean {
  const scores = [
    ...Object.values(mapDescriptiveAxes((axis) => ({ score: evaluation.descriptive?.[axis]?.score ?? 0, note: null }))),
    ...Object.values(mapAffectiveAxes((axis) => ({ score: evaluation.affective?.[axis]?.score ?? 0, note: null }))),
  ];
  const types = (evaluation.tastes ?? []).map((taste) => taste.type ?? "");
  return (
    scores.every(({ score }) => (score ?? 0) > 0) &&
    types.includes("main_tastes") &&
    types.includes("mouthfeel") &&
    types.some((type) => type !== "" && !NOT_AROMATIC.includes(type))
  );
}
