import { describe, it, expect, vi, beforeEach } from "vitest";

// The two request clients of `@/shared/api` are replaced by spies so the
// built path and the credential choice can be observed (design.md D1). Test
// infrastructure only.
const { publicRequest, request } = vi.hoisted(() => ({
  publicRequest: vi.fn(),
  request: vi.fn(),
}));
vi.mock("@/shared/api", () => ({ publicRequest, request }));

import { createOfferings, fetchOwnOfferings, searchCoffeeInventory } from "@/features/offering-management/api/management";

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
});

describe("searchCoffeeInventory (design.md D9)", () => {
  it("resolves to the items of data", async () => {
    const data = [{ ulid: "01I" }];
    request.mockResolvedValue(jsonResponse(200, { data }));

    await expect(searchCoffeeInventory("hu", new AbortController().signal)).resolves.toEqual(
      data,
    );
  });

  it.each([403, 422, 500])("rejects on a %i status", async (status) => {
    request.mockResolvedValue(jsonResponse(status, { message: "nope" }));

    await expect(
      searchCoffeeInventory("hu", new AbortController().signal),
    ).rejects.toBeInstanceOf(Error);
  });
});

describe("createOfferings (design.md D10)", () => {
  it("sends POST /offerings with { coffeeInventoryId, locations } through request", async () => {
    request.mockResolvedValue(jsonResponse(201, { data: [{}, {}], message: "ok" }));

    await createOfferings("01I", ["01L1", "01L2"]);

    expect(request).toHaveBeenCalledTimes(1);
    const [path, init] = request.mock.calls[0];
    expect(path).toBe("/offerings");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      coffeeInventoryId: "01I",
      locations: ["01L1", "01L2"],
    });
    expect(publicRequest).not.toHaveBeenCalled();
  });

  it("maps a 201 to ok with the number of created offerings", async () => {
    request.mockResolvedValue(jsonResponse(201, { data: [{}, {}], message: "ok" }));

    await expect(createOfferings("01I", ["01L1"])).resolves.toEqual({
      outcome: "ok",
      count: 2,
    });
  });

  it("maps a 403 to forbidden", async () => {
    request.mockResolvedValue(jsonResponse(403, { message: "nope" }));

    await expect(createOfferings("01I", [])).resolves.toEqual({ outcome: "forbidden" });
  });

  it.each([422, 500])("maps a %i status to failed", async (status) => {
    request.mockResolvedValue(jsonResponse(status, { message: "nope" }));

    await expect(createOfferings("01I", [])).resolves.toEqual({ outcome: "failed" });
  });

  it("maps a transport failure to failed", async () => {
    request.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(createOfferings("01I", [])).resolves.toEqual({ outcome: "failed" });
  });
});
