import type { ReactNode } from "react";
import { ArrowLeft, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NotFoundNoticeProps = {
  locale: string;
  title: string;
  line: string;
  backLabel: string;
};

// The title and its line 0.5rem apart, the back button 1.5rem below them
// (show-item-not-found-message design.md D2).
const NOTICE_CLASSES = ["flex", "flex-col", "items-start", "gap-6"].join(" ");
const TEXT_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");

/**
 * An unknown evaluation or offering in the specialist area
 * (show-item-not-found-message design.md D4): the item's title as the page
 * heading, its line, then the header's back button to My evaluations, with no
 * retry.
 */
export function NotFoundNotice({ locale, title, line, backLabel }: NotFoundNoticeProps): ReactNode {
  return (
    <div className={NOTICE_CLASSES}>
      <div className={TEXT_CLASSES}>
        <h1 className="type-heading">{title}</h1>
        <p className="type-body">{line}</p>
      </div>
      <RouteButton href={`/${locale}/manage/evaluations`} variant="action-3" size="sm" icon={ArrowLeft}>
        {backLabel}
      </RouteButton>
    </div>
  );
}
