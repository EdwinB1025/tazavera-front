import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The offering read (design.md D1, the Files table; tasks 1.2). `fetchOffering`
 * sends `GET /offerings/{ulid}` through `publicRequest` (the contract's
 * `security: []`) and reports one of three outcomes: `found` with the `data`
 * of a `200`, `not-found` for a `404` or a `200` without `data`, and `failed`
 * for anything else (a network failure or a `5xx`) — never `not-found`.
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchOffering } from "./offering";

const OFFERING = {
  ulid: "01JOFFER000000000000000001",
  location: { name: "Cafè del Born" },
  coffeeInventory: {
    coffee: { name: "Finca La Esperanza", roastLevel: "medium" },
    roastery: { name: "Nomad" },
  },
};

function jsonResponse(status: number, payload: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  publicRequest.mockReset();
});

describe("fetchOffering (design.md D1)", () => {
  it("requests /offerings/{ulid} with publicRequest and returns the data of a 200 as found", async () => {
    publicRequest.mockResolvedValue(jsonResponse(200, { data: OFFERING }));
    const result = await fetchOffering(OFFERING.ulid);
    expect(publicRequest).toHaveBeenCalledWith(`/offerings/${OFFERING.ulid}`);
    expect(result).toEqual({ status: "found", offering: OFFERING });
  });

  it("reports a 404 and a response without data as not-found", async () => {
    publicRequest.mockResolvedValueOnce(jsonResponse(404, { message: "Not found" }));
    expect(await fetchOffering("01JUNKNOWN0000000000000000")).toEqual({
      status: "not-found",
    });
    publicRequest.mockResolvedValueOnce(jsonResponse(200, {}));
    expect(await fetchOffering("01JUNKNOWN0000000000000000")).toEqual({
      status: "not-found",
    });
  });

  it("reports a network failure or a 5xx as failed, never as not-found", async () => {
    publicRequest.mockRejectedValueOnce(new TypeError("network down"));
    expect(await fetchOffering(OFFERING.ulid)).toEqual({ status: "failed" });
    publicRequest.mockResolvedValueOnce(jsonResponse(503, { message: "down" }));
    expect(await fetchOffering(OFFERING.ulid)).toEqual({ status: "failed" });
  });
});
