"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** Which action is in flight, if any. */
export type FormBusy = "save" | "close" | null;

export type FormActionsProps = {
  saveLabel: string;
  closeLabel: string;
  onSave: () => void;
  onClose: () => void;
  busy: FormBusy;
  /** The confirmation or failure message of the last action. */
  message: string | null;
};

// ─── Layout end states (design.md D14; the summary §9) ───
// Below `md` a sticky bar fixed to the bottom of the viewport; from `md` an
// actions row with a top border and 1.5rem above the buttons.
const BAR_CLASSES = [
  "fixed",
  "inset-x-0",
  "bottom-0",
  "z-10",
  "flex",
  "flex-col",
  "gap-2",
  "bg-surface-card",
  "border-t",
  "border-border-subtle",
  "px-4",
  "py-3",
  "md:static",
  "md:z-auto",
  "md:flex-row",
  "md:items-center",
  "md:justify-end",
  "md:gap-4",
  "md:bg-transparent",
  "md:px-0",
  "md:pb-0",
  "md:pt-6",
].join(" ");
const BUTTONS_CLASSES = ["flex", "gap-4", "md:justify-end"].join(" ");
const BUTTON_WIDTH_CLASSES = "flex-1 md:flex-none";

/**
 * Save draft and Close evaluation (design.md D4, D14; spec "Saving a draft",
 * "Closing an evaluation"), with the `role="status"` region beside them that
 * carries the confirmation or failure message of the last action.
 */
export function FormActions({
  saveLabel,
  closeLabel,
  onSave,
  onClose,
  busy,
  message,
}: FormActionsProps): ReactNode {
  // One action at a time (design.md D4): while either runs, the other one
  // ignores activation too; only the running one shows its loading state.
  const idle = busy === null;
  return (
    <div data-slot="actions" className={BAR_CLASSES}>
      <p role="status" className="type-body">
        {message}
      </p>
      <div className={BUTTONS_CLASSES}>
        <Button
          variant="action-3"
          className={BUTTON_WIDTH_CLASSES}
          loading={busy === "save"}
          onClick={idle ? onSave : undefined}
        >
          {saveLabel}
        </Button>
        <Button
          variant="primary"
          className={BUTTON_WIDTH_CLASSES}
          loading={busy === "close"}
          onClick={idle ? onClose : undefined}
        >
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
