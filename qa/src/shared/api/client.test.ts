import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureClient, request } from "@/shared/api/client";
import type { TokenGrant } from "@/shared/api/tokens";

/**
 * The request client and its `401` recovery chain (design.md D2, D3 and D5;
 * specs "Keeping the session alive" and "Sign out"). Written before the client
 * exists (task 2.2): `./client` exports no request client yet, so the file
 * runs and fails as required.
 *
 * The dependency is inverted (design.md D2): the client receives the current
 * tokens, a refresh call and what to do when nothing can recover the session,
 * and `src/features/auth` fills that surface once at startup. An authenticated
 * request carries `Authorization: Bearer <access token>`; a public request is
 * sent without credentials (spec: "Public endpoints need no session"). A `401`
 * provokes exactly one refresh and one retry before the injected recovery is
 * called — never a second refresh while one is pending (design.md D2
 * single-flight), and two concurrent `401`s share that one refresh and both
 * retry with its new token.
 */

const API_URL = "https://api.tazavera.test";

const GRANT: TokenGrant = {
  access_token: "access-1",
  token_type: "Bearer",
  refresh_token: "refresh-1",
  expires_in: 3600,
};
const NEXT_GRANT: TokenGrant = {
  access_token: "access-2",
  token_type: "Bearer",
  refresh_token: "refresh-2",
  expires_in: 3600,
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function rejectedResponse(): Response {
  return jsonResponse({}, 401);
}

/**
 * Fill the configuration surface the way `src/features/auth` will at startup
 * (design.md D2). The refresh keeps one microtask pending before it installs
 * the new pair, so a concurrent `401` meets a refresh that is still pending.
 */
function fillSeam(initial: TokenGrant | null = GRANT) {
  let current = initial;
  const refresh = vi.fn(async () => {
    await Promise.resolve();
    current = NEXT_GRANT;
    return NEXT_GRANT;
  });
  const onUnrecoverable = vi.fn();
  configureClient({ getTokens: () => current, refresh, onUnrecoverable });
  return { refresh, onUnrecoverable };
}

/** The nth call's URL as a string (a hand-rolled client passes a URL). */
function calledUrl(index: number): string {
  return String(fetchMock.mock.calls[index]![0]);
}

/** The Authorization header the nth call carried, or null when it had none. */
function authorizationOf(index: number): string | null {
  const [, init] = fetchMock.mock.calls[index]!;
  return new Headers(init?.headers).get("authorization");
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_URL;
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("the request client (design.md D2, D3 and D5)", () => {
  it("sends Authorization: Bearer <access token> when one exists (design.md D5: GET /user)", async () => {
    fillSeam();
    fetchMock.mockResolvedValue(jsonResponse({ data: {} }));

    const response = await request("/user");

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrl(0)).toBe(`${API_URL}/user`);
    expect(authorizationOf(0)).toBe(`Bearer ${GRANT.access_token}`);
  });

  it("makes exactly one refresh and one retry before calling the injected recovery when the API keeps rejecting (spec: The tokens are rejected and the API session is still live)", async () => {
    const { refresh, onUnrecoverable } = fillSeam();
    fetchMock.mockResolvedValue(rejectedResponse());

    const response = await request("/user");

    expect(response.status).toBe(401);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(onUnrecoverable).toHaveBeenCalledTimes(1);
  });

  it("two 401s at the same time share exactly one refresh and both retry with its new token (design.md D2 single-flight)", async () => {
    const { refresh, onUnrecoverable } = fillSeam();
    fetchMock
      .mockResolvedValueOnce(rejectedResponse())
      .mockResolvedValueOnce(rejectedResponse())
      .mockResolvedValue(jsonResponse({ data: {} }));

    const [first, second] = await Promise.all([request("/a"), request("/b")]);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const retried = fetchMock.mock.calls
      .slice(2)
      .map(([url]) => String(url))
      .sort();
    expect(retried).toEqual([`${API_URL}/a`, `${API_URL}/b`].sort());
    expect(authorizationOf(2)).toBe(`Bearer ${NEXT_GRANT.access_token}`);
    expect(authorizationOf(3)).toBe(`Bearer ${NEXT_GRANT.access_token}`);
    expect(onUnrecoverable).not.toHaveBeenCalled();
  });

  it("sends POST /logout with the Bearer token and no body (design.md D5: POST /logout)", async () => {
    fillSeam();
    fetchMock.mockResolvedValue(jsonResponse({ message: "logout successfully." }));

    const response = await request("/logout", { method: "POST" });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrl(0)).toBe(`${API_URL}/logout`);
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeUndefined();
    expect(authorizationOf(0)).toBe(`Bearer ${GRANT.access_token}`);
  });

  it("rejects at the caller and starts no recovery when the sign-out request fails (spec: The server cannot be reached)", async () => {
    const { refresh, onUnrecoverable } = fillSeam();
    fetchMock.mockRejectedValue(new Error("the server cannot be reached"));

    await expect(request("/logout", { method: "POST" })).rejects.toThrow(
      "the server cannot be reached",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
    expect(onUnrecoverable).not.toHaveBeenCalled();
  });
});
