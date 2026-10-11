import type { CoffeeInventoryItem } from "@/shared/api";

// ─── UI-specific types (declared before the functions) ───

/** The labels of the card's rows, as props (add-coffee-inventory-explorer design.md D10). */
export type InventoryCardTexts = {
  process: string;
  variety: string;
  roastLevel: string;
  altitude: string;
  producer: string;
  certifications: string;
  roastery: string;
  roastLot: string;
  productionDate: string;
};

export type InventoryRow = { label: string; value: string };

// ─── Fixed pieces (no interface text) ───
const ALTITUDE_UNIT = " m";
const ORIGIN_SEPARATOR = " · ";
const CERTIFICATION_SEPARATOR = ", ";

/** `coffee.country · coffee.region`, an empty part skipped. */
export function originLine(item: CoffeeInventoryItem): string {
  return [item.coffee?.country, item.coffee?.region]
    .filter((part) => part != null && part !== "")
    .join(ORIGIN_SEPARATOR);
}

/**
 * The card's labelled rows in their order (design.md D3): the producer row
 * only when `coffee.producer` is not null, the certifications row only when
 * there is at least one. Values render exactly as returned.
 */
export function inventoryRows(item: CoffeeInventoryItem, texts: InventoryCardTexts): InventoryRow[] {
  const coffee = item.coffee ?? {};
  const certifications = coffee.certifications ?? [];
  // `null` skips the row; `undefined` renders an empty value.
  const entries: [string, string | null | undefined][] = [
    [texts.process, coffee.process],
    [texts.variety, coffee.variety],
    [texts.roastLevel, coffee.roastLevel],
    [texts.altitude, coffee.altitude == null ? undefined : `${coffee.altitude}${ALTITUDE_UNIT}`],
    [texts.producer, coffee.producer ?? null],
    [
      texts.certifications,
      certifications.length > 0
        ? certifications.map((certification) => certification.code ?? "").join(CERTIFICATION_SEPARATOR)
        : null,
    ],
    [texts.roastery, item.roastery?.name],
    [texts.roastLot, item.roastLot],
    [texts.productionDate, item.productionDate],
  ];
  return entries
    .filter(([, value]) => value !== null)
    .map(([label, value]) => ({ label, value: value ?? "" }));
}

/** The detail's labels: the card's plus the coffee's lot and the roastery's description. */
export type InventoryFieldsTexts = InventoryCardTexts & {
  coffeeLot: string;
  roasteryDescription: string;
};

/**
 * Every field of the item for its detail (design.md D3): the card's rows, the
 * coffee's lot, one row per certification (its code, its description) and the
 * roastery's description when present.
 */
export function detailRows(item: CoffeeInventoryItem, texts: InventoryFieldsTexts): InventoryRow[] {
  const certifications = (item.coffee?.certifications ?? []).map((certification) => ({
    label: certification.code ?? "",
    value: certification.description ?? "",
  }));
  const description = item.roastery?.description;
  return [
    ...inventoryRows(item, texts),
    { label: texts.coffeeLot, value: item.coffee?.lot ?? "" },
    ...certifications,
    ...(description ? [{ label: texts.roasteryDescription, value: description }] : []),
  ];
}
