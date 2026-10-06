"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { Badge, Button, Card, CardAside, CardContent, CardFooter } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** Every label and caption of a row, from the `evaluations` catalog (design.md D14). */
export type EvaluationRowTexts = {
  openLabel: string;
  closedLabel: string;
  createdOnLabel: string;
  closedOnLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  editLabel: string;
  viewLabel: string;
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
};

export type EvaluationRowCardProps = {
  evaluation: EvaluationItem;
  /** The row's offering, or `null` when it could not be read. */
  offering: OfferingDetail | null;
  locale: string;
  texts: EvaluationRowTexts;
  /** Row actions after Edit or View (the delete action). */
  actions?: ReactNode;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(" ");
const CONTENT_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
const FOOTER_CLASSES = ["flex", "flex-wrap", "justify-end", "gap-4"].join(" ");

/** The date part (`YYYY-MM-DD`) of an API timestamp. */
function datePart(value: string): string {
  return value.slice(0, 10);
}

/**
 * One row of "My evaluations" (design.md's card field mapping; spec "My
 * evaluations list" and "Row actions"): the score row when the evaluation has
 * a `cuppingScore`, the status badge, the coffee name, the date of the row's
 * state and the coffeeshop and roaster captions, and the row actions — Edit
 * for an open evaluation, View for a closed one, both opening its form route.
 */
export function EvaluationRowCard({
  evaluation,
  offering,
  locale,
  texts,
  actions,
}: EvaluationRowCardProps): ReactNode {
  const router = useRouter();
  const tier = ratingTierFor(evaluation.cuppingScore);
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  const closed = evaluation.status === "closed";
  const dateValue = closed ? evaluation.closedAt : evaluation.createdAt;
  const dateLabel = closed ? texts.closedOnLabel : texts.createdOnLabel;
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();
  const formRoute = `/${locale}/manage/evaluations/${evaluation.ulid ?? ""}`;

  return (
    <Card layout="default">
      {tier !== null ? (
        <CardAside>
          <div className={SCORE_ROW_CLASSES}>
            <div className="type-score">{evaluation.cuppingScore}</div>
            <div className="type-meta">{SCORE_SCALE}</div>
            <Badge variant={tier}>{tierWords[tier]}</Badge>
          </div>
        </CardAside>
      ) : null}
      <CardContent className={CONTENT_CLASSES}>
        <Badge variant={closed ? "verified" : "provisional"}>
          {closed ? texts.closedLabel : texts.openLabel}
        </Badge>
        <h3 className="type-card-heading">{offering?.coffeeInventory?.coffee?.name}</h3>
        <p className="type-meta">
          {dateLabel}{" "}
          {dateValue ? <time dateTime={dateValue}>{datePart(dateValue)}</time> : null}
        </p>
        <div>
          <p className="type-label">{coffeeshopCaption}</p>
          <p className="type-label">{roasterCaption}</p>
        </div>
      </CardContent>
      <CardFooter className={FOOTER_CLASSES}>
        <Button variant="action-3" onClick={() => router.push(formRoute)}>
          {closed ? texts.viewLabel : texts.editLabel}
        </Button>
        {actions}
      </CardFooter>
    </Card>
  );
}
