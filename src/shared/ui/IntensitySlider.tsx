"use client";

import { useId, type ReactNode } from "react";
import { ControlMessages, useControlMessages } from "./ControlMessages";
import {
  IntensityInput,
  IntensityMeter,
  IntensityScale,
} from "./IntensitySliderParts";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). The readOnly contract is enforced by a discriminated union
// rather than a runtime assertion: `onChange` is required unless `readOnly`.
// Tests pin this with `@ts-expect-error` cases and `npx tsc --noEmit`, the
// `Textarea` precedent.

export type IntensitySliderProps = {
  label: ReactNode;
  value: number | null; // 0..15; null renders as 0 (Open 4 a)
  valueText: string;
  valueLabel: string;
  scaleLabels: [string, string, string];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
} & (
  | { readOnly: true; onChange?: never }
  | { readOnly?: false; onChange: (value: number) => void }
);

// ─── Treatment classes (design.md D5) ───
// The track's layers and the scale live in IntensitySliderParts.

const HEADER_CLASSES = "mb-2 flex items-baseline justify-between gap-3";
const VALUE_TEXT_CLASSES = "type-body italic tabular-nums text-text-primary";

/**
 * Tazavera intensity slider.
 *
 * Descriptive intensity 0..15 per the `form-fields` spec ("Intensity slider")
 * and design.md (D2, D5): a native range (role, arrows and Home/End for free)
 * over the gradient and off layers, `--fill` set inline as a length. `null`
 * renders as 0 (Open 4 a). The slider is its own field: it renders its label
 * and binds its own help and error to the input, help before error.
 * `readOnly` renders the same layers as a non-focusable meter with no thumb.
 */
export function IntensitySlider(props: IntensitySliderProps): ReactNode {
  const { label, value, valueText, valueLabel, scaleLabels, disabled, help, error } =
    props;
  const inputId = useId();
  const labelId = useId();
  const messages = useControlMessages(help, error);
  const track = {
    intensity: value ?? 0,
    valueLabel,
    disabled,
    describedBy: messages.describedBy,
  };

  return (
    <div>
      <div className={HEADER_CLASSES}>
        {props.readOnly ? (
          <span id={labelId} className="type-label">
            {label}
          </span>
        ) : (
          <label id={labelId} htmlFor={inputId} className="type-label">
            {label}
          </label>
        )}
        <span className={VALUE_TEXT_CLASSES}>{valueText}</span>
      </div>
      {props.readOnly ? (
        <IntensityMeter {...track} labelId={labelId} />
      ) : (
        <IntensityInput
          {...track}
          inputId={inputId}
          invalid={messages.hasError}
          onChange={props.onChange}
        />
      )}
      <IntensityScale scaleLabels={scaleLabels} />
      <ControlMessages ids={messages} help={help} error={error} />
    </div>
  );
}
