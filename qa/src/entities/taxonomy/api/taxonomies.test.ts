import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchTaxonomies } from "@/entities/taxonomy/api/taxonomies";

/**
 * Taxonomy read tests (design.md D1, D7; the landing spec "Error and retry"),
 * moved from `src/widgets/offering-list/api/offerings.test.ts` with the same
 * cases and assertions; the fixture and fetch scaffolding are copied because
 * the original file keeps its `fetchVerifiedOfferings` cases.
 *
 * `fetchTaxonomies()` requests `{NEXT_PUBLIC_API_URL}/taxonomies` with plain
 * `fetch` and only the one-hour cache init, so no credential header, and
 * resolves the shared result with the payload (unify-api-result-shape
 * design.md D1). A non-2xx status or a transport failure resolves an error
 * result, because the API's error body and status never reach the
 * presentation.
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
    expect(result).toEqual({ ok: true, data: TAXONOMIES_PAYLOAD });
  });

  it("resolves an error when the API answers with a non-2xx status (spec: Error and retry)", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "boom" }),
    });
    await expect(fetchTaxonomies()).resolves.toEqual({ ok: false, kind: "error" });
  });

  it("resolves an error when the request fails to transport (spec: Error and retry)", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    await expect(fetchTaxonomies()).resolves.toEqual({ ok: false, kind: "error" });
  });
});
