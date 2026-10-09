import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { CoffeeshopSummary } from "@/shared/api";
import { CoffeeshopList, type CoffeeshopListTexts } from "@/widgets/coffeeshop-list/ui/CoffeeshopList";

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
  viewLabel: "Ver",
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
});
