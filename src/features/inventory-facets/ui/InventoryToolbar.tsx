"use client";

import type { ReactNode } from "react";
import { FiltersTrigger } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type InventoryToolbarProps = {
  /** Number of applied inventory filters (design.md D5). */
  count: number;
  texts: { trigger: string; triggerWithCount: string };
};

/**
 * The inventory list's body toolbar (add-coffee-inventory-explorer design.md
 * D5; spec "Inventory filter toolbar"): the "Filters" trigger with the
 * applied count, and no sort, which the contract does not offer.
 */
export function InventoryToolbar({ count, texts }: InventoryToolbarProps): ReactNode {
  const label = count > 0 ? texts.triggerWithCount.replace("{count}", String(count)) : texts.trigger;
  return (
    <div className="flex items-end">
      <FiltersTrigger label={label} />
    </div>
  );
}
