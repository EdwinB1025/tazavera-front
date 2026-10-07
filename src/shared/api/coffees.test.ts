import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { distinctCoffeeValues, fetchCoffees, type CoffeeSummary } from "@/shared/api";

/**
 * Coffee catalog read (add-offering-facets design.md D1): plain `fetch` with
 * no options, so no credential header, returning `data`; any non-2xx status
 * or transport failure rejects.
 */

const API_URL = "https://api.tazavera.test";
const fetchSpy = vi.fn();

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
  vi.stubGlobal("fetch", fetchSpy);
  fetchSpy.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fetchCoffees (design.md D1)", () => {
  it("requests {NEXT_PUBLIC_API_URL}/coffees with plain fetch and returns data", async () => {
    const data = [{ ulid: "01A", process: "washed" }];
    fetchSpy.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data }) });
    await expect(fetchCoffees()).resolves.toEqual(data);
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/coffees`);
  });

  it("rejects on a non-2xx status", async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(fetchCoffees()).rejects.toThrow();
  });

  it("rejects on a transport failure", async () => {
    fetchSpy.mockRejectedValue(new TypeError("network"));
    await expect(fetchCoffees()).rejects.toThrow();
  });
});

describe("distinctCoffeeValues (spec: Offering facet options)", () => {
  it("removes duplicates, null and empty values and sorts alphabetically", () => {
    const coffees = [
      { process: "washed" },
      { process: "natural" },
      { process: "washed" },
      { process: "" },
      { process: null },
      {},
      { process: "Anaerobic" },
    ] as CoffeeSummary[];
    expect(distinctCoffeeValues(coffees, "process")).toEqual(["Anaerobic", "natural", "washed"]);
  });

  it("reads the given field", () => {
    const coffees = [
      { country: "Colombia", producer: "Bensa" },
      { country: "Ethiopia", producer: null },
    ] as CoffeeSummary[];
    expect(distinctCoffeeValues(coffees, "country")).toEqual(["Colombia", "Ethiopia"]);
    expect(distinctCoffeeValues(coffees, "producer")).toEqual(["Bensa"]);
  });
});
