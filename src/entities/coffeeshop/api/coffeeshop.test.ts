import { describe, it, expect, vi } from "vitest";

/**
 * The public coffee shop read (add-coffeeshop-directory design.md D8; spec
 * "Coffee shop detail page" — "Unknown coffee shop"): a `404` resolves as
 * not-found.
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchCoffeeshop } from "./coffeeshop";

describe("fetchCoffeeshop", () => {
  it("resolves a 404 as not-found (spec: Unknown coffee shop)", async () => {
    publicRequest.mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: "Not found" }) });
    await expect(fetchCoffeeshop("01SHOP")).resolves.toEqual({ ok: false, kind: "not-found" });
  });
});
