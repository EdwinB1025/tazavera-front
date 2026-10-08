import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup } from "@testing-library/react";
import type { Session } from "@/shared/api";

/**
 * The session states and their transitions (design.md D1 and D5; specs
 * "Session states and profile", "Silent re-authentication" and "Sign out").
 * Written before `./session` exists (task 4.1): the import fails to resolve
 * until then, so the file runs and fails as required.
 *
 * Every test stands for one page load: `./session`, `../api/authorize` and
 * `../model/flow` are imported fresh (`vi.resetModules()`), because the
 * startup silent check runs at most once per page load behind a module-level
 * guard (design.md D1 idempotency) and `completeCallback` runs at most once
 * (design.md D4 idempotency).
 *
 * The session is driven only through what design.md names: `useSession` (D1)
 * is the surface under test and is read through a mounted consumer, and
 * `signOut` (D1) is the sign-out under test; the flows complete through
 * `completeCallback` — "the one function `/callback` uses to
 * complete or forward the authorization result" (D1), where the silent restore
 * of design.md D5 completes in redirect mode (D4) — over the pending-flow
 * record of `../model/flow` (the storage contract of `flow.test.ts`). No
 * module-internal seam is named here: after a completed flow the state is read
 * from a consumer mounted on the return route, exactly as the shell mounts
 * after the callback's client-side navigation (D4).
 *
 * The silent request is the authorization request of design.md D5 with
 * `prompt=none`, started as the full-page redirect of D3, so every opening is
 * `location.assign` and its asynchronous PKCE challenge (D8) is awaited before
 * the URL appears. `location`, `fetch`, `history`, `window.open` and
 * `crypto.subtle.digest` are stubbed like in `authorize.test.ts`: jsdom cannot
 * navigate, and the digest must come back in this realm for `oauth4webapi` to
 * encode it.
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

const PROFILE = {
  ulid: "user-ulid-1",
  name: "Andrés",
  surname: "Gómez",
  email: "andres@example.test",
  role: "specialist",
};

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
const locationMock = {
  assign: vi.fn<(url: string) => void>(),
  pathname: "/en/offerings/1",
  search: "",
};
const pushMock = vi.fn<History["pushState"]>();
const replaceMock = vi.fn<History["replaceState"]>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Answers `POST /oauth/token` with the grant and `GET /user` with `profile`. */
function answerTokenAndProfile(profile: unknown): void {
  fetchMock.mockImplementation((input) => {
    const url = String(input);
    if (url.includes("/oauth/token")) return Promise.resolve(jsonResponse(GRANT));
    return Promise.resolve(jsonResponse({ data: profile }));
  });
}

/** Answers `POST /oauth/token` with the grant and fails `GET /user`. */
function answerTokenButNoProfile(): void {
  fetchMock.mockImplementation((input) => {
    const url = String(input);
    if (url.includes("/oauth/token")) return Promise.resolve(jsonResponse(GRANT));
    return Promise.reject(new Error("the profile cannot be loaded"));
  });
}

/** The URL of the single authorization request so far, parsed. */
function requestedUrl(): URL {
  expect(locationMock.assign).toHaveBeenCalledTimes(1);
  return new URL(String(locationMock.assign.mock.calls[0]![0]));
}

/**
 * `crypto.subtle.digest` as this realm offers it, copied into an
 * `ArrayBuffer` of the test's own realm (`authorize.test.ts`: the jsdom
 * worker's digest is rejected by `oauth4webapi`'s base64url encoder).
 */
const realDigest = crypto.subtle.digest.bind(crypto.subtle);
const realmDigest: SubtleCrypto["digest"] = (algorithm, data) =>
  realDigest(algorithm, data).then(
    (value) => new Uint8Array(value).slice().buffer as ArrayBuffer,
  );

/**
 * One page load of the session module: `useSession` (the surface under test),
 * `signOut` through the slice's public entry (design.md D1), the flow entry
 * that completes a returned authorization (design.md D1), the pending-flow
 * record it answers to (design.md D3) and the token memory's reader (D3).
 */
async function load() {
  const session = await import("./session");
  const authorize = await import("../api/authorize");
  const flow = await import("../model/flow");
  const api = await import("@/shared/api");
  const { signOut, refreshProfile } = await import("@/features/auth");
  return {
    ...session,
    ...authorize,
    flow,
    signOut,
    refreshProfile,
    getTokens: api.getTokens,
  };
}

type Loaded = Awaited<ReturnType<typeof load>>;

/** Mounts a consumer of `useSession` and records every state it reads. */
function consume({ useSession }: Loaded): {
  states: Session[];
  current: () => Session;
} {
  const states: Session[] = [];
  const { result } = renderHook(() => {
    const state = useSession();
    states.push(state);
    return state;
  });
  return { states, current: () => result.current };
}

/** Waits for the asynchronous PKCE challenge and the request to start (D8). */
async function awaitRequestStarted(): Promise<void> {
  await vi.waitFor(() => {
    expect(locationMock.assign).toHaveBeenCalled();
  });
}

/** Completes a sign-in at the return route: tokens, marker and profile. */
async function completeSignIn(loaded: Loaded): Promise<void> {
  const pending = {
    verifier: "verifier-123",
    state: "state-123",
    returnRoute: "/en/offerings/1",
  };
  loaded.flow.saveFlow(pending);
  answerTokenAndProfile(PROFILE);
  await loaded.completeCallback({ code: "code-123", state: pending.state }, () => {});
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
  locationMock.search = "";
  pushMock.mockReset();
  replaceMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("location", locationMock);
  vi.spyOn(window.history, "pushState").mockImplementation(pushMock);
  vi.spyOn(window.history, "replaceState").mockImplementation(replaceMock);
  vi.spyOn(crypto.subtle, "digest").mockImplementation(realmDigest);
  vi.resetModules();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session states (spec: Session states and profile)", () => {
  it("starts in loading (spec: The session is resolving)", async () => {
    const loaded = await load();

    const seen = consume(loaded);

    expect(seen.states[0]).toEqual({ state: "loading" });
  });

  it("ends authenticated carrying exactly data.ulid, data.name, data.surname, data.email and data.role when GET /user succeeds (spec: An authenticated session carries the profile)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: "/en/offerings/1",
    };
    loaded.flow.saveFlow(pending);
    answerTokenAndProfile(PROFILE);

    await loaded.completeCallback({ code: "code-123", state: pending.state }, () => {});

    // The consumer mounted before the flow is the one that ends authenticated
    // — no second mount — and the page never navigates (design.md D10).
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
    });
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(locationMock.pathname).toBe("/en/offerings/1");
  });

  it("ends anonymous with no error thrown at the consumer when the profile cannot be resolved (spec: The profile cannot be resolved)", async () => {
    const loaded = await load();
    const pending = {
      verifier: "verifier-123",
      state: "state-123",
      returnRoute: "/en/offerings/1",
    };
    loaded.flow.saveFlow(pending);
    answerTokenButNoProfile();

    await loaded.completeCallback({ code: "code-123", state: pending.state }, () => {});

    // Nothing is thrown at the consumer and the state carries no error text.
    const seen = consume(loaded);
    expect(seen.current()).toEqual({ state: "anonymous" });
  });
});

describe("silent re-authentication (spec: Silent re-authentication)", () => {
  it("stays anonymous on a load with no marker and starts no authorization request (spec: First visit in this browser)", async () => {
    const loaded = await load();

    const seen = consume(loaded);
    await vi.waitFor(() => {
      expect(seen.current().state).toBe("anonymous");
    });

    expect(locationMock.assign).not.toHaveBeenCalled();
  });

  it("starts the silent request with the marker and ends authenticated when it succeeds (spec: Returning user with a live API session)", async () => {
    const loaded = await load();
    loaded.flow.setMarker();
    answerTokenAndProfile(PROFILE);

    const loadWithMarker = consume(loaded);
    await awaitRequestStarted();

    const url = requestedUrl();
    expect(url.pathname).toBe("/oauth/authorize");
    expect(url.searchParams.get("prompt")).toBe("none");
    expect(url.searchParams.get("scope")).toBe("profile:read");

    // The request succeeds: the API session is live, so the authorization
    // returns a code and `completeCallback` completes it in redirect mode
    // (design.md D4), after which the session on the return route is read.
    const pending = loaded.flow.readFlow();
    expect(pending).not.toBeNull();
    await loaded.completeCallback({ code: "code-123", state: pending!.state }, () => {});
    const restored = consume(loaded);

    expect(restored.current()).toEqual({ state: "authenticated", user: PROFILE });
    expect(loadWithMarker.states[0]).toEqual({ state: "loading" });
  });

  it("records the path and the query of the route the user is on as the return route of the silent request (fix-auth-return-query; spec: The return destination keeps the query)", async () => {
    const loaded = await load();
    loaded.flow.setMarker();
    locationMock.search = "?tab=evaluations";

    consume(loaded);
    await awaitRequestStarted();

    expect(loaded.flow.readFlow()!.returnRoute).toBe("/en/offerings/1?tab=evaluations");
  });

  it("ends anonymous with the marker removed and no text when the request comes back with an error (spec: Returning user whose API session is gone)", async () => {
    const loaded = await load();
    loaded.flow.setMarker();

    consume(loaded);
    await awaitRequestStarted();
    const pending = loaded.flow.readFlow()!;

    await loaded.completeCallback({
      error: "login_required",
      error_description: "No session",
      state: pending.state,
    }, () => {});
    const gone = consume(loaded);

    expect(gone.current()).toEqual({ state: "anonymous" });
    expect(loaded.flow.hasMarker()).toBe(false);
  });

  it("stays anonymous with no authorization request on a later load after a sign out (spec: Sign out stops the silent restore)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    fetchMock.mockResolvedValue(jsonResponse({ message: "logout successfully." }));
    loaded.signOut();
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });

    // A later page load: fresh modules over the storage the sign out left.
    vi.resetModules();
    const back = consume(await load());

    await vi.waitFor(() => {
      expect(back.current()).toEqual({ state: "anonymous" });
    });
    expect(locationMock.assign).not.toHaveBeenCalled();
  });
});

describe("sign out (spec: Sign out)", () => {
  it("posts POST /logout with the Bearer token, clears the in-memory tokens and the marker, ends anonymous and opens the root of the active locale (spec: Signing out)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ message: "logout successfully." }));
    pushMock.mockClear();

    loaded.signOut();

    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });
    const [input, init] = fetchMock.mock.calls[0]!;
    expect(String(input)).toBe(`${API_URL}/logout`);
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Bearer ${GRANT.access_token}`,
    );
    expect(loaded.getTokens()).toBeNull();
    expect(loaded.flow.hasMarker()).toBe(false);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(null, "", "/en");
  });

  it("completes the local sign out with no error shown when the request fails (spec: The server cannot be reached)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    fetchMock.mockReset();
    fetchMock.mockRejectedValue(new Error("the server cannot be reached"));
    pushMock.mockClear();

    loaded.signOut();

    // All the local parts still complete and the state carries no error text.
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(`${API_URL}/logout`);
    expect(loaded.getTokens()).toBeNull();
    expect(loaded.flow.hasMarker()).toBe(false);
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(null, "", "/en");
  });
});

describe("profile refresh (spec: Session states and profile; design.md D5)", () => {
  const UPDATED = { ...PROFILE, name: "Andrea", email: "andrea@example.test" };

  /** The `GET /user` requests sent so far. */
  function profileRequests() {
    return fetchMock.mock.calls.filter(([input]) => String(input) === `${API_URL}/user`);
  }

  /** Answers `POST /oauth/token` with the grant and `GET /user` with each answer in turn. */
  function answerProfileInTurn(...answers: Array<() => Promise<Response>>): void {
    let next = 0;
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.includes("/oauth/token")) return Promise.resolve(jsonResponse(GRANT));
      const answer = answers[Math.min(next, answers.length - 1)]!;
      next += 1;
      return answer();
    });
  }

  it("requests GET /user and settles the session with its data (spec: Refreshing the profile)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
    });
    fetchMock.mockReset();
    answerProfileInTurn(() => Promise.resolve(jsonResponse({ data: UPDATED })));

    await loaded.refreshProfile();

    expect(profileRequests()).toHaveLength(1);
    const [, init] = profileRequests()[0]!;
    expect(init?.method ?? "GET").toBe("GET");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer access-1");
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: UPDATED });
    });
  });

  for (const [label, failure] of [
    ["a network failure", () => Promise.reject(new TypeError("offline"))],
  ] as const) {
    it(`retries GET /user exactly once after ${label} (spec: A profile refresh that fails transiently)`, async () => {
      const loaded = await load();
      const seen = consume(loaded);
      await completeSignIn(loaded);
      fetchMock.mockReset();
      answerProfileInTurn(failure, () => Promise.resolve(jsonResponse({ data: UPDATED })));

      await loaded.refreshProfile();

      expect(profileRequests()).toHaveLength(2);
      await vi.waitFor(() => {
        expect(seen.current()).toEqual({ state: "authenticated", user: UPDATED });
      });
    });
  }

  it("keeps the previous user and reaches no consumer with an error when the retry fails too (spec: A profile refresh that fails twice)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
    });
    fetchMock.mockReset();
    answerProfileInTurn(() => Promise.reject(new TypeError("offline")));

    await expect(loaded.refreshProfile()).resolves.toBeUndefined();

    expect(profileRequests()).toHaveLength(2);
    expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
  });
});
