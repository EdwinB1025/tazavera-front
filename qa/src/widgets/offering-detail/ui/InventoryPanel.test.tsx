import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { OfferingDetail } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { InventoryPanel } from "@/widgets/offering-detail/ui/InventoryPanel";

/**
 * Inventory data panel tests (add-offering-catalog design.md D11; spec
 * "Inventory data tab" — "Rows and order", "Null row omitted", "Roastery and
 * location by name").
 */

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

/** The class tokens of an element, as exact names (no substring matching). */
function classTokens(element: Element): string[] {
  return (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

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

function renderPanel(offering: OfferingDetail = OFFERING) {
  return render(<InventoryPanel offering={offering} texts={TEXTS} />);
}

describe("InventoryPanel", () => {
  it("renders one stacked card with the inventory heading and a two-column row grid", () => {
    const { container } = renderPanel();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(TEXTS.detailInventoryHeading);
    expect(classTokens(heading)).toContain("type-subheading");
    expect(container.querySelectorAll(".bg-surface-card")).toHaveLength(1);
    const card = container.querySelector(".bg-surface-card")!;
    expect(classTokens(card)).toContain("flex-col");
    const list = container.querySelector("dl")!;
    expect(classTokens(list)).toEqual(
      expect.arrayContaining(["grid", "gap-x-6", "gap-y-3", "md:grid-cols-2"]),
    );
  });

  it("finds the heading and every row label in the catalog of each locale (design.md D16)", () => {
    for (const locale of ["es", "en", "ca"]) {
      const catalog = getMessages("catalog", locale);
      for (const key of ["detailInventoryHeading", ...LABEL_KEYS]) {
        expect(catalog[key], `${locale}.${key}`).toEqual(expect.any(String));
      }
    }
  });
});
