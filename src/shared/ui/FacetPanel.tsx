"use client";

import { useContext, useEffect, useId, useRef, type ReactNode } from "react";
import { FilterChip } from "./FilterChip";
import { SubsectionToggleContext } from "./SidebarMenuSub";

// ─── UI-specific types (declared before the component) ───
// Applied values and texts come from the consumer; no generated API type is
// used (design.md D2).

export type AppliedFilter = { id: string; facet: string; value: string };

/** `removeFilter` holds `{facet}` and `{value}` placeholders. */
export type FacetPanelTexts = { clearAll: string; removeFilter: string };

export type FacetPanelProps = {
  title: string;
  applied: AppliedFilter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  texts: FacetPanelTexts;
  children?: ReactNode;
};

type FocusTarget = number | "title" | null;

/**
 * Facet panel (spec filtering "Facet panel", "Applied-filter chips";
 * design.md D4): a search region named by its title, the applied-value chips
 * with "Clear all", then the facets. Enter never submits the form. After a
 * removal, focus moves to the chip now at the removed position, else the
 * last chip, else the title; after "Clear all", to the title. Inside a
 * sidebar sub-section the toggle is the title: no heading is rendered, and
 * the region's name and the title's focus go to the toggle
 * (drop-duplicate-filter-title design.md D1).
 */
export function FacetPanel({
  title,
  applied,
  onRemove,
  onClearAll,
  texts,
  children,
}: FacetPanelProps): ReactNode {
  const headingId = useId();
  const toggleId = useContext(SubsectionToggleContext);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const focusTarget = useRef<FocusTarget>(null);

  useEffect(() => {
    const target = focusTarget.current;
    if (target === null) return;
    focusTarget.current = null;
    const chips = chipRefs.current.slice(0, applied.length);
    const chip =
      target === "title" ? undefined : (chips[target] ?? chips[chips.length - 1]);
    const title = toggleId ? document.getElementById(toggleId) : titleRef.current;
    (chip ?? title)?.focus();
  }, [applied, toggleId]);

  return (
    <form
      role="search"
      aria-labelledby={toggleId ?? headingId}
      // Capture phase: the native submit is prevented before any listener on
      // the form sees the event (React's bubble handler runs at the root,
      // after the form's own listeners).
      onSubmitCapture={(event) => event.preventDefault()}
      className="variant-inverse flex flex-col gap-5"
    >
      {!toggleId && (
        <h2 id={headingId} ref={titleRef} tabIndex={-1} className="type-label px-3">
          {title}
        </h2>
      )}
      {applied.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3">
          {applied.map((filter, index) => (
            <FilterChip
              key={filter.id}
              ref={(element) => {
                chipRefs.current[index] = element;
              }}
              value={filter.value}
              label={texts.removeFilter
                .replace("{facet}", filter.facet)
                .replace("{value}", filter.value)}
              onRemove={() => {
                focusTarget.current = index;
                onRemove(filter.id);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              focusTarget.current = "title";
              onClearAll();
            }}
            className="type-button min-h-6 text-nav-text-dark underline focus-visible:focus-ring"
          >
            {texts.clearAll}
          </button>
        </div>
      )}
      {children}
    </form>
  );
}
