"use client";

import { useId, type ReactNode } from "react";
import { ControlMessages, useControlMessages } from "./ControlMessages";
import { ChosenChipRows, ToggleChipRows } from "./DescriptorChipRows";

// ─── UI-specific types (declared before the component) ───
// No generated API type is used or redefined here: this change consumes no API
// operation and every text is a prop supplied by the consuming capability
// (design.md D2). The rows arrive already built from the consuming capability;
// `value` and `onValueChange` carry taxonomy `ulid`s. The readOnly contract is
// enforced by a discriminated union rather than a runtime assertion:
// `onValueChange` is required unless `readOnly`. Tests pin this with
// `@ts-expect-error` cases and `npx tsc --noEmit`, the `Textarea` precedent.

export type ChipOption = { value: string; label: string; color: string; level: 0 | 1 | 2 };
export type ChipRow = { id: string; title?: ReactNode; options: ChipOption[] };

export type DescriptorChipGroupProps = {
  legend: ReactNode;
  rows: ChipRow[];
  value: string[];
  disabled?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  emptyText?: ReactNode; // readOnly only
} & (
  | { readOnly: true; onValueChange?: never }
  | { readOnly?: false; onValueChange: (value: string[]) => void }
);

// ─── Treatment classes (design.md D6) ───
// The chip and row classes live with the rows (DescriptorChipRows).

const FIELDSET_CLASSES = "m-0 min-w-0 border-0 p-0";

/**
 * Tazavera descriptor chip group.
 *
 * Multiple choice over taxonomy rows per the `form-fields` spec ("Descriptor
 * chip group") and design.md (D2, D6, D7): one `type="multiple"` toggle group
 * over every row, so the block is one tab stop and each chip exposes
 * `aria-pressed`; one own key handler moves focus through all chips in
 * reading order, wrapping, without toggling. The group is its own field: the
 * `fieldset` legend names it and it binds its own help and error, help before
 * error. `readOnly` renders only the chosen options as plain taxonomy badges.
 */
export function DescriptorChipGroup(
  props: DescriptorChipGroupProps,
): ReactNode {
  const { legend, rows, value, disabled, help, error, emptyText } = props;
  const legendId = useId();
  const messages = useControlMessages(help, error);

  return (
    <fieldset
      aria-describedby={messages.describedBy}
      aria-invalid={messages.hasError ? "true" : undefined}
      className={FIELDSET_CLASSES}
    >
      <legend id={legendId} className="type-label mb-2">
        {legend}
      </legend>
      {props.readOnly ? (
        <ChosenChipRows rows={rows} value={value} emptyText={emptyText} />
      ) : (
        <ToggleChipRows
          rows={rows}
          value={value}
          onValueChange={props.onValueChange}
          disabled={disabled}
          legendId={legendId}
        />
      )}
      <ControlMessages ids={messages} help={help} error={error} />
    </fieldset>
  );
}
