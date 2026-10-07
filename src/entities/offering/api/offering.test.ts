import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The single-offering read (add-offering-catalog design.md D3; spec "Offering
 * detail page" — "Error and retry"). `fetchOffering` sends
 * `GET /offerings/{ulid}` through `publicRequest` and resolves `found` with
 * the `data` of a `200`, `not-found` for a `404` or a `200` without `data`
 * (add-specialist-evaluations design.md D1), and `failed` for any other
 * non-2xx status or a transport failure; it never rejects.
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchOffering } from "./offering";

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

const OFFERING = {
  ulid: ULID,
  verificationStatus: "verified",
  location: { name: "Tazavera Gràcia" },
  coffeeInventory: {
    coffee: { name: "Huila El Mirador" },
    roastery: { name: "Nómada Roasters" },
  },
};

function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

beforeEach(() => {
  publicRequest.mockReset();
});

describe("fetchOffering (design.md D3)", () => {
  it("requests /offerings/{ulid} through publicRequest and resolves a 200 as found with its data", async () => {
    publicRequest.mockResolvedValue(jsonResponse(200, { data: OFFERING }));
    const result = await fetchOffering(ULID);
    expect(publicRequest).toHaveBeenCalledWith(`/offerings/${ULID}`);
    expect(result).toEqual({ status: "found", offering: OFFERING });
  });

  it("resolves a 404 as not-found", async () => {
    publicRequest.mockResolvedValue(
      jsonResponse(404, { message: "Not found" }),
    );
    await expect(fetchOffering(ULID)).resolves.toEqual({ status: "not-found" });
  });

  it("resolves a 200 without data as not-found", async () => {
    publicRequest.mockResolvedValue(jsonResponse(200, {}));
    await expect(fetchOffering(ULID)).resolves.toEqual({ status: "not-found" });
  });

  it("resolves any other non-2xx status as failed", async () => {
    publicRequest.mockResolvedValue(jsonResponse(500, { message: "boom" }));
    await expect(fetchOffering(ULID)).resolves.toEqual({ status: "failed" });
  });

  it("resolves a transport failure as failed instead of rejecting", async () => {
    publicRequest.mockRejectedValue(new TypeError("network down"));
    await expect(fetchOffering(ULID)).resolves.toEqual({ status: "failed" });
  });
});
