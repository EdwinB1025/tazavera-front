import type { ComponentProps, ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───

export type ActionGroupAlign = "start" | "end";

export type ActionGroupProps = ComponentProps<"div"> & {
  /** Where the row sits from `md`; below it the two columns fill the row. */
  align?: ActionGroupAlign;
};

// Below `md`: two equal columns, each action filling its cell, so the actions
// share one width (an odd last one keeps the cell width). From `md`: a
// wrapping row in which each action keeps its own minimum width
// (unify-action-button-widths D3).
const GROUP_CLASSES = "grid grid-cols-2 gap-3 max-md:*:w-full max-md:*:min-w-0 md:flex md:flex-wrap";

const ALIGN_CLASSES: Record<ActionGroupAlign, string> = {
  start: "md:justify-start",
  end: "md:justify-end",
};

/**
 * The shared group for two or more action buttons shown together (form
 * actions, card and dialog footers, list rows): base-controls "Action group".
 */
export function ActionGroup({ align = "start", className, ...rest }: ActionGroupProps): ReactNode {
  return (
    <div
      {...rest}
      className={[GROUP_CLASSES, ALIGN_CLASSES[align], className].filter(Boolean).join(" ")}
    />
  );
}
