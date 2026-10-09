import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import type { CoffeeshopSummary } from "@/shared/api";
import type { LocationsMapLoaderProps } from "@/shared/ui";
import { takeFocusRequest } from "@/widgets/coffeeshop-list/lib/map-focus";
import { CoffeeshopsMapView, type CoffeeshopsMapTexts } from "@/widgets/coffeeshop-list/ui/CoffeeshopsMapView";

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
  it("ignores a focus that names no coffee shop of the page (spec: Unknown focus)", () => {
    renderView({ focus: "01OTHER" });
    expect(state.map?.focusGroupId).toBeUndefined();
    cleanup();
    renderView({ focus: "01SYRA" });
    expect(state.map?.focusGroupId).toBe("01SYRA");
  });
});
