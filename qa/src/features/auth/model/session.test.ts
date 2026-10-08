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
  const session = await import("@/features/auth/model/session");
  const authorize = await import("@/features/auth/api/authorize");
  const flow = await import("@/features/auth/model/flow");
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

describe("silent re-authentication (spec: Silent re-authentication)", () => {
  it("starts exactly one authorization request when the session start runs twice in one page load (design.md D1 idempotency)", async () => {
    const loaded = await load();
    loaded.flow.setMarker();

    consume(loaded);
    consume(loaded);
    await awaitRequestStarted();

    expect(locationMock.assign).toHaveBeenCalledTimes(1);
  });

  it("ends anonymous with the marker removed and no text when the request fails (spec: Returning user whose API session is gone)", async () => {
    const loaded = await load();
    loaded.flow.setMarker();
    fetchMock.mockRejectedValue(new Error("the token endpoint is down"));

    consume(loaded);
    await awaitRequestStarted();
    const pending = loaded.flow.readFlow()!;

    await loaded.completeCallback({ code: "code-123", state: pending.state }, () => {});
    const gone = consume(loaded);

    expect(gone.current()).toEqual({ state: "anonymous" });
    expect(loaded.flow.hasMarker()).toBe(false);
  });
});

describe("sign out (spec: Sign out)", () => {
  it("starts no refresh, no silent re-authentication and no authorization request and still completes the local sign out when POST /logout answers 401 (design.md D5: POST /logout; spec: Sign out)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    fetchMock.mockReset();
    // The `401` of design.md D5 ("the token is already dead").
    fetchMock.mockResolvedValue(jsonResponse({}, 401));
    pushMock.mockClear();
    const openRoute = vi.fn<(href: string) => void>();
    const openSpy = vi
      .spyOn(window, "open")
      .mockReturnValue(null as unknown as Window);

    loaded.signOut(openRoute);

    // The answer is never consulted and no recovery runs: `POST /logout` is
    // the only request (no refresh grant), and neither a silent
    // re-authentication nor any authorization request revives the session.
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(`${API_URL}/logout`);
    expect(locationMock.assign).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(loaded.getTokens()).toBeNull();
    expect(loaded.flow.hasMarker()).toBe(false);
    expect(openRoute).toHaveBeenCalledExactlyOnceWith("/en");
    expect(pushMock).not.toHaveBeenCalled();
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

  for (const [label, failure] of [
    ["a 5xx", () => Promise.resolve(jsonResponse({ message: "down" }, 503))],
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

  it("sends no GET /user and changes nothing on an anonymous session (spec: Sign out; design.md D5)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });
    answerProfileInTurn(() => Promise.resolve(jsonResponse({ data: UPDATED })));

    await loaded.refreshProfile();

    expect(profileRequests()).toHaveLength(0);
    expect(seen.current()).toEqual({ state: "anonymous" });
  });

  it("discards a GET /user answer that arrives after a sign out (spec: Sign out; design.md D5)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: PROFILE });
    });
    fetchMock.mockReset();
    let answerProfile: (response: Response) => void = () => {};
    fetchMock.mockImplementation((input) => {
      if (String(input) === `${API_URL}/user`) {
        return new Promise<Response>((resolve) => {
          answerProfile = resolve;
        });
      }
      return Promise.resolve(jsonResponse({ message: "logout successfully." }));
    });

    const refreshing = loaded.refreshProfile();
    await vi.waitFor(() => {
      expect(profileRequests()).toHaveLength(1);
    });
    loaded.signOut(() => {});
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "anonymous" });
    });
    answerProfile(jsonResponse({ data: UPDATED }));
    await refreshing;

    expect(seen.current()).toEqual({ state: "anonymous" });
  });

  it("recovers a 401 through the client's chain and changes nothing else (spec: Keeping the session alive)", async () => {
    const loaded = await load();
    const seen = consume(loaded);
    await completeSignIn(loaded);
    fetchMock.mockReset();
    answerProfileInTurn(
      () => Promise.resolve(jsonResponse({}, 401)),
      () => Promise.resolve(jsonResponse({ data: UPDATED })),
    );

    await loaded.refreshProfile();

    const refreshes = fetchMock.mock.calls.filter(([input]) =>
      String(input).includes("/oauth/token"),
    );
    expect(refreshes).toHaveLength(1);
    expect(profileRequests()).toHaveLength(2);
    expect(locationMock.assign).not.toHaveBeenCalled();
    await vi.waitFor(() => {
      expect(seen.current()).toEqual({ state: "authenticated", user: UPDATED });
    });
  });
});
