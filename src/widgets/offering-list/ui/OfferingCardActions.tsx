"use client";

import type { ReactNode } from "react";
import { useSession } from "@/features/auth";
import { EvaluateLink } from "@/features/evaluate-offering";
import { OfferingViewButton } from "@/entities/offering";

// ─── UI-specific types (declared before the component) ───

export type OfferingCardActionsProps = {
  ulid: string;
  locale: string;
  texts: { viewLabel: string; evaluateLabel: string };
};

/**
 * The actions this widget supplies to each offering card
 * (fix-production-aut-findings design.md D3; the landing spec "View link for
 * everyone", "No View action for anonymous visitors"): View for a signed-in
 * user, whatever the role, then Evaluate, which shows itself to a signed-in
 * specialist only (add-specialist-evaluations design.md D6). It reads the
 * viewer's session and passes it to `EvaluateLink`
 * (remove-cross-feature-auth-imports design.md D3).
 */
export function OfferingCardActions({
  ulid,
  locale,
  texts,
}: OfferingCardActionsProps): ReactNode {
  const session = useSession();
  return (
    <>
      {session.state === "authenticated" ? (
        <OfferingViewButton ulid={ulid} locale={locale} label={texts.viewLabel} />
      ) : null}
      <EvaluateLink session={session} ulid={ulid} locale={locale} texts={texts} />
    </>
  );
}
