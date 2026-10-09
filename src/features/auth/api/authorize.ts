/**
 * Starting a flow and completing it at the callback (design.md D3, D4, D5 and
 * D10; specs "Sign in", "Return through the callback" and "Credential
 * handling").
 *
 * Sign in and step-up start as the popup flow of design.md D10 with the
 * full-page fallback of design.md D3 and D4: a blank popup opens synchronously
 * within the click and is pointed at the API's authorization page once the
 * asynchronous PKCE challenge resolves (design.md D8); when no popup can open,
 * the same call runs the full-page redirect flow, its record in
 * `sessionStorage`. The flow's verifier and `state` of a popup live in the
 * opener's memory and never reach storage. `completeCallback` completes or
 * forwards the result at `/callback` (design.md D4) through `@/shared/api`.
 */
import * as oauth from "oauth4webapi";
import {
  DEFAULT_LOCALE,
  localeFromPath,
  type Locale,
} from "@/shared/config/locales";
import { readTheme } from "@/shared/lib/theme";
import {
  clearFlow,
  holdFlow,
  readFlow,
  releaseFlow,
  removeMarker,
  saveFlow,
  setMarker,
  type PendingFlow,
} from "../model/flow";
import { toAppRoute } from "../model/return-route";
import { settleTokens } from "./identity";

/** The scopes the authorization page is asked for (design.md D5). */
type Scope = "profile:read" | "profile:write";

/** The callback's query parameters (design.md D1). */
export type CallbackParams = Record<string, string | string[] | undefined>;

/**
 * The client-side navigation that opens the return route in place of the
 * `/callback` history entry (design.md D4). The callback page passes the App
 * Router's `replace`: a native `history.pushState` only updates the URL and
 * would leave the callback's empty screen rendered.
 */
export type ReplaceRoute = (href: string) => void;

/**
 * What the session module does when a flow settles (design.md D1, D4 and D5).
 * `../model/session` fills this when it loads; without it nothing settles a
 * session and the flow outcomes stay flow-level.
 */
type SessionSeam = {
  /** The tokens settled: the session resolves with `GET /user` (design.md D5). */
  authenticated: () => Promise<void>;
  /** Nothing restores the session: it becomes `anonymous` (design.md D4). */
  anonymous: () => void;
  /** The session user's `ulid`, a step-up's expected user (secure-step-up design.md D2). */
  currentUlid: () => string | undefined;
};

/** What a step-up ends with (secure-step-up design.md D1). */
export type StepUpOutcome = "granted" | "cancelled" | "failed" | "other-account";

let seam: SessionSeam | null = null;

/** Fills the session seam; `../model/session` calls it when it loads (design.md D1). */
export function configureSession(next: SessionSeam): void {
  seam = next;
}

/** The completion has run in this page load (design.md D4 idempotency). */
let handled = false;

/**
 * The route the user is on: path plus query, never the hash
 * (fix-auth-return-query design.md D1).
 */
export function currentRoute(): string {
  return window.location.pathname + window.location.search;
}

/** Starts sign in; the return route defaults to the route the user is on. */
export function signIn(returnRoute?: string): void {
  void startInteractive("profile:read", returnRoute ?? currentRoute());
}

/**
 * Step-up: forces a fresh sign in requesting `profile:write` by the session
 * user, and resolves its outcome (secure-step-up design.md D1 and D2). In the
 * full-page fallback the page leaves and the promise never resolves.
 */
export function requestProfileWrite(returnRoute: string): Promise<StepUpOutcome> {
  return startInteractive("profile:write", returnRoute, seam?.currentUlid() ?? "");
}

/**
 * Completes or forwards the authorization result at `/callback` (design.md
 * D4): with an opener of the front's origin the result is posted to the front's
 * origin and the window closes itself, without one the flow completes here —
 * exchange, flow data deleted, marker set or removed — and the return route
 * opens through `replaceRoute`, client-side navigation that replaces the
 * `/callback` entry so the code does not remain in the URL, never a full page
 * load. Runs at most once per page load: the code is single-use (design.md
 * D4 idempotency).
 */
export async function completeCallback(
  params: CallbackParams,
  replaceRoute: ReplaceRoute,
): Promise<void> {
  if (handled) return;
  handled = true;

  const code = single(params.code);
  const state = single(params.state);
  const error = single(params.error);

  const opener = frontOpener();
  if (opener) {
    opener.postMessage(
      error !== undefined ? { error, state } : { code, state },
      appUrl(),
    );
    window.close();
    return;
  }

  const pending = readFlow();
  // Only an application route opens; any other destination takes the root of
  // the default locale (fix-auth-return-query design.md D3).
  const returnRoute = toAppRoute(pending?.returnRoute) ?? `/${DEFAULT_LOCALE}`;
  // A failed exchange takes the error path (design.md D5), and so does a
  // step-up by another user: the previous tokens did not survive the full
  // page load (secure-step-up design.md D3).
  const settled =
    code !== undefined &&
    error === undefined &&
    pending !== null &&
    state === pending.state &&
    (await settleTokens(code, pending).catch(() => false));
  clearFlow();
  if (settled) {
    setMarker();
    // The session resolves where the user ends up (design.md D4 and D5):
    // here when the completion leaves them on this route, and at the return
    // route's session start when it hands over through client-side
    // navigation and the tokens must survive it.
    if (returnRoute === currentRoute()) {
      await seam?.authenticated();
    }
  } else {
    removeMarker();
    seam?.anonymous();
  }

  replaceRoute(returnRoute);
}

/**
 * The popup start of design.md D10 with the full-page fallback: the popup opens
 * synchronously within the click (a popup opened outside the click would be
 * blocked), and the authorization request starts once the PKCE challenge
 * resolves (design.md D8).
 */
function startInteractive(
  scope: Scope,
  returnRoute: string,
  expectedUlid?: string,
): Promise<StepUpOutcome> {
  const verifier = oauth.generateRandomCodeVerifier();
  const state = oauth.generateRandomState();
  const pending: PendingFlow = { verifier, state, returnRoute };
  if (expectedUlid !== undefined) pending.expectedUlid = expectedUlid;
  const popup = window.open("", "tazavera-auth", "popup");
  let outcome: Promise<StepUpOutcome>;
  if (popup) {
    holdFlow(pending);
    outcome = new Promise((resolve) => listenToPopup(popup, pending, resolve));
  } else {
    saveFlow(pending);
    outcome = new Promise(() => {});
  }
  void oauth.calculatePKCECodeChallenge(verifier).then((challenge) => {
    const url = authorizeUrl(scope, state, challenge);
    if (popup) {
      popup.location.assign(url);
    } else {
      window.location.assign(url);
    }
  });
  return outcome;
}

/**
 * The opener's half of design.md D10: it accepts one message, only from the
 * front's origin and from the popup it opened, and completes the flow there
 * without navigating or reloading — the code exchanged with the verifier held
 * in memory, the marker set and the session settled, so after a step-up the
 * new token replaces the previous one. An error or a `state` mismatch takes the
 * D4 error path: marker removed and the session `anonymous`, with no text.
 *
 * A popup closed before completing ends the flow the same way design.md D10
 * states it: the in-memory flow data is discarded, the session stays as it was
 * (still `anonymous` after a sign in, unchanged after a step-up) and no
 * message is shown. Retrying is a new click.
 */
function listenToPopup(
  popup: Window,
  pending: PendingFlow,
  resolve: (outcome: StepUpOutcome) => void,
): void {
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== appUrl() || event.source !== popup) return;
    stop();
    void completePopup(event.data, pending).then(resolve);
  };
  const timer = window.setInterval(() => {
    if (!popup.closed) return;
    stop();
    releaseFlow();
    resolve("cancelled");
  }, 250);
  const stop = (): void => {
    window.removeEventListener("message", onMessage);
    window.clearInterval(timer);
  };
  window.addEventListener("message", onMessage);
}

async function completePopup(
  data: unknown,
  pending: PendingFlow,
): Promise<StepUpOutcome> {
  releaseFlow();
  const { code, state, error } = (data ?? {}) as {
    code?: unknown;
    state?: unknown;
    error?: unknown;
  };
  if (typeof code === "string" && error === undefined && state === pending.state) {
    // A failed exchange takes the error path (design.md D5).
    const settled = await settleTokens(code, pending).catch(() => null);
    if (settled === true) {
      setMarker();
      await seam?.authenticated();
      return "granted";
    }
    // Another user's step-up leaves the previous session as it was
    // (secure-step-up design.md D3).
    if (settled === false) return "other-account";
  }
  removeMarker();
  seam?.anonymous();
  return "failed";
}

/**
 * Silent re-authentication (design.md D5): the full-page flow of design.md D3
 * and D4 with `prompt=none`, so the API answers without showing its login. The
 * return route is the route the user is on.
 */
export function startSilent(returnRoute: string): void {
  const verifier = oauth.generateRandomCodeVerifier();
  const state = oauth.generateRandomState();
  saveFlow({ verifier, state, returnRoute });
  void oauth
    .calculatePKCECodeChallenge(verifier)
    .then((challenge) => {
      window.location.assign(authorizeUrl("profile:read", state, challenge, "none"));
    })
    .catch(() => {
      // The request cannot start, so the restore fails for this reason too:
      // the user continues as anonymous with no sign-in page and no error
      // shown (spec: "Silent re-authentication").
      clearFlow();
      removeMarker();
      seam?.anonymous();
    });
}

/** The authorization request of design.md D5. */
function authorizeUrl(
  scope: Scope,
  state: string,
  challenge: string,
  prompt?: "none",
): string {
  const url = new URL(`${apiUrl()}/oauth/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", `${appUrl()}/callback`);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("theme", readTheme(document.cookie));
  url.searchParams.set("lang", activeLang());
  if (prompt !== undefined) {
    url.searchParams.set("prompt", prompt);
  }
  return url.toString();
}

/** The opener window, when it belongs to the front (design.md D4 popup mode). */
function frontOpener(): Window | null {
  const opener = window.opener;
  if (!opener) return null;
  try {
    return opener.location.origin === appUrl() ? opener : null;
  } catch {
    return null;
  }
}

/** `lang` is the locale of the route that starts the flow (design.md D5). */
function activeLang(): Locale {
  return localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE;
}

/** The first value of a query parameter that may repeat. */
function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** `{NEXT_PUBLIC_API_URL}`, read per call like every env value here. */
function apiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

/** `{NEXT_PUBLIC_APP_URL}` — the front's origin (design.md D4). */
function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}
