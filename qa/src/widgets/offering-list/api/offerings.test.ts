import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchOfferings } from "@/widgets/offering-list/api/offerings";

/**
 * Server fetch tests (add-offering-catalog design.md D1, D2; the landing spec
 * "Error and retry"). A transport failure is an error result; nothing about
 * the reason reaches the presentation (design.md D4).
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

describe("fetchOfferings (add-offering-catalog design.md D1, D2)", () => {
  it("fails when the request fails to transport (spec: Error and retry)", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    await expect(fetchOfferings({})).resolves.toEqual({ ok: false, kind: "error" });
  });
});
