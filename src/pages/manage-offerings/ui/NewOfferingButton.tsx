import type { ReactNode } from "react";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type NewOfferingButtonProps = {
  locale: string;
  label: string;
};

/**
 * The "New offering" action (apply-header-link-rule; the offering-management
 * spec "My offerings list"): one button to the create route, in positional
 * treatment 1 (create), used in the panel header and in the empty list.
 */
export function NewOfferingButton({ locale, label }: NewOfferingButtonProps): ReactNode {
  return (
    <RouteButton href={`/${locale}/manage/offerings/new`} variant="action-1" size="sm">
      {label}
    </RouteButton>
  );
}
