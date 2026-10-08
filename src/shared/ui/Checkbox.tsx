"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "@/shared/ui/icons";
import { useFieldControl } from "./use-field-control";
import {
  FACET_MESSAGE_CLASSES,
  facetRowClasses,
  withoutDisabledFade,
  type ControlPresentation,
} from "./facet-row";

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
  // add-facet-controls design.md D3: "row" is used controlled, with
  // `variant="inverse"` on the sidebar; the row look follows `checked`.
  presentation?: ControlPresentation;
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
  presentation = "field",
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
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
  // input's real state through CSS. The checkbox's own ids and messages are
  // the field it resolves from, so an enclosing Field never applies.
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const { id, describedBy, ariaInvalid, required, invalid } = useFieldControl(
    {
      id: idProp,
      "aria-describedby": describedByProp,
      "aria-invalid": ariaInvalidProp,
      required: requiredProp,
    },
    {
      controlId: checkboxId,
      helpId: hasHelp ? helpId : undefined,
      errorId: hasError ? errorId : undefined,
      invalid: hasError,
      required: false,
      variant,
    },
  );
  const row =
    presentation === "row"
      ? facetRowClasses({ selected: rest.checked === true, disabled: rest.disabled })
      : undefined;

  return (
    <div className={variant === "inverse" ? "variant-inverse" : undefined}>
      <label className={row ? row.row : LABEL_CLASSES}>
        <span className="relative inline-flex">
          <input
            {...rest}
            id={id}
            type="checkbox"
            aria-describedby={describedBy}
            aria-invalid={ariaInvalid}
            required={required}
            className={[
              row ? withoutDisabledFade(BOX_CLASSES) : BOX_CLASSES,
              invalid
                ? "border-feedback-error"
                : row
                  ? "border-nav-button-border"
                  : "border-border-strong",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <Check className={row ? withoutDisabledFade(MARK_CLASSES) : MARK_CLASSES} />
        </span>
        <span className={row ? row.label : "type-label"}>{label}</span>
      </label>
      {hasHelp && (
        <p id={helpId} className={row ? `type-meta mt-1 ${FACET_MESSAGE_CLASSES}` : "type-meta mt-1"}>
          {help}
        </p>
      )}
      {hasError && (
        <p id={errorId} className={row ? `type-error mt-1 ${FACET_MESSAGE_CLASSES}` : "type-error mt-1"}>
          {error}
        </p>
      )}
    </div>
  );
}
