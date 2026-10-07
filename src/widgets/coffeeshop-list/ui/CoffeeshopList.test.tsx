import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
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
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams(),
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
  viewLabel: "Ver",
  previousLabel: "Anterior",
  nextLabel: "Siguiente",
  emptyMessage: "Todavía no hay cafeterías.",
  errorMessage: "No se pudieron cargar las cafeterías.",
  retryLabel: "Reintentar",
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
    const list = screen.getByRole("list");
    expect(list.getAttribute("class")).toBe("grid grid-cols-1 gap-6");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Nomad Coffee" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(router.push).toHaveBeenCalledWith("/es/coffeeshops?page=2");
  });

  it("keeps the filters and the sort in the pagination, replacing the page (spec: Next keeps the query and the view)", () => {
    render(
      <CoffeeshopList
        result={{ state: "success", items: ITEMS, meta: { current_page: 2, last_page: 3, total: 40 } }}
        locale="es"
        query={{ city: "Barcelona", orderBy: "name", orderDirection: "desc", page: "2" }}
        texts={TEXTS}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    const href = new URL(router.push.mock.calls[0][0] as string, "http://x");
    expect(href.pathname).toBe("/es/coffeeshops");
    expect(Object.fromEntries(href.searchParams)).toEqual({
      city: "Barcelona",
      orderBy: "name",
      orderDirection: "desc",
      page: "3",
    });
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
});
