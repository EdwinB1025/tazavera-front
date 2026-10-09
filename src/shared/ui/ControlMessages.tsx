"use client";

import { useId, type ReactNode } from "react";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used here: the messages are props supplied by the
// consuming capability (split-oversized-shared-ui design.md D2).

export type ControlMessageIds = {
  helpId: string;
  errorId: string;
  hasHelp: boolean;
  hasError: boolean;
  /** Help id before error id; undefined when neither message is shown. */
  describedBy: string | undefined;
};

export type ControlMessagesProps = {
  ids: ControlMessageIds;
  help?: ReactNode;
  error?: ReactNode;
  /** Appended to both paragraphs (the facet-row presentation). */
  className?: string;
};

/**
 * The help and error ids of an own-field control. The `RadioGroup` contract:
 * an empty string is not a message, so it renders and wires nothing.
 */
export function useControlMessages(
  help: ReactNode,
  error: ReactNode,
): ControlMessageIds {
  const helpId = useId();
  const errorId = useId();
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy =
    [hasHelp ? helpId : undefined, hasError ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return { helpId, errorId, hasHelp, hasError, describedBy };
}

/** The help paragraph, then the error paragraph, each only when present. */
export function ControlMessages({
  ids,
  help,
  error,
  className,
}: ControlMessagesProps): ReactNode {
  const extra = className ? ` ${className}` : "";
  return (
    <>
      {ids.hasHelp && (
        <p id={ids.helpId} className={`type-meta mt-1${extra}`}>
          {help}
        </p>
      )}
      {ids.hasError && (
        <p id={ids.errorId} className={`type-error mt-1${extra}`}>
          {error}
        </p>
      )}
    </>
  );
}
