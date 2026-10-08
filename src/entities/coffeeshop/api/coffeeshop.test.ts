import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The public coffee shop read (add-coffeeshop-directory design.md D8; spec
 * "Coffee shop detail page" — "Unknown coffee shop or failure").
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchCoffeeshop } from "./coffeeshop";

function jsonResponse(status: number, payload: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  publicRequest.mockReset();
});

describe("fetchCoffeeshop", () => {
  it("resolves found on 200, not-found on 404, failed on 500 and on a transport failure (spec: Unknown coffee shop or failure)", async () => {
    const data = { ulid: "01SHOP", name: "Nomad Coffee" };
    publicRequest.mockResolvedValueOnce(jsonResponse(200, { data }));
    expect(await fetchCoffeeshop("01SHOP")).toEqual({ status: "found", coffeeshop: data });
    expect(publicRequest).toHaveBeenCalledWith("/coffeeshops/01SHOP");
    publicRequest.mockResolvedValueOnce(jsonResponse(404, {}));
    expect(await fetchCoffeeshop("01SHOP")).toEqual({ status: "not-found" });
    publicRequest.mockResolvedValueOnce(jsonResponse(500, {}));
    expect(await fetchCoffeeshop("01SHOP")).toEqual({ status: "failed" });
    publicRequest.mockRejectedValueOnce(new TypeError("network"));
    expect(await fetchCoffeeshop("01SHOP")).toEqual({ status: "failed" });
  });
});
