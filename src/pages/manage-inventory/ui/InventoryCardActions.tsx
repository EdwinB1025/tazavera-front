import type { ReactNode } from "react";
import { RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type InventoryCardActionsProps = {
  locale: string;
  ulid: string;
  texts: { view: string; createOffering: string };
};

/**
 * The inventory card's actions (add-coffee-inventory-explorer design.md D4):
 * "View" consults the item's detail (positional treatment 3) and "Create
 * offering" starts an offering with the item preselected (treatment 1).
 */
export function InventoryCardActions({ locale, ulid, texts }: InventoryCardActionsProps): ReactNode {
  const id = encodeURIComponent(ulid);
  return (
    <>
      <RouteButton href={`/${locale}/manage/inventory/${id}`} variant="action-3" size="sm">
        {texts.view}
      </RouteButton>
      <RouteButton
        href={`/${locale}/manage/offerings/new?inventory=${id}`}
        variant="action-1"
        size="sm"
      >
        {texts.createOffering}
      </RouteButton>
    </>
  );
}
