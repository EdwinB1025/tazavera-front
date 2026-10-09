import type { EvaluationCreateBody } from "@/shared/api";
import type { AxisKey, DescriptiveAxisKey, DescriptorSelectionKey } from "./groups";

/**
 * The form state of design.md D3: one object holding the whole CVA form. A
 * `note` of `null` is a closed note; a string (possibly empty) is an open one.
 */

/** The contract's five roast levels (`descriptive.roastLevel`). */
export type RoastLevel = EvaluationCreateBody["descriptive"]["roastLevel"];

export const ROAST_LEVELS: readonly RoastLevel[] = [
  "light",
  "medium_light",
  "medium",
  "medium_dark",
  "dark",
];

/** The extrinsics edited beside `generalObservation`, in the contract's order. */
export type ExtrinsicFieldKey = "farming" | "processing" | "trading" | "certifications";

export const EXTRINSIC_FIELDS: readonly ExtrinsicFieldKey[] = [
  "farming",
  "processing",
  "trading",
  "certifications",
];

export type DescriptiveValue = { score: number; note: string | null };
export type AffectiveValue = { score: number | null; note: string | null };

export type EvaluationFormState = {
  roastLevel: RoastLevel | null;
  extractionMethod: string | null;
  descriptive: Record<DescriptiveAxisKey, DescriptiveValue>;
  affective: Record<AxisKey, AffectiveValue>;
  descriptors: Record<DescriptorSelectionKey, string[]>;
  extrinsics: Record<ExtrinsicFieldKey, string | null>;
  generalObservation: string | null;
  fragranceNotEvaluated: boolean;
};

/** A state whose required `roastLevel` is set: the only one that can be sent. */
export type SendableFormState = EvaluationFormState & { roastLevel: RoastLevel };

/** One of the five roast levels, or `null` for any other value. */
export function toRoastLevel(value: string | null | undefined): RoastLevel | null {
  return ROAST_LEVELS.find((level) => level === value) ?? null;
}

const DESCRIPTIVE_AXES: readonly DescriptiveAxisKey[] = [
  "fragrance",
  "aroma",
  "flavor",
  "aftertaste",
  "acidity",
  "sweetness",
  "mouthfeel",
];

const AFFECTIVE_AXES: readonly AxisKey[] = [...DESCRIPTIVE_AXES, "overall"];

export function mapDescriptiveAxes(
  value: (axis: DescriptiveAxisKey) => DescriptiveValue,
): Record<DescriptiveAxisKey, DescriptiveValue> {
  return Object.fromEntries(
    DESCRIPTIVE_AXES.map((axis) => [axis, value(axis)]),
  ) as Record<DescriptiveAxisKey, DescriptiveValue>;
}

export function mapAffectiveAxes(
  value: (axis: AxisKey) => AffectiveValue,
): Record<AxisKey, AffectiveValue> {
  return Object.fromEntries(AFFECTIVE_AXES.map((axis) => [axis, value(axis)])) as Record<
    AxisKey,
    AffectiveValue
  >;
}

/** A new form (spec "A new draft starts empty"; design.md D8). */
export function emptyFormState(roastLevel: RoastLevel | null): EvaluationFormState {
  return {
    roastLevel,
    extractionMethod: null,
    descriptive: mapDescriptiveAxes(() => ({ score: 0, note: null })),
    affective: mapAffectiveAxes(() => ({ score: null, note: null })),
    descriptors: {
      fragranceAroma: [],
      flavorAftertaste: [],
      mainTastes: [],
      mouthfeel: [],
      defects: [],
    },
    extrinsics: { farming: null, processing: null, trading: null, certifications: null },
    generalObservation: null,
    fragranceNotEvaluated: false,
  };
}
