"use client";

import type { ReactNode } from "react";
import { useSession } from "@/features/auth";
import { EvaluateLink, type EvaluateLinkProps } from "@/features/evaluate-offering";

// ─── UI-specific types (declared before the component) ───

export type EvaluateActionProps = Omit<EvaluateLinkProps, "session">;

/**
 * The client seam of an offering card's Evaluate action
 * (remove-cross-feature-auth-imports design.md D3): it reads the viewer's
 * session from the auth feature and passes it to `EvaluateLink`.
 */
export function EvaluateAction(props: EvaluateActionProps): ReactNode {
  const session = useSession();
  return <EvaluateLink session={session} {...props} />;
}
