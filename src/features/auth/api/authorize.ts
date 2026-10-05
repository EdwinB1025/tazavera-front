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
import { exchangeCode } from "@/shared/api";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type Locale,
} from "@/shared/config/locales";
import { readTheme } from "@/shared/lib/theme";
import { clearFlow, holdFlow, readFlow, removeMarker, saveFlow, setMarker } from "../model/flow";

/** The scopes the authorization page is asked for (design.md D5). */
type Scope = "profile:read" | "profile:write";

/** The callback's query parameters (design.md D1). */
export type CallbackParams = Record<string, string | string[] | undefined>;

/** The completion has run in this page load (design.md D4 idempotency). */
let handled = false;

/** Starts sign in; the return route defaults to the route the user is on. */
export function signIn(returnRoute?: string): void {
  startInteractive("profile:read", returnRoute ?? window.location.pathname);
}

/** Step-up: forces a fresh sign in requesting `profile:write`. */
export function requestProfileWrite(returnRoute: string): void {
  startInteractive("profile:write", returnRoute);
}

/**
 * Completes or forwards the authorization result at `/callback` (design.md
 * D4): with an opener of the front's origin the result is posted to the front's
 * origin and the window closes itself, without one the flow completes here —
 * exchange, flow data deleted, marker set or removed — and the return route
 * opens through client-side navigation, never a full page load. Runs at most
 * once per page load: the code is single-use (design.md D4 idempotency).
 */
export async function completeCallback(params: CallbackParams): Promise<void> {
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
  const returnRoute = pending?.returnRoute ?? `/${DEFAULT_LOCALE}`;
  if (code !== undefined && error === undefined && pending !== null && state === pending.state) {
    try {
      await exchangeCode(code, pending.verifier);
      clearFlow();
      setMarker();
    } catch {
      // A failed exchange takes the error path (design.md D5).
      clearFlow();
      removeMarker();
    }
  } else {
    clearFlow();
    removeMarker();
  }

  window.history.replaceState(null, "", window.location.pathname);
  window.history.pushState(null, "", returnRoute);
}

/**
 * The popup start of design.md D10 with the full-page fallback: the popup opens
 * synchronously within the click (a popup opened outside the click would be
 * blocked), and the authorization request starts once the PKCE challenge
 * resolves (design.md D8).
 */
function startInteractive(scope: Scope, returnRoute: string): void {
  const verifier = oauth.generateRandomCodeVerifier();
  const state = oauth.generateRandomState();
  const pending = { verifier, state, returnRoute };
  const popup = window.open("", "tazavera-auth", "popup");
  if (popup) {
    holdFlow(pending);
  } else {
    saveFlow(pending);
  }
  void oauth.calculatePKCECodeChallenge(verifier).then((challenge) => {
    const url = authorizeUrl(scope, state, challenge);
    if (popup) {
      popup.location.assign(url);
    } else {
      window.location.assign(url);
    }
  });
}

/** The authorization request of design.md D5. */
function authorizeUrl(scope: Scope, state: string, challenge: string): string {
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
  const segment = window.location.pathname.split("/")[1] ?? "";
  return isSupportedLocale(segment) ? segment : DEFAULT_LOCALE;
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
