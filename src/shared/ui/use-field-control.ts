"use client";

import { useContext, type AriaAttributes } from "react";
import { FieldContext, type FieldContextValue } from "./field-context";

// ─── UI-specific types (declared before the hook) ───
// No generated API type is used here: the field contract is pure UI
// (form-fields design.md D1).

/** The control's explicit props; each one wins over the field's value. */
export type FieldControlProps = {
  variant?: FieldContextValue["variant"];
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  required?: boolean;
};

export type FieldControl = {
  variant: FieldContextValue["variant"];
  id: string | undefined;
  describedBy: string | undefined;
  ariaInvalid: AriaAttributes["aria-invalid"];
  required: boolean | undefined;
  invalid: boolean; // ariaInvalid is true or "true"
};

/** The field's values, the defaults each explicit prop overrides. */
function fieldDefaults(field: FieldContextValue | null): Omit<FieldControl, "invalid"> {
  if (field === null) {
    return {
      variant: "default",
      id: undefined,
      describedBy: undefined,
      ariaInvalid: undefined,
      required: undefined,
    };
  }
  return {
    variant: field.variant,
    id: field.controlId,
    describedBy:
      [field.helpId, field.errorId].filter(Boolean).join(" ") || undefined,
    ariaInvalid: field.invalid ? "true" : undefined,
    required: field.required ? true : undefined,
  };
}

/**
 * Resolves a control's field attributes (extract-field-control-hook design.md
 * D2): context values are defaults, an explicit prop always wins (form-fields
 * design.md D1). The field is `ownField` when the control supplies its own
 * (Checkbox), else the enclosing Field's context, or none outside a Field.
 */
export function useFieldControl(
  props: FieldControlProps,
  ownField?: FieldContextValue,
): FieldControl {
  const context = useContext(FieldContext);
  const defaults = fieldDefaults(ownField ?? context);
  const ariaInvalid = props["aria-invalid"] ?? defaults.ariaInvalid;

  return {
    variant: props.variant ?? defaults.variant,
    id: props.id ?? defaults.id,
    describedBy: props["aria-describedby"] ?? defaults.describedBy,
    ariaInvalid,
    required: props.required ?? defaults.required,
    invalid: ariaInvalid === true || ariaInvalid === "true",
  };
}
