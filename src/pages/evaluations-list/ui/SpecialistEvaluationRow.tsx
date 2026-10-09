"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { isReadyForClosing } from "@/entities/evaluation";
import { SpecialistEvaluationRowCard, ViewOfferingButton } from "@/widgets/evaluation-row";
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
    viewOfferingLabel: string;
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
 * (add-public-evaluations design.md D6), in the order of refine-evaluation-flow
 * D5 — View on every row, opening its form route read-only (`?mode=view` for
 * an open one), View offering while the offering exists, Close for a complete
 * open one with its offering (D3) with the outcome's message in a status
 * line, Edit for an open one with its offering, and Delete with its
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
  const open = evaluation.status !== "closed";
  const editable = open && evaluation.offeringId !== null;
  const formRoute = `/${locale}/manage/evaluations/${evaluation.ulid ?? ""}`;
  const viewRoute = open ? `${formRoute}?mode=view` : formRoute;

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
          <Button variant="action-3" onClick={() => router.push(viewRoute)}>
            {texts.viewLabel}
          </Button>
          {evaluation.offeringId ? (
            <ViewOfferingButton
              locale={locale}
              offeringId={evaluation.offeringId}
              label={texts.viewOfferingLabel}
              suffix={offering?.coffeeInventory?.coffee?.name ?? ""}
            />
          ) : null}
          {editable && isReadyForClosing(evaluation) ? (
            <CloseEvaluationAction
              ulid={evaluation.ulid ?? ""}
              texts={texts}
              onMessage={setMessage}
              onClosed={onClosed}
            />
          ) : null}
          {editable ? (
            <Button variant="action-4" onClick={() => router.push(formRoute)}>
              {texts.editLabel}
            </Button>
          ) : null}
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
