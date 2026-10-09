"use client";

import type { ReactNode } from "react";
import { Link } from "./Link";
import type { LinkProps } from "./Link";
import { useBackHref } from "./use-back-href";

// ─── UI-specific types (declared before the component) ───

export type BackLinkProps = {
  /** The fixed route opened when the user has no previous page of the application. */
  fallback: LinkProps["href"];
  children: ReactNode;
};

/**
 * The back control on the first line of a page header (apply-header-link-rule;
 * the base-controls specs "Back link to the previous page" and "Navigation
 * controls by position"): the shared link with its back arrow, opening the
 * page the user came from, with its query, or its fallback when there is none.
 */
export function BackLink({ fallback, children }: BackLinkProps): ReactNode {
  return (
    <Link href={useBackHref(fallback)} variant="back">
      {children}
    </Link>
  );
}
