import { createContext } from "react";

// ─── UI-specific types (declared before the components) ───
// No generated API type is used here: the field contract is pure UI and every
// text is a prop supplied by the consuming capability (design.md D1).

export type FieldContextValue = {
  controlId: string;
  helpId?: string;
  errorId?: string; // set when an error message is shown
  invalid: boolean;
  required: boolean;
  variant: "default" | "inverse"; // the field's variant
};

/**
 * Thin context binding a Field to the control it wraps (design.md D1).
 *
 * Input, Select and Textarea read it as defaults — an explicit prop always
 * wins over a context value. Outside a Field the value is `null`: the control
 * receives none of the field attributes and relies on the accessible name its
 * consuming capability supplies.
 */
export const FieldContext = createContext<FieldContextValue | null>(null);
