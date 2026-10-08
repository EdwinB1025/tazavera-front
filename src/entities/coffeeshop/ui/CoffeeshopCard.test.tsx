import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopCard, type CoffeeshopCardTexts } from "./CoffeeshopCard";

// The View action is a route button (fix-production-aut-findings design.md
// D4); the app router is mocked — test infrastructure only.
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

afterEach(() => {
  cleanup();
  router.push.mockReset();
});

/**
 * Coffee shop card (add-coffeeshop-directory design.md D7; spec "Coffee shop
 * card").
 */

const TEXTS: CoffeeshopCardTexts = {
  verifiedBadge: "Con ofertas verificadas",
  locationsCount: "{count} ubicaciones",
  offeringsCount: "Ofertas: {count}",
  verifiedCount: "Verificadas: {count}",
  viewLabel: "Ver",
};

const NOMAD: CoffeeshopSummary = {
  ulid: "01SHOP",
  name: "Nomad Coffee",
  locationsCount: 2,
  offeringsCount: 4,
  verifiedOfferingsCount: 1,
  locations: [
    { ulid: "01L1", name: "Born", latitud: "41.3861", longitud: "2.1794", city: "Barcelona" },
    { ulid: "01L2", name: "Raval", latitud: "41.3799", longitud: "2.1677", city: "Barcelona" },
  ],
};

describe("CoffeeshopCard", () => {
  it("shows the badge, name, locations, city once, counts and View action (spec: Card content)", () => {
    render(<CoffeeshopCard coffeeshop={NOMAD} locale="es" texts={TEXTS} />);
    expect(screen.getByText("Con ofertas verificadas")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: "Nomad Coffee" }).className).toContain(
      "type-card-heading",
    );
    expect(screen.getByText("2 ubicaciones").className).toContain("type-label");
    expect(screen.getByText("Barcelona").className).toContain("type-meta");
    expect(screen.getByText("Ofertas: 4")).toBeTruthy();
    expect(screen.getByText("Verificadas: 1")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ver" })).toBeTruthy();
  });

  it("shows no badge without a verified offering (spec: No verified offering)", () => {
    render(
      <CoffeeshopCard coffeeshop={{ ...NOMAD, verifiedOfferingsCount: 0 }} locale="es" texts={TEXTS} />,
    );
    expect(screen.queryByText("Con ofertas verificadas")).toBeNull();
  });

  it("opens the coffee shop detail in the locale from the View button, not a link (spec: View link)", () => {
    render(<CoffeeshopCard coffeeshop={NOMAD} locale="es" texts={TEXTS} />);
    expect(screen.queryByRole("link", { name: "Ver" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver" }));
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops/01SHOP");
  });
});
