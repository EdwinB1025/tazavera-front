import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import { DEFAULT_LOCALE } from "@/shared/config/locales";

/**
 * Starting a flow and completing it at the callback (design.md D3, D4, D5 and
 * D10; specs "Sign in", "Return through the callback" and "Credential
 * handling"). Written before `./authorize` exists (task 3.1) and updated to
 * the popup start of design.md D10 (task 3.2): sign in opens a popup and keeps
 * its verifier, `state` and return route in the opener's memory, writing
 * nothing to storage, while `completeCallback` runs the D4 outcomes of a
 * full-page flow and opens the return route through client-side navigation.
 *
 * `./authorize` and `../model/flow` are imported fresh in every test
 * (`vi.resetModules()`), because the callback completion runs at most once per
 * page load behind a module-level guard (design.md D4 idempotency) and each
 * test stands for one page load. Every popup opening goes through `window.open`
 * and the popup window's `location.assign`, every return through the history's
 * `pushState` (client-side navigation, never a full page load), stubbed here
 * like `fetch`: jsdom cannot open windows or navigate. `location.pathname` is
 * set to the route sign in starts from, so `lang` is the locale of the route
 * under any reading. The "as anonymous" half of the error outcomes belongs to
 * the session tests of task 4.1; here the outcomes assert their flow data,
 * marker and opening.
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
const popupMock = {
  location: { assign: vi.fn<(url: string) => void>() },
  closed: false,
};
const openMock = vi.fn<Window["open"]>();
const pushMock = vi.fn<History["pushState"]>();
const replaceMock = vi.fn<History["replaceState"]>();
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

/** The URL the single popup opening so far was pointed at, parsed. */
function openedUrl(): URL {
  expect(popupMock.location.assign).toHaveBeenCalledTimes(1);
  return new URL(String(popupMock.location.assign.mock.calls[0]![0]));
}

/** The route the single client-side navigation so far opened. */
function openedRoute(): string {
  expect(pushMock).toHaveBeenCalledTimes(1);
  return String(pushMock.mock.calls[0]![2]);
}

/**
 * Waits for the asynchronous PKCE challenge to resolve and the popup to be
 * pointed at the authorization page (design.md D8).
 */
async function awaitChallenge(): Promise<void> {
  await vi.waitFor(() => {
    expect(popupMock.location.assign).toHaveBeenCalled();
  });
}

/**
 * `crypto.subtle.digest` as this realm offers it. Its result is copied into an
 * `ArrayBuffer` of the test's own realm: in the jsdom worker the digest comes
 * back from another realm, and `oauth4webapi`'s base64url encoder rejects it
 * (`input.subarray is not a function`) before the challenge can resolve. The
 * digest bytes are unchanged.
 */
const realDigest = crypto.subtle.digest.bind(crypto.subtle);
const realmDigest: SubtleCrypto["digest"] = (algorithm, data) =>
  realDigest(algorithm, data).then(
    (value) => new Uint8Array(value).slice().buffer as ArrayBuffer,
  );

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
  popupMock.location.assign.mockReset();
  openMock.mockReset();
  openMock.mockReturnValue(popupMock as unknown as Window);
  pushMock.mockReset();
  replaceMock.mockReset();
  locationMock.assign.mockReset();
  locationMock.pathname = "/";
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
  vi.spyOn(crypto.subtle, "digest").mockImplementation(realmDigest);
  vi.spyOn(window, "open").mockImplementation(openMock);
  vi.spyOn(window.history, "pushState").mockImplementation(pushMock);
  vi.spyOn(window.history, "replaceState").mockImplementation(replaceMock);
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("signIn — the popup start of design.md D10 (spec: Sign in)", () => {
  const route = "/en/offerings/1";

  it("keeps the verifier, state and that return route in the opener's memory and writes nothing to storage (spec: Sign in starts from the current route)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = route;

    signIn(route);
    await awaitChallenge();

    expect(openMock).toHaveBeenCalledTimes(1);
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
    const pending = flow.readHeldFlow();
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
    await awaitChallenge();

    const pending = flow.readHeldFlow()!;
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
    await awaitChallenge();

    expect(openedUrl().searchParams.get("theme")).toBe("traditional");
  });

  it("navigates the current page to the authorization URL and stores the flow record with its return route when window.open returns null (spec: The popup cannot be opened)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = route;
    openMock.mockReturnValue(null);

    signIn(route);
    await vi.waitFor(() => {
      expect(locationMock.assign).toHaveBeenCalledTimes(1);
    });

    const url = new URL(String(locationMock.assign.mock.calls[0]![0]));
    expect(url.origin).toBe(API_URL);
    expect(url.pathname).toBe("/oauth/authorize");

    const pending = flow.readFlow();
    expect(pending).not.toBeNull();
    expect(pending!.returnRoute).toBe(route);
    expect(url.searchParams.get("state")).toBe(pending!.state);
  });
});

describe("completeCallback — the outcomes of design.md D4 (spec: Return through the callback)", () => {
  const route = "/en/offerings/1";

  it("exchanges the code, deletes the flow data, sets the credential-free marker and opens the return route (spec: Completing sign in)", async () => {
    const { completeCallback, flow } = await load();
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: route,
    };
    flow.saveFlow(pending);
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

    expect(openedRoute()).toBe(route);
  });

  it("deletes the flow data, removes the marker and opens the return route when the authorization comes back with an error (design.md D4 outcome table)", async () => {
    const { completeCallback, flow } = await load();
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: route,
    };
    flow.saveFlow(pending);
    flow.setMarker();

    await completeCallback({
      error: "access_denied",
      error_description: "The user denied access",
      state: pending.state,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(openedRoute()).toBe(route);
  });

  it("takes the same path when the state does not answer the pending request (spec: The response does not answer a pending request)", async () => {
    const { completeCallback, flow } = await load();
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: route,
    };
    flow.saveFlow(pending);
    flow.setMarker();

    await completeCallback({ code: "code-123", state: "not-the-state" });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(openedRoute()).toBe(route);
  });

  it("opens the root of the default locale when no flow is pending (design.md D4 outcome table)", async () => {
    const { completeCallback, flow } = await load();
    flow.setMarker();

    await completeCallback({});

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(false);
    expect(openedRoute()).toBe(`/${DEFAULT_LOCALE}`);
  });

  it("makes exactly one token request when invoked twice and takes no error path on the second invocation (design.md D4 idempotency)", async () => {
    const { completeCallback, flow } = await load();
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: route,
    };
    flow.saveFlow(pending);
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
    expect(openedRoute()).toBe(route);
  });
});

describe("requestProfileWrite — step-up in the popup of design.md D10 (spec: Step-up to the write scope)", () => {
  const route = "/en/profile/edit";

  const PROFILE = {
    ulid: "user-ulid-1",
    name: "Andrés",
    surname: "Gómez",
    email: "andres@example.test",
    role: "specialist",
  };

  const WRITE_GRANT = {
    access_token: "access-2",
    token_type: "Bearer",
    refresh_token: "refresh-2",
    expires_in: 3600,
  };

  /**
   * A popup window of this test's own: a message listener left behind by an
   * earlier test's page load answers only its own popup, never this one.
   */
  let popup: { location: { assign: ReturnType<typeof vi.fn> }; closed: boolean };
  /** The grant `POST /oauth/token` answers with; a failure body when `null`. */
  let tokenAnswer: typeof GRANT | null;
  const reloadMock = vi.fn<() => void>();

  /**
   * One page load through the slice's public entry (design.md D1), with the
   * session module it brings in, the flow record and the token memory (D3).
   */
  async function loadWithSession() {
    const auth = await import("@/features/auth");
    const flow = await import("../model/flow");
    const api = await import("@/shared/api");
    return { ...auth, flow, getTokens: api.getTokens, exchangeCode: api.exchangeCode };
  }

  type Loaded = Awaited<ReturnType<typeof loadWithSession>>;

  /** The `GET /user` requests so far, with the Bearer token each carried. */
  function profileRequests(): string[] {
    return fetchMock.mock.calls
      .filter(([input]) => String(input).endsWith("/user"))
      .map(([, init]) => new Headers(init?.headers).get("authorization") ?? "");
  }

  /** The token requests so far, as plain key/value pairs. */
  function tokenForms(): Record<string, string>[] {
    return fetchMock.mock.calls
      .filter(([input]) => String(input).includes("/oauth/token"))
      .map(([, init]) => Object.fromEntries(new URLSearchParams(String(init?.body))));
  }

  /**
   * An authenticated session holding the read grant: the tokens settled in
   * this page load and a mounted consumer resolved the profile (design.md D5).
   */
  async function signedIn(loaded: Loaded) {
    tokenAnswer = GRANT;
    await loaded.exchangeCode("code-1", "verifier-1");
    loaded.flow.setMarker();
    const { result } = renderHook(() => loaded.useSession());
    await vi.waitFor(() => {
      expect(result.current.state).toBe("authenticated");
    });
    return result;
  }

  /** Starts the step-up and waits for the popup to reach the authorization page. */
  async function stepUp(loaded: Loaded): Promise<URL> {
    loaded.requestProfileWrite(route);
    await vi.waitFor(() => {
      expect(popup.location.assign).toHaveBeenCalledTimes(1);
    });
    return new URL(String(popup.location.assign.mock.calls[0]![0]));
  }

  /** The popup's `postMessage` to the opener (design.md D4, popup mode). */
  function answer(data: unknown): void {
    const event = new MessageEvent("message", { data, origin: APP_URL });
    Object.defineProperty(event, "source", { value: popup });
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    popup = { location: { assign: vi.fn<(url: string) => void>() }, closed: false };
    openMock.mockReturnValue(popup as unknown as Window);
    reloadMock.mockReset();
    Object.assign(locationMock, { reload: reloadMock });
    locationMock.pathname = route;
    tokenAnswer = null;
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/oauth/token")) {
        return Promise.resolve(
          tokenAnswer === null
            ? jsonResponse(
                { error: "invalid_grant", error_description: "The code is invalid" },
                400,
              )
            : jsonResponse(tokenAnswer),
        );
      }
      return Promise.resolve(jsonResponse({ data: PROFILE }));
    });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("opens {NEXT_PUBLIC_API_URL}/oauth/authorize in a popup with scope=profile:write and no prompt parameter, leaving the route that asked and its typed input as they are (spec: Requesting the write scope)", async () => {
    const loaded = await loadWithSession();
    await signedIn(loaded);
    const input = document.createElement("input");
    document.body.append(input);
    input.value = "typed before the step-up";

    const url = await stepUp(loaded);

    expect(openMock).toHaveBeenCalledTimes(1);
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
    expect(params.scope).toBe("profile:write");
    expect(url.searchParams.has("prompt")).toBe(false);
    expect(params.response_type).toBe("code");
    expect(params.client_id).toBe(CLIENT_ID);
    expect(params.redirect_uri).toBe(`${APP_URL}/callback`);
    expect(params.code_challenge_method).toBe("S256");
    expect(params.lang).toBe("en");

    const pending = loaded.flow.readHeldFlow()!;
    expect(pending.returnRoute).toBe(route);
    expect(params.state).toBe(pending.state);
    expect(params.code_challenge).toBe(await s256(pending.verifier));

    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(input.isConnected).toBe(true);
    expect(input.value).toBe("typed before the step-up");
  });

  it("ends authenticated with the new token replacing the previous one when a matching message arrives, the opener neither navigating nor reloading (spec: Requesting the write scope; design.md D10)", async () => {
    const loaded = await loadWithSession();
    const session = await signedIn(loaded);
    expect(loaded.getTokens()?.access_token).toBe(GRANT.access_token);
    await stepUp(loaded);
    const pending = loaded.flow.readHeldFlow()!;
    tokenAnswer = WRITE_GRANT;

    answer({ code: "code-2", state: pending.state });

    await vi.waitFor(() => {
      expect(profileRequests()).toEqual([
        `Bearer ${GRANT.access_token}`,
        `Bearer ${WRITE_GRANT.access_token}`,
      ]);
    });
    await vi.waitFor(() => {
      expect(session.current).toEqual({ state: "authenticated", user: PROFILE });
    });
    const forms = tokenForms();
    expect(forms).toHaveLength(2);
    expect(forms[1]!.code).toBe("code-2");
    expect(forms[1]!.code_verifier).toBe(pending.verifier);
    expect(loaded.getTokens()?.access_token).toBe(WRITE_GRANT.access_token);
    expect(loaded.getTokens()?.refresh_token).toBe(WRITE_GRANT.refresh_token);
    expect(loaded.flow.hasMarker()).toBe(true);
    expect(sessionStorage.length).toBe(0);

    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("ends anonymous with the marker removed and no text when the write sign in is declined (spec: The write sign in is declined or fails)", async () => {
    const loaded = await loadWithSession();
    const session = await signedIn(loaded);
    await stepUp(loaded);
    const pending = loaded.flow.readHeldFlow()!;

    answer({ error: "access_denied", state: pending.state });

    await vi.waitFor(() => {
      expect(session.current).toEqual({ state: "anonymous" });
    });
    expect(loaded.flow.hasMarker()).toBe(false);
    expect(tokenForms()).toHaveLength(1);
    expect(document.body.textContent).toBe("");
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("ends anonymous with the marker removed and no text when the write sign in fails at the exchange (spec: The write sign in is declined or fails)", async () => {
    const loaded = await loadWithSession();
    const session = await signedIn(loaded);
    await stepUp(loaded);
    const pending = loaded.flow.readHeldFlow()!;
    tokenAnswer = null;

    answer({ code: "code-2", state: pending.state });

    await vi.waitFor(() => {
      expect(session.current).toEqual({ state: "anonymous" });
    });
    expect(tokenForms()).toHaveLength(2);
    expect(loaded.flow.hasMarker()).toBe(false);
    expect(document.body.textContent).toBe("");
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe("the popup handshake of design.md D10 (spec: Sign in)", () => {
  const route = "/en/offerings/1";

  const PROFILE = {
    ulid: "user-ulid-1",
    name: "Andrés",
    surname: "Gómez",
    email: "andres@example.test",
    role: "specialist",
  };

  /**
   * A popup window of this test's own and a window the flow never opened: a
   * message listener left behind by an earlier test's page load answers only
   * its own popup, never these.
   */
  let popup: { location: { assign: ReturnType<typeof vi.fn> }; closed: boolean };
  let otherWindow: {
    location: { assign: ReturnType<typeof vi.fn> };
    closed: boolean;
  };
  const reloadMock = vi.fn<() => void>();

  /** The `postMessage` `source` sends to the opener (design.md D4 popup mode). */
  function answer(data: unknown, source: unknown, origin: string): void {
    const event = new MessageEvent("message", { data, origin });
    Object.defineProperty(event, "source", { value: source });
    window.dispatchEvent(event);
  }

  /** Waits for this test's popup to reach the authorization page (design.md D8). */
  async function awaitPopup(): Promise<void> {
    await vi.waitFor(() => {
      expect(popup.location.assign).toHaveBeenCalled();
    });
  }

  beforeEach(() => {
    popup = {
      location: { assign: vi.fn<(url: string) => void>() },
      closed: false,
    };
    otherWindow = {
      location: { assign: vi.fn<(url: string) => void>() },
      closed: false,
    };
    openMock.mockReturnValue(popup as unknown as Window);
    reloadMock.mockReset();
    Object.assign(locationMock, { reload: reloadMock });
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("ignores a message from another origin or from a window other than the popup and starts no exchange (design.md D10)", async () => {
    const { signIn, flow } = await load();
    signIn(route);
    await awaitPopup();
    const pending = flow.readHeldFlow()!;

    answer({ code: "code-1", state: pending.state }, popup, "https://evil.test");
    answer({ code: "code-2", state: pending.state }, otherWindow, APP_URL);
    // Let any exchange such a message could have started reach `fetch`.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(flow.readHeldFlow()).not.toBeNull();
  });

  it("ends authenticated when a matching message arrives, the opener neither navigating nor reloading (design.md D10)", async () => {
    const auth = await import("@/features/auth");
    const flow = await import("../model/flow");
    fetchMock.mockImplementation((input) =>
      Promise.resolve(
        String(input).includes("/oauth/token")
          ? jsonResponse(GRANT)
          : jsonResponse({ data: PROFILE }),
      ),
    );
    const { result } = renderHook(() => auth.useSession());
    auth.signIn(route);
    await awaitPopup();
    const pending = flow.readHeldFlow()!;

    answer({ code: "code-1", state: pending.state }, popup, APP_URL);

    await vi.waitFor(() => {
      expect(result.current).toEqual({ state: "authenticated", user: PROFILE });
    });
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(reloadMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("keeps the popup flow's record out of sessionStorage from the popup's opening to the flow's completion (design.md D3 and D10)", async () => {
    const { signIn, flow } = await load();
    fetchMock.mockResolvedValue(jsonResponse(GRANT));
    signIn(route);
    await awaitPopup();
    const pending = flow.readHeldFlow();
    expect(pending).not.toBeNull();

    expect(flow.readFlow()).toBeNull();
    expect(sessionStorage.length).toBe(0);

    answer({ code: "code-1", state: pending!.state }, popup, APP_URL);
    await vi.waitFor(() => {
      expect(flow.hasMarker()).toBe(true);
    });

    expect(sessionStorage.length).toBe(0);
  });
});
