"use client";

import type { ReactNode } from "react";
import { usePreviousUrl } from "@/shared/lib/navigation-history";
import { ArrowLeft } from "@/shared/ui/icons";
import type { LinkProps } from "./Link";
import { RouteButton } from "./RouteButton";

// ─── UI-specific types (declared before the component) ───

export type BackLinkProps = {
  /** The fixed route opened when the user has no previous page of the application. */
  fallback: LinkProps["href"];
  children: ReactNode;
};

/**
 * The back control (fix-production-aut-findings design.md D5; the base-controls
 * spec "Back link to the previous page"): an action button
 * (render-navigation-actions-as-buttons) with the back arrow, opening the page the user came from, with its query, or its
 * fallback when there is none. The first render, on the server and at
 * hydration, addresses the fallback.
 */
export function BackLink({ fallback, children }: BackLinkProps): ReactNode {
  const previous = usePreviousUrl();
  return (
    <RouteButton
      href={(previous ?? fallback) as LinkProps["href"]}
      variant="action-3"
      size="sm"
      icon={ArrowLeft}
    >
      {children}
    </RouteButton>
  );
}
