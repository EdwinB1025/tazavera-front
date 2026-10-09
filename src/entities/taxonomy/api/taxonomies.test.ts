import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchTaxonomiesCovering } from "./taxonomies";

/**
 * The taxonomy read that refreshes a stale cache (spec "Reference data cached
 * with a one-hour refresh": cached taxonomies lacking or holding every shown
 * reference). `fetch` is stubbed: the first call answers the cached read.
 */

const API_URL = "https://api.tazavera.test";
const URL = `${API_URL}/taxonomies`;

function payload(ulid: string) {
  return { data: [{ ulid, level: 0, nameEn: "Fruity", color: "#D9345A" }] };
}

function okResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

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

describe("fetchTaxonomiesCovering", () => {
  it("sends only the cached read when it holds every reference", async () => {
    fetchSpy.mockResolvedValue(okResponse(payload("A")));
    const result = await fetchTaxonomiesCovering(["A"]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(URL, { next: { revalidate: 3600 } });
    expect(result).toEqual({ ok: true, data: payload("A") });
  });

  it("reads again bypassing the cache when a reference is missing", async () => {
    fetchSpy
      .mockResolvedValueOnce(okResponse(payload("OLD")))
      .mockResolvedValueOnce(okResponse(payload("A")));
    const result = await fetchTaxonomiesCovering(["A"]);
    expect(fetchSpy).toHaveBeenLastCalledWith(URL, { cache: "no-store" });
    expect(result).toEqual({ ok: true, data: payload("A") });
  });

  it("sends no third request when the reference is still missing", async () => {
    fetchSpy.mockResolvedValue(okResponse(payload("OLD")));
    await fetchTaxonomiesCovering(["A"]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
