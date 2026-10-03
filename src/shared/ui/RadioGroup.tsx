"use client";

import { useId, type ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: the options and every text are supplied
// by the consuming capability. `value`, `defaultValue` and `onChange` live at
// group level (design.md D7).

export type RadioOption = {
  value: string;
  label: ReactNode;
};

export type RadioGroupVariant = "default" | "inverse";

export type RadioGroupProps = {
  legend: ReactNode;
  options: RadioOption[];
  name?: string; // shared by the options so keyboard grouping is native
  value?: string; // controlled mode
  defaultValue?: string; // uncontrolled mode
  onChange?: (value: string) => void;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean; // marks each radio input required
  disabled?: boolean;
  variant?: RadioGroupVariant; // explicit prop only (design.md D1.1)
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

/**
 * Tazavera radio group.
 *
 * Group name, single choice, dot, hit area and own-field contract per the
 * `form-fields` spec ("Radio group") and design.md (D1.1, D2, D7, D9). The
 * radio group is its own field and is never placed inside a Field: its
 * `fieldset` legend names the group and it binds its own help text and error
 * message to the fieldset from its own props, help before error. The options
 * share one `name`, so keyboard grouping and mutual exclusion are native.
 */
export function RadioGroup({
  legend,
  options,
  name: nameProp,
  value,
  defaultValue,
  onChange,
  help,
  error,
  required,
  disabled,
  variant = "default",
}: RadioGroupProps): ReactNode {
  const groupId = useId();
  const legendId = useId();
  const helpId = useId();
  const errorId = useId();
  const generatedName = useId();
  const name = nameProp ?? generatedName;

  // D1.1: the attribute contract renders from the control's own props. An
  // empty string is not a message: `help=""` and `error=""` render nothing and
  // wire nothing. `value` / `defaultValue` / `onChange` stay at group level
  // (design.md D7): no React state mirrors the choice, the dots follow the
  // inputs' real state through CSS. Review round 1: the fieldset is the named
  // group itself for assistive technology (`role="radiogroup"` with
  // `aria-labelledby` on the legend) and keeps `aria-describedby` and
  // `aria-invalid`, which a plain group does not expose.
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy = [
    hasHelp ? helpId : undefined,
    hasError ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset
      id={groupId}
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={describedBy || undefined}
      aria-invalid={hasError ? "true" : undefined}
      className={variant === "inverse" ? "variant-inverse" : undefined}
    >
      <legend id={legendId} className="type-label mb-2">
        {legend}
      </legend>
      {options.map((option) => {
        return (
          <label key={option.value} className={OPTION_LABEL_CLASSES}>
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
                  CIRCLE_CLASSES,
                  hasError ? "border-feedback-error" : "border-border-strong",
                ].join(" ")}
              />
              <span className={DOT_CLASSES} />
            </span>
            <span className="type-label">{option.label}</span>
          </label>
        );
      })}
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
    </fieldset>
  );
}
