# Design

## Context

See `proposal.md` — Why, and `docs/design/add-auth/design-summary.md`, which settles the product decisions (the flow, the storage posture, the error presentation). This document works out the implementation and records what that left open. The constraints that shape the approach:

- `add-app-shell` is built in parallel and owns the surfaces this change consumes: `src/shared/api/index.ts` (its design.md D4 defines `Session`, `SessionUser` and `UserRole` there), `src/shared/lib/theme.ts` (the theme cookie), `src/shared/lib/i18n/` (the message mechanism of its D10) and `proxy.ts` (whose matcher already excludes `/callback`). This change imports all of it and never redefines it, with one exception: `proxy.ts` and `proxy.test.ts` are extended for the headers of D11, which the product owner approved (review round 1, handoff Q6); `feature/add-app-shell` is merged into `feature/add-auth` before apply.
- `contracts/openapi.yaml` is not touched. `/oauth/authorize` and `/oauth/token` appear only in the contract's `bearerAuth` security scheme and are intentionally absent from its paths, and `theme`, `lang` and `prompt` are web parameters of the API that will never appear there (product-owner decision).
- Next 16 facts taken from `node_modules/next/dist/docs/`: a `page` file renders a route (`01-app/01-getting-started/03-layouts-and-pages.md`); a Server Component page can read `searchParams` and pass them as props into a Client Component, while `useSearchParams` is the client-side alternative and needs a Suspense boundary; state, effects and browser APIs require `"use client"`, and everything a client module imports joins the client bundle (`01-app/01-getting-started/05-server-and-client-components.md`).
- The three environment variables of the design summary — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OAUTH_CLIENT_ID`, `NEXT_PUBLIC_APP_URL` — are read from the environment; no configuration file is created. The redirect URI is `{NEXT_PUBLIC_APP_URL}/callback`.

## Goals / Non-Goals

**Goals:**

- The session contract `add-app-shell`, `add-landing` and `add-user-account` consume, with its three states and the profile.
- One Authorization Code + PKCE flow with silent re-authentication and refresh, implemented to OAuth 2.0 Security BCP.
- The security posture of the design summary: no credential in browser storage, flow data only while a flow is pending.
- The smallest possible seam into `add-app-shell`: `src/app/shell/AppShell.tsx` keeps resolving the catalog texts and delegates the session to one `"use client"` component beside it (review round 2, correction 1).

**Non-Goals:**

- Any UI work. `/callback` renders no text (D6); the header, the menus and their texts belong to `add-app-shell`, with one exception (review round 3): this change gives `ShellChrome`'s "Sign in" and "Sign out" handlers their calls to `signIn` and `signOut` of `@/features/auth` (D1), since no task of `add-app-shell` wires them.
- The API's login, 2FA and security pages (Fortify/Passport web pages).
- A server-side session in the front end; session state lives in the browser tab's memory.
- Any edit to `contracts/openapi.yaml` or `src/shared/api/schema.ts`.

## Decisions

### D1 — Session module and its public API

`src/features/auth` is the only owner of auth state. Its public entry (`index.ts`) exposes the session and the three actions of the design summary §1:

```ts
import type { Session } from "@/shared/api";

/** The current session: loading, anonymous, or authenticated with the user. */
useSession(): Session;

/** Starts sign in; the return route defaults to the route the user is on. */
signIn(returnRoute?: string): void;

/** Signs out; lands on the root of the active locale. */
signOut(): void;

/** Step-up: forces a fresh sign in requesting `profile:write`, returning to `returnRoute`. */
requestProfileWrite(returnRoute: string): void;
```

The public entry also exports `completeCallback` — the one function `/callback` calls to complete or forward the authorization result (D4 and D10), taking the callback's query parameters — so `src/pages/callback` imports only through `@/features/auth` and never deep-imports (review round 1, correction 6). Sign in and step-up open a popup window (D10); silent re-authentication stays a full-page flow.

`Session`, `SessionUser` and `UserRole` are the types `add-app-shell` defines in `src/shared/api/index.ts` (its design.md D4); this change imports them from `@/shared/api` and never redefines them. The session state is browser state, so the hook and its store sit behind a `"use client"` boundary — and `AppShell.tsx` is a Server Component (it resolves the catalog through `getMessages`, which reads `node:fs`), so the seam is one `"use client"` component beside it in `src/app/shell`: `SessionShell` in `src/app/shell/SessionShell.tsx`, the name the round leaves to the architect and settled here (review round 2, correction 1). `AppShell.tsx` stays a Server Component: it resolves the catalog texts and passes them to `SessionShell`, which calls `useSession()` and renders `ShellChrome` and the sidebar region — the sidebar region choice moves with the session into `SessionShell` — while `ShellChrome.tsx` and `AppSidebar.tsx` keep receiving the session as input exactly as `add-app-shell` designed them. The rendered layout is unchanged (spec "Shell layout and main area"). These `app-shell` files are changed by this change under the commit scope `auth`, as `proxy.ts` is (handoff Q6). The `session?` prop of `AppShell` stays as an explicit override (review round 2, correction 2): `SessionShell` calls `useSession()` unconditionally and uses `session ?? <hook value>`, `AppShell`'s props are unchanged, and the `AppShell.test.tsx` cases that pass a literal session keep passing it unchanged.

The header actions are wired by this change (review round 3): the header's "Sign in" calls `signIn` with the route the user is on and the user menu's "Sign out" calls `signOut`, both from the `@/features/auth` public API above and synchronously within the user's click (the popup of D10 must open inside it). The mechanism the round leaves to the architect is settled as calling the two functions in `ShellChrome` — the client chrome that owns the header's interactions and already forwards `onSignIn`/`onSignOut` into `AppHeader` — rather than passing them down from `SessionShell`, which would put a prop seam in front of the same import and leave the route computation where it already is. `ShellChrome.tsx` therefore changes in exactly its two empty handlers and their import, and `AppSidebar.tsx` is not modified.

Session start is idempotent: a module-level guard makes the startup silent check run at most once per page load, so effects running twice — Strict Mode is on by default in the App Router and remounts in development (`01-app/03-api-reference/05-config/01-next-config-js/reactStrictMode.md`) — never start two authorization requests.

Alternative considered: a React context provider wrapping the shell. Rejected: the session has exactly one consumer (`SessionShell`) and the callback screen; a module store and a hook are enough, and no provider has to be mounted anywhere.

### D2 — The seam between the session module and the API client

Feature-Sliced Design forbids `src/shared/api` from importing `src/features/auth`, yet the client must attach the token, refresh on a `401`, and start re-authentication when refresh fails (design summary §1). The dependency is inverted: `src/shared/api` exposes a small configuration surface — access to the current tokens, a refresh call, and what to do when nothing can recover the session — and `src/features/auth` fills it once when it initializes.

The `401` recovery chain is single-flight: concurrent requests that fail with `401` share one in-flight refresh and all retry with its new token, and no second refresh starts while one is pending — the API is expected to rotate the refresh token on use (Passport default; to be confirmed against the API's Passport version), so a second grant with the same token would fail and fall through to re-authentication in the middle of normal use.

Alternative considered: keeping the token memory in `src/features/auth` and passing a token per call. Rejected: the `401` recovery chain would live above the client that needs it, and every call site would carry auth plumbing.

### D3 — Tokens, flow data and the sign-in marker

- Access token, refresh token and expiry live in module memory and are reachable only inside `src/shared/api/tokens.ts`: they are never assigned to `window`, to React state or to any browser storage (design summary §3; review round 1, correction 9). A successful refresh replaces the whole pair and the previous refresh token is never reused (rotation on use, D2); concurrent recoveries share the single in-flight refresh.
- The pending-flow record — PKCE verifier, `state` and the return route — lives in `sessionStorage` under one key for a full-page flow: written when the flow starts as a redirect (the silent restore of D5 and the popup-blocked fallback of D10), deleted on every callback outcome (design summary §3: "only for the duration of the flow"). A popup flow's verifier and `state` live only in the opener's memory and never reach `sessionStorage` or `localStorage` (review round 1, corrections 2 and 3).
- The sign-in marker — a value carrying no credential, recording only that the user had signed in — lives in `localStorage`. It is set when a sign-in completes and removed on sign out and on every callback error (design summary §4).

`localStorage` over `sessionStorage` for the marker: the design summary deliberately scopes the flow data to "the duration of the flow" and describes the marker only as "stored in the browser", and silent restoration must survive a browser restart to match "had a session". A session-scoped marker would end silent restoration when the tab closes and force a manual sign-in the summary never asks for. The cost is listed under Risks.

### D4 — `/callback`: route, screen and outcomes

`app/callback/page.tsx` (route file, FSD layer `app`) is a thin Server Component that reads `searchParams` and passes them to the screen — the Next 16 `searchParams` prop, which keeps the query handling testable and avoids `useSearchParams` with its Suspense requirement. The screen is `src/pages/callback/ui/CallbackScreen.tsx` (FSD layer `pages`, `"use client"`): it completes or forwards the outcome through `src/features/auth` (D1) and renders no text (D6). The route sits outside the locale prefix and outside the locale redirect, where `add-app-shell`'s `proxy.ts` matcher already leaves it alone and the root layout renders it.

The screen has two modes (review round 1, correction 5):

- **Popup mode** — it has an opener of the front's origin: it posts `{ code, state }` or `{ error, state }` to the front's origin only and closes itself. It performs no exchange; the opener completes the flow (D10).
- **Redirect mode** — no opener: the silent restore of D5 and the popup-blocked fallback of D10 complete here. The outcome table below applies, with two additions: the history entry is replaced so the code does not remain in the URL, and the return route opens through client-side navigation, never a full page load — the in-memory tokens must survive.

Outcomes (design summary §3 and §4):

| Callback receives | Handling | The user lands at |
|---|---|---|
| `code` with a matching `state` | Exchange the code, delete the flow data, set the marker, authenticate | The return route, authenticated |
| `error` (`login_required`, `access_denied`, any other) | Delete the flow data, remove the marker | The return route, anonymous |
| A `state` mismatch, or nothing that belongs to a pending flow | Same as an error; with no pending flow there is no return route | The return route as anonymous, or the root of the default locale |

The callback completion is idempotent: a module-level guard makes it run at most once per page load (and the startup silent check likewise, D1), so effects running twice never exchange the code twice — the code is single-use, and a second exchange would fail with `invalid_grant`, take the error path and drop the user to anonymous right after signing in — and never start two authorization requests.

### D5 — API endpoints consumed

**`GET {NEXT_PUBLIC_API_URL}/user`** — issued by the session module after the tokens settle.

| | |
|---|---|
| Method and path | `GET /user` (`operations["getTheAuthenticatedUser"]` in `src/shared/api/schema.ts`) |
| Auth | `Authorization: Bearer <access token>`; scope `profile:read` or `profile:write` |
| Request | No parameters, no body |
| Response `200` | `{ "data": { "ulid": string, "name": string, "surname": string, "email": string, "role": string } }` |
| Errors | `401` when the token is missing, expired past refresh, or lacks the scope |
| Presented to the user | Never. A `401` enters the client's recovery chain (refresh → silent re-authentication → anonymous); no message and no error page |

**`POST {NEXT_PUBLIC_API_URL}/logout`** — issued on sign out.

| | |
|---|---|
| Method and path | `POST /logout` (`operations["logOut"]`) |
| Auth | `Authorization: Bearer <access token>`; scope `profile:read` or `profile:write` |
| Request | No parameters, no body |
| Response `200` | `{ "message": string }` (revokes all the user's tokens and ends their API web sessions server-side) |
| Errors | `401` when the token is already dead; any transport failure |
| Presented to the user | Never. The local sign-out completes regardless: the session becomes anonymous and the user returns to the root of the active locale |

**`GET {NEXT_PUBLIC_API_URL}/oauth/authorize`** — the API's authorization page (only in the contract's `bearerAuth` security scheme).

| | |
|---|---|
| Method and path | `GET /oauth/authorize` |
| Auth | None (the user authenticates on the API's pages) |
| Request | Query: `response_type=code`, `client_id` (`NEXT_PUBLIC_OAUTH_CLIENT_ID`), `redirect_uri` (`{NEXT_PUBLIC_APP_URL}/callback`), `scope` (`profile:read`, or `profile:write` for step-up), `state`, `code_challenge`, `code_challenge_method=S256`, `theme`, `lang`; plus `prompt=none` for silent re-authentication only |
| Response | A redirect to `redirect_uri` carrying `code` and `state`, or `error` and `error_description` (RFC 6749 §4.1.2.1: `login_required`, `access_denied`, `invalid_scope`, …) |
| Presented to the user | Never. Every error takes the D4 error path: marker removed, return route as anonymous, no text |

`theme` is read from the theme cookie through `src/shared/lib/theme.ts` (owned by `add-app-shell`); this change never reads or writes the cookie itself. `lang` is the locale of the route that starts the flow. Silent re-authentication always requests `profile:read`, never `profile:write` (design summary §4).

**`POST {NEXT_PUBLIC_API_URL}/oauth/token`** — the token endpoint (only in the `bearerAuth` security scheme). Public client: no secret is sent.

| | |
|---|---|
| Method and path | `POST /oauth/token` |
| Auth | None; the public client identifies itself with `client_id` in the body |
| Request | `application/x-www-form-urlencoded`. Code exchange: `grant_type=authorization_code`, `code`, `redirect_uri`, `client_id`, `code_verifier`. Refresh: `grant_type=refresh_token`, `refresh_token`, `client_id` |
| Response `200` | `{ "access_token": string, "token_type": "Bearer", "refresh_token": string, "expires_in": number }` (RFC 6749 §5.1: `token_type` is `Bearer`, verified against the API's `/oauth/token`; the remaining fields are the ones the contract's security scheme names) |
| Errors | JSON body with `error` and `error_description` (RFC 6749 §5.2: `invalid_grant`, `invalid_request`, `invalid_client`, `unauthorized_client`, `invalid_scope`) |
| Presented to the user | Never. A failed exchange or refresh takes the D4 error path or drops the session to anonymous; no message and no error page |

**Error presentation in summary.** No API error is ever rendered. The design summary §5 fixes the two visible behaviours: the session settles to `anonymous` and `/callback` shows only its loading indicator. The shared card is not used by this change, so the card field-mapping rule does not apply; and this change renders no user data — the profile fields reach consumers through the session contract and are mapped by `add-app-shell` (its design.md D5).

### D6 — No text on `/callback` (review round 1, correction 5)

The callback renders no text and no status region: whatever the outcome, the page shows nothing and never the API's error text (design summary §5, spec "Return through the callback"). The earlier decision — one status region carrying "Completing sign in…" from a new `auth` message area — is rescinded: the `messages/{locale}/auth.json` files are not created and `add-app-shell`'s D10 area rule is simply not used by this change. The popup closes within a moment and the redirect mode hands over to client-side navigation (D4), so there is no wait to announce.

### D7 — Derived and UI-specific types

`src/shared/api/schema.ts` declares no named schemas, and the two OAuth endpoints are absent from it. Before any component, the first task group defines:

```ts
/** 200 of POST /oauth/token (RFC 6749 §5.1: `token_type` is `Bearer`, verified against the API's `/oauth/token`). Kept inside `src/shared/api`. */
type TokenGrant = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
};

/** Token error body (RFC 6749 §5.2). Kept inside `src/shared/api`. */
type TokenGrantError = {
  error: string;
  error_description?: string;
};
```

`Session`, `SessionUser` and `UserRole` are imported from `@/shared/api` (D1) and are never redefined here. The pending-flow record of D3 is internal to `src/features/auth` and is defined beside its store. `src/shared/api/schema.ts` is left byte-for-byte untouched.

### D8 — The OAuth client: `oauth4webapi` (approved)

The Authorization Code + PKCE exchange, refresh and response validation are security-sensitive parsing and comparison code that a maintained library is likely to do better than hand-rolled code. Researched during propose (one search, first candidate meeting the criteria):

- **Recommended and approved (product owner, 2026-10-04): `oauth4webapi` v3.8.x** — <https://www.npmjs.com/package/oauth4webapi>, <https://github.com/panva/oauth4webapi>. MIT, zero dependencies, tree-shakeable ESM, actively maintained (3.8.8, updated 2026-09), runtime-agnostic Web APIs with no coupling to React or Next.js. It provides `generateRandomCodeVerifier`, `calculatePKCECodeChallenge` (S256), `validateAuthResponse`, the Authorization Code Grant request and response processing, the refresh grant, and the public-client auth method (`None`). Storage and redirects stay ours, so the posture of D3 is unaffected. It is installed by the build; nothing is installed at propose time.
- **Building it in-house** (Web Crypto for S256, plain requests for the grants): viable and dependency-free, and the fallback if the approval is ever withdrawn. It loses because every security-sensitive detail — constant-time state comparison, error-shape parsing, BCP response checks — becomes ours to write and maintain.
- **Framework auth suites (Auth.js / `next-auth`)**: rejected without deep evaluation — they bring their own cookie-based session model, which contradicts the settled in-memory token posture and this change's ownership of `/callback`.

The challenge timing is settled (review round 1, correction 1 — handoff Q3, option 2): `code_challenge` is computed with the library's asynchronous `calculatePKCECodeChallenge` and the authorization request starts once it resolves, `signIn` keeping its `void` return (D1) so no caller can await it. No synchronous in-house SHA-256 is written.

No discovery request is made: the two endpoints are configuration (the design summary names them), and the library accepts a hand-built authorization-server description.

### D9 — Files created or modified

Next.js route files go in the root `app/` folder and import their view from `src/`; tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `src/app/shell/SessionShell.tsx` | `app` | `"use client"` (D1, review round 2): calls `useSession()`, uses `session ?? <hook value>`, renders `ShellChrome` and the sidebar region; covered through `src/app/shell/AppShell.test.tsx`, so it gets no test file of its own |
| `app/callback/page.tsx` | `app` | Route file: reads `searchParams`, renders the callback screen |
| `src/pages/callback/index.ts` | `pages` | Public API of the callback screen |
| `src/pages/callback/ui/CallbackScreen.tsx` | `pages` | `"use client"`: completes or forwards the outcome's two modes (D4), renders no text |
| `src/pages/callback/ui/CallbackScreen.test.tsx` | `pages` | The two modes, their outcomes and the absence of text |
| `src/features/auth/index.ts` | `features` | Public API: `useSession`, `signIn`, `signOut`, `requestProfileWrite` and the callback entry `completeCallback` (D1) |
| `src/features/auth/model/session.ts` | `features` | The `Session` store and `useSession` |
| `src/features/auth/model/session.test.ts` | `features` | The three states and their transitions |
| `src/features/auth/model/flow.ts` | `features` | The pending-flow record of D3 (a popup flow's data stays in memory) and the sign-in marker (`localStorage`) |
| `src/features/auth/model/flow.test.ts` | `features` | Flow-data lifetime and marker rules |
| `src/features/auth/api/authorize.ts` | `features` | Building the authorization request, starting the popup and redirect flows (D10), completing or forwarding at the callback (D4) |
| `src/features/auth/api/authorize.test.ts` | `features` | Flow parameters, the popup handshake (D10), outcome handling, return routes |
| `src/shared/api/client.ts` | `shared` | The request client: base URL, Bearer attach, `401` recovery chain |
| `src/shared/api/client.test.ts` | `shared` | Authenticated, public and recovery behaviour |
| `src/shared/api/tokens.ts` | `shared` | Token memory and the `oauth4webapi` grant calls (exchange, refresh) |
| `src/shared/api/tokens.test.ts` | `shared` | Grant success and error shapes, memory-only storage |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/api/index.ts` | `shared` | Export the request client and token functions; `Session`, `SessionUser` and `UserRole` keep being defined here by `add-app-shell` and are only imported by this change |
| `src/app/shell/AppShell.tsx` | `app` | Stays a Server Component (D1, review round 2): it resolves the catalog texts and passes them, the `session?` override and the `sidebar` region to `SessionShell`; the session expression and the sidebar region choice move there, and its props are unchanged |
| `src/app/shell/ShellChrome.tsx` | `app` | Review round 3 (D1): `handleSignIn` calls `signIn` with the route the user is on and `handleSignOut` calls `signOut`, both from `@/features/auth`; nothing else in it changes |
| `proxy.ts` | `app` | D11 (owned by `add-app-shell`, changed here with the product owner's approval): `/callback` joins the per-request nonce CSP of its D9 with the API origin in `connect-src` and no COOP, and every response the proxy handles gains COOP `same-origin-allow-popups`; the locale redirect keeps leaving `/callback` alone |
| `proxy.test.ts` | `app` | The `/callback` CSP and COOP cases of D11 (tasks 8.13 and 8.15) |

`src/shared/api/schema.ts` and `contracts/openapi.yaml` are not modified.

### D10 — The popup flow (review round 1, corrections 2–4)

Sign in and step-up open in a popup window; silent re-authentication stays a full-page flow.

- On the user's click, `signIn(returnRoute?)` and `requestProfileWrite(returnRoute)` call `window.open` synchronously within the click — a blank window first, pointed at `{NEXT_PUBLIC_API_URL}/oauth/authorize` with the parameters of D5 once the challenge of D8 resolves. A popup opened outside the click would be blocked as a pop-up.
- The verifier and `state` of a popup flow live only in the opener's memory (D3), never in `sessionStorage` or `localStorage`; the return route is kept for the fallback below.
- The result comes back by `postMessage`: the popup posts `{ code, state }` or `{ error, state }` to the front's origin only (D4, popup mode). The opener accepts a message only when its origin is the front's origin and its source is the popup window it opened; it then checks `state`, exchanges the code with the verifier, keeps the tokens in memory (D3), sets the credential-free marker and ends `authenticated` — after a step-up the new token replaces the previous one. A message from any other origin or window is ignored, and a `state` mismatch takes the D4 error path.
- The opener never navigates and never reloads: the current route and any typed input stay as they are, which is what keeps a filled form's input alive through a step-up.
- Popup blocked (`window.open` returns `null`): the same call falls back to the full-page redirect flow — the flow record in `sessionStorage` with the return route kept (D3), completed at `/callback` in redirect mode (D4) — with no message shown.
- Popup closed before completing: the opener notices the closed window, discards the in-memory flow data and keeps its previous session state — still `anonymous` after a sign in, unchanged after a step-up — with no message. Retrying is a new click.

Alternative considered: the earlier full-page redirect for the interactive flows. Rejected by review round 1: it navigates the route the user is on and loses its typed input. The redirect survives as the fallback and as silent re-authentication.

### D11 — Response headers: the `/callback` CSP and COOP (review round 1, corrections 7 and 8)

End states (fixed by review round 1): document responses of `/callback` carry a Content-Security-Policy that allows only the page's own scripts and, in `connect-src`, the API origin (redirect mode exchanges the code there); `/callback` stays outside the locale redirect; every other front document response carries `Cross-Origin-Opener-Policy: same-origin-allow-popups`; `/callback` carries no COOP, because a `/callback` with COOP would be severed from its opener after returning from the API origin. Where they are specified: the front-wide COOP rule lives in this change's `specs/app-shell/spec.md` delta and the `/callback` policy in `specs/auth/spec.md`, beside `add-app-shell`'s own CSP requirement which already leaves `/callback`'s policy to this change (product owner, handoff Q7).

**Mechanism: extend `proxy.ts`** (settled with the product owner, 2026-10-05 — handoff Q6: `add-auth` changes `proxy.ts` and `proxy.test.ts` in its own tasks). `/callback` joins the proxy's handling and branches from the locale path: it gets the D9 directive list with its own fresh nonce — "own scripts only" needs the per-request nonce of D9 because the framework's inline bootstrap scripts block hydration without it, and redirect mode needs hydration for its client-side navigation — and no COOP. Every response the proxy already handles gains `Cross-Origin-Opener-Policy: same-origin-allow-popups` beside its existing CSP, which is exactly the scope of correction 8: the matcher already excludes `/callback`, and framework and asset paths return before the headers are built (`add-app-shell` D2). Next 16 documents exactly one path that can generate a per-request nonce — the proxy (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`, "Adding a nonce with Proxy").

Alternatives considered: `next.config.ts` `headers()` for both headers — rejected for the CSP half, because the documented "Without Nonces" configuration admits only static values and a static `script-src` that keeps the page working needs `'unsafe-inline'`, which is not "only the page's own scripts"; it remains a fallback for the COOP half alone (a source matching every path but `/callback`), which would split the header policy across two files. The experimental SRI hash path — rejected: experimental, build-time only, and not documented for the framework's inline bootstrap scripts.

**Status: settled.** The product owner answered the ownership question (review round 1, handoff Q6 and Q7): `add-auth` changes `proxy.ts` and `proxy.test.ts` in its own tasks (the commit scope stays `auth` for those tasks), and the front-wide COOP requirement is specified in this change's `app-shell` delta, so `specs/auth/spec.md` keeps only the `/callback` policy. Tasks 8.13–8.16 carry the two headers test first. `docs/backlog.md` R2 and R3 sit on the same seam and stay out of this change.

## Risks / Trade-offs

- **This change cannot compile before `feature/add-app-shell` is merged in.** Its `src/shared/api/index.ts`, `src/shared/lib/theme.ts`, `src/shared/lib/i18n/`, `proxy.ts` and `AppShell.tsx` are the surfaces this change uses. → The product owner merges before apply (stated during propose); the first task verifies the imported contract resolves before any feature work, so a missing merge fails immediately and loudly.
- **A declined step-up drops the session to anonymous.** The design summary §3 sends every callback error to §4, which returns "as anonymous" and removes the marker — so a user who declines the write sign in loses the read session too and must sign in again. → Implemented exactly as written and flagged to the product owner in `## Propose status` and the handoff, in case §4 was meant to cover silent re-authentication only.
- **The sign-in marker in `localStorage` outlives the browser session.** On a shared machine, the marker survives the browser closing until a sign-out or a failed silent restore removes it. → It carries no credential (design summary §4); its worst case is one silent `prompt=none` round trip that lands anonymous and removes it.
- **An access token can expire between the check and its use.** → The settled `401` recovery chain (refresh → silent re-authentication → anonymous) turns the race into one retried request; no user-visible effect.
- **`AppShell.tsx` is touched by both changes.** → Confined to the session seam `add-app-shell`'s D3 reserved: it stays a Server Component resolving the catalog texts and delegates the session and the sidebar region to the new `SessionShell` beside it (review round 2); `ShellChrome.tsx` gains only the two action-handler calls of review round 3 and `AppSidebar.tsx` is not modified.
- **The popup flow depends on the API not severing the window relationship.** If `{NEXT_PUBLIC_API_URL}/oauth/authorize` or `/login` answers with `Cross-Origin-Opener-Policy: same-origin`, the popup is cut off from its opener and the flow of D10 cannot complete. → The string `Cross-Origin-Opener-Policy` appears nowhere in the API codebase (checked in its `app`, `config`, `routes`, `public` and `vendor` folders) and the API is not running locally, so the header could not be confirmed live; the real-browser check (task 8.17) confirms it before archive (review round 1).

## Migration Plan

No data and no front-end behaviour to migrate; the change only adds the session. Deployment order and configuration:

1. `feature/add-app-shell` is merged into `feature/add-auth` before apply (its contract files are prerequisites; see the first risk).
2. The API must have the OAuth client registered with id `NEXT_PUBLIC_OAUTH_CLIENT_ID` and `{NEXT_PUBLIC_APP_URL}/callback` as its redirect URI; the three `NEXT_PUBLIC_*` variables are provided per environment.
3. Rollback is reverting the change: the shell falls back to its anonymous session constant, and nothing outside the front end depends on `/callback`.

## Open Questions

1. **Corrections 7 and 8 — who changes `proxy.ts`?** Answered 2026-10-05 (review round 1, handoff Q6 and Q7): `add-auth` changes `proxy.ts` and `proxy.test.ts` in its own tasks (tasks 8.13–8.16), and the front-wide COOP requirement is specified in this change's `app-shell` delta. Nothing is open.
