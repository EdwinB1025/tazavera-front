import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { geocodeAddress } from "@/shared/lib/geocoding";

/**
 * The geocoding entry point (design.md D5, D6): one plain `fetch` to the
 * Nominatim search with the structured query, no credentials and no custom
 * header; it never throws.
 */

const QUERY = {
  street: "Carrer de Verdi 12",
  postalCode: "08012",
  city: "Barcelona",
  country: "España",
};

const fetchSpy = vi.fn();

function respond(status: number, body: unknown) {
  fetchSpy.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function requestedUrl(): URL {
  return new URL(fetchSpy.mock.calls[0][0] as string);
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchSpy);
  fetchSpy.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("geocodeAddress request (design.md D6)", () => {
  it("requests one structured search URL with format=jsonv2, limit=1 and no q", async () => {
    respond(200, []);
    await geocodeAddress(QUERY);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const raw = fetchSpy.mock.calls[0][0] as string;
    expect(raw.startsWith("https://nominatim.openstreetmap.org/search?")).toBe(true);
    const params = requestedUrl().searchParams;
    expect([...params.keys()].sort()).toEqual(
      ["city", "country", "format", "limit", "postalcode", "street"],
    );
    expect(params.get("street")).toBe("Carrer de Verdi 12");
    expect(params.get("postalcode")).toBe("08012");
    expect(params.get("city")).toBe("Barcelona");
    expect(params.get("country")).toBe("España");
    expect(params.get("format")).toBe("jsonv2");
    expect(params.get("limit")).toBe("1");
    expect(params.has("q")).toBe(false);
  });
});
