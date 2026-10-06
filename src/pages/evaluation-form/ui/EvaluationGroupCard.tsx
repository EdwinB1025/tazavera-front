"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlock as BlockDefinition,
  EvaluationFormState,
  GroupDefinition,
  GroupKey,
} from "@/entities/evaluation";
import { BeanScale, Card, CardAside, CardContent, IntensitySlider } from "@/shared/ui";
import { ChevronDown } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";
import { CompletenessIndicator } from "./CompletenessIndicator";

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
};

// ─── Layout end states (design.md D14; the summary §9) ───
const HEADER_ROW_CLASSES = ["flex", "flex-wrap", "items-center", "justify-between", "gap-2"].join(" ");
const TOGGLE_CLASSES = [
  "w-full",
  "flex",
  "flex-wrap",
  "items-center",
  "justify-between",
  "gap-2",
  "text-left",
  "rounded-field",
  "focus-visible:focus-ring",
].join(" ");
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
 * One CVA group (design.md D14; spec "Evaluation form"): the group name and
 * its completeness indicator in the header — a full-width collapse toggle
 * below `md`, a static row from `md` — and the descriptive and affective
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
}: EvaluationGroupCardProps): ReactNode {
  const [expanded, setExpanded] = useState(true);
  const bodyId = useId();
  const name = texts.groupNames[group.key];
  const indicator =
    complete === undefined ? null : (
      <CompletenessIndicator
        complete={complete}
        completeLabel={texts.completeLabel}
        incompleteLabel={texts.incompleteLabel}
      />
    );

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
    <Card layout="stacked" data-group={group.key}>
      <CardAside>
        <h3 className="md:hidden">
          <button
            type="button"
            className={TOGGLE_CLASSES}
            aria-expanded={expanded}
            aria-controls={bodyId}
            aria-label={name}
            onClick={() => setExpanded((open) => !open)}
          >
            <span className="type-subheading">{name}</span>
            <span className="inline-flex items-center gap-2">
              {indicator}
              <ChevronDown
                aria-hidden="true"
                className={cn("size-5 shrink-0 transition-transform", expanded && "rotate-180")}
              />
            </span>
          </button>
        </h3>
        <div className={cn("hidden md:flex", HEADER_ROW_CLASSES)}>
          <h3 className="type-subheading">{name}</h3>
          {indicator}
        </div>
      </CardAside>
      <CardContent id={bodyId} className={expanded ? undefined : "hidden md:block"}>
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
            </div>
          ) : null}
          {group.affective ? (
            <div data-part="affective" className={cn(PART_CLASSES, both && AFFECTIVE_SPLIT_CLASSES)}>
              <p className="type-label">{texts.affectiveHeading}</p>
              {group.affective.axes.length > 0 ? (
                <div className={PANEL_CLASSES}>{group.affective.axes.map(preference)}</div>
              ) : null}
              {blocks(group.affective)}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
