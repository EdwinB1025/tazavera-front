import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import type { ReactNode } from "react";
import type { CoffeeshopSummary } from "@/shared/api";
import type { LocationsMapLoaderProps } from "@/shared/ui";
import { toMapPoints } from "@/entities/coffeeshop";
import { takeFocusRequest } from "../lib/map-focus";
import { CoffeeshopsMapView, type CoffeeshopsMapTexts } from "./CoffeeshopsMapView";

/**
 * The directory's map view (add-coffeeshop-directory design.md D4, D13; specs
 * "Directory map view", "Show a coffee shop on the map", "Full-screen map on
 * a small viewport" and "Selected location panel"). The viewport hook and the
 * client-only map are replaced: the map stub records its props.
 */

const state = vi.hoisted(() => ({ mobile: false, map: null as LocationsMapLoaderProps | null }));
const nav = vi.hoisted(() => ({ push: vi.fn(), search: "city=Barcelona&view=map&page=2" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/es/coffeeshops",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

vi.mock("@/shared/lib/hooks", () => ({
  useIsMobile: () => state.mobile,
}));

vi.mock("@/shared/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/ui")>();
  return {
    ...actual,
    LocationsMapLoader: (props: LocationsMapLoaderProps) => {
      state.map = props;
      return <div data-testid="map" className={props.className} />;
    },
  };
});

afterEach(() => {
  cleanup();
  state.map = null;
  takeFocusRequest();
});

beforeEach(() => {
  state.mobile = false;
  nav.push.mockReset();
  nav.search = "city=Barcelona&view=map&page=2";
});

const TEXTS: CoffeeshopsMapTexts = {
  mapLabel: "Mapa de cafeterías",
  mapHelp: "Muévete con las flechas y acerca con + / −. La lista muestra la misma información.",
  mapEmpty: "Ninguna de estas cafeterías tiene ubicación en el mapa.",
  unlocatedCount: "{count} ubicaciones sin posición en el mapa",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  closePanel: "Cerrar",
  viewCoffeeshop: "Ver cafetería",
  osmAttribution: "© {link}",
  osmContributors: "OpenStreetMap contributors",
  backToList: "Volver a la lista",
  mapLoading: "Cargando el mapa…",
  previousLabel: "Anterior",
  nextLabel: "Siguiente",
  navigationLabel: "Paginación",
  pageLabel: "Página {page}",
};

const PAGE: CoffeeshopSummary[] = [
  {
    ulid: "01NOMAD",
    name: "Nomad Coffee",
    locations: [
      { ulid: "01PUJ", name: "Pujades", latitud: "41.3975", longitud: "2.1920" },
      { ulid: "01BORN", name: "Born", latitud: "41.3861", longitud: "2.1794" },
      { ulid: "01X", name: "Sin posición", latitud: null as unknown as string, longitud: null as unknown as string },
    ],
  },
  {
    ulid: "01SYRA",
    name: "Syra Coffee",
    locations: [
      { ulid: "01GRA", name: "Gràcia", latitud: "41.4021", longitud: "2.1580" },
      { ulid: "01Y", name: "Sin texto", latitud: "abc", longitud: "2.1" },
    ],
  },
];

function renderView(props: { items?: CoffeeshopSummary[]; focus?: string } = {}) {
  return render(
    <CoffeeshopsMapView
      items={props.items ?? PAGE}
      currentPage={2}
      lastPage={3}
      locale="es"
      query={{ city: "Barcelona", page: "2" }}
      focus={props.focus}
      texts={TEXTS}
    />,
  );
}

describe("CoffeeshopsMapView", () => {
  it("renders the help line, the page's points and the pagination keeping the map view (spec: Markers of the page)", () => {
    renderView();
    const help = screen.getByText(TEXTS.mapHelp);
    expect(state.map?.helpId).toBe(help.id);
    expect(state.map?.points).toEqual(toMapPoints(PAGE));
    expect(screen.getByTestId("map").className).toBe(
      "h-[min(32rem,70vh)] border border-border-subtle rounded-container overflow-hidden",
    );
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?city=Barcelona&view=map&page=3");
  });

  it("counts the locations without coordinates under the map (spec: Locations without coordinates)", () => {
    renderView();
    expect(screen.getByText("2 ubicaciones sin posición en el mapa").className).toContain("type-meta");
  });

  it("shows the empty-map message when no location is located (spec: No located location)", () => {
    renderView({ items: [{ ulid: "01Z", name: "Z", locations: [{ ulid: "01ZL", name: "Z1" }] }] });
    expect(screen.getByText(TEXTS.mapEmpty)).toBeDefined();
    expect(screen.queryByTestId("map")).toBeNull();
  });

  it("links the panel to the coffee shop's detail with client navigation (spec: Link to the detail)", () => {
    renderView();
    render(<>{state.map?.renderPanelLink?.(toMapPoints(PAGE)[0]!) as ReactNode}</>);
    const link = screen.getByRole("link", { name: "Ver cafetería" });
    expect(link.getAttribute("href")).toBe("/es/coffeeshops/01NOMAD");
  });

  it("opens full screen below md with its title, the back action and no pagination (spec: Map opens full screen)", () => {
    state.mobile = true;
    renderView();
    const dialog = screen.getByRole("dialog", { name: TEXTS.mapLabel });
    expect(within(dialog).getByRole("heading", { name: TEXTS.mapLabel }).className).toContain("type-subheading");
    expect(within(dialog).getByRole("button", { name: TEXTS.backToList })).toBeDefined();
    expect(within(dialog).getByText(TEXTS.mapHelp).className).toContain("sr-only");
    expect(within(dialog).getByTestId("map")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Siguiente" })).toBeNull();
  });

  it("returns to the list without view and focus and asks to focus the opener (spec: Back to the list)", () => {
    state.mobile = true;
    nav.search = "city=Barcelona&view=map&focus=01NOMAD&page=2";
    renderView({ focus: "01NOMAD" });
    fireEvent.click(screen.getByRole("button", { name: TEXTS.backToList }));
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?city=Barcelona&page=2", { scroll: false });
    expect(takeFocusRequest()).toBe("card:01NOMAD");
    cleanup();
    nav.push.mockReset();
    nav.search = "city=Barcelona&view=map";
    renderView();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(nav.push).toHaveBeenCalledWith("/es/coffeeshops?city=Barcelona", { scroll: false });
    expect(takeFocusRequest()).toBe("toggle");
  });
});
