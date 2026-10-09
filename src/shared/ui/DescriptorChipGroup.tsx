"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { Badge, BADGE_GEOMETRY_CLASSES } from "./Badge";
import { Check } from "./icons";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

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
// The chip button carries only the 2px muted-border shell; its one content
// child carries the badge geometry, so both states measure the same. Hover
// changes only the cursor; disabled is 50% opacity with a not-allowed cursor.

const FIELDSET_CLASSES = "m-0 min-w-0 border-0 p-0";
const ROWS_CLASSES = "flex flex-col gap-3";
const ROW_TITLE_CLASSES = "type-meta mb-1.5 block";
const CHIPS_CLASSES = "flex flex-wrap gap-2";
const CHIP_CLASSES = [
  "inline-flex",
  "items-center",
  "rounded-field",
  "border-2",
  "border-border-muted",
  "cursor-pointer",
  "focus-visible:focus-ring",
  "disabled:opacity-50",
  "disabled:cursor-not-allowed",
].join(" ");

const NEXT_KEYS = new Set(["ArrowRight", "ArrowDown"]);
const PREVIOUS_KEYS = new Set(["ArrowLeft", "ArrowUp"]);

/** One chip's content: the badge when chosen, the dot and label otherwise. */
function ChipContent({
  option,
  chosen,
}: {
  option: ChipOption;
  chosen: boolean;
}): ReactNode {
  if (chosen) {
    return (
      <Badge variant="taxonomy" color={option.color} level={option.level}>
        <Check className="size-4 shrink-0" aria-hidden="true" />
        {option.label}
      </Badge>
    );
  }
  return (
    <span className={BADGE_GEOMETRY_CLASSES}>
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: option.color }}
      />
      <span className="text-text-strong">{option.label}</span>
    </span>
  );
}

/** A row: a named group when it has a title, a plain block otherwise. */
function Row({
  title,
  children,
}: {
  title?: ReactNode;
  children: ReactNode;
}): ReactNode {
  const titleId = useId();
  const chips = (
    <div data-slot="chips" className={CHIPS_CLASSES}>
      {children}
    </div>
  );
  if (title == null || title === "") return <div>{chips}</div>;
  return (
    <div role="group" aria-labelledby={titleId}>
      <span id={titleId} className={ROW_TITLE_CLASSES}>
        {title}
      </span>
      {chips}
    </div>
  );
}

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
  const helpId = useId();
  const errorId = useId();

  // The `RadioGroup` contract: an empty string renders and wires nothing.
  const hasHelp = help != null && help !== "";
  const hasError = error != null && error !== "";
  const describedBy = [
    hasHelp ? helpId : undefined,
    hasError ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const messages = (
    <>
      {hasHelp && (
        <p id={helpId} className="type-meta mt-1">
          {help}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="type-error mt-1">
          {error}
        </p>
      )}
    </>
  );

  const legendElement = (
    <legend id={legendId} className="type-label mb-2">
      {legend}
    </legend>
  );

  const fieldsetProps = {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": hasError ? ("true" as const) : undefined,
    className: FIELDSET_CLASSES,
  };

  if (props.readOnly) {
    const chosenRows = rows
      .map((row) => ({
        ...row,
        options: row.options.filter((option) => value.includes(option.value)),
      }))
      .filter((row) => row.options.length > 0);
    return (
      <fieldset {...fieldsetProps}>
        {legendElement}
        {chosenRows.length === 0 ? (
          emptyText != null && <p className="type-body">{emptyText}</p>
        ) : (
          <div className={ROWS_CLASSES}>
            {chosenRows.map((row) => (
              <Row key={row.id} title={row.title}>
                {row.options.map((option) => (
                  <Badge
                    key={option.value}
                    variant="taxonomy"
                    color={option.color}
                    level={option.level}
                  >
                    {option.label}
                  </Badge>
                ))}
              </Row>
            ))}
          </div>
        )}
        {messages}
      </fieldset>
    );
  }

  const { onValueChange } = props;

  // Capture phase with `preventDefault()`, so the primitive's roving focus,
  // restricted to one orientation, does not move focus a second time (D7).
  function handleKeyDownCapture(event: KeyboardEvent<HTMLDivElement>): void {
    const step = NEXT_KEYS.has(event.key)
      ? 1
      : PREVIOUS_KEYS.has(event.key)
        ? -1
        : 0;
    if (step === 0) return;
    const chips = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "button:not([disabled])",
      ),
    );
    const index = chips.indexOf(event.target as HTMLButtonElement);
    if (index === -1) return;
    event.preventDefault();
    chips[(index + step + chips.length) % chips.length]!.focus();
  }

  return (
    <fieldset {...fieldsetProps}>
      {legendElement}
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        aria-labelledby={legendId}
        onKeyDownCapture={handleKeyDownCapture}
        className={ROWS_CLASSES}
      >
        {rows.map((row) => (
          <Row key={row.id} title={row.title}>
            {row.options.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className={CHIP_CLASSES}
              >
                <ChipContent
                  option={option}
                  chosen={value.includes(option.value)}
                />
              </ToggleGroupItem>
            ))}
          </Row>
        ))}
      </ToggleGroup>
      {messages}
    </fieldset>
  );
}
