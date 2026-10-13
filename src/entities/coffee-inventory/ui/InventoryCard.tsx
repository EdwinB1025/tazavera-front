import type { ReactNode } from "react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { ActionGroup, Card, CardContent, CardFooter, LabelValueRow } from "@/shared/ui";
import { inventoryRows, originLine, type InventoryCardTexts } from "../model/rows";

// ─── UI-specific types (declared before the component) ───

export type InventoryCardProps = {
  item: CoffeeInventoryItem;
  texts: InventoryCardTexts;
  /** The card's actions, supplied by the consumer (design.md D4). */
  actions?: ReactNode;
};

// The heading, the origin line and the rows 0.5rem apart; the rows too.
const CONTENT_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
const ROWS_CLASSES = ["flex", "flex-col", "gap-2"].join(" ");
// The actions' group fills the footer's row below `md` and sits at its end
// from `md` (unify-action-button-widths D3).
const ACTIONS_CLASSES = ["max-md:w-full", "md:ml-auto"].join(" ");

/**
 * One coffee inventory item in the shared stacked card
 * (add-coffee-inventory-explorer design.md D3; spec "Coffee inventory card"):
 * the coffee name, the origin line and the labelled rows, then the
 * consumer's actions in one end-aligned action group.
 */
export function InventoryCard({ item, texts, actions }: InventoryCardProps): ReactNode {
  const origin = originLine(item);
  return (
    <Card layout="stacked">
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-card-heading">{item.coffee?.name}</h2>
        {origin ? <p className="type-meta">{origin}</p> : null}
        <dl className={ROWS_CLASSES}>
          {inventoryRows(item, texts).map((row) => (
            <LabelValueRow key={row.label} label={row.label} value={row.value} />
          ))}
        </dl>
      </CardContent>
      {actions ? (
        <CardFooter>
          <ActionGroup align="end" className={ACTIONS_CLASSES}>
            {actions}
          </ActionGroup>
        </CardFooter>
      ) : null}
    </Card>
  );
}
