"use client";

import { useRef, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./AlertDialog";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). API errors reach the user only as copy the consumer passes
// in: a request failure message as `error`, rendered in the alert region with
// the dialog kept open (design.md D8).

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  error?: ReactNode;
};

// ─── Layout classes (design.md D8) ───
// Below `sm` the actions stack full width with the confirm above the cancel
// (reversed column); from `sm` they sit in one right-aligned row, cancel then
// confirm, the DOM order.

const ACTIONS_CLASSES =
  "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end";
const ACTION_WIDTH_CLASSES = "w-full sm:w-auto";

/**
 * Tazavera confirmation dialog.
 *
 * Confirms one destructive action per the `feedback` spec ("Confirmation
 * dialog") and design.md (D2, D8), on the alert-dialog primitive: it focuses
 * the cancel on open and never closes from the overlay. The confirm runs the
 * consumer's request and does not close the dialog: the consumer closes it on
 * success and passes `error` on failure. While `pending`, Escape and the
 * cancel are inert. On close, focus returns to the element that held it when
 * the dialog opened, the trigger, which the consumer renders outside it.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending = false,
  error,
}: ConfirmDialogProps): ReactNode {
  const triggerRef = useRef<HTMLElement | null>(null);
  const hasError = error != null && error !== "";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        onOpenAutoFocus={() => {
          // Runs before the primitive moves focus to the cancel.
          triggerRef.current = document.activeElement as HTMLElement | null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <AlertDialogTitle className="type-card-heading">{title}</AlertDialogTitle>
        <AlertDialogDescription className="type-body mt-2">
          {description}
        </AlertDialogDescription>
        <div role="alert" className={hasError ? "mt-3" : undefined}>
          {hasError && <p className="type-error">{error}</p>}
        </div>
        <div className={ACTIONS_CLASSES}>
          <AlertDialogCancel asChild>
            <Button
              variant="action-4"
              disabled={pending}
              className={ACTION_WIDTH_CLASSES}
            >
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <Button
            variant="primary"
            loading={pending}
            onClick={onConfirm}
            className={ACTION_WIDTH_CLASSES}
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
