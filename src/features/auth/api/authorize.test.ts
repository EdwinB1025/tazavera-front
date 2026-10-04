import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DEFAULT_LOCALE } from "@/shared/config/locales";

/**
 * Starting a flow and completing it at the callback (design.md D3, D4 and D5;
 * specs "Sign in", "Return through the callback" and "Credential handling").
 * Written before `./authorize` exists (task 3.1): the imports fail to resolve
 * until then, so the file runs and fails as required.
 *
 * `./authorize` and `../model/flow` are imported fresh in every test
 * (`vi.resetModules()`), because the callback completion runs at most once per
 * page load behind a module-level guard (design.md D4 idempotency) and each
 * test stands for one page load. Every opening goes through the `location`
 * global's `assign`, stubbed here like `fetch`: jsdom cannot spy on the real
 * `window.location`. `location.pathname` is set to the route sign in starts
 * from, so `lang` is the locale of the route under any reading. The "as
 * anonymous" half of the error outcomes belongs to the session tests of task
 * 4.1; here the outcomes assert their flow data, marker and opening.
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

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  pathname: "/",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** The URL of the single opening so far, parsed. */
function openedUrl(): URL {
  expect(locationMock.assign).toHaveBeenCalledTimes(1);
  return new URL(String(locationMock.assign.mock.calls[0]![0]));
}

/** base64url of the SHA-256 digest of `verifier` (RFC 7636, `S256`). */
async function s256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const binary = String.fromCharCode(...new Uint8Array(digest));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The form the single token request posted, as plain key/value pairs. */
function postedTokenForm(): Record<string, string> {
  return Object.fromEntries(
    new URLSearchParams(String(fetchMock.mock.calls[0]![1]?.body)),
  );
}

/** Everything left in browser storage, as `key=value` lines. */
function storageDump(): string {
  const entries: string[] = [];
  for (const storage of [sessionStorage, localStorage]) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)!;
      entries.push(`${key}=${storage.getItem(key)}`);
    }
  }
  return entries.join("\n");
}

/** One page load: the flow modules of a fresh module registry. */
async function load() {
  const authorize = await import("./authorize");
  const flow = await import("../model/flow");
  return { ...authorize, flow };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = API_URL;
  process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID = CLIENT_ID;
  process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  sessionStorage.clear();
  localStorage.clear();
  document.cookie = "theme=; path=/; max-age=0";
  fetchMock.mockReset();
  locationMock.assign.mockReset();
  locationMock.pathname = "/";
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("signIn — starting the flow (spec: Sign in; design.md D3 and D5)", () => {
  const route = "/en/offerings/1";

  it("stores the verifier, state and that return route under one sessionStorage key (spec: Sign in starts from the current route)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = route;

    signIn(route);

    expect(sessionStorage.length).toBe(1);
    const pending = flow.readFlow();
    expect(pending).not.toBeNull();
    expect(pending!.returnRoute).toBe(route);
    expect(pending!.verifier).toBeTypeOf("string");
    expect(pending!.state).toBeTypeOf("string");

    const url = openedUrl();
    expect(url.searchParams.get("state")).toBe(pending!.state);
    expect(url.searchParams.get("code_challenge")).toBe(
      await s256(pending!.verifier),
    );
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("opens {NEXT_PUBLIC_API_URL}/oauth/authorize with exactly the parameters of design.md D5, carrying the theme and the language of the route (spec: The authorization page carries the theme and language)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = route;
    document.cookie = "theme=dark";

    signIn(route);

    const pending = flow.readFlow()!;
    const url = openedUrl();
    expect(url.origin).toBe(API_URL);
    expect(url.pathname).toBe("/oauth/authorize");
    const params = Object.fromEntries(url.searchParams);
    expect(Object.keys(params).sort()).toEqual(
      [
        "response_type",
        "client_id",
        "redirect_uri",
        "scope",
        "state",
        "code_challenge",
        "code_challenge_method",
        "theme",
        "lang",
      ].sort(),
    );
    expect(params.response_type).toBe("code");
    expect(params.client_id).toBe(CLIENT_ID);
    expect(params.redirect_uri).toBe(`${APP_URL}/callback`);
    expect(params.scope).toBe("profile:read");
    expect(params.state).toBe(pending.state);
    expect(params.code_challenge_method).toBe("S256");
    expect(params.theme).toBe("dark");
    expect(params.lang).toBe("en");
  });

  it("sends the traditional theme when no theme cookie is set (theme read through src/shared/lib/theme.ts)", async () => {
    const { signIn } = await load();
    locationMock.pathname = route;

    signIn(route);

    expect(openedUrl().searchParams.get("theme")).toBe("traditional");
  });
});

describe("completeCallback — the outcomes of design.md D4 (spec: Return through the callback)", () => {
  const route = "/en/offerings/1";

  it("exchanges the code, deletes the flow data, sets the credential-free marker and opens the return route (spec: Completing sign in)", async () => {
    const { signIn, completeCallback, flow } = await load();
    locationMock.pathname = route;
    signIn(route);
    const pending = flow.readFlow()!;
    fetchMock.mockResolvedValue(jsonResponse(GRANT));

    await completeCallback({ code: "code-123", state: pending.state });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const tokenForm = postedTokenForm();
    expect(tokenForm.code).toBe("code-123");
    expect(tokenForm.code_verifier).toBe(pending.verifier);

    expect(flow.readFlow()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(flow.hasMarker()).toBe(true);
    expect(localStorage.length).toBe(1);
    const dump = storageDump();
    for (const secret of [
      "code-123",
      pending.verifier,
      GRANT.access_token,
      GRANT.refresh_token,
    ]) {
      expect(dump).not.toContain(secret);
    }

    expect(locationMock.assign).toHaveBeenCalledTimes(1);
    expect(locationMock.assign).toHaveBeenCalledWith(route);
  });

  it("deletes the flow data, removes the marker and opens the return route when the authorization comes back with an error (design.md D4 outcome table)", async () => {
    const { signIn, completeCallback, flow } = await load();
    locationMock.pathname = route;
    signIn(route);
    const pending = flow.readFlow()!;
    flow.setMarker();

    await completeCallback({
      error: "access_denied",
      error_description: "The user denied access",
      state: pending.state,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(locationMock.assign).toHaveBeenCalledTimes(1);
    expect(locationMock.assign).toHaveBeenCalledWith(route);
  });

  it("takes the same path when the state does not answer the pending request (spec: The response does not answer a pending request)", async () => {
    const { signIn, completeCallback, flow } = await load();
    locationMock.pathname = route;
    signIn(route);
    flow.setMarker();

    await completeCallback({ code: "code-123", state: "not-the-state" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(locationMock.assign).toHaveBeenCalledTimes(1);
    expect(locationMock.assign).toHaveBeenCalledWith(route);
  });

  it("opens the root of the default locale when no flow is pending (design.md D4 outcome table)", async () => {
    const { completeCallback, flow } = await load();
    flow.setMarker();

    await completeCallback({});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(locationMock.assign).toHaveBeenCalledTimes(1);
    expect(locationMock.assign).toHaveBeenCalledWith(`/${DEFAULT_LOCALE}`);
  });

  it("makes exactly one token request when invoked twice and takes no error path on the second invocation (design.md D4 idempotency)", async () => {
    const { signIn, completeCallback, flow } = await load();
    locationMock.pathname = route;
    signIn(route);
    const pending = flow.readFlow()!;
    flow.setMarker();
    fetchMock.mockResolvedValue(jsonResponse(GRANT));
    const params = { code: "code-123", state: pending.state };

    const first = completeCallback(params);
    const second = completeCallback(params);
    await first;
    await second;

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(true);
    expect(locationMock.assign).toHaveBeenCalledTimes(1);
    expect(locationMock.assign).toHaveBeenCalledWith(route);
  });
});
