import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LocationsMapLoader } from "./LocationsMapLoader";

afterEach(() => {
  cleanup();
});

/**
 * The map loader (add-coffeeshop-directory design.md D14; spec "Directory map
 * view" — "Map loading"). The client-only map module never resolves here, so
 * the loading placeholder stays.
 */
vi.mock("./LocationsMap", () => new Promise(() => {}));

describe("LocationsMapLoader", () => {
  it("shows a placeholder of the map's size with a spinner and the loading text (spec: Map loading)", () => {
    render(
      <LocationsMapLoader
        points={[]}
        helpId="map-help"
        className="h-80"
        texts={{
          mapLabel: "Mapa de cafeterías",
          zoomIn: "Acercar",
          zoomOut: "Alejar",
          closePanel: "Cerrar",
          osmAttribution: "© {link}",
          osmContributors: "OpenStreetMap contributors",
          mapLoading: "Cargando el mapa…",
        }}
      />,
    );
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Cargando el mapa…");
    expect(status.querySelector("svg")).not.toBeNull();
    const placeholder = status.parentElement!;
    expect(placeholder.className).toContain("bg-surface-section");
    expect(placeholder.className).toContain("h-80");
  });
});
