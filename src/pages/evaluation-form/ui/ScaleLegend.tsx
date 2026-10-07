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

// ─── Layout end states (design.md D16, D18) ───
// The section card pads the band and drops its separator while collapsed.
const LIST_CLASSES = ["grid", "gap-2", "md:grid-cols-3", "md:grid-flow-col", "md:grid-rows-3"].join(
  " ",
);
const ITEM_CLASSES = ["flex", "items-center", "gap-2", "type-body"].join(" ");
// The number sits centred over its bean (design.md D18): bold `text-inverse`
// with a 2px stroke in the disc's colour painted under the fill, a 1px
// outline that sets it apart where it crosses the bean drawing.
const MARK_CLASSES = ["relative", "size-8", "shrink-0"].join(" ");
const NUMBER_CLASSES = [
  "absolute",
  "inset-0",
  "flex",
  "items-center",
  "justify-center",
  "type-badge",
  "font-bold",
  "text-text-inverse",
  "[-webkit-text-stroke:2px_var(--color-evaluation-bean-on)]",
  "[paint-order:stroke_fill]",
].join(" ");

/**
 * The 1–9 legend "Affective quality impression" (design.md D16; spec
 * "Evaluation form"): an informative collapsible card listing the nine
 * values in order, each with its number inside its bean mark and its
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
      <Card variant="section" data-legend="affective">
        <CardAside>
          <CollapsibleHeader headingLevel={3}>{texts.title}</CollapsibleHeader>
        </CardAside>
        <CollapsibleBody>
          <CardContent>
            <ol className={LIST_CLASSES}>
              {texts.labels.map((label, index) => (
                <li key={label} className={ITEM_CLASSES}>
                  <span className={MARK_CLASSES}>
                    <BeanMark variant="on" />
                    <span className={NUMBER_CLASSES}>{index + 1}</span>
                  </span>
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
