import type { ReactNode } from "react";
import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import { EVALUATION_GROUPS, formStateFromEvaluation } from "@/entities/evaluation";
import type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlockKey,
  DescriptorSelectionKey,
} from "@/entities/evaluation";
import { ratingTierFor } from "@/entities/offering";
import type { RatingTier } from "@/entities/offering";
import { buildDescriptorRows } from "@/entities/taxonomy";
import {
  Badge,
  BeanScale,
  Card,
  CardContent,
  DescriptorChipGroup,
  IntensitySlider,
  LabelValueRow,
} from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

type ExtrinsicField = "farming" | "processing" | "trading" | "certifications" | "generalObservation";

/** Every text of the sheet, resolved by the host (design.md D3). */
export type EvaluationSheetTexts = {
  summaryHeading: string;
  closedAtLabel: string;
  extractionMethodLabel: string;
  defectiveCupLabel: string;
  yes: string;
  no: string;
  intensityHeading: string;
  preferenceHeading: string;
  descriptorsHeading: string;
  noDescriptors: string;
  notesHeading: string;
  extrinsicsHeading: string;
  extrinsicLabels: Record<ExtrinsicField, string>;
  /** The catalog labels of the known extraction methods; others show raw. */
  extractionLabels: Record<string, string>;
  axisLabels: Record<AxisKey, string>;
  blockLabels: Record<DescriptorSelectionKey, string>;
  scaleLabels: [string, string, string];
  /** Templates holding `{value}`. */
  intensityValueText: string;
  intensityValueLabel: string;
  beanValueText: string;
  beanValueLabel: string;
  ratingLabels: Record<RatingTier, string>;
};

export type EvaluationSheetProps = {
  evaluation: EvaluationItem;
  /** `GET /taxonomies` `data`, for the descriptor names. */
  taxonomies: TaxonomyNode[];
  locale: string;
  texts: EvaluationSheetTexts;
};

// ─── Fixed pieces (no interface text) ───
const SCORE_SCALE = "/100";
const NOTE_SEPARATOR = " · ";

const EXTRINSIC_FIELDS: readonly ExtrinsicField[] = [
  "farming",
  "processing",
  "trading",
  "certifications",
  "generalObservation",
];

/** The taxonomy category each descriptor selection reads (design.md D8). */
const CATEGORY_BY_BLOCK: Record<DescriptorBlockKey, string> = {
  aromatics: "aromatics",
  main_tastes: "main_tastes",
  mouthfeel: "mouthfeel",
  defects: "defects",
};

// The sheet grid: one column below `lg`, two equal columns from `lg`, 1.5rem
// gap; cards of a row stretch to one height (summary §5.5).
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(" ");
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
const BLOCKS_CLASSES = ["grid", "grid-cols-1", "gap-6", "md:grid-cols-2"].join(" ");
const ENTRIES_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const ENTRY_CLASSES = ["flex", "flex-col", "gap-1"].join(" ");

/** The descriptive axes and the affective axes, in the groups' order. */
const DESCRIPTIVE_AXES: DescriptiveAxisKey[] = EVALUATION_GROUPS.flatMap(
  (group) => group.descriptive?.axes ?? [],
);
const AFFECTIVE_AXES: AxisKey[] = EVALUATION_GROUPS.flatMap((group) => group.affective?.axes ?? []);
const BLOCKS = EVALUATION_GROUPS.flatMap((group) => [
  ...(group.descriptive?.blocks ?? []),
  ...(group.affective?.blocks ?? []),
]);

function fill(template: string, value: number): string {
  return template.replace("{value}", String(value));
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
    new Date(value),
  );
}

function SheetCard({
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

/**
 * The read-only evaluation presentation (design.md D8; spec "Read-only
 * evaluation presentation"): Summary, Intensity, Preference, Descriptors and,
 * when they hold a value, Notes and Extrinsic attributes, as stacked cards on
 * the sheet grid. Sync: the host fetches and passes the data and texts.
 */
export function EvaluationSheet({
  evaluation,
  taxonomies,
  locale,
  texts,
}: EvaluationSheetProps): ReactNode {
  const tier = ratingTierFor(evaluation.cuppingScore);
  const descriptors = formStateFromEvaluation(evaluation, null).descriptors;
  const method = evaluation.extractionMethod;

  const notes = [
    ...DESCRIPTIVE_AXES.map((axis) => ({
      key: `descriptive-${axis}`,
      term: `${texts.intensityHeading}${NOTE_SEPARATOR}${texts.axisLabels[axis]}`,
      note: evaluation.descriptive?.[axis]?.note,
    })),
    ...AFFECTIVE_AXES.map((axis) => ({
      key: `affective-${axis}`,
      term: `${texts.preferenceHeading}${NOTE_SEPARATOR}${texts.axisLabels[axis]}`,
      note: evaluation.affective?.[axis]?.note,
    })),
  ].filter((entry) => entry.note);
  const extrinsics = EXTRINSIC_FIELDS.map((field) => ({
    field,
    value: evaluation.extrinsics?.[field],
  })).filter((entry) => entry.value);

  return (
    <div className={GRID_CLASSES}>
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
      <SheetCard heading={texts.intensityHeading}>
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
      <SheetCard heading={texts.preferenceHeading}>
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
      <SheetCard heading={texts.descriptorsHeading} wide>
        <div className={BLOCKS_CLASSES}>
          {BLOCKS.map((block) => (
            <DescriptorChipGroup
              key={block.selection}
              legend={texts.blockLabels[block.selection]}
              rows={buildDescriptorRows(taxonomies, CATEGORY_BY_BLOCK[block.key], locale)}
              value={descriptors[block.selection]}
              emptyText={texts.noDescriptors}
              readOnly
            />
          ))}
        </div>
      </SheetCard>
      {notes.length > 0 ? (
        <SheetCard heading={texts.notesHeading} wide>
          <dl className={ENTRIES_CLASSES}>
            {notes.map((entry) => (
              <div key={entry.key} className={ENTRY_CLASSES}>
                <dt className="type-label">{entry.term}</dt>
                <dd className="type-body">{entry.note}</dd>
              </div>
            ))}
          </dl>
        </SheetCard>
      ) : null}
      {extrinsics.length > 0 ? (
        <SheetCard heading={texts.extrinsicsHeading} wide>
          <dl className={ENTRIES_CLASSES}>
            {extrinsics.map((entry) => (
              <div key={entry.field} className={ENTRY_CLASSES}>
                <dt className="type-label">{texts.extrinsicLabels[entry.field]}</dt>
                <dd className="type-body">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </SheetCard>
      ) : null}
    </div>
  );
}

