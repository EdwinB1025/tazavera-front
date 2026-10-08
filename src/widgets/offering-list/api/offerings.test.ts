import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchOfferings } from "./offerings";

/**
 * Server fetch tests (design.md D4; the landing spec "Error and retry").
 * Written before the implementation (task 5.2): the import fails to resolve
 * until `src/widgets/offering-list/api/offerings.ts` exists, so the file runs
 * and fails as required.
 *
 * `fetchVerifiedOfferings(page)` requests `{NEXT_PUBLIC_API_URL}/offerings`
 * with `verified=1` and `page`, with plain `fetch` and no options and so no
 * credential header (design.md D4) — asserted as a call with the URL and no
 * second argument — and returns `data` and `meta`. The `fetchTaxonomies` cases
 * live in `src/entities/taxonomy/api/taxonomies.test.ts`. A non-2xx status or a transport failure rejects (spec "Error
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

describe("fetchOfferings (add-offering-catalog design.md D1, D2)", () => {
  it("requests {NEXT_PUBLIC_API_URL}/offerings with exactly the kept query, repeated keys repeated", async () => {
    fetchSpy.mockResolvedValue(okResponse(OFFERINGS_PAYLOAD));
    const result = await fetchOfferings({
      verified: "1",
      cataRef: ["01JREFA", "01JREFB"],
      orderBy: "cupping_avg",
      page: "3",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_URL}/offerings?verified=1&cataRef=01JREFA&cataRef=01JREFB&orderBy=cupping_avg&page=3`,
    );
    expect(result.data).toEqual(OFFERINGS_PAYLOAD.data);
    expect(result.meta).toEqual(OFFERINGS_PAYLOAD.meta);
  });

  it("requests /offerings with no query and no verification filter for an empty query", async () => {
    fetchSpy.mockResolvedValue(okResponse(OFFERINGS_PAYLOAD));
    await fetchOfferings({});
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/offerings`);
  });

  it("rejects when the API answers with a non-2xx status (spec: Error and retry)", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: "invalid" }),
    });
    await expect(fetchOfferings({ verified: "x" })).rejects.toBeDefined();
  });

});
