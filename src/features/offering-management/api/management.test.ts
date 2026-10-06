import { describe, it, expect, vi, beforeEach } from "vitest";

// The two request clients of `@/shared/api` are replaced by spies so the
// built path and the credential choice can be observed (design.md D1). Test
// infrastructure only.
const { publicRequest, request } = vi.hoisted(() => ({
  publicRequest: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ publicRequest, request }));

import { fetchOwnOfferings } from "./management";

/**
 * The management requests (design.md D1; spec "My offerings list"). Written
 * before `./management` exists (task 3.1).
 */

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const META = { current_page: 2, last_page: 3, per_page: 15 };

beforeEach(() => {
  publicRequest.mockReset();
  request.mockReset();
});

describe("fetchOwnOfferings (design.md D1)", () => {
  it("builds GET /offerings?coffeeshopUlid={ulid}&page={n} through publicRequest with no credential", async () => {
    publicRequest.mockResolvedValue(jsonResponse(200, { data: [], meta: META }));

    await fetchOwnOfferings("01USER", 2);

    expect(publicRequest).toHaveBeenCalledTimes(1);
    expect(publicRequest.mock.calls[0][0]).toBe(
      "/offerings?coffeeshopUlid=01USER&page=2",
    );
    // No init, so no Authorization header and no credentials.
    expect(publicRequest.mock.calls[0][1]).toBeUndefined();
    expect(request).not.toHaveBeenCalled();
  });

  it("maps a page of offerings to its success result with data and meta", async () => {
    const data = [{ ulid: "01A" }, { ulid: "01B" }];
    publicRequest.mockResolvedValue(jsonResponse(200, { data, meta: META }));

    await expect(fetchOwnOfferings("01USER", 2)).resolves.toEqual({
      state: "success",
      data,
      meta: META,
    });
  });

  it("maps an empty data to its empty result", async () => {
    publicRequest.mockResolvedValue(jsonResponse(200, { data: [], meta: META }));

    await expect(fetchOwnOfferings("01USER", 1)).resolves.toEqual({
      state: "empty",
    });
  });

  it.each([404, 422, 500])("maps a %i status to its error result", async (status) => {
    publicRequest.mockResolvedValue(jsonResponse(status, { message: "nope" }));

    await expect(fetchOwnOfferings("01USER", 1)).resolves.toEqual({
      state: "error",
    });
  });

  it("maps a transport failure to its error result", async () => {
    publicRequest.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchOwnOfferings("01USER", 1)).resolves.toEqual({
      state: "error",
    });
  });
});
