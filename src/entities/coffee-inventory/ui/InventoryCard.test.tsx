import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { CoffeeInventoryItem } from "@/shared/api";
import { InventoryCard } from "@/entities/coffee-inventory";

// No global test setup in this project, so RTL auto-cleanup does not run.
afterEach(() => {
  cleanup();
});

const TEXTS = {
  process: "Process",
  variety: "Variety",
  roastLevel: "Roast level",
  altitude: "Altitude",
  producer: "Producer",
  certifications: "Certifications",
  roastery: "Roastery",
  roastLot: "Roast lot",
  productionDate: "Production date",
};

// The contract's second example item, with one certification added.
const ITEM: CoffeeInventoryItem = {
  ulid: "01K5Y4R7N2D9W6T3H8M1Q5V0XD",
  roastLot: "L-2026-021",
  productionDate: "2026-09-24",
  coffee: {
    ulid: "01K5X2B8P4F7J3N9R6T1W5Y0ZH",
    name: "Sidama Bensa",
    roastLevel: "light",
    process: "natural",
    variety: "Heirloom",
    producer: "Bensa Cooperative",
    country: "Ethiopia",
    region: "Sidama",
    altitude: 2100,
    lot: "SB-12",
    certifications: [{ code: "organic", description: "Certified organic production." }],
  },
  roastery: { ulid: "01K5W7H3M9Q2T6X4B8N1R5V0CE", name: "Nómada Roasters", description: "Tostador." },
};

/** The value shown for a row's label. */
function valueOf(label: string): string | null {
  return screen.getByText(label, { selector: "dt" }).nextElementSibling?.textContent ?? null;
}

/** Spec "Coffee inventory card". */
describe("InventoryCard (spec 'Coffee inventory card')", () => {
  it("Card contents: shows every field exactly as returned, the altitude in metres", () => {
    render(<InventoryCard item={ITEM} texts={TEXTS} />);

    expect(screen.getByRole("heading", { level: 2, name: "Sidama Bensa" })).toBeTruthy();
    expect(screen.getByText("Ethiopia · Sidama")).toBeTruthy();
    expect(
      [
        TEXTS.process,
        TEXTS.variety,
        TEXTS.roastLevel,
        TEXTS.altitude,
        TEXTS.producer,
        TEXTS.certifications,
        TEXTS.roastery,
        TEXTS.roastLot,
        TEXTS.productionDate,
      ].map(valueOf),
    ).toEqual([
      "natural",
      "Heirloom",
      "light",
      "2100 m",
      "Bensa Cooperative",
      "organic",
      "Nómada Roasters",
      "L-2026-021",
      "2026-09-24",
    ]);
  });

  it("No producer and no certification: neither row renders", () => {
    const item = { ...ITEM, coffee: { ...ITEM.coffee, producer: null, certifications: [] } };
    render(<InventoryCard item={item} texts={TEXTS} />);

    expect(screen.queryByText(TEXTS.producer)).toBeNull();
    expect(screen.queryByText(TEXTS.certifications)).toBeNull();
  });
});
