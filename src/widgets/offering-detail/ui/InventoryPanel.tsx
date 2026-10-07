import type { ReactNode } from "react";
import type { OfferingDetail } from "@/shared/api";
import { Card, CardContent, LabelValueRow } from "@/shared/ui";

// ─── UI-specific types (declared before the component) ───

export type InventoryPanelTexts = {
  detailInventoryHeading: string;
  fieldRoastLot: string;
  fieldProductionDate: string;
  fieldCountry: string;
  fieldRegion: string;
  fieldProducer: string;
  fieldVariety: string;
  fieldProcess: string;
  fieldAltitude: string;
  fieldCoffeeLot: string;
  fieldRoastLevel: string;
  fieldRoastery: string;
  fieldCoffeeshop: string;
};

export type InventoryPanelProps = {
  offering: OfferingDetail;
  texts: InventoryPanelTexts;
};

/** One row of the panel: its label and the API's value, or none. */
export type InventoryRow = {
  label: string;
  value: string | number | null | undefined;
};

// The heading and its content, 1rem apart (design.md D12).
const CONTENT_CLASSES = ["flex", "flex-col", "gap-4"].join(" ");

// The rows: one column, two from `md`; 0.75rem between rows and 1.5rem
// between columns (design.md D5, D11).
const LIST_CLASSES = ["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"].join(" ");

/**
 * The Inventory data panel (add-offering-catalog design.md D11; spec
 * "Inventory data tab"): one stacked card with the label/value rows in the
 * settled order. A null value renders no row, every value renders as the API
 * returns it, and the roastery and the location show their names only.
 */
export function InventoryPanel({
  offering,
  texts,
}: InventoryPanelProps): ReactNode {
  const inventory = offering.coffeeInventory;
  const coffee = inventory?.coffee;
  const rows: InventoryRow[] = [
    { label: texts.fieldRoastLot, value: inventory?.roastLot },
    { label: texts.fieldProductionDate, value: inventory?.productionDate },
    { label: texts.fieldCountry, value: coffee?.country },
    { label: texts.fieldRegion, value: coffee?.region },
    { label: texts.fieldProducer, value: coffee?.producer },
    { label: texts.fieldVariety, value: coffee?.variety },
    { label: texts.fieldProcess, value: coffee?.process },
    { label: texts.fieldAltitude, value: coffee?.altitude },
    { label: texts.fieldCoffeeLot, value: coffee?.lot },
    { label: texts.fieldRoastLevel, value: coffee?.roastLevel },
    { label: texts.fieldRoastery, value: inventory?.roastery?.name },
    { label: texts.fieldCoffeeshop, value: offering.location?.name },
  ];

  return (
    <Card layout="stacked">
      <CardContent className={CONTENT_CLASSES}>
        <h2 className="type-subheading">{texts.detailInventoryHeading}</h2>
        <dl className={LIST_CLASSES}>
          {rows
            .filter((row) => row.value != null)
            .map((row) => (
              <LabelValueRow
                key={row.label}
                label={row.label}
                value={row.value}
              />
            ))}
        </dl>
      </CardContent>
    </Card>
  );
}
