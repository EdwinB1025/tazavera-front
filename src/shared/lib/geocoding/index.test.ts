import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { geocodeAddress, NOMINATIM_ORIGIN } from "@/shared/lib/geocoding";

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

  it("omits an empty postal code and country", async () => {
    respond(200, []);
    await geocodeAddress({ ...QUERY, postalCode: "", country: "" });
    const params = requestedUrl().searchParams;
    expect(params.has("postalcode")).toBe(false);
    expect(params.has("country")).toBe(false);
  });

  it("sends no credentials and no custom header", async () => {
    respond(200, []);
    await geocodeAddress(QUERY);
    const init = fetchSpy.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.credentials).not.toBe("include");
    expect(init?.headers).toBeUndefined();
  });
});

describe("geocodeAddress outcome (design.md D5)", () => {
  it("returns found with lat and lon as returned", async () => {
    respond(200, [{ lat: "41.4029", lon: "2.1565" }]);
    await expect(geocodeAddress(QUERY)).resolves.toEqual({
      status: "found",
      lat: "41.4029",
      lon: "2.1565",
    });
  });

  it("returns not-found for an empty array", async () => {
    respond(200, []);
    await expect(geocodeAddress(QUERY)).resolves.toEqual({ status: "not-found" });
  });

  it.each([429, 500])("returns failed for %i", async (status) => {
    respond(status, []);
    await expect(geocodeAddress(QUERY)).resolves.toEqual({ status: "failed" });
  });

  it("returns failed for a rejected fetch", async () => {
    fetchSpy.mockRejectedValue(new TypeError("network"));
    await expect(geocodeAddress(QUERY)).resolves.toEqual({ status: "failed" });
  });

  it("returns failed for an aborted signal", async () => {
    fetchSpy.mockImplementation((_url: string, init?: RequestInit) =>
      init?.signal?.aborted
        ? Promise.reject(new DOMException("Aborted", "AbortError"))
        : Promise.resolve({ ok: true, status: 200, json: async () => [] }),
    );
    const controller = new AbortController();
    controller.abort();
    await expect(geocodeAddress(QUERY, controller.signal)).resolves.toEqual({
      status: "failed",
    });
  });
});

describe("NOMINATIM_ORIGIN (design.md D5)", () => {
  it("is the Nominatim origin", () => {
    expect(NOMINATIM_ORIGIN).toBe("https://nominatim.openstreetmap.org");
  });
});
