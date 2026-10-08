import { toRoastLevel } from "@/entities/evaluation";
import type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorSelectionKey,
  EvaluationFormState,
  PartKey,
} from "@/entities/evaluation";

/** One edit of the form values (design.md D1). */
export type FormValuesUpdate = (values: EvaluationFormState) => EvaluationFormState;

/** How a control hands an edit to the form (the group card's `onChange`). */
export type FormStateUpdate = (update: FormValuesUpdate) => void;

export function withRoastLevel(value: string): FormValuesUpdate {
  return (current) => ({ ...current, roastLevel: toRoastLevel(value) });
}

export function withExtractionMethod(value: string): FormValuesUpdate {
  return (current) => ({ ...current, extractionMethod: value === "" ? null : value });
}

export function withFragranceNotEvaluated(checked: boolean): FormValuesUpdate {
  return (current) => ({ ...current, fragranceNotEvaluated: checked });
}

export function withDescriptors(
  selection: DescriptorSelectionKey,
  value: string[],
): FormValuesUpdate {
  return (current) => ({
    ...current,
    descriptors: { ...current.descriptors, [selection]: value },
  });
}

export function withIntensity(axis: DescriptiveAxisKey, score: number): FormValuesUpdate {
  return (current) => ({
    ...current,
    descriptive: {
      ...current.descriptive,
      [axis]: { ...current.descriptive[axis], score },
    },
  });
}

export function withPreference(axis: AxisKey, score: number): FormValuesUpdate {
  return (current) => ({
    ...current,
    affective: {
      ...current.affective,
      [axis]: { ...current.affective[axis], score },
    },
  });
}

export function withNote(part: PartKey, axis: AxisKey, note: string | null): FormValuesUpdate {
  return (current) =>
    part === "descriptive"
      ? {
          ...current,
          descriptive: {
            ...current.descriptive,
            [axis]: { ...current.descriptive[axis as DescriptiveAxisKey], note },
          },
        }
      : {
          ...current,
          affective: {
            ...current.affective,
            [axis]: { ...current.affective[axis], note },
          },
        };
}

export function withGeneralObservation(note: string | null): FormValuesUpdate {
  return (current) => ({ ...current, generalObservation: note });
}
