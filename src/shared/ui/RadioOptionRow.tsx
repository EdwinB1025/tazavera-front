"use client";

import { type ReactNode } from "react";
import {
  facetRowClasses,
  withoutDisabledFade,
  type ControlPresentation,
} from "./facet-row";
import type { RadioOption } from "./RadioGroup";

// ─── UI-specific types (declared before the component) ───

export type RadioOptionRowProps = {
  option: RadioOption;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  hasError: boolean;
  presentation: ControlPresentation;
};

// ─── Treatment classes ───
// The native control is replaced by a custom circle (`appearance-none`, size,
// fill and the intrinsic rounded-full circle of design.md D6); the dot carries
// the selected state so it never rests on the fill color alone (D9). The dot
// is always rendered and follows the input's REAL state through CSS (`peer`
// on the input): hidden by default, shown with `peer-checked:`, faded with
// `peer-disabled:opacity-50`. The hidden base is `invisible` (not opacity) so
// the disabled fade never fights the checked show.
// The border swaps to the error treatment when the error message is shown
// (D9). The clickable option label keeps the hit area at least 24 by 24
// pixels (D9: flex min-h-6 min-w-6 items-center gap-2).

const CIRCLE_CLASSES = [
  "peer",
  "size-4",
  "appearance-none",
  "rounded-full",
  "border-2",
  "checked:bg-surface-checked",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const OPTION_LABEL_CLASSES = [
  "flex",
  "min-h-6",
  "min-w-6",
  "items-center",
  "gap-2",
].join(" ");

const DOT_CLASSES = [
  "pointer-events-none",
  "absolute",
  "top-1/2",
  "left-1/2",
  "size-2",
  "rounded-full",
  "-translate-x-1/2",
  "-translate-y-1/2",
  "bg-checked-mark",
  "invisible",
  "peer-checked:visible",
  "peer-disabled:opacity-50",
].join(" ");

/** One option of a radio group: the circle, its dot and its label. */
export function RadioOptionRow({
  option,
  name,
  value,
  defaultValue,
  onChange,
  required,
  disabled,
  hasError,
  presentation,
}: RadioOptionRowProps): ReactNode {
  const isRow = presentation === "row";
  const row = isRow
    ? facetRowClasses({
        selected: !option.neutral && value === option.value,
        disabled,
      })
    : undefined;
  return (
    <label
      className={row ? row.row : OPTION_LABEL_CLASSES}
      hidden={option.hidden || undefined}
    >
      <span className="relative inline-flex">
        <input
          type="radio"
          name={name}
          value={option.value}
          checked={
            value !== undefined ? option.value === value : undefined
          }
          defaultChecked={
            value === undefined ? option.value === defaultValue : undefined
          }
          onChange={() => onChange?.(option.value)}
          required={required}
          disabled={disabled}
          className={[
            isRow ? withoutDisabledFade(CIRCLE_CLASSES) : CIRCLE_CLASSES,
            hasError
              ? "border-feedback-error"
              : isRow
                ? "border-nav-button-border"
                : "border-border-strong",
          ].join(" ")}
        />
        <span className={isRow ? withoutDisabledFade(DOT_CLASSES) : DOT_CLASSES} />
      </span>
      <span className={row ? row.label : "type-label"}>
        {option.label}
      </span>
    </label>
  );
}
