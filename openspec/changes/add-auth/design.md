# Design

## Context

See `proposal.md` — Why, and `docs/design/add-auth/design-summary.md`, which settles the product decisions (the flow, the storage posture, the error presentation). This document works out the implementation and records what that left open. The constraints that shape the approach:

- `add-app-shell` is built in parallel and owns the surfaces this change consumes: `src/shared/api/index.ts` (its design.md D4 defines `Session`, `SessionUser` and `UserRole` there), `src/shared/lib/theme.ts` (the theme cookie), `src/shared/lib/i18n/` (the message mechanism of its D10) and `proxy.ts` (whose matcher already excludes `/callback`). This change imports all of it and never redefines it; `feature/add-app-shell` is merged into `feature/add-auth` before apply.
- `contracts/openapi.yaml` is not touched. `/oauth/authorize` and `/oauth/token` appear only in the contract's `bearerAuth` security scheme and are intentionally absent from its paths, and `theme`, `lang` and `prompt` are web parameters of the API that will never appear there (product-owner decision).
- Next 16 facts taken from `node_modules/next/dist/docs/`: a `page` file renders a route (`01-app/01-getting-started/03-layouts-and-pages.md`); a Server Component page can read `searchParams` and pass them as props into a Client Component, while `useSearchParams` is the client-side alternative and needs a Suspense boundary; state, effects and browser APIs require `"use client"`, and everything a client module imports joins the client bundle (`01-app/01-getting-started/05-server-and-client-components.md`).
- The three environment variables of the design summary — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OAUTH_CLIENT_ID`, `NEXT_PUBLIC_APP_URL` — are read from the environment; no configuration file is created. The redirect URI is `{NEXT_PUBLIC_APP_URL}/callback`.

## Goals / Non-Goals

**Goals:**

- The session contract `add-app-shell`, `add-landing` and `add-user-account` consume, with its three states and the profile.
- One Authorization Code + PKCE flow with silent re-authentication and refresh, implemented to OAuth 2.0 Security BCP.
- The security posture of the design summary: no credential in browser storage, flow data only while a flow is pending.
- The smallest possible seam into `add-app-shell`: one expression in `src/app/shell/AppShell.tsx` changes.

**Non-Goals:**

- Any UI beyond the callback's loading state. The header, the menus and their texts belong to `add-app-shell`.
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

`Session`, `SessionUser` and `UserRole` are the types `add-app-shell` defines in `src/shared/api/index.ts` (its design.md D4); this change imports them from `@/shared/api` and never redefines them. The session state is browser state, so the hook and its store sit behind a `"use client"` boundary. `AppShell.tsx`'s single session expression — `add-app-shell`'s D3 seam, today the anonymous constant — calls `useSession()`, and the header and sidebar keep receiving the session as input exactly as `add-app-shell` designed them.

Alternative considered: a React context provider wrapping the shell. Rejected: the session has exactly one consumer (`AppShell.tsx`) and the callback screen; a module store and a hook are enough, and no provider has to be mounted anywhere.

### D2 — The seam between the session module and the API client

Feature-Sliced Design forbids `src/shared/api` from importing `src/features/auth`, yet the client must attach the token, refresh on a `401`, and start re-authentication when refresh fails (design summary §1). The dependency is inverted: `src/shared/api` exposes a small configuration surface — access to the current tokens, a refresh call, and what to do when nothing can recover the session — and `src/features/auth` fills it once when it initializes.

Alternative considered: keeping the token memory in `src/features/auth` and passing a token per call. Rejected: the `401` recovery chain would live above the client that needs it, and every call site would carry auth plumbing.

### D3 — Tokens, flow data and the sign-in marker

- Access token, refresh token and expiry live in module memory inside `src/shared/api` and are never written to any storage (design summary §3).
- The pending-flow record — PKCE verifier, `state` and the return route — lives in `sessionStorage` under one key: written when a flow starts, deleted on every callback outcome (design summary §3: "only for the duration of the flow").
- The sign-in marker — a value carrying no credential, recording only that the user had signed in — lives in `localStorage`. It is set when a sign-in completes and removed on sign out and on every callback error (design summary §4).

`localStorage` over `sessionStorage` for the marker: the design summary deliberately scopes the flow data to "the duration of the flow" and describes the marker only as "stored in the browser", and silent restoration must survive a browser restart to match "had a session". A session-scoped marker would end silent restoration when the tab closes and force a manual sign-in the summary never asks for. The cost is listed under Risks.

### D4 — `/callback`: route, screen and outcomes

`app/callback/page.tsx` (route file, FSD layer `app`) is a thin Server Component that reads `searchParams` and passes them to the screen — the Next 16 `searchParams` prop, which keeps the query handling testable and avoids `useSearchParams` with its Suspense requirement. The screen is `src/pages/callback/ui/CallbackScreen.tsx` (FSD layer `pages`, `"use client"`): it runs the outcome through `src/features/auth` and renders the loading indicator of D6. The route sits outside the locale prefix, where `add-app-shell`'s `proxy.ts` matcher already leaves it alone and the root layout renders it.

Outcomes (design summary §3 and §4):

| Callback receives | Handling | The user lands at |
|---|---|---|
| `code` with a matching `state` | Exchange the code, delete the flow data, set the marker, authenticate | The return route, authenticated |
| `error` (`login_required`, `access_denied`, any other) | Delete the flow data, remove the marker | The return route, anonymous |
| A `state` mismatch, or nothing that belongs to a pending flow | Same as an error; with no pending flow there is no return route | The return route as anonymous, or the root of the default locale |

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
| Response `200` | `{ "access_token": string, "refresh_token": string, "expires_in": number }` (the fields the contract's security scheme names; RFC 6749 §5.1) |
| Errors | JSON body with `error` and `error_description` (RFC 6749 §5.2: `invalid_grant`, `invalid_request`, `invalid_client`, `unauthorized_client`, `invalid_scope`) |
| Presented to the user | Never. A failed exchange or refresh takes the D4 error path or drops the session to anonymous; no message and no error page |

**Error presentation in summary.** No API error is ever rendered. The design summary §5 fixes the two visible behaviours: the session settles to `anonymous` and `/callback` shows only its loading indicator. The shared card is not used by this change, so the card field-mapping rule does not apply; and this change renders no user data — the profile fields reach consumers through the session contract and are mapped by `add-app-shell` (its design.md D5).

### D6 — The loading indicator and its text

The callback renders one status region carrying "Completing sign in…" and nothing else — never the API's error text, whatever the outcome (design summary §5, spec "Return through the callback"). The text comes from a new message area, per `add-app-shell`'s D10 ("each later change adds its own area file and touches no other change's catalog"): `messages/es/auth.json`, `messages/en/auth.json`, `messages/ca/auth.json`, one key `callback.status`:

| Locale | Text |
|---|---|
| `es` | `Completando el inicio de sesión…` |
| `en` | `Completing sign in…` |
| `ca` | `Completant l'inici de sessió…` |

The screen loads the catalog through `src/shared/lib/i18n/messages.ts` and passes the text down as a prop like every other screen. `/callback` carries no locale in its URL, so the text follows the locale of the pending flow's return route and falls back to the default locale when there is no pending flow (product-owner decision during propose).

### D7 — Derived and UI-specific types

`src/shared/api/schema.ts` declares no named schemas, and the two OAuth endpoints are absent from it. Before any component, the first task group defines:

```ts
/** 200 of POST /oauth/token (RFC 6749 §5.1; the fields the contract's security scheme names). Kept inside `src/shared/api`. */
type TokenGrant = {
  access_token: string;
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

No discovery request is made: the two endpoints are configuration (the design summary names them), and the library accepts a hand-built authorization-server description.

### D9 — Files created or modified

Next.js route files go in the root `app/` folder and import their view from `src/`; tests live beside the file they test.

**Created**

| Path | FSD layer | Holds |
|---|---|---|
| `app/callback/page.tsx` | `app` | Route file: reads `searchParams`, renders the callback screen |
| `src/pages/callback/index.ts` | `pages` | Public API of the callback screen |
| `src/pages/callback/ui/CallbackScreen.tsx` | `pages` | `"use client"`: runs the outcome (D4), renders the loading indicator |
| `src/pages/callback/ui/CallbackScreen.test.tsx` | `pages` | The three outcomes and the announced status text |
| `src/features/auth/index.ts` | `features` | Public API: `useSession`, `signIn`, `signOut`, `requestProfileWrite` |
| `src/features/auth/model/session.ts` | `features` | The `Session` store and `useSession` |
| `src/features/auth/model/session.test.ts` | `features` | The three states and their transitions |
| `src/features/auth/model/flow.ts` | `features` | The pending-flow record (`sessionStorage`) and the sign-in marker (`localStorage`) |
| `src/features/auth/model/flow.test.ts` | `features` | Flow-data lifetime and marker rules |
| `src/features/auth/api/authorize.ts` | `features` | Building the authorization request, starting flows, completing them at the callback |
| `src/features/auth/api/authorize.test.ts` | `features` | Redirect parameters, outcome handling, return routes |
| `src/shared/api/client.ts` | `shared` | The request client: base URL, Bearer attach, `401` recovery chain |
| `src/shared/api/client.test.ts` | `shared` | Authenticated, public and recovery behaviour |
| `src/shared/api/tokens.ts` | `shared` | Token memory and the `oauth4webapi` grant calls (exchange, refresh) |
| `src/shared/api/tokens.test.ts` | `shared` | Grant success and error shapes, memory-only storage |
| `messages/es/auth.json` | `app` | Spanish text of the callback status |
| `messages/en/auth.json` | `app` | English text of the callback status |
| `messages/ca/auth.json` | `app` | Catalan text of the callback status |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/api/index.ts` | `shared` | Export the request client and token functions; `Session`, `SessionUser` and `UserRole` keep being defined here by `add-app-shell` and are only imported by this change |
| `src/app/shell/AppShell.tsx` | `app` | The single expression that supplies the session now reads `useSession()` from `@/features/auth`; no other line changes |

`src/shared/api/schema.ts` and `contracts/openapi.yaml` are not modified.

## Risks / Trade-offs

- **This change cannot compile before `feature/add-app-shell` is merged in.** Its `src/shared/api/index.ts`, `src/shared/lib/theme.ts`, `src/shared/lib/i18n/`, `proxy.ts` and `AppShell.tsx` are the surfaces this change uses. → The product owner merges before apply (stated during propose); the first task verifies the imported contract resolves before any feature work, so a missing merge fails immediately and loudly.
- **A declined step-up drops the session to anonymous.** The design summary §3 sends every callback error to §4, which returns "as anonymous" and removes the marker — so a user who declines the write sign in loses the read session too and must sign in again. → Implemented exactly as written and flagged to the product owner in `## Propose status` and the handoff, in case §4 was meant to cover silent re-authentication only.
- **The sign-in marker in `localStorage` outlives the browser session.** On a shared machine, the marker survives the browser closing until a sign-out or a failed silent restore removes it. → It carries no credential (design summary §4); its worst case is one silent `prompt=none` round trip that lands anonymous and removes it.
- **An access token can expire between the check and its use.** → The settled `401` recovery chain (refresh → silent re-authentication → anonymous) turns the race into one retried request; no user-visible effect.
- **`AppShell.tsx` is touched by both changes.** → Confined to the single expression `add-app-shell`'s D3 already reserved for it.
- **The status text is the only copy this change introduces, in three languages.** → The wording is proposed in D6 and confirmed by the product owner's decision; it can still be corrected in artifact review without touching any behaviour.

## Migration Plan

No data and no front-end behaviour to migrate; the change only adds the session. Deployment order and configuration:

1. `feature/add-app-shell` is merged into `feature/add-auth` before apply (its contract files are prerequisites; see the first risk).
2. The API must have the OAuth client registered with id `NEXT_PUBLIC_OAUTH_CLIENT_ID` and `{NEXT_PUBLIC_APP_URL}/callback` as its redirect URI; the three `NEXT_PUBLIC_*` variables are provided per environment.
3. Rollback is reverting the change: the shell falls back to its anonymous session constant, and nothing outside the front end depends on `/callback`.

## Open Questions

None.
