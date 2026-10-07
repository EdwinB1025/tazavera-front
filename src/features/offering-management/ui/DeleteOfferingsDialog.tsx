"use client";

import type { ReactNode } from "react";
import { Button, ConfirmDialog } from "@/shared/ui";
import type { DeleteError, DeleteTarget } from "../model/delete-flow";

// ─── UI-specific types (declared before the component) ───

export type DeleteOfferingsDialogTexts = {
  deleteOneTitle: string;
  deleteOneDescription: string;
  deleteManyTitle: string;
  deleteManyDescription: string;
  deleteConfirmLabel: string;
  cancelLabel: string;
  deleteError: string;
  stepUpMessage: string;
  stepUpLabel: string;
};

export type DeleteOfferingsDialogProps = {
  target: DeleteTarget | null;
  pending: boolean;
  error: DeleteError;
  onCancel: () => void;
  onConfirm: () => void;
  /** Starts the identity check (`requestProfileWrite`, injected by the page). */
  onStepUp: () => void;
  texts: DeleteOfferingsDialogTexts;
};

// The step-up text and its action: a column 0.75rem apart, no box (summary
// §6.3), inside the dialog's error slot.
const STEP_UP_CLASSES = ["flex", "flex-col", "items-start", "gap-3"].join(" ");

/**
 * The confirmation of both delete flows (design.md D5, D7): `ConfirmDialog`
 * with the single or the bulk texts. Its `error` slot is the dialog's single
 * `role="alert"` region: it carries the delete error, or the step-up text and
 * its action, which carry no role of their own.
 */
export function DeleteOfferingsDialog({
  target,
  pending,
  error,
  onCancel,
  onConfirm,
  onStepUp,
  texts,
}: DeleteOfferingsDialogProps): ReactNode {
  const many = target?.kind === "many";
  let errorContent: ReactNode = null;
  if (error === "failed") {
    errorContent = texts.deleteError;
  } else if (error === "step-up") {
    errorContent = (
      <span className={STEP_UP_CLASSES}>
        <span>{texts.stepUpMessage}</span>
        <Button variant="primary" size="sm" onClick={onStepUp}>
          {texts.stepUpLabel}
        </Button>
      </span>
    );
  }

  return (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
      title={many ? texts.deleteManyTitle : texts.deleteOneTitle}
      description={many ? texts.deleteManyDescription : texts.deleteOneDescription}
      confirmLabel={texts.deleteConfirmLabel}
      cancelLabel={texts.cancelLabel}
      onConfirm={onConfirm}
      pending={pending}
      error={errorContent}
    />
  );
}
