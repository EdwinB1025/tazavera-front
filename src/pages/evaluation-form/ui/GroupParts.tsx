import type { ReactNode } from "react";
import type {
  AxisKey,
  DescriptiveAxisKey,
  DescriptorBlock as BlockDefinition,
  EvaluationFormState,
  GroupPart,
  PartKey,
} from "@/entities/evaluation";
import { EXTRINSIC_FIELDS } from "@/entities/evaluation";
import { cn } from "@/shared/lib/utils";
import { withExtrinsic, withGeneralObservation } from "../model/form-updates";
import type { FormStateUpdate } from "../model/form-updates";
import { AxisNote, IntensityControl, PreferenceControl } from "./AxisControls";
import { ExtrinsicField } from "./ExtrinsicField";
import type { EvaluationGroupTexts } from "./group-texts";
import { NoteField } from "./NoteField";

// ─── UI-specific types (declared before the component) ───

export type GroupPartProps<Axis extends AxisKey = AxisKey> = {
  definition: GroupPart<Axis>;
  /** The group has both parts: each takes its split classes. */
  both: boolean;
  state: EvaluationFormState;
  onChange: FormStateUpdate;
  texts: EvaluationGroupTexts;
  /** The closed evaluation's read-only presentation (design.md D4). */
  readOnly: boolean;
  /** Renders one descriptor block of a part (design.md D7). */
  renderBlock?: (block: BlockDefinition) => ReactNode;
};

export type ExtrinsicNotesProps = {
  state: EvaluationFormState;
  onChange: FormStateUpdate;
  texts: EvaluationGroupTexts;
  readOnly: boolean;
};

type PartColumnProps = {
  part: PartKey;
  heading: string;
  className: string;
  /** The axes' controls, in their panel when the part has axes. */
  controls: ReactNode[];
  blocks: BlockDefinition[];
  renderBlock?: (block: BlockDefinition) => ReactNode;
  notes: ReactNode[];
};

// ─── Layout end states (design.md D14, D18; the summary §9) ───
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
 * One part of a group: its heading, the axes' controls in a panel, the
 * descriptor blocks of the part, each in its own panel, and the axes' notes.
 */
function PartColumn({
  part,
  heading,
  className,
  controls,
  blocks,
  renderBlock,
  notes,
}: PartColumnProps): ReactNode {
  return (
    <div data-part={part} className={className}>
      <p className="type-label">{heading}</p>
      {controls.length > 0 ? <div className={PANEL_CLASSES}>{controls}</div> : null}
      {renderBlock
        ? blocks.map((block) => (
            <div key={block.selection} className={PANEL_CLASSES}>
              {renderBlock(block)}
            </div>
          ))
        : null}
      {notes}
    </div>
  );
}

/** The descriptive part: one intensity slider (0–15) per axis. */
export function DescriptivePart({
  definition,
  both,
  renderBlock,
  ...axis
}: GroupPartProps<DescriptiveAxisKey>): ReactNode {
  const pair = definition.axes.length > 1;
  return (
    <PartColumn
      part="descriptive"
      heading={axis.texts.descriptiveHeading}
      className={cn(PART_CLASSES, both && DESCRIPTIVE_SPLIT_CLASSES)}
      controls={definition.axes.map((key) => (
        <IntensityControl key={key} axis={key} {...axis} />
      ))}
      blocks={definition.blocks}
      renderBlock={renderBlock}
      notes={definition.axes.map((key) => (
        <AxisNote
          key={`descriptive-${key}-note`}
          part="descriptive"
          axis={key}
          pair={pair}
          {...axis}
        />
      ))}
    />
  );
}

/** The affective part: one bean scale (1–9) per axis. */
export function AffectivePart({
  definition,
  both,
  renderBlock,
  ...axis
}: GroupPartProps): ReactNode {
  const pair = definition.axes.length > 1;
  return (
    <PartColumn
      part="affective"
      heading={axis.texts.affectiveHeading}
      className={cn(PART_CLASSES, both && AFFECTIVE_SPLIT_CLASSES)}
      controls={definition.axes.map((key) => (
        <PreferenceControl key={key} axis={key} {...axis} />
      ))}
      blocks={definition.blocks}
      renderBlock={renderBlock}
      notes={definition.axes.map((key) => (
        <AxisNote
          key={`affective-${key}-note`}
          part="affective"
          axis={key}
          pair={pair}
          {...axis}
        />
      ))}
    />
  );
}

/**
 * The Extrinsic group's five fields in the contract's order (add-extrinsic-fields):
 * farming, processing, trading and certifications, then the general
 * observation note, sent as `extrinsics.generalObservation`.
 */
export function ExtrinsicNotes({
  state,
  onChange,
  texts,
  readOnly,
}: ExtrinsicNotesProps): ReactNode {
  return (
    <div data-part="notes" className={PART_CLASSES}>
      {EXTRINSIC_FIELDS.map((field) => (
        <ExtrinsicField
          key={field}
          label={texts.extrinsicLabels[field]}
          // As a pair's notes: the group holds several "Add note" controls.
          noteLabel={`${texts.noteLabel} (${texts.extrinsicLabels[field]})`}
          addLabel={`${texts.addNoteLabel} (${texts.extrinsicLabels[field]})`}
          removeLabel={texts.removeNoteLabel}
          value={state.extrinsics[field]}
          readOnly={readOnly}
          onChange={(next) => onChange(withExtrinsic(field, next))}
        />
      ))}
      <NoteField
        label={texts.extrinsicNoteLabel}
        addLabel={texts.addNoteLabel}
        removeLabel={texts.removeNoteLabel}
        value={state.generalObservation}
        readOnly={readOnly}
        onChange={(next) => onChange(withGeneralObservation(next))}
      />
    </div>
  );
}
