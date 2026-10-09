/**
 * Public API of the `entities/evaluation` slice (Feature-Sliced Design).
 *
 * Exports the evaluation calls and the pure model of the CVA form (design.md
 * D2, D3), so every consumer imports through this entry point.
 */
export { EVALUATION_GROUPS } from "./model/groups";
export type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlock,
  DescriptorBlockKey,
  DescriptorSelectionKey,
  GroupDefinition,
  GroupKey,
  GroupPart,
  PartKey,
} from "./model/groups";
export { EXTRINSIC_FIELDS, ROAST_LEVELS, emptyFormState, toRoastLevel } from "./model/state";
export type { EvaluationFormState, ExtrinsicFieldKey } from "./model/state";
export { buildCreateBody, buildUpdateBody } from "./model/body";
export { formStateFromEvaluation } from "./model/load";
export { completenessOf } from "./model/completeness";
export {
  closeAnEvaluation,
  createAnEvaluation,
  deleteAnEvaluation,
  getMyEvaluation,
  listMyEvaluations,
  updateAnEvaluation,
} from "./api/user-evaluations";
export type { EvaluationCallResult, EvaluationWriteResult } from "./api/user-evaluations";
export { fetchEvaluation, fetchEvaluations } from "./api/public-evaluations";
export { loadEvaluationOfferings } from "./lib/offerings";
export type { EvaluationsQuery } from "./api/public-evaluations";
