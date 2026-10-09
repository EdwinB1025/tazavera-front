"use client";

import type { ReactNode } from "react";
import type { Session } from "@/shared/api";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type EvaluateLinkTexts = {
  evaluateLabel: string;
};

export type EvaluateLinkProps = {
  /** The viewer's session, from the caller. */
  session: Session;
  /** The offering's `ulid`, from the card's actions slot. */
  ulid: string;
  locale: string;
  texts: EvaluateLinkTexts;
};

/**
 * The Evaluate action of an offering card (design.md D6; spec "Evaluate
 * action on the offering card"): an action button opening the new form of the
 * offering for a signed-in specialist (fix-production-aut-findings design.md
 * D4), and nothing for anyone else, so the card itself keeps no auth knowledge.
 * The session comes from the caller.
 */
export function EvaluateLink({ session, ulid, locale, texts }: EvaluateLinkProps): ReactNode {
  if (session.state !== "authenticated" || session.user.role !== "specialist") {
    return null;
  }
  return (
    <RouteButton
      href={`/${locale}/manage/evaluations/new?offering=${ulid}`}
      variant="action-1"
      size="sm"
    >
      {texts.evaluateLabel}
    </RouteButton>
  );
}
