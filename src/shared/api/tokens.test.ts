import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { exchangeCode, refreshTokens, getTokens } from "./tokens";

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
const REDIRECT_URI = `${APP_URL}/callback`;

const GRANT = {
  access_token: "access-1",
  refresh_token: "refresh-1",
  expires_in: 3600,
};
const NEXT_GRANT = {
  access_token: "access-2",
  refresh_token: "refresh-2",
  expires_in: 3600,
};
const EXCHANGE_ERROR = {
  error: "invalid_grant",
  error_description: "The authorization code is not valid",
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

/** The nth call's URL as a string (a hand-rolled client passes a URL). */
function calledUrl(index: number): string {
  return String(fetchMock.mock.calls[index]![0]);
}

/** The form the nth call posted, as plain key/value pairs. */
function postedForm(index: number): Record<string, string> {
  const [, init] = fetchMock.mock.calls[index]!;
  return Object.fromEntries(new URLSearchParams(String(init?.body)));
}

/** The content type the nth call posted with. */
function contentType(index: number): string | null {
  const [, init] = fetchMock.mock.calls[index]!;
  return new Headers(init?.headers).get("content-type");
}

/** Everything written to `localStorage` and `sessionStorage` so far. */
function storageWrites(setItem: { mock: { calls: unknown[][] } }): string {
  return setItem.mock.calls
    .map(([key, value]) => `${String(key)}=${String(value)}`)
    .join("\n");
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
  vi.restoreAllMocks();
});

describe("the code exchange (design.md D5)", () => {
  it("posts application/x-www-form-urlencoded to {NEXT_PUBLIC_API_URL}/oauth/token with exactly grant_type=authorization_code, code, redirect_uri, client_id and code_verifier and no secret", async () => {
    fetchMock.mockResolvedValue(jsonResponse(GRANT));

    await exchangeCode("code-123", "verifier-123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledUrl(0)).toBe(`${API_URL}/oauth/token`);
    expect(fetchMock.mock.calls[0]![1]?.method).toBe("POST");
    expect(contentType(0)).toContain("application/x-www-form-urlencoded");
    expect(postedForm(0)).toEqual({
      grant_type: "authorization_code",
      code: "code-123",
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: "verifier-123",
    });
    expect(postedForm(0)).not.toHaveProperty("client_secret");
  });

  it("keeps access_token, refresh_token and expires_in in memory and writes neither token to browser storage (spec: Credential handling)", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    fetchMock.mockResolvedValue(jsonResponse(GRANT));

    await exchangeCode("code-123", "verifier-123");

    expect(getTokens()).toEqual(GRANT);
    const writes = storageWrites(setItem);
    expect(writes).not.toContain(GRANT.access_token);
    expect(writes).not.toContain(GRANT.refresh_token);
  });

  it("surfaces a token error body with error and error_description as failure (spec: Keeping the session alive — the tokens are rejected and nothing restores them)", async () => {
    fetchMock.mockResolvedValue(jsonResponse(EXCHANGE_ERROR, 400));

    await expect(exchangeCode("code-123", "verifier-123")).rejects.toMatchObject(
      EXCHANGE_ERROR,
    );
  });
});

describe("the refresh (design.md D2, D3 and D5)", () => {
  it("posts exactly grant_type=refresh_token, refresh_token and client_id", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(GRANT));
    await exchangeCode("code-123", "verifier-123");
    fetchMock.mockResolvedValueOnce(jsonResponse(NEXT_GRANT));

    await refreshTokens();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(calledUrl(1)).toBe(`${API_URL}/oauth/token`);
    expect(fetchMock.mock.calls[1]![1]?.method).toBe("POST");
    expect(contentType(1)).toContain("application/x-www-form-urlencoded");
    expect(postedForm(1)).toEqual({
      grant_type: "refresh_token",
      refresh_token: GRANT.refresh_token,
      client_id: CLIENT_ID,
    });
    expect(postedForm(1)).not.toHaveProperty("client_secret");
  });

  it("replaces the whole pair in memory and writes neither token to browser storage (design.md D3; spec: Credential handling)", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    fetchMock.mockResolvedValueOnce(jsonResponse(GRANT));
    await exchangeCode("code-123", "verifier-123");
    fetchMock.mockResolvedValueOnce(jsonResponse(NEXT_GRANT));

    await refreshTokens();

    expect(getTokens()).toEqual(NEXT_GRANT);
    const writes = storageWrites(setItem);
    for (const grant of [GRANT, NEXT_GRANT]) {
      expect(writes).not.toContain(grant.access_token);
      expect(writes).not.toContain(grant.refresh_token);
    }
  });

  it("surfaces a token error body with error and error_description as failure (spec: Keeping the session alive — the tokens are rejected and nothing restores them)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(GRANT));
    await exchangeCode("code-123", "verifier-123");
    fetchMock.mockResolvedValueOnce(jsonResponse(REFRESH_ERROR, 400));

    await expect(refreshTokens()).rejects.toMatchObject(REFRESH_ERROR);
  });
});
