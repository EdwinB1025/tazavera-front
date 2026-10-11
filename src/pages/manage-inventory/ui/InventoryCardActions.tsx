import type { ReactNode } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { LABEL_SEPARATOR, inventoryIdentification } from "@/features/offering-management";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type InventoryCardActionsProps = {
  locale: string;
  item: CoffeeInventoryItem;
  texts: { view: string; createOffering: string };
};

/**
 * The inventory card's actions (add-coffee-inventory-explorer design.md D4):
 * "View" consults the item's detail (positional treatment 3) and "Create
 * offering" starts an offering with the item preselected (treatment 1). Each
 * accessible name starts with its visible label and names the item's coffee
 * and roastery in a visually hidden span (name-card-actions-by-coffee D2).
 */
export function InventoryCardActions({ locale, item, texts }: InventoryCardActionsProps): ReactNode {
  const id = encodeURIComponent(item.ulid ?? "");
  const name = (
    <>
      {LABEL_SEPARATOR}
      <span className="sr-only">{inventoryIdentification(item)}</span>
    </>
  );
  return (
    <>
      <RouteButton href={`/${locale}/manage/inventory/${id}`} variant="action-3" size="sm">
        {texts.view}
        {name}
      </RouteButton>
      <RouteButton
        href={`/${locale}/manage/offerings/new?inventory=${id}`}
        variant="action-1"
        size="sm"
      >
        {texts.createOffering}
        {name}
      </RouteButton>
    </>
  );
}
