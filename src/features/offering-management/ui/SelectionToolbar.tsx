"use client";

import type { ReactNode } from "react";
import { Button, Checkbox } from "@/shared/ui";
import { Trash2 } from "@/shared/ui/icons";

// ─── UI-specific types (declared before the component) ───

export type SelectionToolbarTexts = {
  selectAllLabel: string;
  selectedCount: string;
  deleteSelectedLabel: string;
};

export type SelectionToolbarProps = {
  allSelected: boolean;
  selectedCount: number;
  onToggleAll: () => void;
  onDeleteSelected: () => void;
  texts: SelectionToolbarTexts;
};

// One wrapping row, centre-aligned, 1rem apart, no box (summary §6.2).
const TOOLBAR_CLASSES = ["flex", "flex-wrap", "items-center", "gap-4"].join(" ");
// From `md` the bulk delete sits at the end of the row; below it wraps under
// the other two, left-aligned.
const BULK_DELETE_CLASSES = "md:ml-auto";

/**
 * The selection toolbar of the own list (design.md D7; spec "Offering
 * selection"): the select-all checkbox of the page, the selected count and
 * the bulk delete, which is unavailable at zero selected.
 */
export function SelectionToolbar({
  allSelected,
  selectedCount,
  onToggleAll,
  onDeleteSelected,
  texts,
}: SelectionToolbarProps): ReactNode {
  // The count appended to the catalog word by concatenation (design.md D11).
  const count = `${texts.selectedCount} ${selectedCount}`;

  return (
    <div className={TOOLBAR_CLASSES}>
      <Checkbox
        checked={allSelected}
        onChange={onToggleAll}
        label={texts.selectAllLabel}
      />
      <span className="type-meta">{count}</span>
      <Button
        variant="action-2"
        size="sm"
        icon={Trash2}
        disabled={selectedCount === 0}
        onClick={onDeleteSelected}
        className={BULK_DELETE_CLASSES}
      >
        {texts.deleteSelectedLabel}
      </Button>
    </div>
  );
}
