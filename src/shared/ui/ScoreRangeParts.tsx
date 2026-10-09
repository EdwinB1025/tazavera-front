"use client";

import type { ReactNode } from "react";
import { Slider } from "radix-ui";
import { Field } from "./Field";
import { Input } from "./Input";

export type ScoreRangeEnd = "from" | "to";

const THUMB_CLASSES = "block size-5 rounded-full bg-nav-text-dark focus-visible:focus-ring";

/**
 * The bound an input commits (design.md D3): an empty or unreadable text
 * falls back to the end of the scale; the result is the nearest whole
 * number, kept between the scale end and the other bound.
 */
export function clampedBound(
  end: ScoreRangeEnd,
  text: string,
  [lo, hi]: readonly [number, number],
  min: number,
  max: number,
): number {
  const parsed = Number.parseFloat(text);
  const bound = end === "from" ? min : max;
  const raw = text.trim() === "" || Number.isNaN(parsed) ? bound : Math.round(parsed);
  return end === "from" ? Math.min(Math.max(raw, min), hi) : Math.min(Math.max(raw, lo), max);
}

type ScoreRangeSliderProps = {
  min: number;
  max: number;
  value: readonly [number, number];
  disabled?: boolean;
  thumbLabels: readonly [string, string];
  onChange: (range: [number, number]) => void;
  onCommit: (range: [number, number]) => void;
};

/** The two-thumb slider of the score range facet (design.md D3). */
export function ScoreRangeSlider({
  min,
  max,
  value,
  disabled,
  thumbLabels,
  onChange,
  onCommit,
}: ScoreRangeSliderProps): ReactNode {
  return (
    <div className="mt-3 px-3">
      <div className="px-2.5">
        <Slider.Root
          min={min}
          max={max}
          step={1}
          minStepsBetweenThumbs={0}
          value={[value[0], value[1]]}
          disabled={disabled}
          onValueChange={([lo = min, hi = max]) => onChange([lo, hi])}
          onValueCommit={([lo = min, hi = max]) => onCommit([lo, hi])}
          className="relative flex h-5 w-full touch-none select-none items-center data-disabled:opacity-50"
        >
          <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-pill bg-border-inverse">
            <Slider.Range className="absolute h-full bg-surface-checked" />
          </Slider.Track>
          <Slider.Thumb aria-label={thumbLabels[0]} className={THUMB_CLASSES} />
          <Slider.Thumb aria-label={thumbLabels[1]} className={THUMB_CLASSES} />
        </Slider.Root>
      </div>
    </div>
  );
}

type ScoreRangeInputProps = {
  label: string;
  min: number;
  max: number;
  text: string;
  disabled?: boolean;
  onTextChange: (text: string) => void;
  onCommit: () => void;
};

/** One bound's number input of the score range facet (design.md D3). */
export function ScoreRangeInput({
  label,
  min,
  max,
  text,
  disabled,
  onTextChange,
  onCommit,
}: ScoreRangeInputProps): ReactNode {
  return (
    <div className="flex-1">
      <Field label={label} variant="inverse">
        <Input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            onCommit();
          }}
          onBlur={onCommit}
        />
      </Field>
    </div>
  );
}
