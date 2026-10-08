import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { Badge, Card, CardContent } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type ScoreCardTexts = {
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
};

export type ScoreCardProps = {
  offering: OfferingDetail;
  texts: ScoreCardTexts;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

// Score, `/100` and rating badge on one row, as on the offering card.
const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(
  " ",
);

/**
 * The score card of the Consensus panel: a verified offering's score out of
 * 100 with its rating badge; nothing for any other offering.
 */
export function ScoreCard({ offering, texts }: ScoreCardProps): ReactNode {
  const tier =
    offering.verificationStatus === "verified"
      ? ratingTierFor(offering.cuppingAvg)
      : null;
  if (tier === null) {
    return null;
  }
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  return (
    <Card layout="stacked">
      <CardContent>
        <div className={SCORE_ROW_CLASSES}>
          <div className="type-score">{offering.cuppingAvg}</div>
          <div className="type-meta">{SCORE_SCALE}</div>
          <Badge variant={tier}>{tierWords[tier]}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
