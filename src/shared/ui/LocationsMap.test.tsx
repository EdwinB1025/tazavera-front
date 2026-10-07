import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act, within } from "@testing-library/react";
import { LINK_CLASSES } from "./Link";
import { LocationsMap, type LocationsMapPoint, type LocationsMapTexts } from "./LocationsMap";

/**
 * The shared map (add-coffeeshop-directory design.md D14; specs "Map
 * interaction and accessibility", "Selected location panel" and "Show a
 * coffee shop on the map"). Leaflet is replaced at its entry point by a fake
 * that records the calls and builds the marker element as Leaflet 1.9.4 does:
 * a div holding the icon's `html` element, with `tabindex="0"` and
 * `role="button"` for a keyboard marker, whose Enter fires the marker's click.
 * As in Leaflet, a marker added before the map has a view gets its element
 * only once the view is set (`whenReady`).
 */

type Handler = () => void;

const fake = vi.hoisted(() => ({
  map: null as null | {
    container: HTMLElement;
    loaded: boolean;
    whenReady: Array<() => void>;
    options: Record<string, unknown>;
    fitBounds: ReturnType<typeof vi.fn>;
    setView: ReturnType<typeof vi.fn>;
    zoomIn: ReturnType<typeof vi.fn>;
    zoomOut: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  },
  tileUrl: "",
}));

vi.mock("@/shared/lib/leaflet", () => {
  const L = {
    map: (container: HTMLElement, options: Record<string, unknown>) => {
      const load = () => {
        if (fake.map!.loaded) return;
        fake.map!.loaded = true;
        fake.map!.whenReady.splice(0).forEach((run) => run());
      };
      fake.map = {
        container,
        options,
        loaded: false,
        whenReady: [],
        fitBounds: vi.fn(load),
        setView: vi.fn(load),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        remove: vi.fn(),
      };
      return fake.map;
    },
    tileLayer: (url: string) => {
      fake.tileUrl = url;
      return { addTo: () => {} };
    },
    divIcon: (options: { className: string; html: Element }) => options,
    latLngBounds: (points: [number, number][]) => ({ points }),
    marker: (latlng: [number, number], options: { keyboard: boolean; icon: { className: string; html: Element } }) => {
      const handlers: Record<string, Handler> = {};
      const element = document.createElement("div");
      element.className = `leaflet-marker-icon ${options.icon.className}`;
      element.appendChild(options.icon.html);
      if (options.keyboard) {
        element.tabIndex = 0;
        element.setAttribute("role", "button");
      }
      element.addEventListener("click", () => handlers.click?.());
      element.addEventListener("keypress", (event) => {
        if ((event as KeyboardEvent).key === "Enter") handlers.click?.();
      });
      let added = false;
      const marker = {
        latlng,
        addTo: (map: { container: HTMLElement; loaded: boolean; whenReady: Array<() => void> }) => {
          const add = () => {
            map.container.appendChild(element);
            added = true;
          };
          if (map.loaded) add();
          else map.whenReady.push(add);
          return marker;
        },
        on: (name: string, handler: Handler) => {
          handlers[name] = handler;
          return marker;
        },
        getElement: () => (added ? element : undefined),
      };
      return marker;
    },
  };
  return { L };
});

const TEXTS: LocationsMapTexts = {
  mapLabel: "Mapa de cafeterías",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  closePanel: "Cerrar",
  osmAttribution: "© {link}",
  osmContributors: "OpenStreetMap contributors",
};

const POINTS: LocationsMapPoint[] = [
  { id: "01PUJ", groupId: "01NOMAD", lat: 41.3975, lng: 2.192, label: "Nomad Coffee — Pujades", title: "Nomad Coffee", subtitle: "Pujades", addressLine: "Carrer de Pujades 95, 08005 Barcelona" },
  { id: "01BORN", groupId: "01NOMAD", lat: 41.3861, lng: 2.1794, label: "Nomad Coffee — Born", title: "Nomad Coffee", subtitle: "Born", addressLine: "Barcelona" },
  { id: "01GRA", groupId: "01SYRA", lat: 41.4021, lng: 2.158, label: "Syra Coffee — Gràcia", title: "Syra Coffee", subtitle: "Gràcia", addressLine: "Barcelona" },
];

function setReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function renderMap(props: Partial<Parameters<typeof LocationsMap>[0]> = {}) {
  return render(
    <LocationsMap
      points={POINTS}
      texts={TEXTS}
      helpId="map-help"
      className="h-80"
      renderPanelLink={(point) => <a href={`/es/coffeeshops/${point.groupId}`}>Ver cafetería</a>}
      {...props}
    />,
  );
}

function marker(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

beforeEach(() => {
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  fake.map = null;
});

describe("LocationsMap", () => {
  it("is a focusable region named by its label and described by the help line, with the keyboard on (spec: Keyboard navigation)", () => {
    renderMap();
    const region = screen.getByRole("region", { name: "Mapa de cafeterías" });
    expect(region.getAttribute("aria-describedby")).toBe("map-help");
    expect(region.tabIndex).toBe(0);
    expect(region.className).toContain("focus-visible:focus-ring");
    expect(fake.map?.container).toBe(region);
    expect(fake.map?.options).toMatchObject({
      zoomControl: false,
      attributionControl: false,
      keyboard: true,
      maxZoom: 19,
    });
    expect(fake.tileUrl).toBe("https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  });

  it("zooms one level with its own buttons (spec: Zoom buttons)", () => {
    renderMap();
    fireEvent.click(screen.getByRole("button", { name: "Acercar" }));
    fireEvent.click(screen.getByRole("button", { name: "Alejar" }));
    expect(fake.map?.zoomIn).toHaveBeenCalledTimes(1);
    expect(fake.map?.zoomOut).toHaveBeenCalledTimes(1);
  });

  it("shows the attribution linking to the copyright page (spec: Attribution)", () => {
    renderMap();
    const link = screen.getByRole("link", { name: "OpenStreetMap contributors" });
    expect(link.getAttribute("href")).toBe("https://www.openstreetmap.org/copyright");
    expect(link.className).toBe(LINK_CLASSES);
    expect(link.parentElement?.textContent).toBe("© OpenStreetMap contributors");
  });

  it("turns the animations off under reduced motion (spec: Reduced motion)", () => {
    setReducedMotion(true);
    renderMap();
    expect(fake.map?.options).toMatchObject({
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
  });

  it("selects a marker by click, Enter or Space and opens its panel, the focus kept (spec: Open the panel)", () => {
    renderMap();
    for (const activate of [
      (element: HTMLElement) => fireEvent.click(element),
      (element: HTMLElement) => fireEvent.keyPress(element, { key: "Enter", charCode: 13 }),
      (element: HTMLElement) => fireEvent.keyDown(element, { key: " " }),
    ]) {
      const pujades = marker("Nomad Coffee — Pujades");
      pujades.focus();
      act(() => activate(pujades));
      expect(pujades.getAttribute("data-selected")).toBe("true");
      const panel = screen.getByRole("region", { name: "Nomad Coffee" });
      expect(within(panel).getByText("Pujades")).toBeDefined();
      expect(within(panel).getByText("Carrer de Pujades 95, 08005 Barcelona")).toBeDefined();
      expect(within(panel).getByRole("link", { name: "Ver cafetería" })).toBeDefined();
      expect(document.activeElement).toBe(pujades);
      fireEvent.click(within(panel).getByRole("button", { name: "Cerrar" }));
    }
  });

  it("closes the panel with Escape or Close and focuses its marker (spec: Close the panel)", () => {
    renderMap();
    const gracia = marker("Syra Coffee — Gràcia");
    act(() => fireEvent.click(gracia));
    fireEvent.keyDown(gracia, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Syra Coffee" })).toBeNull();
    expect(document.activeElement).toBe(gracia);
    act(() => fireEvent.click(gracia));
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("region", { name: "Syra Coffee" })).toBeNull();
    expect(document.activeElement).toBe(gracia);
  });

  it("fits and selects the focused group and opens its first panel (spec: Focus from a card)", () => {
    renderMap({ focusGroupId: "01NOMAD" });
    expect(fake.map?.fitBounds).toHaveBeenCalledWith(
      { points: [[41.3975, 2.192], [41.3861, 2.1794]] },
      { padding: [32, 32] },
    );
    expect(marker("Nomad Coffee — Pujades").getAttribute("data-selected")).toBe("true");
    expect(marker("Nomad Coffee — Born").getAttribute("data-selected")).toBe("true");
    expect(marker("Syra Coffee — Gràcia").getAttribute("data-selected")).toBe("false");
    expect(within(screen.getByRole("region", { name: "Nomad Coffee" })).getByText("Pujades")).toBeDefined();
  });

  it("fits all points and selects nothing for a focus not on the map (spec: Unknown focus)", () => {
    renderMap({ focusGroupId: "01OTHER" });
    expect(fake.map?.fitBounds).toHaveBeenCalledWith(
      { points: POINTS.map((point) => [point.lat, point.lng]) },
      { padding: [32, 32] },
    );
    for (const point of POINTS) {
      expect(marker(point.label).getAttribute("data-selected")).toBe("false");
    }
    expect(screen.queryByRole("region", { name: "Nomad Coffee" })).toBeNull();
  });
});
