"use client";

import type { ComponentProps, ReactNode } from "react";
import { ComboboxLoader } from "./ComboboxLoader";
import type { ComboboxOption } from "./Combobox";

/** The facet texts a combobox reads (suggest-inventory-coffee-names design.md D2). */
type FacetComboboxTexts = {
  searching: string;
  noOptionMatches: string;
  searchFailed: string;
  optionCount: string;
  loading?: string;
};

export function asComboboxValue(value: string | undefined): ComboboxOption | null {
  return value === undefined ? null : { value, label: value };
}

/** The comboboxes' texts, with their loading text (lazy-load-facet-controls design.md D3). */
export function comboboxTexts(texts: FacetComboboxTexts) {
  return {
    searching: texts.searching,
    noMatches: texts.noOptionMatches,
    loadError: texts.searchFailed,
    optionCount: texts.optionCount,
    loading: texts.loading ?? "",
  };
}

/** A facet combobox inside the panel's side padding (split-oversized-facets design.md D6). */
export function PaddedCombobox(props: ComponentProps<typeof ComboboxLoader>): ReactNode {
  return (
    <div className="px-3">
      <ComboboxLoader {...props} />
    </div>
  );
}
