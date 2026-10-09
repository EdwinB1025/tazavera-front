import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { fetchEvaluation, fetchEvaluations } from "@/entities/evaluation/api/public-evaluations";

/**
 * The public evaluation reads (design.md D1, D4; spec "Public evaluations
 * list" — "Fixed request keys"; tasks 2.1): plain server `fetch` against
 * `NEXT_PUBLIC_API_URL` with no options, so no credential header; the query
 * in the D1 key order without absent keys; any non-2xx or transport failure
 * resolves an error result (unify-api-result-shape design.md D1).
 */

const API_URL = "https://api.tazavera.test";
const fetchSpy = vi.fn();

function response(status: number, payload: unknown = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
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

describe("fetchEvaluations (design.md D1, D4)", () => {
  it("sends every key in the D1 order and returns data and meta", async () => {
    const page = { data: [{ ulid: "01JEVAL0000000000000000001" }], meta: { current_page: 2, last_page: 3 } };
    fetchSpy.mockResolvedValue(response(200, page));
    const result = await fetchEvaluations({
      page: 2,
      orderDirection: "asc",
      orderBy: "cupping_score",
      scoreMax: 90,
      scoreMin: 80,
      status: "closed",
      process: "Washed",
      city: "Barcelona",
      evaluationType: "specialist",
      offeringId: "01K6A3M8Q2V7XH4T9B5N1RCW0D",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_URL}/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D&evaluationType=specialist&city=Barcelona&process=Washed&status=closed&scoreMin=80&scoreMax=90&orderBy=cupping_score&orderDirection=asc&page=2`,
    );
    expect(result).toEqual({ ok: true, data: page });
  });

  it("omits absent keys: the baseline query sends offeringId, the type and the newest-first order", async () => {
    fetchSpy.mockResolvedValue(response(200, { data: [], meta: {} }));
    await fetchEvaluations({
      offeringId: "01K6A3M8Q2V7XH4T9B5N1RCW0D",
      evaluationType: "baseline",
      orderBy: "created_at",
      orderDirection: "desc",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_URL}/evaluations?offeringId=01K6A3M8Q2V7XH4T9B5N1RCW0D&evaluationType=baseline&orderBy=created_at&orderDirection=desc`,
    );
  });

  it("resolves an error on a non-2xx status and on a transport failure", async () => {
    fetchSpy.mockResolvedValue(response(422));
    await expect(fetchEvaluations({ evaluationType: "specialist" })).resolves.toEqual({ ok: false, kind: "error" });
    fetchSpy.mockRejectedValue(new TypeError("network"));
    await expect(fetchEvaluations({ evaluationType: "specialist" })).resolves.toEqual({ ok: false, kind: "error" });
  });
});

describe("fetchEvaluation (design.md D1)", () => {
  it("requests /evaluations/{ulid} and returns its data", async () => {
    const data = { ulid: "01JEVAL0000000000000000001", status: "closed" };
    fetchSpy.mockResolvedValue(response(200, { data }));
    await expect(fetchEvaluation("01JEVAL0000000000000000001")).resolves.toEqual({ ok: true, data });
    expect(fetchSpy).toHaveBeenCalledWith(`${API_URL}/evaluations/01JEVAL0000000000000000001`);
  });

  it("resolves an error on a transport failure", async () => {
    fetchSpy.mockRejectedValue(new TypeError("network"));
    await expect(fetchEvaluation("01JUNKNOWN")).resolves.toEqual({ ok: false, kind: "error" });
  });
});
