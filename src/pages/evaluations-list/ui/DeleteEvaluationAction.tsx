"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { deleteAnEvaluation } from "@/entities/evaluation";
import { Button, ConfirmDialog } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The delete action's texts, from the `evaluations` catalog (design.md D14). */
export type DeleteEvaluationTexts = {
  deleteLabel: string;
  deleteTitle: string;
  deleteDescription: string;
  deleteConfirmLabel: string;
  deleteCancelLabel: string;
  notYoursMessage: string;
  failureMessage: string;
};

export type DeleteEvaluationActionProps = {
  ulid: string;
  texts: DeleteEvaluationTexts;
  /** Called once the API confirms the deletion. */
  onDeleted: (ulid: string) => void;
};

/**
 * The Delete action of a row (design.md D4 and its error table; spec "Row
 * actions"). It opens `ConfirmDialog`; confirming sends `deleteAnEvaluation`
 * with the confirm pending, closes the dialog and reports the deletion on
 * success; a `403` shows the "not yours" text and any other failure the
 * generic one in the dialog's `error`. Nothing is resent automatically.
 */
export function DeleteEvaluationAction({
  ulid,
  texts,
  onDeleted,
}: DeleteEvaluationActionProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (!next) setError(null);
  };

  const confirm = async () => {
    setPending(true);
    setError(null);
    const result = await deleteAnEvaluation(ulid);
    setPending(false);
    if (result.ok) {
      setOpen(false);
      onDeleted(ulid);
      return;
    }
    setError(result.status === 403 ? texts.notYoursMessage : texts.failureMessage);
  };

  return (
    <>
      <Button variant="action-2" onClick={() => changeOpen(true)}>
        {texts.deleteLabel}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={changeOpen}
        title={texts.deleteTitle}
        description={texts.deleteDescription}
        confirmLabel={texts.deleteConfirmLabel}
        cancelLabel={texts.deleteCancelLabel}
        onConfirm={confirm}
        pending={pending}
        error={error}
      />
    </>
  );
}
