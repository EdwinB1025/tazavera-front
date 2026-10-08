"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type {
  DescriptorBlock as BlockDefinition,
  EvaluationFormState,
  GroupDefinition,
} from "@/entities/evaluation";
import {
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
} from "@/shared/ui";
import type { FormStateUpdate } from "../model/form-updates";
import { CompletenessIndicator } from "./CompletenessIndicator";
import type { EvaluationGroupTexts } from "./group-texts";
import { AffectivePart, DescriptivePart, ExtrinsicNotes } from "./GroupParts";

// ─── UI-specific types (declared before the component) ───

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

// ─── Layout end states (design.md D14, D18; the summary §9) ───
// The section card pads the band and drops its separator while collapsed
// (design.md D15, D18): the aside takes no class of its own.
// An incomplete group after a refused close: a ring in the error colour; the
// indicator's "Incomplete" carries the state in words.
const HIGHLIGHT_CLASSES = ["ring-2", "ring-feedback-error"].join(" ");
const BODY_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");
const BOTH_PARTS_CLASSES = ["flex", "flex-col", "gap-6", "md:grid", "md:grid-cols-2"].join(" ");
const ONE_PART_CLASSES = ["flex", "flex-col", "gap-6"].join(" ");

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

  const both = group.descriptive !== null && group.affective !== null;
  const part = { both, state, onChange, texts, readOnly, renderBlock };

  return (
    <Collapsible open={open} onOpenChange={changeOpen}>
      <Card
        variant="section"
        data-group={group.key}
        data-highlighted={highlighted ? "true" : undefined}
        className={highlighted ? HIGHLIGHT_CLASSES : undefined}
      >
        <CardAside>
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
                  <DescriptivePart definition={group.descriptive} {...part} />
                ) : null}
                {group.affective ? <AffectivePart definition={group.affective} {...part} /> : null}
                {group.notes === "generalObservation" ? (
                  <ExtrinsicNotes
                    state={state}
                    onChange={onChange}
                    texts={texts}
                    readOnly={readOnly}
                  />
                ) : null}
              </div>
            </div>
          </CardContent>
        </CollapsibleBody>
      </Card>
    </Collapsible>
  );
}
