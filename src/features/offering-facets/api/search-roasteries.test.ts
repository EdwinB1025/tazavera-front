import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { searchRoasteries } from "./search-roasteries";

/**
 * Roastery search from the browser (design.md D1, D7): `GET /roasteries?name=`
 * with the combobox's abort signal and no credential header.
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

describe("searchRoasteries (design.md D1)", () => {
  it("requests the roasteries by name with the signal and maps the rows", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          { ulid: "01A", name: "Nómada Roasters", description: "Tostador en Barcelona." },
          { ulid: "01B", name: "Nomad Lab", description: "" },
          { ulid: "01C", name: "Nomadic" },
        ],
      }),
    });
    const signal = new AbortController().signal;
    const rows = await searchRoasteries("nóm", signal);
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/roasteries?name=n%C3%B3m`, { signal });
    expect(rows).toEqual([
      { value: "Nómada Roasters", label: "Nómada Roasters", detail: "Tostador en Barcelona." },
      { value: "Nomad Lab", label: "Nomad Lab" },
      { value: "Nomadic", label: "Nomadic" },
    ]);
  });
});
