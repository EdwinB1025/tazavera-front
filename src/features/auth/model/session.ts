/**
 * The session store and `useSession` (design.md D1, D2 and D5; specs "Session
 * states and profile", "Silent re-authentication" and "Keeping the session
 * alive").
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
  configureClient,
  getTokens,
  refreshTokens,
  request,
} from "@/shared/api";
import { configureSession, startSilent } from "../api/authorize";
import { hasMarker } from "./flow";

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
  startSilent(window.location.pathname);
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

// The module's initialization (design.md D2): `src/features/auth` fills the
// API client's seam once — the tokens, the refresh and the silent
// re-authentication that starts when nothing can recover the session — and the
// seam of `../api/authorize` that settles this store when a flow completes
// (design.md D4 and D5).
configureClient({
  getTokens,
  refresh: refreshTokens,
  onUnrecoverable: () => startSilent(window.location.pathname),
});
configureSession({
  authenticated: loadProfile,
  anonymous: () => settle(ANONYMOUS),
});
