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

beforeEach(() => {
  publicRequest.mockReset();
  request.mockReset();
});

describe("fetchOwnOfferings (design.md D1)", () => {
  it("maps a transport failure to its error result", async () => {
    publicRequest.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(fetchOwnOfferings("01USER", 1)).resolves.toEqual({
      state: "error",
    });
  });
});
