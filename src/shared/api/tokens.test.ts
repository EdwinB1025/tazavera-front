import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  clearTokens,
  exchangeCode,
  getTokens,
  keepRegistrationGrant,
  refreshTokens,
} from "./tokens";

/**
 * Token grants and the token memory (design.md D2, D3 and D5; spec
 * "Credential handling" and "Keeping the session alive"). Written before the
 * grant calls exist (task 2.2): `./tokens` exports no grant call yet, so the
 * file runs and fails as required.
 *
 * `POST /oauth/token` is the public client's token endpoint (no secret is
 * sent). The code exchange posts `application/x-www-form-urlencoded` with
 * exactly `grant_type=authorization_code`, `code`, `redirect_uri`,
 * `client_id` and `code_verifier`; the refresh posts exactly
 * `grant_type=refresh_token`, `refresh_token` and `client_id`. Both keep
 * `access_token`, `refresh_token` and `expires_in` in module memory and
 * neither token may reach `localStorage` or `sessionStorage` — the spec's
 * "Credential handling" fails as soon as either storage receives a token. A
 * token error body with `error` and `error_description` (RFC 6749 §5.2)
 * surfaces as failure: the caller falls back to silent re-authentication and
 * then to anonymous, never to a message (design.md D5).
 */

const API_URL = "https://api.tazavera.test";
const APP_URL = "https://app.tazavera.test";
const CLIENT_ID = "client-ulid-1";

const GRANT = {
  access_token: "access-1",
  token_type: "Bearer",
  refresh_token: "refresh-1",
  expires_in: 3600,
};
const REFRESH_ERROR = {
  error: "invalid_grant",
  error_description: "The refresh token is not valid",
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Every value in `localStorage` and `sessionStorage` right now. */
function storedValues(): string {
  return [localStorage, sessionStorage]
    .flatMap((storage) =>
      Object.keys(storage).map((key) => `${key}=${storage.getItem(key)}`),
    )
    .join("\n");
}

/**
 * Every own property of `window` not named in `before` that is or serialises
 * to a text containing `value`. Only properties added since `before` was taken
 * are inspected, so test-runner internals present beforehand (such as Vitest's
 * RPC proxy, whose `toJSON` rejects asynchronously) are never serialised. A
 * property that cannot be read or serialised (a throwing getter, a cyclic
 * object) cannot carry the value as plain data and is skipped.
 */
function windowPropertiesHolding(value: string, before: Set<string>): string[] {
  return Object.getOwnPropertyNames(window).filter((name) => {
    if (before.has(name)) return false;
    try {
      const property: unknown = (window as unknown as Record<string, unknown>)[name];
      const text =
        typeof property === "string" ? property : JSON.stringify(property);
      return typeof text === "string" && text.includes(value);
    } catch {
      return false;
    }
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_URL;
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID = CLIENT_ID;
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the code exchange (design.md D5)", () => {
  it("leaves no token value on window, in localStorage or in sessionStorage after a successful grant (spec: Credential handling — After sign in)", async () => {
    localStorage.clear();
    sessionStorage.clear();
    fetchMock.mockResolvedValue(jsonResponse(GRANT));
    const windowBefore = new Set(Object.getOwnPropertyNames(window));

    await exchangeCode("code-123", "verifier-123");

    expect(getTokens()).toEqual(GRANT);
    for (const token of [GRANT.access_token, GRANT.refresh_token]) {
      expect(windowPropertiesHolding(token, windowBefore)).toEqual([]);
      expect(storedValues()).not.toContain(token);
    }
  });
});

describe("the refresh (design.md D2, D3 and D5)", () => {
  it("surfaces a token error body with error and error_description as failure (spec: Keeping the session alive — the tokens are rejected and nothing restores them)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(GRANT));
    await exchangeCode("code-123", "verifier-123");
    fetchMock.mockResolvedValueOnce(jsonResponse(REFRESH_ERROR, 400));

    await expect(refreshTokens()).rejects.toMatchObject(REFRESH_ERROR);
  });
});

describe("the registration grant (sign-in-after-registration design.md D1)", () => {
  it("keeps a valid registration block as the grant in memory and writes no storage (spec: Signing in with a registration grant)", () => {
    clearTokens();
    localStorage.clear();
    sessionStorage.clear();

    keepRegistrationGrant(GRANT);

    expect(getTokens()).toEqual(GRANT);
    expect(storedValues()).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a block without one of the four fields or with a wrong type and keeps nothing (spec: A registration grant that cannot sign in)", () => {
    clearTokens();
    const withoutRefresh: Record<string, unknown> = { ...GRANT };
    delete withoutRefresh.refresh_token;

    for (const block of [withoutRefresh, { ...GRANT, expires_in: "3600" }, null]) {
      expect(() => keepRegistrationGrant(block)).toThrow("registration grant");
      expect(getTokens()).toBeNull();
    }
  });
});
