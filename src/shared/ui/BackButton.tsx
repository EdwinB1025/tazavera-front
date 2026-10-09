"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "@/shared/ui/icons";
import type { BackLinkProps } from "./BackLink";
import { RouteButton } from "./RouteButton";
import { useBackHref } from "./use-back-href";

// ─── UI-specific types (declared before the component) ───

export type BackButtonProps = BackLinkProps;

/**
 * The back control repeated at the end of a view (apply-header-link-rule; the
 * base-controls spec "Back link to the previous page"): an action button with
 * the back arrow, with the same destination as `BackLink`.
 */
export function BackButton({ fallback, children }: BackButtonProps): ReactNode {
  return (
    <RouteButton href={useBackHref(fallback)} variant="action-3" size="sm" icon={ArrowLeft}>
      {children}
    </RouteButton>
  );
}
