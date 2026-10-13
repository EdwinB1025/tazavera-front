import type { ReactNode } from "react";
import type { EvaluationItem } from "@/shared/api";
import { EVALUATION_GROUPS } from "@/entities/evaluation";
import type { AxisKey, DescriptiveAxisKey } from "@/entities/evaluation";
import type { RatingTier } from "@/entities/offering";
import {
  Badge,
  BeanScale,
  Card,
  CardContent,
  IntensitySlider,
  LabelValueRow,
} from "@/shared/ui";

// ─── UI-specific types (declared before the components) ───

type SummaryTexts = {
  summaryHeading: string;
  closedAtLabel: string;
  extractionMethodLabel: string;
  defectiveCupLabel: string;
  yes: string;
  no: string;
  extractionLabels: Record<string, string>;
  ratingLabels: Record<RatingTier, string>;
};

type ScaleTexts = {
  axisLabels: Record<AxisKey, string>;
  scaleLabels: [string, string, string];
  intensityValueText: string;
  intensityValueLabel: string;
  beanValueText: string;
  beanValueLabel: string;
};

export type SheetEntry = { key: string; term: string; value: ReactNode };

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";

const WIDE_CLASSES = "lg:col-span-2";
// Each card: the heading and its content, 1rem apart.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const HEADER_ROW_CLASSES = [
  "flex",
  "flex-wrap",
  "items-center",
  "justify-between",
  "gap-2",
].join(" ");
const SCORE_ROW_CLASSES = ["flex", "flex-wrap", "items-baseline", "gap-2"].join(" ");
const LIST_CLASSES = ["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"].join(" ");
const SCALES_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
const ENTRIES_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const ENTRY_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");

/** The descriptive axes and the affective axes, in the groups' order. */
export const DESCRIPTIVE_AXES: DescriptiveAxisKey[] = EVALUATION_GROUPS.flatMap(
  (group) => group.descriptive?.axes ?? [],
);
export const AFFECTIVE_AXES: AxisKey[] = EVALUATION_GROUPS.flatMap(
  (group) => group.affective?.axes ?? [],
);

function fill(template: string, value: number): string {
  return template.replace("{value}", String(value));
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

/** One card of the sheet: its heading (or header row) and its content. */
export function SheetCard({
  heading,
  header,
  wide,
  children,
}: {
  heading: string;
  /** Replaces the plain heading (the Summary's header row). */
  header?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}): ReactNode {
  return (
    <Card layout="stacked" className={wide ? WIDE_CLASSES : undefined}>
      <CardContent className={CONTENT_CLASSES}>
        {header ?? <h2 className="type-subheading">{heading}</h2>}
        {children}
      </CardContent>
    </Card>
  );
}

/** The Summary card: the score row, the close date, the method and the defective cup. */
export function SummaryCard({
  evaluation,
  tier,
  locale,
  texts,
}: {
  evaluation: EvaluationItem;
  tier: RatingTier | null;
  locale: string;
  texts: SummaryTexts;
}): ReactNode {
  const method = evaluation.extractionMethod;
  return (
    <SheetCard
      heading={texts.summaryHeading}
      wide
      header={
        <div className={HEADER_ROW_CLASSES}>
          <h2 className="type-subheading">{texts.summaryHeading}</h2>
          {tier !== null ? (
            <div className={SCORE_ROW_CLASSES}>
              <span className="type-score">{evaluation.cuppingScore}</span>
              <span className="type-meta">{SCORE_SCALE}</span>
              <Badge variant={tier}>{texts.ratingLabels[tier]}</Badge>
            </div>
          ) : null}
        </div>
      }
    >
      <dl className={LIST_CLASSES}>
        {evaluation.closedAt ? (
          <LabelValueRow
            label={texts.closedAtLabel}
            value={formatDate(evaluation.closedAt, locale)}
          />
        ) : null}
        {method ? (
          <LabelValueRow
            label={texts.extractionMethodLabel}
            value={texts.extractionLabels[method] ?? method}
          />
        ) : null}
        {evaluation.isDefective !== undefined && evaluation.isDefective !== null ? (
          <LabelValueRow
            label={texts.defectiveCupLabel}
            value={evaluation.isDefective ? texts.yes : texts.no}
          />
        ) : null}
      </dl>
    </SheetCard>
  );
}

/** The Intensity card: one read-only slider per descriptive axis. */
export function IntensityCard({
  evaluation,
  heading,
  texts,
}: {
  evaluation: EvaluationItem;
  heading: string;
  texts: ScaleTexts;
}): ReactNode {
  return (
    <SheetCard heading={heading}>
      <div className={SCALES_CLASSES}>
        {DESCRIPTIVE_AXES.map((axis) => {
          const score = evaluation.descriptive?.[axis]?.score ?? 0;
          return (
            <IntensitySlider
              key={axis}
              label={texts.axisLabels[axis]}
              value={score}
              valueText={fill(texts.intensityValueText, score)}
              valueLabel={fill(texts.intensityValueLabel, score)}
              scaleLabels={texts.scaleLabels}
              readOnly
            />
          );
        })}
      </div>
    </SheetCard>
  );
}

/** The Preference card: one read-only bean scale per scored affective axis. */
export function PreferenceCard({
  evaluation,
  heading,
  texts,
}: {
  evaluation: EvaluationItem;
  heading: string;
  texts: ScaleTexts;
}): ReactNode {
  return (
    <SheetCard heading={heading}>
      <div className={SCALES_CLASSES}>
        {AFFECTIVE_AXES.map((axis) => {
          // 0 is not on the 1–9 scale: unscored, like null (the specialist form's `|| null`).
          const score = evaluation.affective?.[axis]?.score;
          return !score ? null : (
            <BeanScale
              key={axis}
              label={texts.axisLabels[axis]}
              value={score}
              valueText={fill(texts.beanValueText, score)}
              valueLabel={fill(texts.beanValueLabel, score)}
              size="responsive"
              readOnly
            />
          );
        })}
      </div>
    </SheetCard>
  );
}

/** A wide card listing its entries as terms and values (Notes, Extrinsic attributes). */
export function EntriesCard({
  heading,
  entries,
}: {
  heading: string;
  entries: SheetEntry[];
}): ReactNode {
  return (
    <SheetCard heading={heading} wide>
      <dl className={ENTRIES_CLASSES}>
        {entries.map((entry) => (
          <div key={entry.key} className={ENTRY_CLASSES}>
            <dt className="type-label">{entry.term}</dt>
            <dd className="type-body">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </SheetCard>
  );
}
