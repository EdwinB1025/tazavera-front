import type { ReactNode } from "react";
import { Check } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

/** `success`: the request succeeded. `error`: the generic form-level error. */
export type FormStatusKind = "success" | "error";

export type FormStatusProps = {
  kind: FormStatusKind;
  text: string;
};

/**
 * The status a form shows above its actions (feedback "Request status messages"): a
 * success is a `role="status"` row with the `aria-hidden` `Check` beside its
 * text; the form-level error is `role="alert"` text, never colour alone.
 */
export function FormStatus({ kind, text }: FormStatusProps): ReactNode {
  if (kind === "error") {
    return (
      <p role="alert" className="type-error">
        {text}
      </p>
    );
  }
  return (
    <div role="status" className="flex items-start gap-2">
      <Check aria-hidden="true" className="size-4 shrink-0" />
      <span className="type-body">{text}</span>
    </div>
  );
}
