"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { closeAnEvaluation } from "@/entities/evaluation";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The close action's texts: the form's own `evaluations` catalog keys. */
export type CloseEvaluationTexts = {
  closeLabel: string;
  closedMessage: string;
  incompleteMessage: string;
  notYoursMessage: string;
  failureMessage: string;
};

export type CloseEvaluationActionProps = {
  ulid: string;
  texts: CloseEvaluationTexts;
  /** Receives the outcome's message, as the form shows it. */
  onMessage: (message: string) => void;
  /** Called once the API confirms the close. */
  onClosed: (ulid: string) => void;
};

/**
 * The Close action of an open row (close-evaluation-only-when-saved; spec
 * "Row actions"). It sends `closeAnEvaluation`, as the form does, with its
 * loading state, and reports the form's message for the outcome: closed on
 * success, incomplete on a `409`, "not yours" on a `403`, the generic
 * failure otherwise. Nothing is resent automatically.
 */
export function CloseEvaluationAction({
  ulid,
  texts,
  onMessage,
  onClosed,
}: CloseEvaluationActionProps): ReactNode {
  const [pending, setPending] = useState(false);

  const close = async () => {
    setPending(true);
    const result = await closeAnEvaluation(ulid);
    setPending(false);
    if (result.ok) {
      onMessage(texts.closedMessage);
      onClosed(ulid);
      return;
    }
    onMessage(
      result.kind === "conflict"
        ? texts.incompleteMessage
        : result.kind === "forbidden"
          ? texts.notYoursMessage
          : texts.failureMessage,
    );
  };

  return (
    <Button variant="action-3" loading={pending} onClick={pending ? undefined : close}>
      {texts.closeLabel}
    </Button>
  );
}
