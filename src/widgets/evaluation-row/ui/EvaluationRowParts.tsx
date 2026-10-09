import type { ReactNode } from "react";
import type { EvaluationItem, OfferingDetail } from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { Badge, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

/** The texts both rows render (`evaluations`, `public-evaluations`; design.md D3, D6). */
export type EvaluationRowSharedTexts = {
  closedOnLabel: string;
  coffeeshopCaption: string;
  roasterCaption: string;
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
  /** Shown in place of the offering when its `offeringId` is `null`. */
  offeringMissingLabel: string;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(" ");
export const CONTENT_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
export const FOOTER_CLASSES = ["flex", "flex-wrap", "justify-end", "gap-4"].join(" ");

/**
 * The score row (score, scale and rating badge) when the evaluation's
 * `cuppingScore` has a rating tier; `null` otherwise.
 */
export function scoreRow(evaluation: EvaluationItem, texts: EvaluationRowSharedTexts): ReactNode {
  const tier = ratingTierFor(evaluation.cuppingScore);
  if (tier === null) return null;
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  return (
    <div className={SCORE_ROW_CLASSES}>
      <div className="type-score">{evaluation.cuppingScore}</div>
      <div className="type-meta">{SCORE_SCALE}</div>
      <Badge variant={tier}>{tierWords[tier]}</Badge>
    </div>
  );
}

export type ViewOfferingButtonProps = {
  locale: string;
  offeringId: string;
  label: string;
  /** The hidden suffix that tells the row's actions apart. */
  suffix: string;
};

/** The View offering route button of both rows (refine-evaluation-flow D5). */
export function ViewOfferingButton({
  locale,
  offeringId,
  label,
  suffix,
}: ViewOfferingButtonProps): ReactNode {
  return (
    <RouteButton href={`/${locale}/offerings/${offeringId}`} variant="action-3" size="sm">
      {label} <span className="sr-only">{suffix}</span>
    </RouteButton>
  );
}

export type OfferingCaptionsProps = {
  offering: OfferingDetail | null;
  texts: EvaluationRowSharedTexts;
};

/** The coffeeshop and roaster captions of a row's offering. */
export function OfferingCaptions({ offering, texts }: OfferingCaptionsProps): ReactNode {
  const coffeeshopCaption = `${texts.coffeeshopCaption} ${offering?.location?.name ?? ""}`.trim();
  const roasterCaption =
    `${texts.roasterCaption} ${offering?.coffeeInventory?.roastery?.name ?? ""}`.trim();
  return (
    <div>
      <p className="type-label">{coffeeshopCaption}</p>
      <p className="type-label">{roasterCaption}</p>
    </div>
  );
}
