import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The single-offering read (add-offering-catalog design.md D3; spec "Offering
 * detail page" — "Error and retry"). `fetchOffering` sends
 * `GET /offerings/{ulid}` through `publicRequest` and resolves `ok` with
 * the `data` of a `200`, `not-found` for a `404` or a `200` without `data`
 * (add-specialist-evaluations design.md D1), and `error` for any other
 * non-2xx status or a transport failure; it never rejects.
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchOffering } from "./offering";

const ULID = "01K6A3M8Q2V7XH4T9B5N1RCW0D";

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
  it("resolves a 404 as not-found", async () => {
    publicRequest.mockResolvedValue(
      jsonResponse(404, { message: "Not found" }),
    );
    await expect(fetchOffering(ULID)).resolves.toEqual({ ok: false, kind: "not-found" });
  });

  it("resolves a transport failure as an error instead of rejecting", async () => {
    publicRequest.mockRejectedValue(new TypeError("network down"));
    await expect(fetchOffering(ULID)).resolves.toEqual({ ok: false, kind: "error" });
  });
});
