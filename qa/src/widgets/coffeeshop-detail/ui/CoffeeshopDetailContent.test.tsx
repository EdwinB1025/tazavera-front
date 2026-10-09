import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { CoffeeshopDetail } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { CoffeeshopDetailContent, coffeeshopDetailTexts } from "@/widgets/coffeeshop-detail";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
}));

// The client-only map is replaced by a stub that records its props.
const map = vi.hoisted(() => ({ props: null as null | Record<string, unknown> }));
vi.mock("@/shared/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/ui")>();
  return {
    ...actual,
    LocationsMapLoader: (props: Record<string, unknown>) => {
      map.props = props;
      return <div data-testid="map" />;
    },
  };
});

/**
 * Coffee shop detail presentation (add-coffeeshop-directory design.md D8,
 * D10, D11; specs "Coffee shop detail page", "Coffee shop detail tabs in the
 * address" and "Coffee shop Locations tab").
 */

const TEXTS = coffeeshopDetailTexts(
  getMessages("coffeeshops", "es"),
  getMessages("contact", "es"),
  getMessages("landing", "es"),
);

const NOMAD: CoffeeshopDetail = {
  ulid: "01SHOP",
  name: "Nomad Coffee",
  locationsCount: 2,
  offeringsCount: 4,
  verifiedOfferingsCount: 1,
  locations: [
    {
      ulid: "01L1",
      name: "Nomad Born",
      description: "Nomad Coffee al Born.",
      latitud: "41.3861",
      longitud: "2.1794",
      address: "Passatge Sert 12",
      city: "Barcelona",
      postalCode: "08003",
      country: "España",
      phone: "+34 933 000 001",
      web: "https://nomad.example",
      social: "@nomad.bcn",
    },
    {
      ulid: "01L2",
      name: "Nomad Raval",
      description: null as unknown as string,
      latitud: null as unknown as string,
      longitud: "2.1677",
      address: "Carrer de la Riereta 13",
      city: "Barcelona",
      postalCode: "08001",
      country: "España",
      phone: null as unknown as string,
      web: "nomad.example",
      social: "@nomad.bcn",
    },
  ],
};

function renderDetail(tab: "offerings" | "locations", coffeeshop: CoffeeshopDetail = NOMAD) {
  return render(
    <CoffeeshopDetailContent
      result={{ state: "success", coffeeshop }}
      locale="es"
      ulid="01SHOP"
      tab={tab}
      offerings={<div data-testid="offerings-panel" />}
      texts={TEXTS}
    />,
  );
}

function card(name: string): HTMLElement {
  return screen.getByRole("heading", { level: 2, name }).closest("li")!;
}

describe("CoffeeshopDetailContent", () => {
  it("renders one location card per location in a list (spec: Locations and map)", () => {
    renderDetail("locations");
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(card("Nomad Born")).toBeDefined();
    expect(card("Nomad Raval")).toBeDefined();
  });
});
