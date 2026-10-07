"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";

// ─── UI-specific types (declared before the component) ───

export type StepUpNoticeProps = {
  text: string;
  actionLabel: string;
  /** Starts the consumer's write-scope sign in, inside the click. */
  onConfirm: () => void;
};

/**
 * The step-up notice of a write answered `403` (feedback "Request status
 * messages"): `role="alert"` text and an action that calls `onConfirm`
 * synchronously inside its click. Built from phrasing elements so it can sit
 * inside a dialog's error paragraph.
 */
export function StepUpNotice({
  text,
  actionLabel,
  onConfirm,
}: StepUpNoticeProps): ReactNode {
  return (
    <span className="flex flex-col items-start gap-3">
      <span role="alert" className="type-body">
        {text}
      </span>
      <Button
        variant="primary"
        size="base"
        type="button"
        onClick={() => onConfirm()}
      >
        {actionLabel}
      </Button>
    </span>
  );
}
