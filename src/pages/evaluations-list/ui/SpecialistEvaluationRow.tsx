"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { SpecialistEvaluationRowCard } from "@/widgets/evaluation-row";
import type { SpecialistEvaluationRowCardTexts } from "@/widgets/evaluation-row";
import { Button } from "@/shared/ui";
import { CloseEvaluationAction } from "./CloseEvaluationAction";
import type { CloseEvaluationTexts } from "./CloseEvaluationAction";
import { DeleteEvaluationAction } from "./DeleteEvaluationAction";
import type { DeleteEvaluationTexts } from "./DeleteEvaluationAction";

// ─── UI-specific types (declared before the component) ───

/** Every label and caption of a row, from the `evaluations` catalog (design.md D14). */
export type EvaluationRowTexts = DeleteEvaluationTexts &
  CloseEvaluationTexts &
  SpecialistEvaluationRowCardTexts & {
    editLabel: string;
    viewLabel: string;
  };

export type SpecialistEvaluationRowProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read. */
  offering: OfferingDetail | null;
  locale: string;
  texts: EvaluationRowTexts;
  /** Called once the row's evaluation is deleted. */
  onDeleted: (ulid: string) => void;
  /** Called once the row's evaluation is closed. */
  onClosed: (ulid: string) => void;
};

/**
 * One row of "My evaluations" (spec "My evaluations list" and "Row
 * actions"): the shared row card with the specialist's actions in its slot
 * (add-public-evaluations design.md D6) — Edit for an open evaluation, View
 * for a closed one or one whose offering was deleted, both opening its form
 * route, Close for an open one with its offering (close-evaluation-only-when-saved)
 * with the outcome's message in a status line, and Delete with its
 * confirmation.
 */
export function SpecialistEvaluationRow({
  evaluation,
  offering,
  locale,
  texts,
  onDeleted,
  onClosed,
}: SpecialistEvaluationRowProps): ReactNode {
  const router = useRouter();
  // Mounted only while it holds a message: one status region per row would
  // sit beside the list's result count otherwise.
  const [message, setMessage] = useState<string | null>(null);
  const viewOnly = evaluation.status === "closed" || evaluation.offeringId === null;
  const formRoute = `/${locale}/manage/evaluations/${evaluation.ulid ?? ""}`;

  return (
    <SpecialistEvaluationRowCard
      evaluation={evaluation}
      offering={offering}
      texts={texts}
      actions={
        <>
          {message ? (
            <p role="status" className="type-body">
              {message}
            </p>
          ) : null}
          <Button variant={viewOnly ? "action-3" : "action-4"} onClick={() => router.push(formRoute)}>
            {viewOnly ? texts.viewLabel : texts.editLabel}
          </Button>
          {viewOnly ? null : (
            <CloseEvaluationAction
              ulid={evaluation.ulid ?? ""}
              texts={texts}
              onMessage={setMessage}
              onClosed={onClosed}
            />
          )}
          <DeleteEvaluationAction
            ulid={evaluation.ulid ?? ""}
            texts={texts}
            onDeleted={onDeleted}
          />
        </>
      }
    />
  );
}
