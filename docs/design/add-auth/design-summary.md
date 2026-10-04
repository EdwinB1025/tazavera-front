# add-auth — Design summary

Capability: `auth`. Built in parallel with `add-app-shell`; provides the session contract that the header, `add-landing` and `add-user-account` consume.

## 1. Contracts provided

- **Session module** (`src/features/auth`): state (anonymous, loading, authenticated); user from `GET /user` (ulid, name, surname, email, role); sign in (with an optional return route); sign out; request the `profile:write` scope (step-up) returning to a given route.
- **Session types:** `Session`, `SessionUser` and `UserRole` are defined by `add-app-shell` in `src/shared/api/index.ts` (its `design.md` D4); `add-auth` imports them from `@/shared/api` and never redefines them.
- **API client** (`src/shared/api`): base `NEXT_PUBLIC_API_URL`; adds the Bearer token when there is a session; on a 401 tries to refresh and, if that fails, starts re-authentication. Public endpoints work without a session.
- **Configuration:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OAUTH_CLIENT_ID`, `NEXT_PUBLIC_APP_URL` (the `redirect_uri` is `{NEXT_PUBLIC_APP_URL}/callback`).

## 2. Endpoints and parameters

- **REST (in `openapi.yaml`):** `GET /user`, `POST /logout` (revokes all tokens and ends the user's web sessions on the server).
- **OAuth (not in `openapi.yaml`, only described in the security scheme):** `/oauth/authorize` and `/oauth/token`. Their errors are documented in `design.md` following OAuth 2.0: authorize errors return as `error` (and `error_description`) in the redirect query; token errors as JSON with `error` and `error_description`.
- **Web parameters of the API (not in `openapi.yaml`, intentionally):** `theme` and `lang` on `/oauth/authorize` (read by an API web middleware to style and translate its login pages), and `prompt` (standard OIDC, supported by Passport). The `theme` value sent to `/oauth/authorize` comes from the theme cookie owned by `add-app-shell`, read through `src/shared/lib/theme.ts`; `add-auth` does not read or write the cookie itself. `lang` comes from the active route locale.

## 3. Flow (Authorization Code + PKCE)

- **Sign in:** to `/oauth/authorize` with `response_type=code`, `client_id`, `redirect_uri`, `scope=profile:read`, `state`, `code_challenge` (S256), `code_challenge_method=S256`, `theme` and `lang`. `code_verifier`, `state` and the return route are kept in `sessionStorage` only for the duration of the flow.
- **`/callback`** (outside the locale prefix): checks `state`; with `code`, exchanges it at `/oauth/token` (form-urlencoded, `grant_type=authorization_code`, no secret), deletes the flow data and returns to the saved route; with `error`, see section 4.
- **Tokens:** access and refresh tokens only in memory, never in storage. Automatic refresh with `grant_type=refresh_token` before expiry or on a 401.
- **Sign out:** `POST /logout`, memory and the session flag are cleared, return to `/[locale]`.
- **Step-up:** to `/oauth/authorize` with `scope=profile:write`; the API always forces a login for that scope. Returns to the route that asked for it.

## 4. Re-authentication on reload

- On sign in, a non-sensitive "had a session" flag (no token) is stored in the browser; it is removed on sign out.
- When the app loads with no tokens in memory: without the flag, the user stays anonymous with no redirect. With the flag, the app calls `/oauth/authorize` with `prompt=none` and `scope=profile:read` (never `profile:write`).
- `/callback` with `error` (`login_required` or any other): removes the flag and returns to the saved route as anonymous, without showing the login. A `state` mismatch is treated the same way.

## 5. States and errors shown

- While the session is resolving, consumers see the `loading` state (no flash of the signed-out header).
- Token exchange or refresh failure: the session becomes anonymous; no error page.
- `/callback` renders only a loading indicator; it never shows the API's error text.

## 6. Out of scope

Header and menus (`add-app-shell`); registration and profile pages (`add-user-account`); the API's login, 2FA and security pages (already in the API).

## Propose status

- **Change:** `add-auth`
- **Date:** 2026-10-04
- **Validation:** `openspec validate add-auth --strict` — passed ("Change 'add-auth' is valid"); 4/4 artifacts complete (`proposal.md`, `specs/auth/spec.md`, `design.md`, `tasks.md`).
- **Backlog:** no entry is resolved by this change; `docs/backlog.md` holds no candidates.
- **Resolved during propose (with its decision):**
  1. **Session types** (folded into §1 at the product owner's instruction): `Session`, `SessionUser` and `UserRole` are defined by `add-app-shell` in `src/shared/api/index.ts` (its `design.md` D4) and only imported from `@/shared/api`; a guard test fails on any redefinition under `src/`.
  2. **Theme and language on the authorization request** (folded into §2 at the product owner's instruction): `theme` comes from the theme cookie through `src/shared/lib/theme.ts` (owned by `add-app-shell`); `lang` comes from the active route locale.
  3. **OAuth client:** `oauth4webapi` v3.8.x (MIT, zero dependencies) — approved by the product owner. Alternatives (in-house Web Crypto, framework auth suites) are recorded in `design.md` D8.
  4. **The `/callback` loading indicator carries text** — "Completing sign in…" as status text, in a new `auth` message area (`messages/{locale}/auth.json`, key `callback.status`; texts in `design.md` D6) — approved by the product owner. The text follows the locale of the pending flow's return route and falls back to the default locale, since `/callback` has no locale prefix.
  5. **The sign-in marker lives in `localStorage`** (`design.md` D3), on §3/§4's wording distinction: the flow data stays in `sessionStorage` for the flow's duration and the tokens stay in memory only.
  6. **Sign out completes locally even when `POST /logout` fails** (spec "Sign out", scenario "The server cannot be reached"), following §5's failure pattern.
  7. **The seam to `src/shared/api`** (`design.md` D2): the request client is configured by `src/features/auth` at startup, so `shared` never imports `features`.
- **Artifact review 2026-10-04 (applied to the artifacts; `openspec validate add-auth --strict` passed afterwards):**
  1. **Single-flight refresh** — applied to `design.md` D2 and D3 and to task 2.2: concurrent `401`s share one in-flight refresh and all retry with its new token, and no second refresh starts while one is pending (the API is expected to rotate the refresh token on use; to be confirmed against its Passport version).
  2. **Idempotent callback and session start** — applied to `design.md` D1 and D4 and to tasks 3.1 and 4.1: each runs at most once per page load behind a module-level guard, so Strict Mode's double effects never exchange a single-use code twice nor start two authorization requests. Strict Mode is verified on by default in the App Router (Next docs `reactStrictMode.md`: since Next.js 13.5.1, `true` by default with `app` router).
- **Flagged item resolved as decided:** the `profile:write` step-up ending `anonymous` on decline is correct — the product owner verified that `prompt=login` closes the user's API web session (Passport logs the guard out), so there is nothing to restore. No correction to the specs or the design.
- **Open:** nothing.