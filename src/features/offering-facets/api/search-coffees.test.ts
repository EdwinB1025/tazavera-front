import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { searchCoffees } from "./search-coffees";

/**
 * Coffee search from the browser (search-coffee-facet design.md D2, D3):
 * `GET /coffees?name=` with the combobox's abort signal, one option per
 * distinct name with its origin line.
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

describe("searchCoffees (design.md D2)", () => {
  it("requests the coffees by name with the signal and maps the rows", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            ulid: "01A",
            name: "Huila El Mirador",
            country: "Colombia",
            region: "Huila",
            process: "washed",
            variety: "Caturra",
          },
          {
            ulid: "01B",
            name: "Huila Rosado",
            country: "Colombia",
            region: "",
            process: null,
            variety: "Pink Bourbon",
          },
          { ulid: "01C", name: "Huila Lot" },
          { ulid: "01D", name: "Huila El Mirador", country: "Ethiopia" },
        ],
      }),
    });
    const signal = new AbortController().signal;
    const rows = await searchCoffees("hui", signal);
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/coffees?name=hui`, { signal });
    expect(rows).toEqual([
      {
        value: "Huila El Mirador",
        label: "Huila El Mirador",
        detail: "Colombia · Huila · washed · Caturra",
      },
      { value: "Huila Rosado", label: "Huila Rosado", detail: "Colombia · Pink Bourbon" },
      { value: "Huila Lot", label: "Huila Lot" },
    ]);
  });
});
