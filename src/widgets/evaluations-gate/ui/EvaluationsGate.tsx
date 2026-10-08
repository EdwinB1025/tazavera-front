"use client";

import type { ReactNode } from "react";
import { signIn, useSession } from "@/features/auth";
import { EvaluationsAccess, type EvaluationsAccessTexts } from "@/features/manage-evaluations";

// ─── UI-specific types (declared before the component) ───

export type EvaluationsGateProps = {
  texts: EvaluationsAccessTexts;
  children: ReactNode;
};

/**
 * The client seam of the evaluation routes' access gate
 * (remove-cross-feature-auth-imports design.md D2): it reads the session and
 * the sign-in action from the auth feature and passes them to
 * `EvaluationsAccess`, so the server-rendered screens keep their content.
 */
export function EvaluationsGate({ texts, children }: EvaluationsGateProps): ReactNode {
  const session = useSession();
  return (
    <EvaluationsAccess session={session} signIn={signIn} texts={texts}>
      {children}
    </EvaluationsAccess>
  );
}
