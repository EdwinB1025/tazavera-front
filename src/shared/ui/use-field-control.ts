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
  const field = ownField ?? context;

  const ariaInvalid =
    props["aria-invalid"] ?? (field?.invalid ? "true" : undefined);

  return {
    variant: props.variant ?? field?.variant ?? "default",
    id: props.id ?? field?.controlId,
    describedBy:
      props["aria-describedby"] ??
      ([field?.helpId, field?.errorId].filter(Boolean).join(" ") || undefined),
    ariaInvalid,
    required: props.required ?? (field?.required ? true : undefined),
    invalid: ariaInvalid === true || ariaInvalid === "true",
  };
}
