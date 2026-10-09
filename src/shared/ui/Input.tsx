"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useFieldControl } from "./use-field-control";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: every text is a prop supplied by the
// consuming capability. `type`, `name`, `readOnly`, `disabled`, `value`,
// `defaultValue`, `onChange` and all native input attributes come from
// InputHTMLAttributes and pass through to the element.

export type InputVariant = "default" | "inverse";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant; // default: the field's variant, else "default"
};

// ─── Treatment classes ───
// The box is identical across variants (design rule 9): the inverse variant
// adds the variant-inverse scope utility plus its two explicit treatments,
// which are not a variable swap (design.md D2). The border swaps to the error
// treatment when the field is invalid (D9). No hover token in the default
// variant: on light surfaces the state shows on focus (spec: Hover on light
// surfaces).

const BOX_CLASSES = [
  "h-10",
  "w-full",
  "px-3",
  "rounded-field",
  "border-2",
  "bg-surface-input",
  "type-control",
  "placeholder:italic",
  "placeholder:text-text-placeholder",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const INVERSE_CLASSES = [
  "variant-inverse",
  "bg-transparent",
  "hover:border-nav-text-dark",
].join(" ");

/**
 * Tazavera text input.
 *
 * Box, states and contract per the `form-fields` spec ("Text input", "Data-
 * entry control states", "Control without a field") and design.md (D1 field
 * contract, D2 inverse, D7 modes, D8 native `type` passthrough). The field
 * context values are defaults; an explicit prop always wins. Outside a Field
 * the input receives none of the field attributes and relies on the accessible
 * name its consuming capability supplies. The password mode and its visibility
 * toggle live in PasswordInput (design.md D9).
 */
export function Input({
  variant: variantProp,
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
  disabled,
  className,
  ...rest
}: InputProps): ReactNode {
  // D1: context values are defaults, an explicit prop always wins.
  const { variant, id, describedBy, ariaInvalid, required, invalid } =
    useFieldControl({
      variant: variantProp,
      id: idProp,
      "aria-describedby": describedByProp,
      "aria-invalid": ariaInvalidProp,
      required: requiredProp,
    });

  return (
    <input
      {...rest}
      id={id}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid}
      required={required}
      disabled={disabled}
      className={[
        BOX_CLASSES,
        invalid ? "border-feedback-error" : "border-border-strong",
        variant === "inverse" ? INVERSE_CLASSES : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
