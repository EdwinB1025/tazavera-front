import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { Card, CardContent, LabelValueRow } from "@/shared/ui";
import { concordanceBand } from "../lib/concordance";
import type { ConcordanceBand } from "../lib/concordance";

// ─── UI-specific types (declared before the component) ───

export type StatusCardTexts = {
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

export type StatusCardProps = {
  offering: OfferingDetail;
  texts: StatusCardTexts;
};

// ─── Fixed pieces (no interface text) ───

// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// The label/value rows (design.md D5's grid).
const LIST_CLASSES = ["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"].join(" ");

// A concordance value and its band word, 0.5rem apart, wrapping.
const CONCORDANCE_CLASSES = ["flex", "flex-wrap", "gap-2"].join(" ");

/**
 * The status card of the Consensus panel: the evaluation counts and the
 * concordances, each concordance with the word of its band; absent values
 * render no row.
 */
export function StatusCard({ offering, texts }: StatusCardProps): ReactNode {
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
  );
}
