// ─── Facet-row presentation (add-facet-controls design.md D3) ───
// Class sets shared by the facet-row presentation of Checkbox and RadioGroup
// and by the cascade facet. The row look follows the controlled value, not
// CSS state: the consumer passes the rest or the selected set. The 4px left
// border is constant (transparent at rest) so the label never shifts.

export type ControlPresentation = "field" | "row";

const FACET_ROW_CLASSES =
  "group flex w-full min-h-10 cursor-pointer items-center gap-2 rounded-field border-l-4 px-3 py-2";

const FACET_ROW_REST_CLASSES = "border-transparent hover:shadow-nav-hover";

const FACET_ROW_SELECTED_CLASSES =
  "border-nav-indicator bg-nav-current-dark shadow-nav-current";

const FACET_ROW_LABEL_REST_CLASSES = "type-sidebar-item group-hover:font-bold";

const FACET_ROW_LABEL_SELECTED_CLASSES =
  "type-sidebar-item underline decoration-nav-underline underline-offset-3";

const FACET_ROW_DISABLED_CLASSES = "cursor-not-allowed opacity-50";

/**
 * Removes the control's own disabled fade (`disabled:opacity-50`,
 * `peer-disabled:opacity-50`) from a box or mark class string: inside a facet
 * row the row's `opacity-50` already fades it, and opacities multiply.
 */
export function withoutDisabledFade(classes: string): string {
  return classes
    .split(" ")
    .filter((c) => c !== "disabled:opacity-50" && c !== "peer-disabled:opacity-50")
    .join(" ");
}

export const FACET_LEGEND_CLASSES = "type-label mb-1 px-3 py-1";

/**
 * Side padding of the help and error paragraphs under a row facet, aligned
 * with the legend's `px-3` (refine-facet-controls design.md D1).
 */
export const FACET_MESSAGE_CLASSES = "px-3";

/** Row column: rows sit in a `flex flex-col gap-1` column. */
export const FACET_ROWS_CLASSES = "flex flex-col gap-1";

/**
 * The `label` (row) and label-text classes of one facet row. A disabled row
 * drops its hover changes and swaps the pointer cursor for the disabled one.
 */
export function facetRowClasses({
  selected,
  disabled = false,
}: {
  selected: boolean;
  disabled?: boolean;
}): { row: string; label: string } {
  const base = disabled
    ? FACET_ROW_CLASSES.replace("cursor-pointer ", "")
    : FACET_ROW_CLASSES;
  if (selected) {
    return {
      row: [base, FACET_ROW_SELECTED_CLASSES, disabled && FACET_ROW_DISABLED_CLASSES]
        .filter(Boolean)
        .join(" "),
      label: FACET_ROW_LABEL_SELECTED_CLASSES,
    };
  }
  if (disabled) {
    return {
      row: `${base} border-transparent ${FACET_ROW_DISABLED_CLASSES}`,
      label: "type-sidebar-item",
    };
  }
  return {
    row: `${base} ${FACET_ROW_REST_CLASSES}`,
    label: FACET_ROW_LABEL_REST_CLASSES,
  };
}
