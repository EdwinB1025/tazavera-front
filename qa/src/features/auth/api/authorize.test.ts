import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";

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
 * and the popup window's `location.assign`, every return through the
 * `replaceRoute` navigation passed in (the App Router's `replace` on the
 * callback page: client-side navigation, never a full page load), stubbed here
 * like `fetch`: jsdom cannot open windows or navigate. `location.pathname` is
 * set to the route sign in starts from, so `lang` is the locale of the route
 * under any reading. The "as anonymous" half of the error outcomes belongs to
 * the session tests of task 4.1; here the outcomes assert their flow data,
 * marker and opening.
 */

/**
 * The locale `useLocale()` answers under the provider: the cases start from
 * routes under `/en` (adopt-next-intl-routing design.md D7: the sign-in flow
 * takes the locale `useSession()` records). Test infrastructure only.
 */
const intl = vi.hoisted(() => ({ locale: "en" }));

vi.mock("next-intl", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-intl")>()),
  useLocale: () => intl.locale,
}));

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
const replaceRouteMock = vi.fn<(href: string) => void>();
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  pathname: "/",
  search: "",
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
  expect(replaceRouteMock).toHaveBeenCalledTimes(1);
  return String(replaceRouteMock.mock.calls[0]![0]);
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

/** One page load: the flow modules of a fresh module registry. */
async function load() {
  const authorize = await import("@/features/auth/api/authorize");
  const flow = await import("@/features/auth/model/flow");
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
  replaceRouteMock.mockReset();
  locationMock.assign.mockReset();
  locationMock.pathname = "/";
  locationMock.search = "";
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

  it("sends the traditional theme when no theme cookie is set (theme read through src/shared/lib/theme.ts)", async () => {
    const { signIn } = await load();
    locationMock.pathname = route;

    signIn(route);
    await awaitChallenge();

    expect(openedUrl().searchParams.get("theme")).toBe("traditional");
  });

  it("keeps the path and the query of the current route as the default return route when the popup is blocked (fix-auth-return-query; spec: The return destination keeps the query)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = "/es/manage/evaluations/new";
    locationMock.search = "?offering=01J0";
    openMock.mockReturnValue(null);

    signIn();
    await vi.waitFor(() => {
      expect(locationMock.assign).toHaveBeenCalledTimes(1);
    });

    expect(flow.readFlow()!.returnRoute).toBe("/es/manage/evaluations/new?offering=01J0");
  });

  it("holds the path and the query of the current route as the default return route of a popup flow (fix-auth-return-query; spec: The return destination keeps the query)", async () => {
    const { signIn, flow } = await load();
    locationMock.pathname = "/es/manage/evaluations/new";
    locationMock.search = "?offering=01J0";

    signIn();
    await awaitChallenge();

    expect(flow.readHeldFlow()!.returnRoute).toBe("/es/manage/evaluations/new?offering=01J0");
  });
});

describe("completeCallback — the outcomes of design.md D4 (spec: Return through the callback)", () => {
  const route = "/en/offerings/1";

  it.each([
    ["//evil.example/es", "/es"],
    ["/\\evil.example", "/es"],
  ])("completes the flow and opens the stored return route %j only as an application route, else the default-locale root (fix-auth-return-query; spec: The return destination keeps the query, A return destination that is not an application route)", async (stored, opened) => {
    const { completeCallback, flow } = await load();
    flow.saveFlow({ verifier: "verifier-123", state: "state-123", returnRoute: stored });
    fetchMock.mockResolvedValue(jsonResponse(GRANT));

    await completeCallback({ code: "code-123", state: "state-123" }, replaceRouteMock);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(flow.readFlow()).toBeNull();
    expect(flow.hasMarker()).toBe(true);
    expect(replaceRouteMock).toHaveBeenCalledTimes(1);
    expect(replaceRouteMock).toHaveBeenCalledWith(opened);
  });

  it("opens the default-locale root for a stored return route that is not an application route when the authorization comes back with an error (fix-auth-return-query; spec: A return destination that is not an application route)", async () => {
    const { completeCallback, flow } = await load();
    flow.saveFlow({ verifier: "verifier-123", state: "state-123", returnRoute: "//evil.example/es" });

    await completeCallback({ error: "access_denied", state: "state-123" }, replaceRouteMock);

    expect(replaceRouteMock).toHaveBeenCalledWith("/es");
  });

  it("opens the return route through the client-side navigation it is given, in place of the /callback entry, and never through the native history API (design.md D4; spec: Completing on the callback)", async () => {
    const { completeCallback, flow } = await load();
    flow.saveFlow({ verifier: "verifier-123", state: "state-123", returnRoute: route });

    await completeCallback(
      { error: "access_denied", state: "state-123" },
      replaceRouteMock,
    );

    expect(replaceRouteMock).toHaveBeenCalledTimes(1);
    expect(replaceRouteMock).toHaveBeenCalledWith(route);
    expect(pushMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(locationMock.assign).not.toHaveBeenCalled();
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

    const first = completeCallback(params, replaceRouteMock);
    const second = completeCallback(params, replaceRouteMock);
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
    const flow = await import("@/features/auth/model/flow");
    const api = await import("@/shared/api");
    return { ...auth, flow, getTokens: api.getTokens, exchangeCode: api.exchangeCode };
  }

  type Loaded = Awaited<ReturnType<typeof loadWithSession>>;

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
