import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchTaxonomies } from "@/entities/taxonomy/api/taxonomies";

/**
 * Taxonomy read tests (design.md D1, D7; the landing spec "Error and retry"),
 * moved from `src/widgets/offering-list/api/offerings.test.ts` with the same
 * cases and assertions; the fixture and fetch scaffolding are copied because
 * the original file keeps its `fetchVerifiedOfferings` cases.
 *
 * `fetchTaxonomies()` requests `{NEXT_PUBLIC_API_URL}/taxonomies` with plain
 * `fetch` and no options, so no credential header — asserted as a call with
 * the URL and no second argument — and returns `data`. A non-2xx status or a
 * transport failure rejects; nothing about the rejection reason is asserted,
 * because the API's error body and status never reach the presentation.
 */

const API_URL = "https://api.tazavera.test";

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

describe("fetchTaxonomies (design.md D4)", () => {
  it("requests {NEXT_PUBLIC_API_URL}/taxonomies with plain fetch and returns data", async () => {
    fetchSpy.mockResolvedValue(okResponse(TAXONOMIES_PAYLOAD));
    const result = await fetchTaxonomies();
    // Plain `fetch` with the URL and no options, so no credential header is
    // sent (design.md D4).
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/taxonomies`, { next: { revalidate: 3600 } });
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
