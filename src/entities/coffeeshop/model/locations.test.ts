import { describe, it, expect } from "vitest";
import type { CoffeeshopSummary } from "@/shared/api";
import { countUnlocated, toMapPoints } from "./locations";

/**
 * Map points of a page of coffee shops (add-coffeeshop-directory design.md
 * D12; spec "Directory map view").
 */

const PAGE: CoffeeshopSummary[] = [
  {
    ulid: "01NOMAD",
    name: "Nomad Coffee",
    locations: [
      {
        ulid: "01PUJ",
        name: "Pujades",
        latitud: "41.3975",
        longitud: "2.1920",
        address: "Carrer de Pujades 95",
        postalCode: "08005",
        city: "Barcelona",
      },
      { ulid: "01BORN", name: "Born", latitud: "41.3861", longitud: "2.1794", city: "Barcelona" },
      { ulid: "01NOPOS", name: "Sin posición", latitud: null as unknown as string, longitud: "2.1" },
    ],
  },
  {
    ulid: "01SYRA",
    name: "Syra Coffee",
    locations: [
      { ulid: "01GRA", name: "Gràcia", latitud: "41.4021", longitud: "2.1580", city: "Barcelona" },
      { ulid: "01BAD", name: "Sin texto", latitud: "abc", longitud: "2.1" },
    ],
  },
];

describe("map points", () => {
  it("gives one point per located location of the page (spec: Markers of the page)", () => {
    const points = toMapPoints(PAGE);
    expect(points.map((point) => point.id)).toEqual(["01PUJ", "01BORN", "01GRA"]);
    expect(points[0]).toEqual({
      id: "01PUJ",
      groupId: "01NOMAD",
      lat: 41.3975,
      lng: 2.192,
      label: "Nomad Coffee — Pujades",
      title: "Nomad Coffee",
      subtitle: "Pujades",
      addressLine: "Carrer de Pujades 95, 08005 Barcelona",
    });
  });

  it("counts the locations without both coordinates (spec: Locations without coordinates)", () => {
    expect(countUnlocated(PAGE)).toBe(2);
  });
});
