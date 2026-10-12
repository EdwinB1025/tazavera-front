# Proposal

## Why

The build environment is a single server with one public entry point, the front's address (Product owner, 2026-10-12, decision D10 option A). Today the browser calls the API on its own address for every JSON call, the token exchange, the authorization page and the API's web pages, so nothing works through that one entry point. Backlog entry R74 makes the front the only door to the API; it is the last change before the Playwright suite (R1).

## What Changes

- The front's proxy forwards two groups of paths to a server-only internal API address, `API_INTERNAL_URL`, keeping the method, query, headers and body:
  - every path under `/api/` (the JSON calls and `POST /oauth/token`), with the `/api` prefix removed;
  - an explicit list of the API's web routes (authorization, the Fortify screens, the security page and its actions, passkeys, and the `/build/`, `/flux/` and Livewire assets those pages load), with the path unchanged.
- The forwarded request carries the front's public origin in `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port`; a forwarded response carries none of the front's headers. Without `API_INTERNAL_URL` a forwarded request answers `502`.
- `NEXT_PUBLIC_API_URL` keeps its name and role but takes the value `{NEXT_PUBLIC_APP_URL}/api` in every setup, so the browser's JSON calls and the token exchange go to the front's origin. No code change for the token exchange.
- The authorization page and the links to the API's web pages (user menu "Security", the account's security section, "Verify email", "Forgot your password?") are built on `NEXT_PUBLIC_APP_URL` through one helper.
- Server-side reads call `API_INTERNAL_URL` directly with the API's own paths; the browser never uses it. There is no fallback to `NEXT_PUBLIC_API_URL`.
- **BREAKING (environment):** `NEXT_PUBLIC_API_URL` must now be `{NEXT_PUBLIC_APP_URL}/api`, and `API_INTERNAL_URL` is required on the front's server. The CSP's `connect-src` drops the API origin. A production build signs in only when the front is served over `https`.
- R74's end-state point 2 (JSON and `/oauth/token` direct) and point 3's fallback are superseded by option A; the decisions log entry of 2026-10-09 that called `API_INTERNAL_URL` a deploy matter is superseded too.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: ADDED "One public entry point" (forwarding, forwarded headers, `502` without an internal address, every other path unchanged); MODIFIED "Sign in", "Silent re-authentication" and "Step-up to the write scope" (the authorization page on the front's origin), "Credential handling" (the token exchange and refresh at `{NEXT_PUBLIC_API_URL}/oauth/token`) and "Content-Security-Policy on the callback" (`connect-src` without the API origin).
- `app-shell`: MODIFIED "Content-Security-Policy", "Cross-Origin-Opener-Policy" and "Response security headers" (forwarded paths left untouched, `connect-src` without the API origin) and "Signed-in header and user menu" (the security entry on the front's origin); ADDED "Server-side reads at the internal API address".
- `user-account`: MODIFIED "Grouped security section" and "Password change" (the API's pages reached on the front's origin).

## Non-goals

- Any API code change; the API's environment (`APP_URL`, `FRONT_URL`, `TRUSTED_PROXIES`, `SESSION_DOMAIN`, secure cookies, `expose_php`, the OAuth client's `redirect_uris`) is Product owner's.
- The deploy files (Dockerfile, compose, Caddyfile) and how the front is served over `https` in each setup.
- The token storage, PKCE, the scopes and the authorization parameters.
- Rewriting `Location` headers or response bodies; absolute URLs inside JSON bodies (the front does not read them).
- A Content-Security-Policy for the API's own pages (backlog candidate, §8 of the design summary).
- `contracts/openapi.yaml`: it keeps describing the API's own paths.

## Impact

- Code: `proxy.ts` (forwarding, order of checks, CSP), new modules in `src/shared/api` (forwarded-route list and `/api` prefix, web-page URL helper), `src/shared/api/client.ts` (server-side base), `src/features/auth/api/authorize.ts`, `src/widgets/app-header/ui/UserMenu.tsx`, `src/pages/account/ui/SecuritySection.tsx`, `src/features/user-account/ui/PasswordForm.tsx`.
- Tests: `proxy.test.ts`, `src/shared/api/client.test.ts`, `src/shared/api/tokens.test.ts`, `src/features/auth/api/authorize.test.ts`, `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/pages/account/ui/AccountClient.test.tsx`, `src/features/user-account/ui/PasswordForm.test.tsx`.
- Environment: `NEXT_PUBLIC_API_URL` = `{NEXT_PUBLIC_APP_URL}/api`; new server-only `API_INTERNAL_URL`.
- Dependencies: none added.
- Resolves backlog entry R74.
