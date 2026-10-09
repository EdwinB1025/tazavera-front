import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { searchRoasteries } from "@/features/offering-facets/api/search-roasteries";

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
  it("throws on a non-2xx status", async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(searchRoasteries("nóm", new AbortController().signal)).rejects.toThrow();
  });
});
