import { describe, it, expect, vi } from "vitest";

/**
 * The public evaluation read (add-public-evaluations design.md D1;
 * show-item-not-found-message design.md D1; spec "Read-only evaluation view" —
 * "Opening an unknown evaluation"): a `404` resolves as not-found.
 */

const publicRequest = vi.fn();

vi.mock("@/shared/api", () => ({
  publicRequest: (...args: unknown[]) => publicRequest(...args),
}));

import { fetchEvaluation } from "./public-evaluations";

describe("fetchEvaluation", () => {
  it("resolves a 404 as not-found (spec: Opening an unknown evaluation)", async () => {
    publicRequest.mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: "Not found" }) });
    await expect(fetchEvaluation("01JEVAL")).resolves.toEqual({ ok: false, kind: "not-found" });
  });
});
