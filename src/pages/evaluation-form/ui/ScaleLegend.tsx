"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  Card,
  CardAside,
  CardContent,
  Collapsible,
  CollapsibleBody,
  CollapsibleHeader,
} from "@/shared/ui";
import { BeanMark } from "@/shared/ui/icons";
import { cn } from "@/shared/lib/utils";

// ─── UI-specific types (declared before the component) ───

/** The legend's texts, from the `evaluations` catalog (design.md D16). */
export type ScaleLegendTexts = {
  title: string;
  /** The labels of the values 1 to 9, in order. */
  labels: string[];
};

export type ScaleLegendProps = {
  texts: ScaleLegendTexts;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

// ─── Layout end states (design.md D15, D16) ───
// The header aside of the group card: 0.5rem around the header's own 0.5rem,
// no bottom border while collapsed.
const ASIDE_CLASSES = ["px-2", "py-2"].join(" ");
const ASIDE_COLLAPSED_CLASSES = "border-b-0";
const LIST_CLASSES = ["grid", "gap-2", "md:grid-cols-3", "md:grid-flow-col", "md:grid-rows-3"].join(
  " ",
);
const ITEM_CLASSES = ["flex", "items-center", "gap-2", "type-body"].join(" ");
const MARK_CLASSES = ["size-6", "shrink-0"].join(" ");

/**
 * The 1–9 legend "Affective quality impression" (design.md D16; spec
 * "Evaluation form"): an informative collapsible card listing the nine
 * values in order, each with its bean mark, its number beside it and its
 * label. From `md` the values fill three columns top to bottom, so reading
 * order stays 1 to 9.
 */
export function ScaleLegend({
  texts,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: ScaleLegendProps): ReactNode {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const changeOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <Collapsible open={open} onOpenChange={changeOpen}>
      <Card layout="stacked" data-legend="affective">
        <CardAside className={cn(ASIDE_CLASSES, !open && ASIDE_COLLAPSED_CLASSES)}>
          <CollapsibleHeader headingLevel={3}>{texts.title}</CollapsibleHeader>
        </CardAside>
        <CollapsibleBody>
          <CardContent>
            <ol className={LIST_CLASSES}>
              {texts.labels.map((label, index) => (
                <li key={label} className={ITEM_CLASSES}>
                  <span className={MARK_CLASSES}>
                    <BeanMark variant="on" />
                  </span>
                  <span className="type-label">{index + 1}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </CollapsibleBody>
      </Card>
    </Collapsible>
  );
}
