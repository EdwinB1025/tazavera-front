import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The six `/user/evaluations` calls (design.md's endpoint table, D1; tasks
 * 2.7), sent through the add-auth `request` client. Every call reports the
 * response status (`null` for a transport failure) so the screens pick the
 * message of design.md's error table.
 */

const request = vi.fn();

vi.mock("@/shared/api", () => ({
  request: (...args: unknown[]) => request(...args),
}));

import { listMyEvaluations } from "./user-evaluations";

const ULID = "01JEVAL0000000000000000001";
const ITEM = { ulid: ULID, offeringId: "01JOFFER000000000000000001", status: "open" };
const META = { current_page: 2, last_page: 3, per_page: 15, total: 40 };

function jsonResponse(status: number, payload: unknown = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  request.mockReset();
});

describe("listMyEvaluations", () => {
  it("requests the page newest first and returns data and meta", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: [ITEM], meta: META }));
    const result = await listMyEvaluations("orderBy=created_at&orderDirection=desc&page=2");
    expect(request).toHaveBeenCalledWith(
      "/user/evaluations?orderBy=created_at&orderDirection=desc&page=2",
    );
    expect(result).toEqual({ ok: true, status: 200, data: { data: [ITEM], meta: META } });
  });
});
