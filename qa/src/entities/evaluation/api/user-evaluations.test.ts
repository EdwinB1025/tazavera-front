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

import {
  closeAnEvaluation,
  createAnEvaluation,
  deleteAnEvaluation,
  getMyEvaluation,
  listMyEvaluations,
  updateAnEvaluation,
} from "@/entities/evaluation/api/user-evaluations";
import type { EvaluationCreateBody } from "@/shared/api";

const ULID = "01JEVAL0000000000000000001";
const ITEM = { ulid: ULID, offeringId: "01JOFFER000000000000000001", status: "open" };

const BODY: EvaluationCreateBody = {
  offeringId: "01JOFFER000000000000000001",
  extractionMethod: null,
  descriptive: { roastLevel: "medium" },
  affective: {},
  extrinsics: null,
};

function jsonResponse(status: number, payload: unknown = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

beforeEach(() => {
  request.mockReset();
});

describe("listMyEvaluations", () => {

  it("reports a failed status and a transport failure", async () => {
    request.mockResolvedValueOnce(jsonResponse(500));
    expect(await listMyEvaluations("orderBy=created_at&orderDirection=desc&page=1")).toEqual({ ok: false, status: 500 });
    request.mockRejectedValueOnce(new TypeError("network down"));
    expect(await listMyEvaluations("orderBy=created_at&orderDirection=desc&page=1")).toEqual({ ok: false, status: null });
  });
});

describe("getMyEvaluation", () => {
  it("requests /user/evaluations/{ulid} and returns its data", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: ITEM }));
    expect(await getMyEvaluation(ULID)).toEqual({ ok: true, status: 200, data: ITEM });
    expect(request).toHaveBeenCalledWith(`/user/evaluations/${ULID}`);
  });

  it("reports a 404 distinctly from other failures", async () => {
    request.mockResolvedValueOnce(jsonResponse(404));
    expect(await getMyEvaluation(ULID)).toEqual({ ok: false, status: 404 });
    request.mockResolvedValueOnce(jsonResponse(502));
    expect(await getMyEvaluation(ULID)).toEqual({ ok: false, status: 502 });
  });
});

describe("createAnEvaluation", () => {
  it("posts the body to /user/evaluations and returns the created data", async () => {
    request.mockResolvedValue(jsonResponse(201, { data: ITEM, message: "Created" }));
    expect(await createAnEvaluation(BODY)).toEqual({ ok: true, status: 201, data: ITEM });
    const [path, init] = request.mock.calls[0];
    expect(path).toBe("/user/evaluations");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(BODY);
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("reports a 422", async () => {
    request.mockResolvedValue(jsonResponse(422));
    expect(await createAnEvaluation(BODY)).toEqual({ ok: false, status: 422 });
  });
});

describe("updateAnEvaluation", () => {
  it("puts the body without offeringId to /user/evaluations/{ulid}", async () => {
    request.mockResolvedValue(jsonResponse(200, { data: ITEM, message: "Updated" }));
    const { offeringId: _unused, ...update } = BODY;
    void _unused;
    expect(await updateAnEvaluation(ULID, update)).toEqual({ ok: true, status: 200, data: ITEM });
    const [path, init] = request.mock.calls[0];
    expect(path).toBe(`/user/evaluations/${ULID}`);
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).not.toHaveProperty("offeringId");
    expect(JSON.parse(init.body)).toEqual(update);
  });

  it("reports a 403 and a 409", async () => {
    request.mockResolvedValueOnce(jsonResponse(403));
    expect(await updateAnEvaluation(ULID, BODY)).toEqual({ ok: false, status: 403 });
    request.mockResolvedValueOnce(jsonResponse(409));
    expect(await updateAnEvaluation(ULID, BODY)).toEqual({ ok: false, status: 409 });
  });
});

describe("closeAnEvaluation", () => {
  it("patches /user/evaluations/{ulid}/close with no body", async () => {
    request.mockResolvedValue(jsonResponse(200, { message: "Closed" }));
    expect(await closeAnEvaluation(ULID)).toEqual({ ok: true, status: 200, data: null });
    const [path, init] = request.mock.calls[0];
    expect(path).toBe(`/user/evaluations/${ULID}/close`);
    expect(init).toEqual({ method: "PATCH" });
  });

  it("reports a 409", async () => {
    request.mockResolvedValue(jsonResponse(409));
    expect(await closeAnEvaluation(ULID)).toEqual({ ok: false, status: 409 });
  });
});

describe("deleteAnEvaluation", () => {
  it("deletes /user/evaluations/{ulid} with no body", async () => {
    request.mockResolvedValue(jsonResponse(200, { message: "Deleted" }));
    expect(await deleteAnEvaluation(ULID)).toEqual({ ok: true, status: 200, data: null });
    const [path, init] = request.mock.calls[0];
    expect(path).toBe(`/user/evaluations/${ULID}`);
    expect(init).toEqual({ method: "DELETE" });
  });

  it("reports a 403 and a transport failure", async () => {
    request.mockResolvedValueOnce(jsonResponse(403));
    expect(await deleteAnEvaluation(ULID)).toEqual({ ok: false, status: 403 });
    request.mockRejectedValueOnce(new TypeError("network down"));
    expect(await deleteAnEvaluation(ULID)).toEqual({ ok: false, status: null });
  });
});
