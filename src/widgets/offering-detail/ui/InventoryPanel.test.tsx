import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { OfferingDetail } from "@/shared/api";
import { InventoryPanel } from "./InventoryPanel";

/**
 * Inventory data panel tests (add-offering-catalog design.md D11; spec
 * "Inventory data tab" — "Rows and order", "Null row omitted", "Roastery and
 * location by name").
 */

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const LABEL_KEYS = [
  "fieldRoastLot",
  "fieldProductionDate",
  "fieldCountry",
  "fieldRegion",
  "fieldProducer",
  "fieldVariety",
  "fieldProcess",
  "fieldAltitude",
  "fieldCoffeeLot",
  "fieldRoastLevel",
  "fieldRoastery",
  "fieldCoffeeshop",
] as const;

const TEXTS = {
  detailInventoryHeading: "texts.detailInventoryHeading",
  ...Object.fromEntries(LABEL_KEYS.map((key) => [key, `texts.${key}`])),
} as Record<(typeof LABEL_KEYS)[number] | "detailInventoryHeading", string>;

const OFFERING: OfferingDetail = {
  ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D",
  location: {
    ulid: "01K5Z9C2T6H8M3Q7V1X4B9N2PA",
    name: "Tazavera Gràcia",
    description: "Barra de especialidad en Gràcia.",
    latitud: "41.40290000",
    longitud: "2.15650000",
  },
  coffeeInventory: {
    ulid: "01K5Y4R7N2D9W6T3H8M1Q5V0XC",
    roastLot: "L-2026-014",
    productionDate: "2026-09-19",
    coffee: {
      ulid: "01K5X2B8P4F7J3N9R6T1W5Y0ZG",
      name: "Huila El Mirador",
      roastLevel: "medium",
      process: "washed",
      variety: "Caturra",
      producer: "Finca El Mirador",
      country: "Colombia",
      region: "Huila",
      altitude: 1800,
      lot: "HM-07",
    },
    roastery: {
      ulid: "01K5W7H3M9Q2T6X4B8N1R5V0CE",
      name: "Nómada Roasters",
      description: "Tostador de especialidad en Barcelona.",
    },
  },
};

/** Expected [label, value] pairs in the settled order (design.md D11). */
const EXPECTED_ROWS: [string, string][] = [
  [TEXTS.fieldRoastLot, "L-2026-014"],
  [TEXTS.fieldProductionDate, "2026-09-19"],
  [TEXTS.fieldCountry, "Colombia"],
  [TEXTS.fieldRegion, "Huila"],
  [TEXTS.fieldProducer, "Finca El Mirador"],
  [TEXTS.fieldVariety, "Caturra"],
  [TEXTS.fieldProcess, "washed"],
  [TEXTS.fieldAltitude, "1800"],
  [TEXTS.fieldCoffeeLot, "HM-07"],
  [TEXTS.fieldRoastLevel, "medium"],
  [TEXTS.fieldRoastery, "Nómada Roasters"],
  [TEXTS.fieldCoffeeshop, "Tazavera Gràcia"],
];

function rowsOf(container: HTMLElement): [string, string][] {
  return Array.from(container.querySelectorAll("dl > div")).map((row) => [
    row.querySelector("dt")!.textContent ?? "",
    row.querySelector("dd")!.textContent ?? "",
  ]);
}

function renderPanel(offering: OfferingDetail = OFFERING) {
  return render(<InventoryPanel offering={offering} texts={TEXTS} />);
}

describe("InventoryPanel", () => {
  it("renders one labelled row per field in the settled order, values as the API returns them (spec: Rows and order)", () => {
    const { container } = renderPanel();
    expect(rowsOf(container)).toEqual(EXPECTED_ROWS);
  });

  it("omits the producer row when the producer is null and keeps the rest (spec: Null row omitted)", () => {
    const { container } = renderPanel({
      ...OFFERING,
      coffeeInventory: {
        ...OFFERING.coffeeInventory,
        coffee: { ...OFFERING.coffeeInventory!.coffee, producer: null },
      },
    });
    expect(rowsOf(container)).toEqual(
      EXPECTED_ROWS.filter(([label]) => label !== TEXTS.fieldProducer),
    );
  });

  it("renders the roastery and the location by name only (spec: Roastery and location by name)", () => {
    const { container } = renderPanel();
    const text = container.textContent ?? "";
    for (const hidden of [
      "Barra de especialidad en Gràcia.",
      "Tostador de especialidad en Barcelona.",
      "41.40290000",
      "2.15650000",
      "01K5Z9C2T6H8M3Q7V1X4B9N2PA",
      "01K5W7H3M9Q2T6X4B8N1R5V0CE",
      "01K5Y4R7N2D9W6T3H8M1Q5V0XC",
      "01K5X2B8P4F7J3N9R6T1W5Y0ZG",
      "01K6A3M8Q2V7XH4T9B5N1RCW0D",
    ]) {
      expect(text).not.toContain(hidden);
    }
  });
});
