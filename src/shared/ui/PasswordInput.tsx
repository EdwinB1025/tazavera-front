"use client";

import {
  useContext,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff } from "@/shared/ui/icons";
import { FieldContext } from "@/shared/ui/field-context";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: every text is a prop supplied by the
// consuming capability and PasswordInput writes no copy of its own (design.md
// D9) — the toggle's accessible name is `showPasswordLabel` while masked and
// `hidePasswordLabel` while revealed. It takes no `type` prop: its value is
// masked by default and readable while revealed. `name`, `readOnly`,
// `disabled`, `value`, `defaultValue`, `onChange` and all other native input
// attributes come from InputHTMLAttributes and pass through to the element.

export type PasswordInputVariant = "default" | "inverse";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  variant?: PasswordInputVariant; // default: the field's variant, else "default"
  showPasswordLabel: string; // the toggle's name while the value is masked
  hidePasswordLabel: string; // the toggle's name while the value is revealed
};

// ─── Treatment classes ───
// The box is the text input's, with the toggle's right padding (design rule
// 9): the inverse variant adds the variant-inverse scope utility plus its two
// explicit treatments, which are not a variable swap (design.md D2). The
// border swaps to the error treatment when the field is invalid (D9). No hover
// token in the default variant: on light surfaces the state shows on focus
// (spec: Hover on light surfaces).

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
 * Tazavera password input.
 *
 * Masked by default and readable while revealed (spec: "Password input").
 * Box, states and contract per the `form-fields` spec ("Data-entry control
 * states", "Control without a field") and design.md (D1 field contract, D2
 * inverse, D7 modes, D9 toggle treatment). The field context values are
 * defaults; an explicit prop always wins. Outside a Field the input receives
 * none of the field attributes and relies on the accessible name its consuming
 * capability supplies.
 */
export function PasswordInput({
  variant: variantProp,
  id: idProp,
  "aria-describedby": describedByProp,
  "aria-invalid": ariaInvalidProp,
  required: requiredProp,
  showPasswordLabel,
  hidePasswordLabel,
  disabled,
  className,
  ...rest
}: PasswordInputProps): ReactNode {
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

  // D9: the visibility toggle sits in the input's relative wrapper, names its
  // current action and carries the shared focus indicator. The wrapper carries
  // variant-inverse with the control, so the toggle icon and its focus ring
  // resolve to the inverse tokens even without a Field. The toggle is disabled
  // whenever the input is: out of the tab order and rejecting activation with
  // it.
  return (
    <div
      className={
        variant === "inverse" ? "relative variant-inverse" : "relative"
      }
    >
      <input
        {...rest}
        id={id}
        type={revealed ? "text" : "password"}
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
      <button
        type="button"
        onClick={() => setRevealed((was) => !was)}
        aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
        disabled={disabled}
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
