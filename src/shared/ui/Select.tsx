"use client";

import {
  useContext,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "@/shared/ui/icons";
import { FieldContext } from "@/shared/ui/field-context";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: the options are consumer-supplied
// <option> children and every text is a prop of the consuming capability.
// `name`, `disabled`, `value`, `defaultValue`, `onChange` and all native
// select attributes come from SelectHTMLAttributes and pass through.

export type SelectVariant = "default" | "inverse";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: SelectVariant; // default: the field's variant, else "default"
};

// ─── Treatment classes ───
// The box is the input box (design rule 9) plus `appearance-none`, so the
// closed box is styled and the open option list stays native and unstyled
// (design.md D9). The border swaps to the error treatment when the field is
// invalid (D9); the inverse variant adds the variant-inverse scope utility
// plus its two explicit treatments (D2).

const BOX_CLASSES = [
  "h-10",
  "w-full",
  "px-3",
  "pr-10",
  "rounded-field",
  "border-2",
  "bg-surface-input",
  "type-control",
  "placeholder:italic",
  "placeholder:text-text-placeholder",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
  "appearance-none",
].join(" ");

const INVERSE_CLASSES = [
  "variant-inverse",
  "bg-transparent",
  "hover:border-nav-text-dark",
].join(" ");

const CHEVRON_CLASSES = [
  "pointer-events-none",
  "absolute",
  "right-3",
  "top-1/2",
  "size-4",
  "-translate-y-1/2",
  "text-text-secondary",
].join(" ");

/**
 * Tazavera select.
 *
 * Closed box and contract per the `form-fields` spec ("Select", "Control
 * without a field") and design.md (D1 field contract, D2 inverse, D7 modes,
 * D9 chevron). The field context values are defaults; an explicit prop always
 * wins. The open option list renders in the platform's native presentation
 * without custom styling.
 */
export function Select({
  variant: variantProp,
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
  className,
  children,
  ...rest
}: SelectProps): ReactNode {
  const field = useContext(FieldContext);

  // D1: context values are defaults, an explicit prop always wins.
  const variant = variantProp ?? field?.variant ?? "default";
  const id = idProp ?? field?.controlId;
  const describedBy =
    describedByProp ??
    ([field?.helpId, field?.errorId].filter(Boolean).join(" ") || undefined);
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid ? "true" : undefined);
  const required = requiredProp ?? (field?.required ? true : undefined);
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  return (
    <div className="relative">
      <select
        {...rest}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid}
        required={required}
        className={[
          BOX_CLASSES,
          invalid ? "border-feedback-error" : "border-border-strong",
          variant === "inverse" ? INVERSE_CLASSES : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </select>
      <ChevronDown className={CHEVRON_CLASSES} />
    </div>
  );
}
