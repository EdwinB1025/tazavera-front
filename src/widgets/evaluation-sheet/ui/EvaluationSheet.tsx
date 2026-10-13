import type { ReactNode } from "react";
import type { EvaluationItem, TaxonomyNode } from "@/shared/api";
import { formStateFromEvaluation } from "@/entities/evaluation";
import type { AxisKey, DescriptorSelectionKey } from "@/entities/evaluation";
import { ratingTierFor } from "@/entities/offering";
import type { RatingTier } from "@/entities/offering";
import { DescriptorsCard } from "./EvaluationSheetDescriptors";
import {
  AFFECTIVE_AXES,
  DESCRIPTIVE_AXES,
  EntriesCard,
  IntensityCard,
  PreferenceCard,
  SummaryCard,
  type SheetEntry,
} from "./EvaluationSheetCards";

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
  /** The descriptor trees' toggle names; each holds `{label}`. */
  showNotesLabel: string;
  hideNotesLabel: string;
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
const NOTE_SEPARATOR = " · ";

const EXTRINSIC_FIELDS: readonly ExtrinsicField[] = [
  "farming",
  "processing",
  "trading",
  "certifications",
  "generalObservation",
];

// The sheet grid: one column below `lg`, two equal columns from `lg`, 1.5rem
// gap; cards of a row stretch to one height (summary §5.5).
const GRID_CLASSES = ["grid", "grid-cols-1", "gap-6", "lg:grid-cols-2"].join(" ");

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

  const notes: SheetEntry[] = [
    ...DESCRIPTIVE_AXES.map((axis) => ({
      key: `descriptive-${axis}`,
      term: `${texts.intensityHeading}${NOTE_SEPARATOR}${texts.axisLabels[axis]}`,
      value: evaluation.descriptive?.[axis]?.note,
    })),
    ...AFFECTIVE_AXES.map((axis) => ({
      key: `affective-${axis}`,
      term: `${texts.preferenceHeading}${NOTE_SEPARATOR}${texts.axisLabels[axis]}`,
      value: evaluation.affective?.[axis]?.note,
    })),
  ].filter((entry) => entry.value);
  const extrinsics: SheetEntry[] = EXTRINSIC_FIELDS.map((field) => ({
    key: field,
    term: texts.extrinsicLabels[field],
    value: evaluation.extrinsics?.[field],
  })).filter((entry) => entry.value);

  return (
    <div className={GRID_CLASSES}>
      <SummaryCard evaluation={evaluation} tier={tier} locale={locale} texts={texts} />
      <IntensityCard evaluation={evaluation} heading={texts.intensityHeading} texts={texts} />
      <PreferenceCard evaluation={evaluation} heading={texts.preferenceHeading} texts={texts} />
      <DescriptorsCard
        descriptors={descriptors}
        taxonomies={taxonomies}
        locale={locale}
        heading={texts.descriptorsHeading}
        emptyText={texts.noDescriptors}
        blockLabels={texts.blockLabels}
        treeTexts={{ showNotesLabel: texts.showNotesLabel, hideNotesLabel: texts.hideNotesLabel }}
      />
      {notes.length > 0 ? <EntriesCard heading={texts.notesHeading} entries={notes} /> : null}
      {extrinsics.length > 0 ? (
        <EntriesCard heading={texts.extrinsicsHeading} entries={extrinsics} />
      ) : null}
    </div>
  );
}
