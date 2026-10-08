"use client";

import type { ReactNode } from "react";
import { usePreviousUrl } from "@/shared/lib/navigation-history";
import { Link } from "./Link";
import type { LinkProps } from "./Link";

// ─── UI-specific types (declared before the component) ───

export type BackLinkProps = {
  /** The fixed route opened when the user has no previous page of the application. */
  fallback: LinkProps["href"];
  children: ReactNode;
};

/**
 * The back link (fix-production-aut-findings design.md D5; the base-controls
 * spec "Back link to the previous page"): the shared `Link` in its back
 * variant, addressing the page the user came from, with its query, or its
 * fallback when there is none. The first render, on the server and at
 * hydration, addresses the fallback.
 */
export function BackLink({ fallback, children }: BackLinkProps): ReactNode {
  const previous = usePreviousUrl();
  return (
    <Link variant="back" href={(previous ?? fallback) as LinkProps["href"]}>
      {children}
    </Link>
  );
}
