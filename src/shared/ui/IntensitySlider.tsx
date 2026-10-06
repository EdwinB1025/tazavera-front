"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

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
// The track block (20px, the thumb) layers a 6px gradient spanning the whole
// width, an off layer from `--fill` to the right edge and, when interactive,
// the native range on top with a transparent track. The thumb is the
// `intensity-slider-thumb` utility of `globals.css`.

const MAX = 15;

const HEADER_CLASSES = "mb-2 flex items-baseline justify-between gap-3";
const VALUE_TEXT_CLASSES = "type-body italic tabular-nums text-text-primary";
const LAYER_CLASSES = "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-pill";
const GRADIENT_CLASSES = [
  LAYER_CLASSES,
  "inset-x-0",
  // The stops are the two tokens inside one gradient utility: the separate
  // direction utility (linear to the right) reads as an unknown color name to
  // the color guard.
  "bg-linear-[to_right,var(--color-evaluation-slider-start),var(--color-evaluation-slider-end)]",
].join(" ");
const OFF_CLASSES = [
  LAYER_CLASSES,
  "left-(--fill)",
  "right-0",
  "bg-evaluation-slider-track",
].join(" ");
const INPUT_CLASSES = [
  "absolute",
  "inset-0",
  "h-5",
  "w-full",
  "appearance-none",
  "bg-transparent",
  "rounded-pill",
  "cursor-pointer",
  "intensity-slider-thumb",
  "focus-visible:focus-ring",
  "disabled:cursor-not-allowed",
].join(" ");
// Inset by half the thumb so each mark sits under the thumb centre.
const MARKS_CLASSES = "mx-2.5 mt-1 flex justify-between type-meta tabular-nums";
const SCALE_LABELS_CLASSES =
  "mx-2.5 mt-0.5 flex justify-between type-meta font-semibold text-text-label";

const MARKS = [0, 5, 10, 15] as const;

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
  const helpId = useId();
  const errorId = useId();

  // The `Checkbox` contract: an empty string renders and wires nothing.
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy = [
    hasHelp ? helpId : undefined,
    hasError ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const intensity = value ?? 0;
  const trackStyle = {
    ["--fill" as string]: `${(intensity * 100) / MAX}%`,
  } as CSSProperties;
  const trackClasses = ["relative h-5", disabled ? "opacity-50" : undefined]
    .filter(Boolean)
    .join(" ");
  const layers = (
    <>
      <div data-slot="gradient" className={GRADIENT_CLASSES} />
      <div data-slot="off" className={OFF_CLASSES} />
    </>
  );

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
        <div
          data-slot="track"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={MAX}
          aria-valuenow={intensity}
          aria-valuetext={valueLabel}
          aria-labelledby={labelId}
          aria-describedby={describedBy || undefined}
          className={trackClasses}
          style={trackStyle}
        >
          {layers}
        </div>
      ) : (
        <div data-slot="track" className={trackClasses} style={trackStyle}>
          {layers}
          <input
            id={inputId}
            type="range"
            min={0}
            max={MAX}
            step={1}
            value={intensity}
            onChange={(event) => props.onChange(Number(event.target.value))}
            disabled={disabled}
            aria-valuetext={valueLabel}
            aria-describedby={describedBy || undefined}
            aria-invalid={hasError ? "true" : undefined}
            className={INPUT_CLASSES}
          />
        </div>
      )}
      <div aria-hidden="true" className={MARKS_CLASSES}>
        {MARKS.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
      <div aria-hidden="true" className={SCALE_LABELS_CLASSES}>
        {scaleLabels.map((scaleLabel) => (
          <span key={scaleLabel}>{scaleLabel}</span>
        ))}
      </div>
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="type-error mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
