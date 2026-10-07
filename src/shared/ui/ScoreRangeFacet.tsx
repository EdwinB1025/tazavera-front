"use client";

import { useState, type ReactNode } from "react";
import { Slider } from "radix-ui";
import { Field } from "./Field";
import { Input } from "./Input";
import { FACET_LEGEND_CLASSES } from "./facet-row";

// ─── UI-specific types (declared before the component) ───
// Bounds, range and texts come from the consumer; no generated API type is
// used. Which query keys a range writes is the consumer's (design.md D8).

export type ScoreRange = readonly [number, number];

export type ScoreRangeTexts = { minThumb: string; maxThumb: string; from: string; to: string };

export type ScoreRangeFacetProps = {
  legend: string;
  min: number;
  max: number;
  value: ScoreRange;
  onCommit: (range: ScoreRange) => void;
  texts: ScoreRangeTexts;
  disabled?: boolean;
};

const THUMB_CLASSES = "block size-5 rounded-full bg-nav-text-dark focus-visible:focus-ring";

/**
 * Score range facet (spec filtering "Score range facet"; design.md D8): a
 * Radix two-thumb slider and "From" / "To" number inputs over a local draft
 * that follows `value`. The slider commits on release and on each keyboard
 * step; an input commits on Enter or blur, clamped, when the range changed.
 */
export function ScoreRangeFacet({
  legend,
  min,
  max,
  value,
  onCommit,
  texts,
  disabled,
}: ScoreRangeFacetProps): ReactNode {
  const [draft, setDraft] = useState<ScoreRange>(value);
  const [fromText, setFromText] = useState(String(value[0]));
  const [toText, setToText] = useState(String(value[1]));
  const [previousValue, setPreviousValue] = useState<ScoreRange>(value);
  if (value[0] !== previousValue[0] || value[1] !== previousValue[1]) {
    setPreviousValue(value);
    setDraft(value);
    setFromText(String(value[0]));
    setToText(String(value[1]));
  }

  function commitInput(end: "from" | "to"): void {
    const [lo, hi] = draft;
    const text = end === "from" ? fromText : toText;
    const parsed = Number.parseFloat(text);
    const bound = end === "from" ? min : max;
    const raw = text.trim() === "" || Number.isNaN(parsed) ? bound : Math.round(parsed);
    const clamped =
      end === "from" ? Math.min(Math.max(raw, min), hi) : Math.min(Math.max(raw, lo), max);
    const next: ScoreRange = end === "from" ? [clamped, hi] : [lo, clamped];
    if (end === "from") setFromText(String(clamped));
    else setToText(String(clamped));
    if (next[0] === lo && next[1] === hi) return;
    setDraft(next);
    onCommit(next);
  }

  function inputField(end: "from" | "to"): ReactNode {
    return (
      <div className="flex-1">
        <Field label={end === "from" ? texts.from : texts.to} variant="inverse">
          <Input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={1}
            disabled={disabled}
            value={end === "from" ? fromText : toText}
            onChange={(event) =>
              end === "from" ? setFromText(event.target.value) : setToText(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              commitInput(end);
            }}
            onBlur={() => commitInput(end)}
          />
        </Field>
      </div>
    );
  }

  return (
    <fieldset className="flex flex-col">
      <legend className={FACET_LEGEND_CLASSES}>{legend}</legend>
      <div className="mt-3 px-3">
        <div className="px-2.5">
          <Slider.Root
            min={min}
            max={max}
            step={1}
            minStepsBetweenThumbs={0}
            value={[draft[0], draft[1]]}
            disabled={disabled}
            onValueChange={([lo = min, hi = max]) => {
              setDraft([lo, hi]);
              setFromText(String(lo));
              setToText(String(hi));
            }}
            onValueCommit={([lo = min, hi = max]) => onCommit([lo, hi])}
            className="relative flex h-5 w-full touch-none select-none items-center data-disabled:opacity-50"
          >
            <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-pill bg-border-inverse">
              <Slider.Range className="absolute h-full bg-surface-checked" />
            </Slider.Track>
            <Slider.Thumb aria-label={texts.minThumb} className={THUMB_CLASSES} />
            <Slider.Thumb aria-label={texts.maxThumb} className={THUMB_CLASSES} />
          </Slider.Root>
        </div>
      </div>
      <div className="mt-2 flex gap-3 px-3">
        {inputField("from")}
        {inputField("to")}
      </div>
    </fieldset>
  );
}
