"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: every text is a prop supplied by the
// consuming capability. `name`, `disabled`, `required`, `checked`,
// `defaultChecked`, `onChange` and all native input attributes come from
// InputHTMLAttributes and pass through to the element (design.md D7).

export type CheckboxVariant = "default" | "inverse";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  variant?: CheckboxVariant; // explicit prop only (design.md D1.1)
};

// ─── Treatment classes ───
// The native control is replaced by a custom box (`appearance-none`, size,
// radius and fill from the semantic tokens); the check mark carries the
// checked state so it never rests on the fill color alone (design.md D9).
// The mark is always rendered and follows the input's REAL state through CSS
// (`peer` on the input): hidden by default, shown with `peer-checked:`,
// faded with `peer-disabled:opacity-50`. The hidden base is `invisible` (not
// opacity) so the disabled fade never fights the checked show.
// The border swaps to the error treatment when the error message is shown
// (D9). The clickable label keeps the hit area at least 24 by 24 pixels
// (D9: flex min-h-6 min-w-6 items-center gap-2).

const BOX_CLASSES = [
  "peer",
  "size-4",
  "appearance-none",
  "rounded-check",
  "border-2",
  "checked:bg-surface-checked",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const LABEL_CLASSES = [
  "flex",
  "min-h-6",
  "min-w-6",
  "items-center",
  "gap-2",
].join(" ");

const MARK_CLASSES = [
  "pointer-events-none",
  "absolute",
  "top-1/2",
  "left-1/2",
  "size-3",
  "-translate-x-1/2",
  "-translate-y-1/2",
  "text-checked-mark",
  "invisible",
  "peer-checked:visible",
  "peer-disabled:opacity-50",
].join(" ");

/**
 * Tazavera checkbox.
 *
 * Box, mark, hit area and own-field contract per the `form-fields` spec
 * ("Checkbox") and design.md (D1.1, D2, D7, D9). The checkbox is its own
 * field and is never placed inside a Field: it renders its own label and
 * binds its own help text and error message to the input from its own props,
 * help before error.
 */
export function Checkbox({
  label,
  help,
  error,
  variant = "default",
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  className,
  ...rest
}: CheckboxProps): ReactNode {
  const checkboxId = useId();
  const helpId = useId();
  const errorId = useId();

  // D1.1: the attribute contract renders from the control's own props; an
  // explicit prop wins over the generated or derived value. An empty string
  // is not a message: `help=""` and `error=""` render nothing and wire
  // nothing. `checked`, `defaultChecked` and `onChange` pass through natively
  // (design.md D7): no React state mirrors the choice, the mark follows the
  // input's real state through CSS.
  const id = idProp ?? checkboxId;
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy =
    describedByProp ??
    ([hasHelp ? helpId : undefined, hasError ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined);
  const ariaInvalid = ariaInvalidProp ?? (hasError ? "true" : undefined);
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <div className={variant === "inverse" ? "variant-inverse" : undefined}>
      <label className={LABEL_CLASSES}>
        <span className="relative inline-flex">
          <input
            {...rest}
            id={id}
            type="checkbox"
            aria-describedby={describedBy}
            aria-invalid={ariaInvalid}
            className={[
              BOX_CLASSES,
              invalid ? "border-feedback-error" : "border-border-strong",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <Check className={MARK_CLASSES} />
        </span>
        <span className="type-label">{label}</span>
      </label>
      {hasHelp && (
        <p id={helpId} className="type-meta">
          {help}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="type-error">
          {error}
        </p>
      )}
    </div>
  );
}
