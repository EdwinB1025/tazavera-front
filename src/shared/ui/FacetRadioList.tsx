"use client";

import { useId, useState, type ReactNode } from "react";
import { RadioGroup, type RadioOption } from "./RadioGroup";
import { SeeMoreButton, type SeeMoreTexts } from "./SeeMoreButton";

// ─── UI-specific types (declared before the component) ───
// Options and texts come from the consumer; no generated API type is used.

export type FacetOption = { value: string; label: string };

export type FacetRadioListProps = {
  legend: string;
  options: FacetOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  anyLabel: string;
  texts: SeeMoreTexts;
  help?: string;
  disabled?: boolean;
};

/** Options shown while a long facet is collapsed (design.md D6, Open 6 (a)). */
export const SEE_MORE_THRESHOLD = 5;

/**
 * Radio-list facet (spec filtering "Radio-list facet"; design.md D6): "Any"
 * first (neutral, reports `undefined`), then the options as facet rows.
 * While collapsed, options after the fifth are hidden unless applied.
 */
export function FacetRadioList({
  legend,
  options,
  value,
  onChange,
  anyLabel,
  texts,
  help,
  disabled,
}: FacetRadioListProps): ReactNode {
  const groupId = useId();
  const [expanded, setExpanded] = useState(false);
  const collapsible = options.length > SEE_MORE_THRESHOLD;

  const rows: RadioOption[] = [
    { value: "", label: anyLabel, neutral: true },
    ...options.map((option, index) => ({
      value: option.value,
      label: option.label,
      hidden:
        collapsible &&
        !expanded &&
        index >= SEE_MORE_THRESHOLD &&
        option.value !== value,
    })),
  ];
  const hiddenCount = rows.filter((row) => row.hidden).length;

  return (
    <div className="flex flex-col">
      <RadioGroup
        id={groupId}
        legend={legend}
        options={rows}
        value={value ?? ""}
        onChange={(next) => onChange(next === "" ? undefined : next)}
        help={help}
        disabled={disabled}
        variant="inverse"
        presentation="row"
      />
      {collapsible && (
        <SeeMoreButton
          expanded={expanded}
          count={hiddenCount}
          controls={groupId}
          onToggle={() => setExpanded((current) => !current)}
          texts={texts}
        />
      )}
    </div>
  );
}
