"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { SpecialistEvaluationRowCard } from "@/widgets/evaluation-row";
import type { SpecialistEvaluationRowCardTexts } from "@/widgets/evaluation-row";
import { Button } from "@/shared/ui";
import { DeleteEvaluationAction } from "./DeleteEvaluationAction";
import type { DeleteEvaluationTexts } from "./DeleteEvaluationAction";

// ─── UI-specific types (declared before the component) ───

/** Every label and caption of a row, from the `evaluations` catalog (design.md D14). */
export type EvaluationRowTexts = DeleteEvaluationTexts &
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
};

/**
 * One row of "My evaluations" (spec "My evaluations list" and "Row
 * actions"): the shared row card with the specialist's actions in its slot
 * (add-public-evaluations design.md D6) — Edit for an open evaluation, View
 * for a closed one or one whose offering was deleted, both opening its form
 * route, and Delete with its confirmation.
 */
export function SpecialistEvaluationRow({
  evaluation,
  offering,
  locale,
  texts,
  onDeleted,
}: SpecialistEvaluationRowProps): ReactNode {
  const router = useRouter();
  const viewOnly = evaluation.status === "closed" || evaluation.offeringId === null;
  const formRoute = `/${locale}/manage/evaluations/${evaluation.ulid ?? ""}`;

  return (
    <SpecialistEvaluationRowCard
      evaluation={evaluation}
      offering={offering}
      texts={texts}
      actions={
        <>
          <Button variant="action-3" onClick={() => router.push(formRoute)}>
            {viewOnly ? texts.viewLabel : texts.editLabel}
          </Button>
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
