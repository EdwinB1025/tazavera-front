"use client";

import { type CSSProperties, type ReactNode } from "react";

// ─── UI-specific types (declared before the components) ───

type TrackProps = {
  intensity: number;
  valueLabel: string;
  disabled?: boolean;
  describedBy: string | undefined;
};

export type IntensityMeterProps = TrackProps & { labelId: string };

export type IntensityInputProps = TrackProps & {
  inputId: string;
  invalid: boolean;
  onChange: (value: number) => void;
  /** The range's treatment classes, owned by IntensitySlider. */
  inputClasses: string;
};

// ─── Treatment classes (design.md D5) ───
// The track block (20px, the thumb) layers a 6px gradient spanning the whole
// width, an off layer from `--fill` to the right edge and, when interactive,
// the native range on top with a transparent track (its classes arrive from
// IntensitySlider).

const MAX = 15;

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
// Inset by half the thumb so each mark sits under the thumb centre.
const MARKS_CLASSES = "mx-2.5 mt-1 flex justify-between type-meta tabular-nums";
const SCALE_LABELS_CLASSES =
  "mx-2.5 mt-0.5 flex justify-between type-meta font-semibold text-text-label";

const MARKS = [0, 5, 10, 15] as const;

/** The track's `--fill` length and its classes (disabled fades it). */
function trackAttributes(
  intensity: number,
  disabled: boolean | undefined,
): { className: string; style: CSSProperties } {
  return {
    className: ["relative h-5", disabled ? "opacity-50" : undefined]
      .filter(Boolean)
      .join(" "),
    style: {
      ["--fill" as string]: `${(intensity * 100) / MAX}%`,
    } as CSSProperties,
  };
}

function Layers(): ReactNode {
  return (
    <>
      <div data-slot="gradient" className={GRADIENT_CLASSES} />
      <div data-slot="off" className={OFF_CLASSES} />
    </>
  );
}

/** The read-only track: the layers as a non-focusable meter with no thumb. */
export function IntensityMeter({
  intensity,
  valueLabel,
  disabled,
  describedBy,
  labelId,
}: IntensityMeterProps): ReactNode {
  return (
    <div
      data-slot="track"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={MAX}
      aria-valuenow={intensity}
      aria-valuetext={valueLabel}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      {...trackAttributes(intensity, disabled)}
    >
      <Layers />
    </div>
  );
}

/** The interactive track: the native range over the layers. */
export function IntensityInput({
  intensity,
  valueLabel,
  disabled,
  describedBy,
  inputId,
  invalid,
  onChange,
  inputClasses,
}: IntensityInputProps): ReactNode {
  return (
    <div data-slot="track" {...trackAttributes(intensity, disabled)}>
      <Layers />
      <input
        id={inputId}
        type="range"
        min={0}
        max={MAX}
        step={1}
        value={intensity}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        aria-valuetext={valueLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid ? "true" : undefined}
        className={inputClasses}
      />
    </div>
  );
}

/** The marks 0, 5, 10 and 15 and the three scale labels below the track. */
export function IntensityScale({
  scaleLabels,
}: {
  scaleLabels: [string, string, string];
}): ReactNode {
  return (
    <>
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
    </>
  );
}
