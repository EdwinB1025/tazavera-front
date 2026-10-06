import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchVerifiedOfferings, fetchTaxonomies } from "./offerings";

/**
 * Server fetch tests (design.md D4; the landing spec "Error and retry").
 * Written before the implementation (task 5.2): the import fails to resolve
 * until `src/widgets/offering-list/api/offerings.ts` exists, so the file runs
 * and fails as required.
 *
 * `fetchVerifiedOfferings(page)` requests `{NEXT_PUBLIC_API_URL}/offerings`
 * with `verified=1` and `page`; `fetchTaxonomies()` requests
 * `{NEXT_PUBLIC_API_URL}/taxonomies`. Both use plain `fetch` with no options
 * and so no credential header (design.md D4) — asserted as a call with the URL
 * and no second argument — and return `data` and `meta`, and `data`,
 * respectively. A non-2xx status or a transport failure rejects (spec "Error
 * and retry"); nothing about the rejection reason is asserted, because the
 * API's error body and status never reach the presentation (design.md D4).
 */

const API_URL = "https://api.tazavera.test";

const OFFERINGS_PAYLOAD = {
  data: [{ ulid: "01K6A3M8Q2V7XH4T9B5N1RCW0D" }],
  meta: {
    current_page: 2,
    from: 11,
    last_page: 5,
    path: "https://api.tazavera.test/offerings",
    per_page: 10,
    to: 20,
    total: 42,
  },
};

const TAXONOMIES_PAYLOAD = {
  data: [
    {
      ulid: "01JTAXN0DE0000000000000001",
      level: 0,
      nameEn: "Fruity",
      nameEs: "Frutal",
      nameCa: "Fruitat",
      color: "#D9345A",
    },
  ],
};

const fetchSpy = vi.fn();

function okResponse(payload: unknown) {
  return { ok: true, status: 200, json: async () => payload };
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
  vi.stubGlobal("fetch", fetchSpy);
  fetchSpy.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("fetchVerifiedOfferings (design.md D4)", () => {
  it("requests {NEXT_PUBLIC_API_URL}/offerings with verified=1 and page and returns data and meta", async () => {
    fetchSpy.mockResolvedValue(okResponse(OFFERINGS_PAYLOAD));
    const result = await fetchVerifiedOfferings(2);
    // Plain `fetch` with the URL and no options, so no credential header is
    // sent (design.md D4).
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_URL}/offerings?verified=1&page=2`,
    );
    expect(result.data).toEqual(OFFERINGS_PAYLOAD.data);
    expect(result.meta).toEqual(OFFERINGS_PAYLOAD.meta);
  });

  it("rejects when the API answers with a non-2xx status (spec: Error and retry)", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "boom" }),
    });
    await expect(fetchVerifiedOfferings(2)).rejects.toBeDefined();
  });

  it("rejects when the request fails to transport (spec: Error and retry)", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    await expect(fetchVerifiedOfferings(2)).rejects.toBeDefined();
  });
});

describe("fetchTaxonomies (design.md D4)", () => {
  it("requests {NEXT_PUBLIC_API_URL}/taxonomies with plain fetch and returns data", async () => {
    fetchSpy.mockResolvedValue(okResponse(TAXONOMIES_PAYLOAD));
    const result = await fetchTaxonomies();
    // Plain `fetch` with the URL and no options, so no credential header is
    // sent (design.md D4).
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/taxonomies`);
    expect(result.data).toEqual(TAXONOMIES_PAYLOAD.data);
  });

  it("rejects when the API answers with a non-2xx status (spec: Error and retry)", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "boom" }),
    });
    await expect(fetchTaxonomies()).rejects.toBeDefined();
  });

  it("rejects when the request fails to transport (spec: Error and retry)", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    await expect(fetchTaxonomies()).rejects.toBeDefined();
  });
});
