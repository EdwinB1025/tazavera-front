"use client";

import { useContext, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "@/shared/ui/icons";
import { FieldContext } from "@/shared/ui/field-context";

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

const TOGGLE_CLASSES = [
  "absolute",
  "inset-y-0",
  "right-0",
  "flex",
  "w-10",
  "items-center",
  "justify-center",
  "focus-visible:focus-ring",
].join(" ");

/**
 * Tazavera text input.
 *
 * Box, states and contract per the `form-fields` spec ("Text input", "Data-
 * entry control states", "Control without a field") and design.md (D1 field
 * contract, D2 inverse, D7 modes, D9 password reveal). The field context
 * values are defaults; an explicit prop always wins. Outside a Field the
 * input receives none of the field attributes and relies on the accessible
 * name its consuming capability supplies.
 */
export function Input({
  variant: variantProp,
  type = "text",
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
  className,
  ...rest
}: InputProps): ReactNode {
  const field = useContext(FieldContext);
  const [revealed, setRevealed] = useState(false);

  // D1: context values are defaults, an explicit prop always wins.
  const variant = variantProp ?? field?.variant ?? "default";
  const id = idProp ?? field?.controlId;
  const describedBy =
    describedByProp ??
    ([field?.helpId, field?.errorId].filter(Boolean).join(" ") || undefined);
  const ariaInvalid = ariaInvalidProp ?? (field?.invalid ? "true" : undefined);
  const required = requiredProp ?? (field?.required ? true : undefined);
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  const isPassword = type === "password";

  const input = (
    <input
      {...rest}
      id={id}
      type={isPassword && revealed ? "text" : type}
      aria-describedby={describedBy}
      aria-invalid={ariaInvalid}
      required={required}
      className={[
        BOX_CLASSES,
        invalid ? "border-feedback-error" : "border-border-strong",
        isPassword ? "pr-10" : "",
        variant === "inverse" ? INVERSE_CLASSES : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  if (!isPassword) return input;

  // Password mode (D9): the visibility toggle sits in the input's relative
  // wrapper, names its current action and carries the shared focus indicator.
  return (
    <div className="relative">
      {input}
      <button
        type="button"
        onClick={() => setRevealed((was) => !was)}
        aria-label={revealed ? "Hide password" : "Show password"}
        className={TOGGLE_CLASSES}
      >
        {revealed ? (
          <EyeOff className="size-4 text-text-secondary" />
        ) : (
          <Eye className="size-4 text-text-secondary" />
        )}
      </button>
    </div>
  );
}
