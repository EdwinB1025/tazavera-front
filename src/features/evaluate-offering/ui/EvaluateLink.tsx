"use client";

import type { ReactNode } from "react";
import { useSession } from "@/features/auth";
import { Link } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type EvaluateLinkTexts = {
  evaluateLabel: string;
};

export type EvaluateLinkProps = {
  /** The offering's `ulid`, from the card's actions slot. */
  ulid: string;
  locale: string;
  texts: EvaluateLinkTexts;
};

/**
 * The Evaluate action of an offering card (design.md D6; spec "Evaluate
 * action on the offering card"): a link to the new form of the offering for a
 * signed-in specialist, and nothing for anyone else, so the card itself keeps
 * no auth knowledge.
 */
export function EvaluateLink({ ulid, locale, texts }: EvaluateLinkProps): ReactNode {
  const session = useSession();
  if (session.state !== "authenticated" || session.user.role !== "specialist") {
    return null;
  }
  return (
    <Link href={`/${locale}/manage/evaluations/new?offering=${ulid}`}>{texts.evaluateLabel}</Link>
  );
}
