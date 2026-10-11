import type { ReactNode } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { InventoryFields, type InventoryFieldsTexts } from "@/entities/coffee-inventory";
import { Card, CardContent, RouteButton } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type InventoryDetailViewTexts = InventoryFieldsTexts & {
  eyebrow: string;
  createOffering: string;
};

export type InventoryDetailViewProps = {
  locale: string;
  item: CoffeeInventoryItem;
  texts: InventoryDetailViewTexts;
};

// The header → the fields' card: 2rem.
const BODY_CLASSES = ["flex", "flex-col", "gap-8"].join(" ");
// The eyebrow and the heading 0.5rem apart, the action 1rem below the heading.
const HEADER_CLASSES = ["flex", "flex-col", "items-start", "gap-2"].join(" ");
const ACTION_CLASSES = "mt-2";

/**
 * One inventory item below its back link (add-coffee-inventory-explorer
 * design.md D7): the eyebrow, the coffee name as the page heading and
 * "Create offering" (positional treatment 1), then a section card with every
 * field of the item.
 */
export function InventoryDetailView({ locale, item, texts }: InventoryDetailViewProps): ReactNode {
  const id = encodeURIComponent(item.ulid ?? "");
  return (
    <div className={BODY_CLASSES}>
      <div className={HEADER_CLASSES}>
        <p className="type-eyebrow">{texts.eyebrow}</p>
        <h1 className="type-heading">{item.coffee?.name}</h1>
        <div className={ACTION_CLASSES}>
          <RouteButton
            href={`/${locale}/manage/offerings/new?inventory=${id}`}
            variant="action-1"
            size="sm"
          >
            {texts.createOffering}
          </RouteButton>
        </div>
      </div>
      <Card variant="section">
        <CardContent>
          <InventoryFields item={item} texts={texts} />
        </CardContent>
      </Card>
    </div>
  );
}
