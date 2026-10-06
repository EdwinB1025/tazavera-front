import type { ReactNode } from "react";
import type { OfferingDetail, TaxonomyNode } from "@/shared/api";
import { ratingTierFor } from "@/entities/offering";
import { Badge, Card, CardContent, LabelValueRow } from "@/shared/ui";
import { concordanceBand } from "../lib/concordance";
import type { ConcordanceBand } from "../lib/concordance";

// ─── UI-specific types (declared before the component) ───

export type ConsensusPanelTexts = {
  ratingExceptionalLabel: string;
  ratingExcellentLabel: string;
  ratingGoodLabel: string;
  ratingCommercialLabel: string;
  detailStatusHeading: string;
  fieldEvaluationCount: string;
  fieldDefectiveCount: string;
  fieldConcordanceAffective: string;
  fieldConcordanceDescriptive: string;
  concordanceLow: string;
  concordanceModerate: string;
  concordanceHigh: string;
  concordanceExcellent: string;
};

export type ConsensusPanelProps = {
  offering: OfferingDetail;
  /** The taxonomy tree of `GET /taxonomies`. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: ConsensusPanelTexts;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

// The score card above the card grid, 1.5rem apart.
const PANEL_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

// The card grid: one column below `lg`, two equal columns from `lg`, with a
// 1.5rem gap; grid items stretch, so the cards of a row share one height.
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(
  " ",
);

// Score, `/100` and rating badge on one row, as on the offering card.
const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(
  " ",
);

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// The label/value rows (design.md D5's grid).
const LIST_CLASSES = ["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"].join(" ");

// A concordance value and its band word, 0.5rem apart, wrapping.
const CONCORDANCE_CLASSES = ["flex", "flex-wrap", "gap-2"].join(" ");

/**
 * The Consensus panel (add-offering-catalog design.md D12–D14; the spec's
 * "Consensus …" requirements): the score card for a verified offering, then
 * the card grid with the blocks in the settled order. Every text arrives as a
 * prop; the score and the bands never rest on colour alone.
 */
export function ConsensusPanel({
  offering,
  texts,
}: ConsensusPanelProps): ReactNode {
  const tier =
    offering.verificationStatus === "verified"
      ? ratingTierFor(offering.cuppingAvg)
      : null;
  const tierWords = {
    "rating-exceptional": texts.ratingExceptionalLabel,
    "rating-excellent": texts.ratingExcellentLabel,
    "rating-good": texts.ratingGoodLabel,
    "rating-commercial": texts.ratingCommercialLabel,
  };
  const bandWords: Record<ConcordanceBand, string> = {
    low: texts.concordanceLow,
    moderate: texts.concordanceModerate,
    high: texts.concordanceHigh,
    excellent: texts.concordanceExcellent,
  };

  function concordance(value: string): ReactNode {
    return (
      <span className={CONCORDANCE_CLASSES}>
        <span>{value}</span>
        <span>{bandWords[concordanceBand(value)]}</span>
      </span>
    );
  }

  const statusRows: { label: string; value: ReactNode | undefined }[] = [
    { label: texts.fieldEvaluationCount, value: offering.evaluationCount },
    {
      label: texts.fieldDefectiveCount,
      value: offering.defectiveEvaluationCount,
    },
    {
      label: texts.fieldConcordanceAffective,
      value:
        offering.concordanceAffective != null
          ? concordance(offering.concordanceAffective)
          : undefined,
    },
    {
      label: texts.fieldConcordanceDescriptive,
      value:
        offering.concordanceDescriptive != null
          ? concordance(offering.concordanceDescriptive)
          : undefined,
    },
  ];

  return (
    <div className={PANEL_CLASSES}>
      {tier !== null ? (
        <Card layout="stacked">
          <CardContent>
            <div className={SCORE_ROW_CLASSES}>
              <div className="type-score">{offering.cuppingAvg}</div>
              <div className="type-meta">{SCORE_SCALE}</div>
              <Badge variant={tier}>{tierWords[tier]}</Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className={GRID_CLASSES}>
        <Card layout="stacked">
          <CardContent className={CONTENT_CLASSES}>
            <h2 className="type-subheading">{texts.detailStatusHeading}</h2>
            <dl className={LIST_CLASSES}>
              {statusRows
                .filter((row) => row.value != null)
                .map((row) => (
                  <LabelValueRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                  />
                ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
