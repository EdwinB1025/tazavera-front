"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "@/shared/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

// ─── UI-specific types (declared before the component) ───

export type ViewToggleItem = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export type ViewToggleProps = {
  /** The group's accessible name. */
  label: string;
  value: string;
  items: ViewToggleItem[];
  onValueChange: (value: string) => void;
};

const GROUP_CLASSES = "inline-flex gap-2";
const ITEM_CLASSES = [
  "inline-flex",
  "items-center",
  "gap-2",
  "min-h-10",
  "px-3",
  "py-2",
  "border",
  "border-action-3-border",
  "rounded-field",
  "type-label",
  "focus-visible:focus-ring",
  "bg-action-3-bg",
  "text-action-3-text",
  "data-[state=on]:bg-action-3-bg-hover",
  "data-[state=on]:text-action-3-text-hover",
].join(" ");

/**
 * A single-choice view control (add-coffeeshop-directory design.md D13; spec
 * "Directory view toggle"): the segment's Radix toggle group, named by its
 * label, one item per view with its icon and visible label. Arrow keys move
 * between items; re-choosing the pressed item is ignored, so one item is
 * always pressed.
 */
export function ViewToggle({ label, value, items, onValueChange }: ViewToggleProps): ReactNode {
  return (
    <ToggleGroup
      type="single"
      aria-label={label}
      value={value}
      onValueChange={(next) => {
        if (next !== "" && next !== value) onValueChange(next);
      }}
      className={GROUP_CLASSES}
    >
      {items.map(({ value: itemValue, label: itemLabel, icon: Icon }) => (
        <ToggleGroupItem key={itemValue} value={itemValue} className={ITEM_CLASSES}>
          <Icon className="size-4" aria-hidden="true" />
          {itemLabel}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
