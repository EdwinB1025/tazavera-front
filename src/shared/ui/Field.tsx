"use client";

import { useId, type ReactNode } from "react";
import { FieldContext } from "@/shared/ui/field-context";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: the field contract is pure UI and every
// text is a prop supplied by the consuming capability (design.md D1).

export type FieldProps = {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean; // marks the control and shows the visual-only asterisk
  variant?: "default" | "inverse"; // default "default"
  children: ReactNode; // one Input, Select or Textarea
};

/**
 * Tazavera field: label above the control, optional help text and optional
 * error message below it, bound to the control through the thin field context
 * (spec: "Field structure and association").
 *
 * Field generates the control, help and error ids with `useId` and carries the
 * invalid state (an error message is shown), the required state and the
 * field's variant in the context — context values the control reads as
 * defaults (design.md D1). The error message always renders as text beside the
 * boundary change, so the error is never conveyed by color alone.
 */
export function Field({
  label,
  help,
  error,
  required = false,
  variant = "default",
  children,
}: FieldProps): ReactNode {
  const controlId = useId();
  const helpId = useId();
  const errorId = useId();

  const hasHelp = help != null;
  const hasError = error != null;

  return (
    <FieldContext.Provider
      value={{
        controlId,
        helpId: hasHelp ? helpId : undefined,
        errorId: hasError ? errorId : undefined,
        invalid: hasError,
        required,
        variant,
      }}
    >
      <div className={variant === "inverse" ? "variant-inverse" : undefined}>
        <label htmlFor={controlId} className="type-label block">
          {label}
          {required && (
            <>
              {" "}
              <span aria-hidden="true">*</span>
            </>
          )}
        </label>
        {children}
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
    </FieldContext.Provider>
  );
}
