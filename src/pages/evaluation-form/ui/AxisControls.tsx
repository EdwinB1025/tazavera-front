import type { ReactNode } from "react";
import type {
  AxisKey,
  DescriptiveAxisKey,
  EvaluationFormState,
  PartKey,
} from "@/entities/evaluation";
import { BeanScale, IntensitySlider } from "@/shared/ui";
import { withIntensity, withNote, withPreference } from "../model/form-updates";
import type { FormStateUpdate } from "../model/form-updates";
import type { EvaluationGroupTexts } from "./group-texts";
import { NoteField } from "./NoteField";

// ─── UI-specific types (declared before the component) ───

export type AxisControlProps<Axis extends AxisKey = AxisKey> = {
  axis: Axis;
  state: EvaluationFormState;
  onChange: FormStateUpdate;
  texts: EvaluationGroupTexts;
  /** The closed evaluation's read-only presentation (design.md D4). */
  readOnly: boolean;
};

export type AxisNoteProps = AxisControlProps & {
  part: PartKey;
  /** The part has two axes: the "Add note" text names its axis. */
  pair: boolean;
};

/** "Fragrance not evaluated" disables the fragrance controls (design.md D9). */
function disabledAxis(state: EvaluationFormState, axis: AxisKey): boolean {
  return state.fragranceNotEvaluated && axis === "fragrance";
}

/** The intensity slider (0–15) of one descriptive axis. */
export function IntensityControl({
  axis,
  state,
  onChange,
  texts,
  readOnly,
}: AxisControlProps<DescriptiveAxisKey>): ReactNode {
  const score = state.descriptive[axis].score;
  const value = `${score}${texts.intensityScale}`;
  const common = {
    label: texts.axisLabels[axis],
    value: score,
    valueText: value,
    valueLabel: value,
    scaleLabels: texts.scaleLabels,
  };
  return readOnly ? (
    <IntensitySlider {...common} readOnly />
  ) : (
    <IntensitySlider
      {...common}
      disabled={disabledAxis(state, axis)}
      onChange={(next) => onChange(withIntensity(axis, next))}
    />
  );
}

/** The bean scale (1–9) of one affective axis. */
export function PreferenceControl({
  axis,
  state,
  onChange,
  texts,
  readOnly,
}: AxisControlProps): ReactNode {
  const score = state.affective[axis].score;
  const value = `${score ?? texts.unsetScore}${texts.preferenceScale}`;
  return readOnly ? (
    <BeanScale
      label={texts.axisLabels[axis]}
      value={score}
      valueText={value}
      valueLabel={value}
      readOnly
    />
  ) : (
    <BeanScale
      label={texts.axisLabels[axis]}
      value={score}
      valueText={value}
      disabled={disabledAxis(state, axis)}
      onChange={(next) => onChange(withPreference(axis, next))}
    />
  );
}

/** The note field of one axis (spec "Notes"). */
export function AxisNote({
  part,
  axis,
  pair,
  state,
  onChange,
  texts,
  readOnly,
}: AxisNoteProps): ReactNode {
  const label = `${texts.noteLabel} (${texts.axisLabels[axis]})`;
  const value =
    part === "descriptive"
      ? state.descriptive[axis as DescriptiveAxisKey].note
      : state.affective[axis].note;
  return (
    <NoteField
      label={label}
      addLabel={pair ? `${texts.addNoteLabel} (${texts.axisLabels[axis]})` : texts.addNoteLabel}
      removeLabel={texts.removeNoteLabel}
      value={value}
      disabled={disabledAxis(state, axis)}
      readOnly={readOnly}
      onChange={(next) => onChange(withNote(part, axis, next))}
    />
  );
}
