import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { registerUser } from "./register";

/**
 * The registration request (sign-in-after-registration design.md D2; spec
 * "Registration result"): a `201` returns the body's `token` block, or `null`
 * when the body carries none.
 */

const API = "https://api.tazavera.test";

const PAYLOAD = {
  name: "Ana",
  surname: "López",
  email: "ana@example.com",
  password: "Secret123",
  passwordConfirmation: "Secret123",
  role: "specialist" as const,
};

const TOKEN = {
  token_type: "Bearer",
  expires_in: 1800,
  access_token: "access-1",
  refresh_token: "refresh-1",
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

function created(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", API);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("registerUser", () => {
  it("returns the token block of a 201 that carries one (spec: Signed in by the registration)", async () => {
    fetchMock.mockResolvedValue(created({ data: {}, message: "m", token: TOKEN }));

    await expect(registerUser(PAYLOAD)).resolves.toEqual({ ok: true, data: TOKEN });
  });

  it("returns null for a 201 without a token block (spec: The account is created)", async () => {
    fetchMock.mockResolvedValue(created({ data: {}, message: "m" }));

    await expect(registerUser(PAYLOAD)).resolves.toEqual({ ok: true, data: null });
  });
});
