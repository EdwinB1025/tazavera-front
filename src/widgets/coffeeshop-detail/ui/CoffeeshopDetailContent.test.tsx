import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import type { CoffeeshopDetail } from "@/shared/api";
import { getMessages } from "@/shared/lib/i18n";
import { CoffeeshopDetailContent, coffeeshopDetailTexts, toCoffeeshopTab } from "@/widgets/coffeeshop-detail";

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
  it("renders the badge, the name heading and the captions (spec: Header)", () => {
    renderDetail("offerings");
    expect(screen.getByText("Con ofertas verificadas")).toBeDefined();
    expect(screen.getByRole("heading", { level: 1, name: "Nomad Coffee" })).toBeDefined();
    expect(screen.getByText("2 ubicaciones")).toBeDefined();
    expect(screen.getByText("Ofertas: 4 · Verificadas: 1")).toBeDefined();
  });

  it("links back to the directory of the locale (spec: Back link)", () => {
    renderDetail("offerings");
    expect(screen.getByRole("link", { name: "Volver a cafeterías" }).getAttribute("href")).toBe(
      "/es/coffeeshops",
    );
  });

  it("selects Ofertas with no tab or an unknown one (spec: Default tab)", () => {
    for (const raw of [undefined, "banana"]) {
      renderDetail(toCoffeeshopTab(raw));
      expect(screen.getByRole("tab", { name: "Ofertas" }).getAttribute("aria-selected")).toBe("true");
      expect(screen.getByTestId("offerings-panel")).toBeDefined();
      cleanup();
    }
  });

  it("selects Ubicaciones for tab=locations, rendering only its panel (spec: Locations named in the address)", () => {
    renderDetail(toCoffeeshopTab("locations"));
    expect(screen.getByRole("tab", { name: "Ubicaciones" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByTestId("offerings-panel")).toBeNull();
  });

  it("renders one location card per location in a list (spec: Locations and map)", () => {
    renderDetail("locations");
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(card("Nomad Born")).toBeDefined();
    expect(card("Nomad Raval")).toBeDefined();
  });

  it("shows the help line and the map of the located locations before the cards (spec: Locations and map)", () => {
    const located = {
      ...NOMAD,
      locations: NOMAD.locations!.map((location) => ({ ...location, latitud: "41.38", longitud: "2.17" })),
    };
    renderDetail("locations", located);
    const help = screen.getByText("Muévete con las flechas y acerca con + / −. La lista muestra la misma información.");
    expect(map.props?.helpId).toBe(help.id);
    expect((map.props?.points as unknown[]).length).toBe(2);
    expect(map.props?.renderPanelLink).toBeUndefined();
    expect(map.props?.focusGroupId).toBeUndefined();
    expect(
      screen.getByTestId("map").compareDocumentPosition(screen.getByRole("list")) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows no phone row and no description for null values (spec: Null values)", () => {
    renderDetail("locations");
    const raval = card("Nomad Raval");
    expect(within(raval).queryByText("Teléfono")).toBeNull();
    expect(within(raval).queryByText("Nomad Coffee al Born.")).toBeNull();
    expect(within(card("Nomad Born")).getByText("Teléfono")).toBeDefined();
  });

  it("renders an https web as a link and any other value as text (spec: Web value)", () => {
    renderDetail("locations");
    expect(within(card("Nomad Born")).getByRole("link", { name: "https://nomad.example" })).toBeDefined();
    expect(within(card("Nomad Raval")).queryByRole("link")).toBeNull();
    expect(within(card("Nomad Raval")).getByText("nomad.example")).toBeDefined();
  });

  it("shows the not-on-the-map line on a location without both coordinates (spec: Location without coordinates)", () => {
    renderDetail("locations");
    expect(screen.getByText("1 ubicaciones sin posición en el mapa").className).toContain("type-meta");
    expect((map.props?.points as unknown[]).length).toBe(1);
    expect(within(card("Nomad Raval")).getByText("Sin posición en el mapa").className).toContain("type-meta");
    expect(within(card("Nomad Born")).queryByText("Sin posición en el mapa")).toBeNull();
  });

  it("renders the back link, the error and the retry action, and no tab (spec: Unknown coffee shop or failure)", () => {
    render(
      <CoffeeshopDetailContent result={{ state: "error" }} locale="es" ulid="01SHOP" tab="offerings" texts={TEXTS} />,
    );
    expect(screen.getByRole("link", { name: "Volver a cafeterías" })).toBeDefined();
    expect(screen.getByText("No se pudo cargar la cafetería.")).toBeDefined();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeDefined();
    expect(screen.queryByRole("tab")).toBeNull();
  });
});
