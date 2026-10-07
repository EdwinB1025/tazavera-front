"use client";

import type { ReactNode } from "react";
import { Button, Checkbox } from "@/shared/ui";
import type { LocationsState } from "../model/create-flow";

// ─── UI-specific types (declared before the component) ───

export type LocationsFieldsetTexts = {
  locationsLegend: string;
  locationsLoading: string;
  locationsEmpty: string;
  locationsError: string;
  retryLabel: string;
};

export type LocationsFieldsetProps = {
  locations: LocationsState;
  /** The selected location ulids. */
  selected: readonly string[];
  onToggle: (ulid: string) => void;
  onRetry: () => void;
  disabled?: boolean;
  texts: LocationsFieldsetTexts;
};

// ─── Layout (summary §6.3) ───
// No native fieldset border, padding or margin.
const FIELDSET_CLASSES = ["m-0", "min-w-0", "border-0", "p-0"].join(" ");
// Legend 0.5rem above the options (Field's label pattern).
const LEGEND_CLASSES = ["type-label", "mb-2", "p-0"].join(" ");
// Checkboxes in a column 0.5rem apart.
const OPTIONS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
// Error line and Retry: a wrapping row 0.5rem apart.
const ERROR_CLASSES = ["flex", "flex-wrap", "items-center", "gap-2"].join(" ");

/**
 * The locations group of the create form (design.md D10; spec "Creating
 * offerings"): a `fieldset` whose `legend` carries the required asterisk, one
 * checkbox per location by its name, and its loading, empty and error lines
 * in the options' place. `form-fields` has no checkbox group, so it is
 * composed here.
 */
export function LocationsFieldset({
  locations,
  selected,
  onToggle,
  onRetry,
  disabled = false,
  texts,
}: LocationsFieldsetProps): ReactNode {
  let content: ReactNode;
  if (locations.state === "loading") {
    content = <p className="type-meta">{texts.locationsLoading}</p>;
  } else if (locations.state === "error") {
    content = (
      <div className={ERROR_CLASSES}>
        <p className="type-error">{texts.locationsError}</p>
        <Button variant="primary" size="sm" onClick={onRetry}>
          {texts.retryLabel}
        </Button>
      </div>
    );
  } else if (locations.data.length === 0) {
    content = <p className="type-meta">{texts.locationsEmpty}</p>;
  } else {
    content = (
      <div className={OPTIONS_CLASSES}>
        {locations.data.map((location, index) => (
          <Checkbox
            key={location.ulid ?? index}
            label={location.name ?? ""}
            checked={selected.includes(location.ulid ?? "")}
            onChange={() => onToggle(location.ulid ?? "")}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }

  return (
    <fieldset className={FIELDSET_CLASSES}>
      <legend className={LEGEND_CLASSES}>
        {texts.locationsLegend} <span aria-hidden="true">*</span>
      </legend>
      {content}
    </fieldset>
  );
}
