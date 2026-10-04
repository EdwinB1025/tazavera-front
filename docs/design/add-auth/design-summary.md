# add-auth — Design summary

Capability: `auth`. Built in parallel with `add-app-shell`; provides the session contract that the header, `add-landing` and `add-user-account` consume.

## 1. Contracts provided

- **Session module** (`src/features/auth`): state (anonymous, loading, authenticated); user from `GET /user` (ulid, name, surname, email, role); sign in (with an optional return route); sign out; request the `profile:write` scope (step-up) returning to a given route.
- **API client** (`src/shared/api`): base `NEXT_PUBLIC_API_URL`; adds the Bearer token when there is a session; on a 401 tries to refresh and, if that fails, starts re-authentication. Public endpoints work without a session.
- **Configuration:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OAUTH_CLIENT_ID`, `NEXT_PUBLIC_APP_URL` (the `redirect_uri` is `{NEXT_PUBLIC_APP_URL}/callback`).

## 2. Endpoints and parameters

- **REST (in `openapi.yaml`):** `GET /user`, `POST /logout` (revokes all tokens and ends the user's web sessions on the server).
- **OAuth (not in `openapi.yaml`, only described in the security scheme):** `/oauth/authorize` and `/oauth/token`. Their errors are documented in `design.md` following OAuth 2.0: authorize errors return as `error` (and `error_description`) in the redirect query; token errors as JSON with `error` and `error_description`.
- **Web parameters of the API (not in `openapi.yaml`, intentionally):** `theme` and `lang` on `/oauth/authorize` (read by an API web middleware to style and translate its login pages), and `prompt` (standard OIDC, supported by Passport).

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