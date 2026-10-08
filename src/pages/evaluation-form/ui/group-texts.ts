import type { AxisKey, GroupKey } from "@/entities/evaluation";

/** The group card's texts, from the `evaluations` catalog (design.md D14). */
export type EvaluationGroupTexts = {
  groupNames: Record<GroupKey, string>;
  descriptiveHeading: string;
  affectiveHeading: string;
  axisLabels: Record<AxisKey, string>;
  /** LOW / MEDIUM / HIGH under the intensity slider. */
  scaleLabels: [string, string, string];
  /** The "/15" suffix of an intensity. */
  intensityScale: string;
  /** The "/9" suffix of a preference. */
  preferenceScale: string;
  /** What an unset preference shows in place of its number. */
  unsetScore: string;
  completeLabel: string;
  incompleteLabel: string;
  addNoteLabel: string;
  removeNoteLabel: string;
  /** The note field's label, followed by the axis name. */
  noteLabel: string;
  /** The label of the Extrinsic group's notes field. */
  extrinsicNoteLabel: string;
};
