import type { ReactNode } from "react";
import { Check } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type CompletenessIndicatorProps = {
  complete: boolean;
  completeLabel: string;
  incompleteLabel: string;
};

const INDICATOR_CLASSES = ["type-label", "inline-flex", "items-center", "gap-1"].join(" ");

/**
 * A group's completeness indicator (design.md D10; spec "Completeness
 * indicator"): "Complete" with the `Check` icon, or "Incomplete" as text alone.
 * The state is always in the words, never in colour alone.
 */
export function CompletenessIndicator({
  complete,
  completeLabel,
  incompleteLabel,
}: CompletenessIndicatorProps): ReactNode {
  return (
    <span className={INDICATOR_CLASSES}>
      {complete ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
      {complete ? completeLabel : incompleteLabel}
    </span>
  );
}
