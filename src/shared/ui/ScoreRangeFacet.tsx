"use client";

import { useState, type ReactNode } from "react";
import { FACET_LEGEND_CLASSES } from "./facet-row";
import {
  clampedBound,
  ScoreRangeInput,
  ScoreRangeSlider,
  type ScoreRangeEnd,
} from "./ScoreRangeParts";

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

/**
 * Score range facet (spec filtering "Score range facet"; design.md D8): a
 * Radix two-thumb slider and "From" / "To" number inputs over a local draft
 * that follows `value`. The slider commits on release and on each keyboard
 * step; an input commits on Enter or blur, clamped, when the range changed.
 * The slider and the inputs render from `ScoreRangeParts`
 * (split-oversized-facets design.md D3).
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

  function commitInput(end: ScoreRangeEnd): void {
    const [lo, hi] = draft;
    const clamped = clampedBound(end, end === "from" ? fromText : toText, draft, min, max);
    const next: ScoreRange = end === "from" ? [clamped, hi] : [lo, clamped];
    if (end === "from") setFromText(String(clamped));
    else setToText(String(clamped));
    if (next[0] === lo && next[1] === hi) return;
    setDraft(next);
    onCommit(next);
  }

  return (
    <fieldset className="flex flex-col">
      <legend className={FACET_LEGEND_CLASSES}>{legend}</legend>
      <ScoreRangeSlider
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        thumbLabels={[texts.minThumb, texts.maxThumb]}
        onChange={([lo, hi]) => {
          setDraft([lo, hi]);
          setFromText(String(lo));
          setToText(String(hi));
        }}
        onCommit={onCommit}
      />
      <div className="mt-2 flex gap-3 px-3">
        <ScoreRangeInput
          label={texts.from}
          min={min}
          max={max}
          text={fromText}
          disabled={disabled}
          onTextChange={setFromText}
          onCommit={() => commitInput("from")}
        />
        <ScoreRangeInput
          label={texts.to}
          min={min}
          max={max}
          text={toText}
          disabled={disabled}
          onTextChange={setToText}
          onCommit={() => commitInput("to")}
        />
      </div>
    </fieldset>
  );
}
