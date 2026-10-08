/**
 * The session store, `useSession` and `signOut` (design.md D1, D2 and D5;
 * specs "Session states and profile", "Silent re-authentication", "Keeping the
 * session alive" and "Sign out").
 *
 * The store starts `loading` and settles to `anonymous` or to `authenticated`
 * with the profile of `GET /user`, which is the only source of user data
 * (design.md D5). A completed flow settles it through the seam `../api/authorize`
 * fills here (design.md D4): the profile is loaded when the tokens settle and
 * the completion leaves the user on their route, and when the completion hands
 * over to the return route through client-side navigation the session start
 * below resolves it there.
 *
 * The session start runs at every consumer (design.md D1): it resolves the
 * session from what the page load finds — the tokens in memory, the sign-in
 * marker of design.md D3, or a first visit — and starts the silent
 * re-authentication of design.md D5 (`prompt=none`) at most once per page load,
 * so effects running twice (Strict Mode) never start two authorization
 * requests. The module fills the two seams once when it loads (design.md D2):
 * the API client's, so `GET /user` carries the token and recovers on a `401`,
 * and the flow's, so a completed flow settles this store.
 */
import { useEffect, useSyncExternalStore } from "react";
import type { Session, SessionUser } from "@/shared/api";
import {
  clearTokens,
  configureClient,
  getTokens,
  refreshTokens,
  request,
} from "@/shared/api";
import { DEFAULT_LOCALE, localeFromPath } from "@/shared/config/locales";
import { configureSession, currentRoute, startSilent } from "../api/authorize";
import { hasMarker, removeMarker } from "./flow";

const LOADING: Session = { state: "loading" };
const ANONYMOUS: Session = { state: "anonymous" };

/** The store: still resolving, or settled to one session (design.md D1). */
let store: { resolving: true } | { resolving: false; session: Session } = {
  resolving: true,
};

let listeners: Array<() => void> = [];
/** The silent check of this page load has started (design.md D1 idempotency). */
let silentCheckDone = false;
/** The `GET /user` in flight, if any. */
let profileLoad: Promise<void> | null = null;

function snapshot(): Session {
  return store.resolving ? LOADING : store.session;
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((kept) => kept !== listener);
  };
}

function setResolving(): void {
  store = { resolving: true };
  for (const listener of [...listeners]) listener();
}

function settle(session: Session): void {
  store = { resolving: false, session };
  for (const listener of [...listeners]) listener();
}

/** The current session: loading, anonymous, or authenticated with the user. */
export function useSession(): Session {
  useEffect(() => {
    start();
  }, []);
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/**
 * The client-side navigation that opens the root of the active locale after
 * sign out. The caller passes the App Router's `push`: a native
 * `history.pushState` only updates the URL and would leave the previous page
 * rendered (as `ReplaceRoute` of `../api/authorize` at `/callback`).
 */
export type OpenRoute = (href: string) => void;

/**
 * Signs out; lands on the root of the active locale (design.md D1 and D5).
 * `POST /logout` carries the Bearer token and its answer is never consulted:
 * a `200`, a `401` when the token is already dead and any transport failure
 * all leave the local sign-out completed — tokens and marker cleared, the
 * session `anonymous`, the root of the active locale open through
 * `openRoute` — with no error shown (spec: "Sign out").
 */
export function signOut(openRoute: OpenRoute): void {
  void request("/logout", { method: "POST" })
    .catch(() => {
      // The server cannot be reached (spec: "The server cannot be reached").
    })
    .finally(() => {
      clearTokens();
      removeMarker();
      settle(ANONYMOUS);
      openRoute(localeRoot());
    });
}

/** The root of the active locale (design.md D5: where the user lands). */
function localeRoot(): string {
  return `/${localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE}`;
}

/** The session start of design.md D1, run at every consumer's mount. */
function start(): void {
  if (getTokens() !== null) {
    // The tokens settled in this page load (design.md D5): the session
    // resolves with the profile unless it is already settled.
    if (store.resolving) void loadProfile();
    return;
  }
  if (!hasMarker()) {
    // First visit in this browser (spec: "First visit in this browser").
    settle(ANONYMOUS);
    return;
  }
  if (silentCheckDone) return;
  silentCheckDone = true;
  setResolving();
  startSilent(currentRoute());
}

/** `GET /user` after the tokens settle (design.md D5), or `anonymous`. */
async function loadProfile(): Promise<void> {
  if (profileLoad !== null) return profileLoad;
  profileLoad = (async () => {
    try {
      const response = await request("/user");
      const body = (await response.json()) as { data?: SessionUser };
      if (body.data === undefined) {
        throw new Error("the profile cannot be resolved");
      }
      settle({ state: "authenticated", user: body.data });
    } catch {
      // The profile cannot be resolved: anonymous, with no error shown
      // (spec: "The profile cannot be resolved").
      settle(ANONYMOUS);
    } finally {
      profileLoad = null;
    }
  })();
  return profileLoad;
}

/** The short pause before the one retry of a failed profile refresh (design.md D5). */
const REFRESH_RETRY_PAUSE_MS = 500;

/**
 * Refreshes the profile after a consumer changed it (design.md D5; spec
 * "Session states and profile"): `GET /user` through the authenticated
 * client settles the session with its `data`, the change request's own
 * response never being written into the session. A network failure or a
 * server error retries once after a short pause; a second failure keeps the
 * previous user with nothing shown. A `401` is recovered by the client.
 * It runs only on an `authenticated` session, and an answer that arrives
 * after that session ended (signed out or another user) changes nothing
 * (spec: "Sign out").
 */
export async function refreshProfile(): Promise<void> {
  const started = snapshot();
  if (started.state !== "authenticated") return;
  const ulid = started.user.ulid;
  const stillCurrent = (): boolean => {
    const current = snapshot();
    return current.state === "authenticated" && current.user.ulid === ulid;
  };
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, REFRESH_RETRY_PAUSE_MS));
      if (!stillCurrent()) return;
    }
    try {
      const response = await request("/user");
      if (!stillCurrent()) return;
      if (response.status >= 500) continue;
      if (response.ok) {
        const body = (await response.json()) as { data?: SessionUser };
        if (body.data !== undefined && stillCurrent()) {
          settle({ state: "authenticated", user: body.data });
        }
      }
      return;
    } catch {
      // A network failure: retried once, then the previous user is kept.
    }
  }
}

// The module's initialization (design.md D2): `src/features/auth` fills the
// API client's seam once — the tokens, the refresh and the silent
// re-authentication that starts when nothing can recover the session — and the
// seam of `../api/authorize` that settles this store when a flow completes
// (design.md D4 and D5).
configureClient({
  getTokens,
  refresh: refreshTokens,
  onUnrecoverable: () => startSilent(currentRoute()),
});
configureSession({
  authenticated: loadProfile,
  anonymous: () => settle(ANONYMOUS),
});
