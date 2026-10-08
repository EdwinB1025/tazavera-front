"use client";

import type { ReactNode, TextareaHTMLAttributes } from "react";
import { useFieldControl } from "./use-field-control";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: every text is a prop supplied by the
// consuming capability. `name`, `readOnly`, `disabled`, `value`,
// `defaultValue`, `onChange` and all native textarea attributes come from
// TextareaHTMLAttributes and pass through to the element (design.md D3).
//
// Textarea renders the default variant only and takes no `variant` prop
// (design.md D4): it is never placed on a dark surface.

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// ─── Treatment classes ───
// The textarea has its own surface and boundary treatment, visibly distinct
// from the input's box (spec: Distinct treatment): its own surface token and
// the muted border. The border swaps to the error treatment when the field is
// invalid (design.md D9). No hover token: on light surfaces the state shows on
// focus (spec: Hover on light surfaces).

const BOX_CLASSES = [
  "w-full",
  "px-3",
  "py-2",
  "rounded-field",
  "border-2",
  "bg-surface-textarea",
  "type-control",
  "placeholder:italic",
  "placeholder:text-text-placeholder",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

/**
 * Tazavera textarea.
 *
 * Surface, boundary and contract per the `form-fields` spec ("Textarea",
 * "Control without a field") and design.md (D1 field contract, D3 readOnly,
 * D4 no variant, D7 modes). The field context values are defaults; an
 * explicit prop always wins. Outside a Field the textarea receives none of
 * the field attributes and relies on the accessible name its consuming
 * capability supplies.
 */
export function Textarea({
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
  className,
  ...rest
}: TextareaProps): ReactNode {
  // D1: context values are defaults, an explicit prop always wins.
  const { id, describedBy, ariaInvalid, required, invalid } = useFieldControl({
    id: idProp,
    "aria-describedby": describedByProp,
    "aria-invalid": ariaInvalidProp,
    required: requiredProp,
  });

  return (
    <textarea
      {...rest}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid}
      required={required}
      className={[
        BOX_CLASSES,
        invalid ? "border-feedback-error" : "border-border-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
