import type { ReactNode } from "react";
import { Button } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type StepUpNoticeTexts = {
  stepUpText: string;
  stepUpButton: string;
};

export type StepUpNoticeProps = {
  locale: string;
  texts: StepUpNoticeTexts;
  /** Starts the write-scope sign in for a return route (design.md D6). */
  requestProfileWrite: (returnRoute: string) => void;
};

/**
 * The step-up notice of a write answered `403` (spec "Writes and the
 * step-up"; design.md D6, D9 and D10): `role="alert"` text and "Confirm
 * identity", which starts the write-scope sign in for the account route
 * inside its click. Built from phrasing elements so it can sit inside the
 * dialog's error paragraph.
 */
export function StepUpNotice({
  locale,
  texts,
  requestProfileWrite,
}: StepUpNoticeProps): ReactNode {
  return (
    <span className="flex flex-col items-start gap-3">
      <span role="alert" className="type-body">
        {texts.stepUpText}
      </span>
      <Button
        variant="primary"
        size="base"
        onClick={() => requestProfileWrite(`/${locale}/account`)}
      >
        {texts.stepUpButton}
      </Button>
    </span>
  );
}
