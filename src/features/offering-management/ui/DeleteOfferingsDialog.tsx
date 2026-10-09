"use client";

import type { ReactNode } from "react";
import { ConfirmDialog } from "@/shared/ui";
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
};

export type DeleteOfferingsDialogProps = {
  target: DeleteTarget | null;
  pending: boolean;
  error: DeleteError;
  onCancel: () => void;
  onConfirm: () => void;
  texts: DeleteOfferingsDialogTexts;
};

/**
 * The confirmation of both delete flows (design.md D5, D7): `ConfirmDialog`
 * with the single or the bulk texts. Its `error` slot is the dialog's single
 * `role="alert"` region: it carries the delete error.
 */
export function DeleteOfferingsDialog({
  target,
  pending,
  error,
  onCancel,
  onConfirm,
  texts,
}: DeleteOfferingsDialogProps): ReactNode {
  const many = target?.kind === "many";
  const errorContent = error === "failed" ? texts.deleteError : null;

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
