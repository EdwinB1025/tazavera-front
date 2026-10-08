import { EVALUATION_GROUPS } from "./groups";
import type { DescriptorSelectionKey, GroupKey } from "./groups";
import type { EvaluationFormState } from "./state";

/**
 * The completeness rule of design.md D10: a group is complete when every score
 * of the group is > 0 (descriptive 0 and affective `null` are unset) and its
 * descriptor requirements are met. The aromatic requirement is one requirement
 * shared by Fragrance / Aroma and Flavor / Aftertaste; Flavor / Aftertaste also
 * needs a main taste and Mouthfeel a mouthfeel descriptor. With "Fragrance not
 * evaluated" checked the fragrance scores count as satisfied (design.md D9).
 * Defects and Extrinsic have no indicator and are absent from the result.
 */

export type GroupCompleteness = Partial<Record<GroupKey, boolean>>;

const REQUIRED_SELECTIONS: Partial<Record<GroupKey, DescriptorSelectionKey[]>> = {
  flavorAftertaste: ["mainTastes"],
  mouthfeel: ["mouthfeel"],
};

const AROMATIC_GROUPS: GroupKey[] = ["fragranceAroma", "flavorAftertaste"];

const set = (score: number | null) => score !== null && score > 0;

export function completenessOf(state: EvaluationFormState): GroupCompleteness {
  const aromatics =
    state.descriptors.fragranceAroma.length > 0 || state.descriptors.flavorAftertaste.length > 0;
  const result: GroupCompleteness = {};
  for (const group of EVALUATION_GROUPS) {
    const descriptiveAxes = group.descriptive?.axes ?? [];
    const affectiveAxes = group.affective?.axes ?? [];
    if (descriptiveAxes.length + affectiveAxes.length === 0) continue;
    const skip = (axis: string) =>
      group.key === "fragranceAroma" && state.fragranceNotEvaluated && axis === "fragrance";
    const scores =
      descriptiveAxes.every((axis) => skip(axis) || set(state.descriptive[axis].score)) &&
      affectiveAxes.every((axis) => skip(axis) || set(state.affective[axis].score));
    const selections = (REQUIRED_SELECTIONS[group.key] ?? []).every(
      (selection) => state.descriptors[selection].length > 0,
    );
    const aromatic = !AROMATIC_GROUPS.includes(group.key) || aromatics;
    result[group.key] = scores && selections && aromatic;
  }
  return result;
}
