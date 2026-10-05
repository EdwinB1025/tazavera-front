# Proposal

## Why

The application cannot sign anyone in. The API owns the login (OAuth 2.0 with Laravel Passport), but the front end has no session: nothing starts the authorization, nothing completes it on return, and no request carries a token. Every change that needs the authenticated user — the signed-in header of `add-app-shell`, `add-user-account` and the management screens — sits behind this contract, and `add-app-shell` already renders against it. This change provides the session contract once.

## What Changes

- **Sign in (Authorization Code + PKCE) in a popup.** On the user's click the application opens the API's authorization page (`/oauth/authorize`) with PKCE (S256) in a popup window, so the route the user is on and any input typed on it stay as they are. The popup returns through `/callback`, which forwards the result to the application; the application exchanges the code at `/oauth/token` and completes sign in on the route where it started. When no popup can open, sign in falls back to a full-page redirect that keeps the return destination.
- **Session state.** A session that resolves to `loading`, `anonymous` or `authenticated`, carrying the profile of `GET /user` (`data.ulid`, `data.name`, `data.surname`, `data.email`, `data.role`) to its consumers.
- **Silent re-authentication.** When the application loads and the user had signed in before, it restores the session without showing the API's login (`prompt=none`); when that fails, the user continues as anonymous with no error shown.
- **Tokens in memory with automatic refresh.** Access and refresh tokens live in memory only and never in browser storage; the API client refreshes before expiry or on a `401`, and a `401` that cannot be refreshed falls back to re-authentication and then to anonymous.
- **Sign out.** `POST /logout` revokes all the user's tokens and ends their API web sessions; the local session and the sign-in marker are cleared and the user returns to the root of the active locale.
- **Step-up to the write scope.** Requesting `profile:write` forces a fresh sign in on the API's login in the same popup flow and returns to the route that asked for it, with its typed input intact.
- **API client.** `src/shared/api` grows the request client around `NEXT_PUBLIC_API_URL`: Bearer token when there is a session, refresh and re-authentication on `401`, and public access without a session.
- **Response headers.** `/callback` carries a Content-Security-Policy that allows only the page's own scripts and the API origin in `connect-src`, and every document response of the application carries `Cross-Origin-Opener-Policy: same-origin-allow-popups` except `/callback`, which carries none — a `/callback` with COOP would be severed from its opener after returning from the API origin.

## Capabilities

### New Capabilities

- `auth`: the user session — signing in through the API's authorization page and back through the callback, the session states and the profile they carry, silent re-authentication, sign out, and the step-up to the write scope.

### Modified Capabilities

- `app-shell`: gains the `Cross-Origin-Opener-Policy` requirement (in this change's `specs/app-shell/spec.md` delta) — every document response except the callback route carries `same-origin-allow-popups` — delivered by the response-header policy the capability already owns. `theming`, `base-controls` and `form-fields` gain no requirement from this change.

## Out of Scope (non-goals)

- **Header and menus** (`add-app-shell`): the "Sign in" action and the user menu entries that trigger these flows belong to the shell.
- **Registration and profile settings** (`add-user-account`).
- **The API's own web pages**: the login, 2FA and security pages already live in the API and are not rebuilt here.
- **Any grant other than Authorization Code + PKCE and the refresh grant** (no password grant).
- **Any change to `contracts/openapi.yaml`, `src/shared/api/schema.ts`, or the shell's layout** beyond the single expression that supplies the session.
- **Management content and the forum** (later changes).

## Impact

- **Code (all under `src/` unless stated):** New — `app/callback/page.tsx` (route file, FSD layer `app`), the callback screen under `src/pages/callback/` (FSD layer `pages`), the session module under `src/features/auth/` (FSD layer `features`), the request client and token handling under `src/shared/api/` (FSD layer `shared`), and tests beside the files they test. Modified — `src/shared/api/index.ts` (exports the client; `Session`, `SessionUser` and `UserRole` are imported from `@/shared/api`, never redefined), `src/app/shell/AppShell.tsx` (the single expression that supplies the session), and `proxy.ts` with `proxy.test.ts` (owned by `add-app-shell`, changed here with the product owner's approval): `/callback` joins the per-request nonce Content-Security-Policy with the API origin in `connect-src`, and every document response except `/callback` gains `Cross-Origin-Opener-Policy: same-origin-allow-popups` (design.md D11).
- **Dependencies:** One open decision (see `design.md`): `oauth4webapi` (v3.8.x, MIT, no dependencies) as the OAuth client, or building the flow in-house on Web Crypto. Nothing is installed until the product owner approves; no dependency is removed or upgraded.
- **API:** Consumes `GET /user` and `POST /logout` from `contracts/openapi.yaml`, and `/oauth/authorize` and `/oauth/token`, which the contract describes only in its `bearerAuth` security scheme and intentionally omits from its paths. `src/shared/api/schema.ts` is not edited.
- **Existing behavior:** `theming`, `base-controls` and `form-fields` are unchanged. The authorization redirect leaves the application and is rendered natively, exactly as `base-controls` already requires for external navigation. Until this change lands, `add-app-shell` renders its anonymous shell as designed.
