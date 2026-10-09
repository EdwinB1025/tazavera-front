"use client";

import { useId, type KeyboardEvent, type ReactNode } from "react";
import { Badge, BADGE_GEOMETRY_CLASSES } from "./Badge";
import type { ChipOption, ChipRow } from "./DescriptorChipGroup";
import { Check } from "./icons";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

// ─── UI-specific types (declared before the components) ───

export type ChosenChipRowsProps = {
  rows: ChipRow[];
  value: string[];
  emptyText?: ReactNode;
};

export type ToggleChipRowsProps = {
  rows: ChipRow[];
  value: string[];
  onValueChange: (value: string[]) => void;
  disabled?: boolean;
  legendId: string;
  /** The chip button's treatment classes, owned by DescriptorChipGroup. */
  chipClasses: string;
};

// ─── Treatment classes (design.md D6) ───
// The chip button's classes arrive from DescriptorChipGroup; its one content
// child carries the badge geometry, so both states measure the same.

const ROWS_CLASSES = "flex flex-col gap-3";
const ROW_TITLE_CLASSES = "type-meta mb-1.5 block";
const CHIPS_CLASSES = "flex flex-wrap gap-2";
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

/** The read-only rows: only the chosen options, as plain taxonomy badges. */
export function ChosenChipRows({
  rows,
  value,
  emptyText,
}: ChosenChipRowsProps): ReactNode {
  const chosenRows = rows
    .map((row) => ({
      ...row,
      options: row.options.filter((option) => value.includes(option.value)),
    }))
    .filter((row) => row.options.length > 0);
  if (chosenRows.length === 0) {
    return emptyText != null && <p className="type-body">{emptyText}</p>;
  }
  return (
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
  );
}

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

/** The interactive rows: one multiple toggle group over every row. */
export function ToggleChipRows({
  rows,
  value,
  onValueChange,
  disabled,
  legendId,
  chipClasses,
}: ToggleChipRowsProps): ReactNode {
  return (
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
              className={chipClasses}
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
  );
}
