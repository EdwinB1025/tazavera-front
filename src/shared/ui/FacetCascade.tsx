"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "@/shared/ui/icons";
import { Checkbox } from "./Checkbox";
import { FACET_LEGEND_CLASSES, FACET_ROWS_CLASSES } from "./facet-row";
import { SEE_MORE_THRESHOLD, type FacetOption } from "./FacetRadioList";
import { SeeMoreButton, type SeeMoreTexts } from "./SeeMoreButton";

// ─── UI-specific types (declared before the component) ───
// Options and texts come from the consumer; no generated API type is used.

/** Two levels: a top-level option and its optional children. */
export type CascadeOption = FacetOption & { children?: FacetOption[] };

/** `toggleChildren` holds a `{label}` placeholder. */
export type FacetCascadeTexts = SeeMoreTexts & { toggleChildren: string };

export type FacetCascadeProps = {
  legend: string;
  options: CascadeOption[];
  value: string[];
  onChange: (values: string[]) => void;
  texts: FacetCascadeTexts;
  help?: string;
  disabled?: boolean;
};

const TOGGLE_CLASSES =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-field text-nav-text-dark hover:shadow-nav-hover focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Taxonomy cascade facet (spec filtering "Taxonomy cascade facet";
 * design.md D7). Checkboxes are independent; a change reports the checked
 * ids in option order (parent before its children). Expansion is local
 * state initialised once: a parent with a checked child starts expanded.
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
  const baseId = useId();
  const listId = `${baseId}-list`;
  const helpId = `${baseId}-help`;
  const hasHelp = help != null && help !== "";
  const checked = new Set(value);

  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    () =>
      new Set(
        options
          .filter((option) => option.children?.some((child) => checked.has(child.value)))
          .map((option) => option.value),
      ),
  );
  const [showAll, setShowAll] = useState(false);
  const collapsible = options.length > SEE_MORE_THRESHOLD;

  function toggleValue(id: string): void {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(
      options
        .flatMap((option) => [option.value, ...(option.children ?? []).map((c) => c.value)])
        .filter((id) => next.has(id)),
    );
  }

  function toggleExpanded(id: string): void {
    setExpandedParents((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function row(option: FacetOption): ReactNode {
    return (
      <Checkbox
        label={option.label}
        checked={checked.has(option.value)}
        onChange={() => toggleValue(option.value)}
        disabled={disabled}
        variant="inverse"
        presentation="row"
      />
    );
  }

  const hiddenTop = options.map(
    (option, index) =>
      collapsible &&
      !showAll &&
      index >= SEE_MORE_THRESHOLD &&
      !checked.has(option.value) &&
      !(option.children ?? []).some((child) => checked.has(child.value)),
  );

  return (
    <fieldset aria-describedby={hasHelp ? helpId : undefined} className="flex flex-col">
      <legend className={FACET_LEGEND_CLASSES}>{legend}</legend>
      <div id={listId} className={FACET_ROWS_CLASSES}>
        {options.map((option, index) => {
          const children = option.children ?? [];
          if (children.length === 0) {
            return (
              <div key={option.value} hidden={hiddenTop[index] || undefined}>
                {row(option)}
              </div>
            );
          }
          const childrenId = `${baseId}-children-${index}`;
          const expanded = expandedParents.has(option.value);
          const Chevron = expanded ? ChevronDown : ChevronRight;
          return (
            <div key={option.value} hidden={hiddenTop[index] || undefined}>
              <div className="flex items-center gap-1">
                <div className="flex-1">{row(option)}</div>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={childrenId}
                  aria-label={texts.toggleChildren.replace("{label}", option.label)}
                  onClick={() => toggleExpanded(option.value)}
                  disabled={disabled}
                  className={TOGGLE_CLASSES}
                >
                  <Chevron className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div
                role="group"
                id={childrenId}
                aria-label={option.label}
                hidden={!expanded || undefined}
                className="ml-6 mt-1 flex flex-col gap-1"
              >
                {children.map((child) => (
                  <div key={child.value}>{row(child)}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {collapsible && (
        <SeeMoreButton
          expanded={showAll}
          count={hiddenTop.filter(Boolean).length}
          controls={listId}
          onToggle={() => setShowAll((current) => !current)}
          texts={texts}
        />
      )}
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
    </fieldset>
  );
}
