"use client";

import { useId, useState, type ReactNode } from "react";
import { DescriptorCascade } from "./DescriptorCascade";
import type { CascadeNode } from "./descriptor-cascade";
import { SEE_MORE_THRESHOLD, type FacetOption } from "./FacetRadioList";
import { SeeMoreButton, type SeeMoreTexts } from "./SeeMoreButton";

// ─── UI-specific types (declared before the component) ───
// Options and texts come from the consumer; no generated API type is used.

/**
 * A taxonomy option with its data colour; a chip without one takes `""`, as
 * the descriptor rows do (refine-offering-facets-aut D5).
 */
export type CascadeChildOption = FacetOption & { color?: string };

/** Two levels: a top-level option (level 0) and its optional children (level 1). */
export type CascadeOption = CascadeChildOption & { children?: CascadeChildOption[] };

export type FacetCascadeTexts = SeeMoreTexts;

export type FacetCascadeProps = {
  legend: string;
  options: CascadeOption[];
  value: string[];
  onChange: (values: string[]) => void;
  texts: FacetCascadeTexts;
  help?: string;
  disabled?: boolean;
};

/** An option as a cascade node: level by depth, no colour as `""` (D3). */
function toNode(option: CascadeChildOption, level: 0 | 1, children: CascadeNode[] = []): CascadeNode {
  return { value: option.value, label: option.label, color: option.color ?? "", level, children };
}

/**
 * Taxonomy chip cascade facet (spec filtering "Taxonomy chip cascade facet";
 * refine-offering-facets-aut D3, D4): the shared descriptor cascade
 * (cascade-evaluation-descriptors D3), whose children render only while their
 * parent is chosen. "See more" applies to the top-level chips, a chosen
 * parent always visible.
 */
export function FacetCascade({
  legend,
  options,
  value,
  onChange,
  texts,
  help,
  disabled,
}: FacetCascadeProps): ReactNode {
  const wrapperId = useId();
  const [showAll, setShowAll] = useState(false);
  const chosen = new Set(value);
  const collapsible = options.length > SEE_MORE_THRESHOLD;
  const visible = options.filter(
    (option, index) =>
      !collapsible || showAll || index < SEE_MORE_THRESHOLD || chosen.has(option.value),
  );

  return (
    // `min-w-0` lets the facet shrink inside the 16rem sidebar and
    // `wrap-anywhere` (inherited) wraps long labels without break points.
    <div className="flex min-w-0 flex-col wrap-anywhere">
      <div id={wrapperId} className="px-3 pt-1">
        <DescriptorCascade
          legend={legend}
          nodes={visible.map((option) =>
            toNode(option, 0, (option.children ?? []).map((child) => toNode(child, 1))),
          )}
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          help={help}
        />
      </div>
      {collapsible && (
        <SeeMoreButton
          expanded={showAll}
          count={options.length - visible.length}
          controls={wrapperId}
          onToggle={() => setShowAll((current) => !current)}
          texts={texts}
        />
      )}
    </div>
  );
}
