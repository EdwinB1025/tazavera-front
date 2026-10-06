"use client";

import type { ReactNode } from "react";

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
