"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlock as BlockDefinition,
  EvaluationFormState,
  GroupDefinition,
  GroupKey,
} from "@/entities/evaluation";
import {
  BeanScale,
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
  IntensitySlider,
} from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { CompletenessIndicator } from "./CompletenessIndicator";
import { NoteField } from "./NoteField";

// ─── UI-specific types (declared before the component) ───

/** The group card's texts, from the `evaluations` catalog (design.md D14). */
export type EvaluationGroupTexts = {
  groupNames: Record<GroupKey, string>;
  descriptiveHeading: string;
  affectiveHeading: string;
  axisLabels: Record<AxisKey, string>;
  /** LOW / MEDIUM / HIGH under the intensity slider. */
  scaleLabels: [string, string, string];
  /** The "/15" suffix of an intensity. */
  intensityScale: string;
  /** The "/9" suffix of a preference. */
  preferenceScale: string;
  /** What an unset preference shows in place of its number. */
  unsetScore: string;
  completeLabel: string;
  incompleteLabel: string;
  addNoteLabel: string;
  removeNoteLabel: string;
  /** The note field's label, followed by the axis name. */
  noteLabel: string;
  /** The label of the Extrinsic group's notes field. */
  extrinsicNoteLabel: string;
};

export type FormStateUpdate = (update: (state: EvaluationFormState) => EvaluationFormState) => void;

export type EvaluationGroupCardProps = {
  group: GroupDefinition;
  state: EvaluationFormState;
  onChange: FormStateUpdate;
  texts: EvaluationGroupTexts;
  /** The group's completeness; `undefined` for a group without indicator. */
  complete?: boolean;
  /** The closed evaluation's read-only presentation (design.md D4). */
  readOnly?: boolean;
  /** Renders one descriptor block of a part (design.md D7). */
  renderBlock?: (block: BlockDefinition) => ReactNode;
  /** Content at the top of the body, 1rem above the parts (design.md D9). */
  top?: ReactNode;
  /** Marks the group after a `409` on close (design.md D10). */
  highlighted?: boolean;
  /**
   * Controlled open state (design.md D15). Uncontrolled, the group starts
   * collapsed when editable and expanded when read-only.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// ─── Layout end states (design.md D14; the summary §9) ───
// The header's 0.5rem plus the aside's 0.5rem: 1rem from the card's edges
// (design.md D15). `px-2`/`py-2` follow the Card's `p-6` in the generated CSS
// and override it; `border-b-0` likewise drops the aside's bottom border while
// the body is collapsed, so a collapsed card is its header row only.
const ASIDE_CLASSES = ["px-2", "py-2"].join(" ");
const ASIDE_COLLAPSED_CLASSES = "border-b-0";
// An incomplete group after a refused close: a ring in the error colour; the
// indicator's "Incomplete" carries the state in words.
const HIGHLIGHT_CLASSES = ["ring-2", "ring-feedback-error"].join(" ");
const BODY_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const BOTH_PARTS_CLASSES = ["flex", "flex-col", "gap-6", "md:grid", "md:grid-cols-2"].join(" ");
const ONE_PART_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");
const PART_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const DESCRIPTIVE_SPLIT_CLASSES = ["md:border-r", "md:border-border-subtle", "md:pr-6"].join(" ");
const AFFECTIVE_SPLIT_CLASSES = [
  "border-t",
  "border-border-subtle",
  "pt-6",
  "md:border-t-0",
  "md:pt-0",
].join(" ");
const PANEL_CLASSES = [
  "flex",
  "flex-col",
  "gap-2",
  "bg-surface-section",
  "rounded-container",
  "border",
  "border-border-subtle",
  "p-4",
].join(" ");

/**
 * One CVA group (design.md D14, D15; spec "Evaluation form"): a shared
 * collapsible section whose header carries the group name and its
 * completeness indicator at every viewport, and the descriptive and affective
 * parts, stacked below `md` and in two columns from `md`. Each descriptive
 * axis is an intensity slider (0–15) and each affective axis a bean scale
 * (1–9), both read-only for a closed evaluation; the descriptor blocks of a
 * part follow its scores, each in its own panel.
 */
export function EvaluationGroupCard({
  group,
  state,
  onChange,
  texts,
  complete,
  readOnly = false,
  renderBlock,
  top,
  highlighted = false,
  open: openProp,
  onOpenChange,
}: EvaluationGroupCardProps): ReactNode {
  const [openState, setOpenState] = useState(readOnly);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };
  const name = texts.groupNames[group.key];
  const indicator =
    complete === undefined ? null : (
      <CompletenessIndicator
        complete={complete}
        completeLabel={texts.completeLabel}
        incompleteLabel={texts.incompleteLabel}
      />
    );

  // "Fragrance not evaluated" disables the fragrance controls (design.md D9).
  const disabledAxis = (axis: AxisKey) => state.fragranceNotEvaluated && axis === "fragrance";

  const intensity = (axis: DescriptiveAxisKey) => {
    const score = state.descriptive[axis].score;
    const value = `${score}${texts.intensityScale}`;
    const common = {
      label: texts.axisLabels[axis],
      value: score,
      valueText: value,
      valueLabel: value,
      scaleLabels: texts.scaleLabels,
    };
    return readOnly ? (
      <IntensitySlider key={axis} {...common} readOnly />
    ) : (
      <IntensitySlider
        key={axis}
        {...common}
        disabled={disabledAxis(axis)}
        onChange={(next) =>
          onChange((current) => ({
            ...current,
            descriptive: {
              ...current.descriptive,
              [axis]: { ...current.descriptive[axis], score: next },
            },
          }))
        }
      />
    );
  };

  const preference = (axis: AxisKey) => {
    const score = state.affective[axis].score;
    const value = `${score ?? texts.unsetScore}${texts.preferenceScale}`;
    return readOnly ? (
      <BeanScale
        key={axis}
        label={texts.axisLabels[axis]}
        value={score}
        valueText={value}
        valueLabel={value}
        readOnly
      />
    ) : (
      <BeanScale
        key={axis}
        label={texts.axisLabels[axis]}
        value={score}
        valueText={value}
        disabled={disabledAxis(axis)}
        onChange={(next) =>
          onChange((current) => ({
            ...current,
            affective: {
              ...current.affective,
              [axis]: { ...current.affective[axis], score: next },
            },
          }))
        }
      />
    );
  };

  // In a part with two axes the "Add note" text names its axis.
  const note = (part: "descriptive" | "affective", axis: AxisKey, pair: boolean) => {
    const label = `${texts.noteLabel} (${texts.axisLabels[axis]})`;
    const value =
      part === "descriptive"
        ? state.descriptive[axis as DescriptiveAxisKey].note
        : state.affective[axis].note;
    return (
      <NoteField
        key={`${part}-${axis}-note`}
        label={label}
        addLabel={pair ? `${texts.addNoteLabel} (${texts.axisLabels[axis]})` : texts.addNoteLabel}
        removeLabel={texts.removeNoteLabel}
        value={value}
        disabled={disabledAxis(axis)}
        readOnly={readOnly}
        onChange={(next) =>
          onChange((current) =>
            part === "descriptive"
              ? {
                  ...current,
                  descriptive: {
                    ...current.descriptive,
                    [axis]: { ...current.descriptive[axis as DescriptiveAxisKey], note: next },
                  },
                }
              : {
                  ...current,
                  affective: {
                    ...current.affective,
                    [axis]: { ...current.affective[axis], note: next },
                  },
                },
          )
        }
      />
    );
  };

  const both = group.descriptive !== null && group.affective !== null;
  const blocks = (part: { blocks: BlockDefinition[] }) =>
    renderBlock
      ? part.blocks.map((block) => (
          <div key={block.selection} className={PANEL_CLASSES}>
            {renderBlock(block)}
          </div>
        ))
      : null;

  return (
    <Collapsible open={open} onOpenChange={changeOpen}>
      <Card
        layout="stacked"
        data-group={group.key}
        data-highlighted={highlighted ? "true" : undefined}
        className={highlighted ? HIGHLIGHT_CLASSES : undefined}
      >
        <CardAside className={cn(ASIDE_CLASSES, !open && ASIDE_COLLAPSED_CLASSES)}>
          <CollapsibleHeader headingLevel={3} aside={indicator}>
            {name}
          </CollapsibleHeader>
        </CardAside>
        <CollapsibleBody>
          <CardContent>
            <div className={BODY_CLASSES}>
              {top ? <div>{top}</div> : null}
              <div className={both ? BOTH_PARTS_CLASSES : ONE_PART_CLASSES}>
                {group.descriptive ? (
                  <div
                    data-part="descriptive"
                    className={cn(PART_CLASSES, both && DESCRIPTIVE_SPLIT_CLASSES)}
                  >
                    <p className="type-label">{texts.descriptiveHeading}</p>
                    {group.descriptive.axes.length > 0 ? (
                      <div className={PANEL_CLASSES}>{group.descriptive.axes.map(intensity)}</div>
                    ) : null}
                    {blocks(group.descriptive)}
                    {group.descriptive.axes.map((axis) =>
                      note("descriptive", axis, group.descriptive!.axes.length > 1),
                    )}
                  </div>
                ) : null}
                {group.affective ? (
                  <div
                    data-part="affective"
                    className={cn(PART_CLASSES, both && AFFECTIVE_SPLIT_CLASSES)}
                  >
                    <p className="type-label">{texts.affectiveHeading}</p>
                    {group.affective.axes.length > 0 ? (
                      <div className={PANEL_CLASSES}>{group.affective.axes.map(preference)}</div>
                    ) : null}
                    {blocks(group.affective)}
                    {group.affective.axes.map((axis) =>
                      note("affective", axis, group.affective!.axes.length > 1),
                    )}
                  </div>
                ) : null}
                {group.notes === "generalObservation" ? (
                  <div data-part="notes" className={PART_CLASSES}>
                    <NoteField
                      label={texts.extrinsicNoteLabel}
                      addLabel={texts.addNoteLabel}
                      removeLabel={texts.removeNoteLabel}
                      value={state.generalObservation}
                      readOnly={readOnly}
                      onChange={(next) =>
                        onChange((current) => ({ ...current, generalObservation: next }))
                      }
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </CollapsibleBody>
      </Card>
    </Collapsible>
  );
}
