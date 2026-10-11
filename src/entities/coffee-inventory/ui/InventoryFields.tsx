import type { ReactNode } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { LabelValueRow } from "@/shared/ui";
import { detailRows, type InventoryFieldsTexts } from "../model/rows";

// ─── UI-specific types (declared before the component) ───

export type InventoryFieldsProps = {
  item: CoffeeInventoryItem;
  texts: InventoryFieldsTexts;
};

// The rows 0.75rem apart (design.md D3).
const ROWS_CLASSES = ["flex", "flex-col", "gap-3"].join(" ");

/**
 * Every field of one inventory item as labelled values
 * (add-coffee-inventory-explorer design.md D3; spec "Coffee inventory
 * detail"), each value exactly as returned.
 */
export function InventoryFields({ item, texts }: InventoryFieldsProps): ReactNode {
  return (
    <dl className={ROWS_CLASSES}>
      {detailRows(item, texts).map((row, index) => (
        <LabelValueRow key={`${row.label}-${index}`} label={row.label} value={row.value} />
      ))}
    </dl>
  );
}
