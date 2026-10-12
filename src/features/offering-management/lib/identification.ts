import type { CoffeeInventoryItem, OfferingSummary } from "@/shared/api";

// The offering's identification after a control's visible label: coffee name
// and location name (summary §4; no interface text). Shared by Select and
// Delete so both name the same offering alike
// (fix-offering-card-actions-layout design.md D2).
const NAME_SEPARATOR = " — ";
export const LABEL_SEPARATOR = " ";

/** The offering's coffee name and location name, joined. */
export function offeringIdentification(offering: OfferingSummary): string {
  return [offering.coffeeInventory?.coffee?.name, offering.location?.name]
    .filter(Boolean)
    .join(NAME_SEPARATOR);
}

/** The inventory item's coffee name and roastery name, joined (name-card-actions-by-coffee D1). */
export function inventoryIdentification(item: CoffeeInventoryItem): string {
  return [item.coffee?.name, item.roastery?.name].filter(Boolean).join(NAME_SEPARATOR);
}
