import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { Badge, Card, CardAside, CardContent, CardFooter } from "@/shared/ui";
import { CONTENT_CLASSES, FOOTER_CLASSES, OfferingCaptions, scoreRow } from "./EvaluationRowParts";
import type { EvaluationRowSharedTexts } from "./EvaluationRowParts";

// ─── UI-specific types (declared before the component) ───

/** The "My evaluations" row's labels and captions (`evaluations`; design.md D3, D6). */
export type SpecialistEvaluationRowCardTexts = EvaluationRowSharedTexts & {
  openLabel: string;
  closedLabel: string;
  createdOnLabel: string;
};

export type SpecialistEvaluationRowCardProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read or was deleted. */
  offering: OfferingDetail | null;
  texts: SpecialistEvaluationRowCardTexts;
  /** The footer actions. */
  actions: ReactNode;
};

/** The date part (`YYYY-MM-DD`) of an API timestamp. */
function datePart(value: string): string {
  return value.slice(0, 10);
}

type DateLineProps = {
  evaluation: EvaluationItem;
  texts: SpecialistEvaluationRowCardTexts;
};

/** The created date of an open evaluation, the closed date of a closed one, as ISO date. */
function DateLine({ evaluation, texts }: DateLineProps): ReactNode {
  const closed = evaluation.status === "closed";
  const dateValue = closed ? evaluation.closedAt : evaluation.createdAt;
  const dateLabel = closed ? texts.closedOnLabel : texts.createdOnLabel;
  return (
    <p className="type-meta">
      {dateLabel}{" "}
      {dateValue ? <time dateTime={dateValue}>{datePart(dateValue)}</time> : null}
    </p>
  );
}

/**
 * One "My evaluations" row (spec "My evaluations list"; design.md D6's card
 * field mapping): the score row when the evaluation has a rating tier, the
 * status badge, the coffee name, the created or closed date and the
 * coffeeshop and roaster captions, with the specialist's actions in the
 * footer. A row whose `offeringId` is `null` shows the offering-missing text
 * with no captions.
 */
export function SpecialistEvaluationRowCard({
  evaluation,
  offering,
  texts,
  actions,
}: SpecialistEvaluationRowCardProps): ReactNode {
  const closed = evaluation.status === "closed";
  // The offering was deleted (design.md D3, D6).
  const orphan = evaluation.offeringId === null;
  const heading = orphan ? texts.offeringMissingLabel : offering?.coffeeInventory?.coffee?.name;
  const score = scoreRow(evaluation, texts);

  return (
    <Card layout="default">
      {score ? <CardAside>{score}</CardAside> : null}
      <CardContent className={CONTENT_CLASSES}>
        <Badge variant={closed ? "verified" : "provisional"}>
          {closed ? texts.closedLabel : texts.openLabel}
        </Badge>
        <h3 className="type-card-heading">{heading}</h3>
        <DateLine evaluation={evaluation} texts={texts} />
        {orphan ? null : <OfferingCaptions offering={offering} texts={texts} />}
      </CardContent>
      <CardFooter className={FOOTER_CLASSES}>{actions}</CardFooter>
    </Card>
  );
}
