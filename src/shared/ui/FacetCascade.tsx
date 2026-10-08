"use client";

import { useId, useState, type ReactNode } from "react";
import { DescriptorChipGroup, type ChipOption, type ChipRow } from "./DescriptorChipGroup";
import { SEE_MORE_THRESHOLD, type FacetOption } from "./FacetRadioList";
import { SeeMoreButton, type SeeMoreTexts } from "./SeeMoreButton";

// ─── UI-specific types (declared before the component) ───
// Options and texts come from the consumer; no generated API type is used.

/** A taxonomy option with its data colour. */
export type CascadeChildOption = FacetOption & { color: string };

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

function chip(option: CascadeChildOption, level: 0 | 1): ChipOption {
  return { value: option.value, label: option.label, color: option.color, level };
}

/**
 * The chip rows (refine-offering-facets-aut D3): the visible top-level chips
 * in untitled rows, broken after each chosen parent with children, which is
 * followed by its children row titled with its label.
 */
function cascadeRows(visible: CascadeOption[], chosen: Set<string>): ChipRow[] {
  const rows: ChipRow[] = [];
  let line: ChipOption[] = [];
  for (const option of visible) {
    line.push(chip(option, 0));
    const children = option.children ?? [];
    if (!chosen.has(option.value) || children.length === 0) continue;
    rows.push({ id: `line-${option.value}`, options: line });
    rows.push({
      id: `children-${option.value}`,
      title: option.label,
      options: children.map((child) => chip(child, 1)),
    });
    line = [];
  }
  if (line.length > 0) rows.push({ id: "line-end", options: line });
  return rows;
}

/**
 * The value to report: the next chosen set without the children of every
 * parent that became unchosen, in option order (parent before its children).
 */
function cascadeValue(options: CascadeOption[], previous: string[], next: string[]): string[] {
  const kept = new Set(next);
  for (const option of options) {
    if (previous.includes(option.value) && !kept.has(option.value)) {
      for (const child of option.children ?? []) kept.delete(child.value);
    }
  }
  return options
    .flatMap((option) => [option.value, ...(option.children ?? []).map((c) => c.value)])
    .filter((id) => kept.has(id));
}

/**
 * Taxonomy chip cascade facet (spec filtering "Taxonomy chip cascade facet";
 * refine-offering-facets-aut D3, D4): a descriptor chip group whose children
 * render only while their parent is chosen. "See more" applies to the
 * top-level chips, a chosen parent always visible.
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
        <DescriptorChipGroup
          legend={legend}
          rows={cascadeRows(visible, chosen)}
          value={value}
          onValueChange={(next) => onChange(cascadeValue(options, value, next))}
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
