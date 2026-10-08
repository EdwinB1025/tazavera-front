import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import type { CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopList, type CoffeeshopListTexts } from "./CoffeeshopList";

afterEach(() => {
  cleanup();
});

/**
 * Directory list presentation (add-coffeeshop-directory design.md D4, D7;
 * specs "Coffee shop directory page" and "Directory pagination"). The retry
 * and paging actions use the app router, mocked here.
 */

const router = { push: vi.fn(), refresh: vi.fn() };
const nav = vi.hoisted(() => ({ search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => {
  router.push.mockReset();
  router.refresh.mockReset();
});

const TEXTS: CoffeeshopListTexts = {
  verifiedBadge: "Con ofertas verificadas",
  locationsCount: "{count} ubicaciones",
  offeringsCount: "Ofertas: {count}",
  verifiedCount: "Verificadas: {count}",
  viewLabel: "Ver ofertas",
  previousLabel: "Anterior",
  nextLabel: "Siguiente",
  navigationLabel: "Paginación",
  pageLabel: "Página {page}",
  emptyMessage: "Todavía no hay cafeterías.",
  errorMessage: "No se pudieron cargar las cafeterías.",
  retryLabel: "Reintentar",
  resultCount: "Resultados: {count}",
  noMatches: "Ningún resultado coincide con estos filtros.",
  clearAll: "Borrar todo",
  showOnMapLabel: "Ver {name} en el mapa",
};

function shop(ulid: string, name: string): CoffeeshopSummary {
  return {
    ulid,
    name,
    locationsCount: 1,
    offeringsCount: 0,
    verifiedOfferingsCount: 0,
    locations: [{ ulid: `${ulid}L`, name: "Centro", city: "Barcelona" }],
  };
}

const ITEMS = [shop("01A", "Nomad Coffee"), shop("01B", "Syra Coffee")];

describe("CoffeeshopList", () => {
  it("renders one card per coffee shop in one column and the pagination (spec: Success)", () => {
    render(
      <CoffeeshopList
        result={{ state: "success", items: ITEMS, meta: { current_page: 1, last_page: 2, total: 20 } }}
        locale="es"
        query={{}}
        texts={TEXTS}
      />,
    );
    // The cards' list, not the numbered Pagination's own list of page links.
    const list = screen.getByRole("heading", { name: "Nomad Coffee" }).closest("ul")!;
    expect(list.getAttribute("class")).toBe("grid grid-cols-1 gap-6");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops?page=2");
  });

  it("renders the centred empty message, no card and no pagination (spec: Empty)", () => {
    render(<CoffeeshopList result={{ state: "empty" }} locale="es" query={{}} texts={TEXTS} />);
    expect(screen.getByText("Todavía no hay cafeterías.").className).toContain("text-center");
    expect(screen.queryByRole("listitem")).toBeNull();
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
  });

  it("renders the error message with a retry action, no card and no pagination (spec: Error and retry)", () => {
    render(<CoffeeshopList result={{ state: "error" }} locale="es" query={{}} texts={TEXTS} />);
    expect(screen.getByText("No se pudieron cargar las cafeterías.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeTruthy();
    expect(screen.queryByRole("listitem")).toBeNull();
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
  });

  it("shows no matches with Clear all keeping the sort and the view when a filter matches nothing (spec: Filtered empty)", () => {
    nav.search = "city=Girona&orderBy=name&orderDirection=desc&view=map&page=2";
    render(<CoffeeshopList result={{ state: "empty" }} filtered locale="es" query={{ city: "Girona" }} texts={TEXTS} />);
    expect(screen.getByText("Ningún resultado coincide con estos filtros.")).toBeTruthy();
    expect(screen.queryByText("Todavía no hay cafeterías.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Borrar todo" }));
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops?orderBy=name&orderDirection=desc&view=map", {
      scroll: false,
    });
    nav.search = "";
  });

  it("announces the total as a visually hidden status (spec: Result count announced)", () => {
    render(
      <CoffeeshopList
        result={{ state: "success", items: ITEMS, meta: { current_page: 1, last_page: 1, total: 12 } }}
        filtered
        locale="es"
        query={{ city: "Barcelona" }}
        texts={TEXTS}
      />,
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Resultados: 12");
    expect(status.className).toContain("sr-only");
  });

  it("offers the map action only on a card with a located location (spec: Map action only with coordinates)", () => {
    const located: CoffeeshopSummary = {
      ...shop("01C", "Satan's Coffee"),
      locations: [{ ulid: "01CL", name: "Gòtic", latitud: "41.38", longitud: "2.17" }],
    };
    render(
      <CoffeeshopList
        result={{ state: "success", items: [...ITEMS, located], meta: { current_page: 1, last_page: 1, total: 3 } }}
        locale="es"
        query={{}}
        texts={TEXTS}
      />,
    );
    expect(screen.getByRole("button", { name: "Ver Satan's Coffee en el mapa" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Ver Nomad Coffee en el mapa" })).toBeNull();
  });
});
