import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureClient, request, publicRequest } from "./client";
import type { TokenGrant } from "./tokens";

/**
 * The request client and its `401` recovery chain (design.md D2, D3 and D5;
 * spec "Keeping the session alive"). Written before the client exists (task
 * 2.2): `./client` exports no request client yet, so the file runs and fails
 * as required.
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

  it("sends no credential header on a public request (spec: Public endpoints need no session)", async () => {
    fillSeam();
    fetchMock.mockResolvedValue(jsonResponse({}));

    const response = await publicRequest("/offerings");

    expect(response.status).toBe(200);
    expect(calledUrl(0)).toBe(`${API_URL}/offerings`);
    expect(authorizationOf(0)).toBeNull();
  });

  it("makes exactly one refresh and one retry when the access token has expired (spec: The access token expires)", async () => {
    const { refresh, onUnrecoverable } = fillSeam();
    fetchMock
      .mockResolvedValueOnce(rejectedResponse())
      .mockResolvedValueOnce(jsonResponse({ data: {} }));

    const response = await request("/user");

    expect(response.status).toBe(200);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calledUrl(1)).toBe(`${API_URL}/user`);
    expect(authorizationOf(0)).toBe(`Bearer ${GRANT.access_token}`);
    expect(authorizationOf(1)).toBe(`Bearer ${NEXT_GRANT.access_token}`);
    expect(onUnrecoverable).not.toHaveBeenCalled();
  });

  it("calls the injected recovery when the refresh is rejected (spec: The tokens are rejected and the API session is still live)", async () => {
    const refresh = vi.fn(() => Promise.reject(new Error("invalid_grant")));
    const onUnrecoverable = vi.fn();
    configureClient({ getTokens: () => GRANT, refresh, onUnrecoverable });
    fetchMock.mockResolvedValue(rejectedResponse());

    const response = await request("/user");

    expect(response.status).toBe(401);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onUnrecoverable).toHaveBeenCalledTimes(1);
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
});
