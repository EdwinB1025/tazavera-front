Status: draft — pending Product owner review

# Design summary — route-api-web-pages-through-front

Drafted by the design lead on 2026-10-12 from backlog entry R74 (Product owner, 2026-10-12), decision D10 (`tazavera-documentation/docker-deploy-guideline.md`), the front notes C8/C9, the API notes C8, the build steps C8/C9, `docker-dudas-y-guia-contenedores.md` §4.13, the front code on `develop` (`e34d5e70`), the API's route list (`php artisan route:list`, read only) and views, and the Next.js 16 guides in `node_modules/next/dist/docs/`. Product owner, 2026-10-12: the design lead decides the open points a–d of R74; the values that belong to the API's environment and the demo's tunnels are listed under "Open".

- Change-id: `route-api-web-pages-through-front`
- Type: Change (traditional workflow, section 3a): it adds behaviour and touches security (headers, the auth flow).
- Capabilities: `auth` (owner), `app-shell` (response headers), `user-account` (links to the API's pages).
- Branch and folders: `feature/route-api-web-pages-through-front`, `openspec/changes/route-api-web-pages-through-front/`, `docs/design/route-api-web-pages-through-front/`.
- Contract: no change. The forwarded routes are web routes and are intentionally absent from `contracts/openapi.yaml`.
- Interface: no visual element is added or changed, so no spacing, token or contrast value applies (criteria A and D). Every visible text stays as it is.
- Out of scope: any API code (Product owner's), the deploy files (Dockerfile, compose, Caddyfile: the PO builds them), the token storage, PKCE, the scopes, the JSON calls.

## 1. Today (verified 2026-10-12)

| What | Where | Base today |
|---|---|---|
| JSON calls (`request`, `publicRequest`, `requestWithToken`), browser and server | `src/shared/api/client.ts:128-130` | `NEXT_PUBLIC_API_URL` |
| Token exchange and refresh, OAuth `issuer` | `src/shared/api/tokens.ts:167-170` | `NEXT_PUBLIC_API_URL` |
| Authorization page (popup, full-page fallback, silent `prompt=none`) | `src/features/auth/api/authorize.ts:300` (`authorizeUrl`), `:344` (`apiUrl`) | `NEXT_PUBLIC_API_URL` |
| User menu "Security" link | `src/widgets/app-header/ui/UserMenu.tsx:123` | `NEXT_PUBLIC_API_URL` |
| Account security section: security page, "Verify email" | `src/pages/account/ui/SecuritySection.tsx:43`, `:56` | `NEXT_PUBLIC_API_URL` |
| "Forgot your password?" | `src/features/user-account/ui/PasswordForm.tsx:92` | `NEXT_PUBLIC_API_URL` |
| Forwarding | `next.config.ts` (no rewrites), `proxy.ts` (headers and locale only) | none |
| `API_INTERNAL_URL` | — | not read anywhere |

- `proxy.ts` matches every path (`/:path*`). It returns paths under `/_next/` and any path with a file extension untouched (`proxy.ts:74-76`), gives `/callback` its CSP without COOP, and sends every other path through next-intl, which redirects a path without a locale prefix (`/login` → `/es/login`).
- The server-side reads go through `publicRequest` (taxonomies, coffees, offerings, offering detail, coffee shops, public evaluations, management lists). The front never follows an absolute URL from a response body (no `links`, `next_page_url` or `path` is read; grep of `src/`), so the base of a server-side read can change without touching any parser.
- Decisions log, 2026-10-09 (2): "reading `API_INTERNAL_URL` on the front's server is a deploy matter, not launched as a front change". R74 (Product owner, 2026-10-12, point 3) supersedes it: the change reads it. Resolved as a semantic point (criterion B): the later decision prevails.

## 2. The API routes (read only, `php artisan route:list`, 2026-10-12)

The API has no path prefix: JSON routes and web routes share the root (`/user` is JSON, `/user/security` is web). So the forwarding is an explicit list of paths, never a prefix such as `/user/*`.

| Group | Paths | Middleware | Under this change |
|---|---|---|---|
| Authorization | `GET`/`POST`/`DELETE /oauth/authorize` | `web` | Forwarded |
| Fortify screens | `GET`/`POST /login`; `GET`/`POST /two-factor-challenge`; `GET`/`POST /forgot-password`; `GET /reset-password/{token}`, `POST /reset-password`; `GET /email/verify`, `GET /email/verify/{id}/{hash}`, `POST /email/verification-notification` | `web` | Forwarded |
| Security page and its actions | `GET /user/security`; `/user/confirm-password`; `/user/confirmed-password-status`; `/user/confirmed-two-factor-authentication`; `/user/two-factor-authentication`; `/user/two-factor-qr-code`; `/user/two-factor-recovery-codes`; `/user/two-factor-secret-key`; `/user/passkeys`, `/user/passkeys/options`, `/user/passkeys/{passkey}` | `web` | Forwarded |
| Passkey sign-in and confirmation | `/passkeys/login`, `/passkeys/login/options`, `/passkeys/confirm`, `/passkeys/confirm/options` | `web` | Forwarded |
| Assets of those pages | `/build/*` (Vite build), `/flux/*` (Flux scripts), `/livewire-<hash>/*` (Livewire scripts, `update`, uploads; the hash part is per installation, `livewire-eb65e81f` locally) | none or `web` | Forwarded |
| Token endpoint | `POST /oauth/token` | `throttle` only | Direct (not forwarded) |
| JSON endpoints | every `api` route (`/user`, `/user/evaluations…`, `/offerings…`, `/register`, `/logout`…) | `api` | Direct (not forwarded) |
| Not used by the front | `/oauth/token/refresh`, `/oauth/device*`, `/storage/*`, `/up`, `/`, the Scribe docs | — | Not forwarded |
| Icons of the API's layout | `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png` (`partials/head.blade.php:8-10`) | — | Not forwarded: the front serves its own icon at those paths (or none), the same brand |

- The API's pages build every form action, link and asset URL with `route()`, `url()` and `@vite` (`resources/views/livewire/auth/*.blade.php`, `partials/head.blade.php`), so they come out on whatever origin Laravel takes as the request's root. No `URL::forceRootUrl` or `forceScheme` exists in the API (grep of `app/`, `bootstrap/`, `config/`). This is why the forwarded request must carry the front's public origin (D3).
- The API's pages load Google Fonts from `fonts.googleapis.com` and send no CSP of their own today.

## 3. Decisions

### D1 — One allowlist of forwarded web routes

- The forwarded paths are exactly the groups marked "Forwarded" in §2, kept in one module in `src/shared/api` (for example `web-routes.ts`) as path patterns. `proxy.ts` reads it, and the tests use the same list.
- Patterns: exact paths for the single routes; `/reset-password/:token`, `/email/verify/:id/:hash` and `/user/passkeys/:passkey` for the parameters; prefixes only for the asset groups (`/build/`, `/flux/`) and for the Livewire group, matched as `/livewire-<hex>/` because its hash changes per installation.
- Every HTTP method of a listed path is forwarded (GET, HEAD, POST, PUT, PATCH, DELETE), with its query string unchanged.
- Why: the API has no prefix that separates web from JSON (§2), so a prefix rule would also forward JSON paths. An explicit list exposes nothing beyond the pages the browser needs. Adding a page later is one line.

### D2 — Forwarding happens in `proxy.ts`, not in `next.config.ts` rewrites

- `proxy.ts` checks the allowlist first, before the asset early return and before the `/callback` and locale branches. A match answers `NextResponse.rewrite(<target><path><query>)` to the absolute target of D5 and sets none of the front's headers on it (D6).
- Why proxy and not `rewrites()`:
  1. Order: the proxy runs before the `beforeFiles` rewrites (`03-file-conventions/proxy.md` "Execution order"; `05-config/01-next-config-js/rewrites.md` lines 87-96), and today it locale-redirects `/login` and lets `/flux/flux.js` fall through as a file path. A rewrite in `next.config.ts` would still need the proxy to step aside for every listed path, so the list would live in two places.
  2. Runtime value: the target is `API_INTERNAL_URL`, a server value read when the server runs (D5). The proxy reads `process.env` per request (Node.js runtime by default, `proxy.md` line 255). `rewrites()` are compiled into the build's routing manifest [Likely, not verified in the docs], which would freeze the target at build time.
  3. Headers: only the proxy can set the forwarded request's headers (D3).
- `NextResponse.rewrite` to an absolute URL proxies the method, headers and body and keeps the browser's URL (`04-functions/next-response.md` `rewrite()`).

### D3 — The forwarded request carries the front's public origin

- The proxy sets `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port` on the forwarded request from `NEXT_PUBLIC_APP_URL` (the front's exact public origin, a build value), replacing any incoming value. `X-Forwarded-For` keeps the client's address, so the API's login and two-factor rate limits keep counting per client.
- Why: Laravel builds form actions, redirects (`Location`) and asset URLs from the request's root (§2). With the front's address in `TRUSTED_PROXIES` (Open 2) and these headers, every URL the API emits stays on the front's origin. The front never rewrites a `Location` header or a response body: the API emits the right URL in the first place.
- Taking the origin from `NEXT_PUBLIC_APP_URL` instead of the incoming request keeps it right behind ngrok, which terminates TLS before the front (the request reaching Next.js is plain `http`).

### D4 — The second base URL is `NEXT_PUBLIC_APP_URL` (point a)

- No new variable. The web routes live on the front's origin by definition, and that origin is already `NEXT_PUBLIC_APP_URL`: a build value, the API's `FRONT_URL`, the client's redirect `<APP>/callback`, and the origin `authorize.ts` checks for the popup's message and opener (`authorize.ts:212`, `:324`). A separate variable could diverge from it and break those checks.
- One helper in `src/shared/api` builds a web-route URL from it (for example `apiWebPageUrl(path)`), so no call site concatenates the origin by hand.
- Call sites:

| Call site | Path | After |
|---|---|---|
| `authorize.ts` `authorizeUrl` (popup, full-page fallback, silent `prompt=none`) | `/oauth/authorize` | front origin |
| `UserMenu.tsx:123` | `/user/security` | front origin |
| `SecuritySection.tsx:43` | `/user/security` | front origin |
| `SecuritySection.tsx:56` | `/email/verify` | front origin |
| `PasswordForm.tsx:92` | `/forgot-password` | front origin |
| `tokens.ts:168` token endpoint and `issuer` | `/oauth/token` | API (unchanged) |
| `client.ts` JSON calls in the browser | every JSON path | API (unchanged) |

- The parameters of the authorization request (`redirect_uri`, `client_id`, `scope`, `state`, PKCE, `theme`, `lang`, `prompt`, `login_hint`) do not change. The links keep their presentation and popup behaviour (`openSecurityPopup`, `ExternalLink`).

### D5 — `API_INTERNAL_URL`: server only, with a fallback

- A server-only variable (no `NEXT_PUBLIC_` prefix, never inlined into the browser bundle), read per call. It is:
  1. the target of the forwarding (D2);
  2. the base of every request the front's **server** sends (the server-side `publicRequest` reads).
- When it is unset or empty, both fall back to `NEXT_PUBLIC_API_URL`, so `npm run dev` with today's `.env.local` keeps working.
- The browser never uses it: `client.ts` picks the server base only when it runs on the server (no `window`); in the browser every JSON call, the token exchange and the CSP's `connect-src` keep `NEXT_PUBLIC_API_URL`'s public origin.
- Values (environment, not code): Docker `http://api:80`; local without Docker `http://localhost:8000` (`artisan serve`, the address the local Caddy proxies to). Pointing it at the local Caddy (`https://localhost:8443`) also works, but Caddy then replaces the forwarded host with its own and the API's URLs leave the front's origin (D3), so the documented local value is the plain `http` address.
- It also removes the need for `NODE_EXTRA_CA_CERTS` for the server-side reads in Docker (front notes C7, row 3).

### D6 — Headers: the front's pages unchanged, the forwarded responses as the API sends them

- The front's own pages keep every header they carry today: the CSP with its nonce (`connect-src` = `'self'` + the API's public origin + Nominatim; `form-action 'self'`), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and COOP `same-origin-allow-popups`; `/callback` keeps its CSP and no COOP. Nothing is added to `connect-src`: the authorization page is a navigation, not a connection.
- A forwarded response carries none of the front's headers: no CSP (its nonce would block the Livewire and Flux scripts), no COOP, no security headers. It is served as the API sends it (R74 point 4).
- COOP across the popup (`add-auth` D11): the opener page keeps `same-origin-allow-popups`; the authorization popup is now on the same origin and the API's pages send no COOP (`unsafe-none`), so the popup keeps its opener, and `/callback` (no COOP) posts the result back as today. No change to D11.
- Spec impact: app-shell "Content-Security-Policy", "Cross-Origin-Opener-Policy" and "Response security headers" add the forwarded web routes to the paths they leave untouched, next to the static assets. "No response of the application SHALL carry `X-Powered-By`" is scoped to the front's own responses; a forwarded response is the API's (Open 4).

### D7 — Cookies and redirects

- The API's web session cookie and `XSRF-TOKEN` are set by the API's response and pass through unchanged. The browser stores them on the front's origin (host-only, `SESSION_DOMAIN` unset). The front sets no cookie of its own except `theme`; Laravel ignores a cookie it cannot decrypt, and the front ignores the API's cookies.
- `Location` headers and form actions come from the API with the front's origin (D3). The front does not follow redirects for the browser: the rewrite returns the API's `302` to the browser as is.
- A session started on the API's own origin before this change does not carry over: the first sign-in after the switch shows the login once.

### D8 — The OAuth `issuer` stays the API base (point c)

- Verified: nothing compares the issuer with the origin that served `/oauth/authorize`.
  - `tokens.ts` calls `validateAuthResponse` with only the `code` (`tokens.ts:101-106`); no `iss` parameter is passed, so no RFC 9207 issuer check runs.
  - The front requests no `openid` scope, so no ID token and no issuer claim are validated (`processAuthorizationCodeResponse`, `processRefreshTokenResponse`).
  - The API's OAuth server (league/oauth2-server under Passport) sends no `iss` in the authorization response (no match for `iss` in `vendor/league/oauth2-server/src`).
- The token endpoint stays on the API (`POST /oauth/token` is stateless, R74). So `tokens.ts` does not change: `issuer` and `token_endpoint` keep `NEXT_PUBLIC_API_URL`.

### D9 — The demo from another device (point b): the front forwards no JSON

- The front does not forward the JSON calls or `/oauth/token`, in any setup (D10 as decided by Product owner). No demo-only code path is added: the front reads its two public addresses from `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_API_URL`, so the demo is an environment matter.
- Consequence: from another device the API also needs a public `https` address, and the CSP's `connect-src` then names it. How the demo exposes it is Product owner's (Open 3).

### D10 — Same-origin consequences, accepted

- The API's pages now run on the front's origin. Their scripts (Livewire, Flux, the API's own) share the front's `sessionStorage` and `localStorage` (the full-page flow record `tazavera.pending-flow`, the signed-in marker, the list preferences) and can reach the opener window, where the tokens live in memory. The API is first-party, and D10 is Product owner's decision, so this is accepted. It is recorded as a risk (§8), with a backlog candidate for an API-side CSP on its web pages.
- `authorize.ts` keeps its checks: the message must come from `NEXT_PUBLIC_APP_URL` and from the popup it opened (`:212`); the callback posts only to an opener of the front's origin (`:324`). They hold as they are.

## 4. Requirements for propose (spec deltas)

- **auth**
  - ADDED "API web routes through the front": the listed web routes (§2) are answered on the front's origin by forwarding to the API, with method, path, query, headers and body unchanged; the forwarded request carries the front's public origin as `X-Forwarded-Host`/`-Proto`/`-Port`; the target is the server-only internal API address, or the public API address when none is set; any path outside the list keeps its current handling.
  - MODIFIED "Sign in", "Silent re-authentication", "Step-up to the write scope": "the API's authorization page" opens at `{front origin}/oauth/authorize`, with the same parameters.
  - Unchanged and restated by a scenario: "Credential handling" / token exchange at `{API}/oauth/token`.
- **app-shell**
  - MODIFIED "Content-Security-Policy", "Cross-Origin-Opener-Policy", "Response security headers": the forwarded web routes are left untouched, like the static assets; `connect-src` keeps the public API origin.
  - ADDED (or in "Content-Security-Policy"): a server-side read uses the internal API address when set; the browser never does.
- **user-account**
  - MODIFIED "Grouped security section" (security page and "Verify email" at `{front origin}/…`), "Password change" ("Forgot your password?" at `{front origin}/forgot-password`), and the user menu's security entry (app-shell "Signed-in header and user menu").

## 5. Scenarios and their tests (one test each)

| # | Scenario | Test (file) |
|:-:|---|---|
| 1 | A listed web route (e.g. `GET /login`, `POST /oauth/authorize`, `GET /user/security`, `GET /reset-password/{token}?email=…`, `POST /livewire-<hash>/update`, `GET /flux/flux.js`, `GET /build/assets/app.css`) is rewritten to `{target}{path}{query}` | `proxy.test.ts` (rewrite header `x-middleware-rewrite`) |
| 2 | A forwarded response carries no CSP, no COOP and none of the security headers | `proxy.test.ts` |
| 3 | The forwarded request carries `X-Forwarded-Host`/`-Proto`/`-Port` of `NEXT_PUBLIC_APP_URL` | `proxy.test.ts` (`x-middleware-request-*`) |
| 4 | Target fallback: without `API_INTERNAL_URL` the target is `NEXT_PUBLIC_API_URL` | `proxy.test.ts` |
| 5 | Not forwarded: `POST /oauth/token`, `GET /user`, `/user/evaluations`, `/offerings`, `/callback`, `/es/…`, `/login` under a locale | `proxy.test.ts` |
| 6 | The authorization page opens at `{NEXT_PUBLIC_APP_URL}/oauth/authorize` with the same parameters (popup, full-page, silent) | `src/features/auth/api/authorize.test.ts` (existing scenarios, their base URL updated) |
| 7 | The token exchange and refresh go to `{NEXT_PUBLIC_API_URL}/oauth/token` | `src/shared/api/tokens.test.ts` (existing) |
| 8 | User menu, security section and "Forgot your password?" link to the front's origin | `AppHeader.test.tsx`, `AccountClient.test.tsx` / `SecuritySection`, `PasswordForm.test.tsx` (existing scenarios, their base URL updated) |
| 9 | A server-side read uses `API_INTERNAL_URL` when set, `NEXT_PUBLIC_API_URL` when not | `src/shared/api/client.test.ts` |
| 10 | A browser read always uses `NEXT_PUBLIC_API_URL`, and `connect-src` names its origin, never the internal one | `src/shared/api/client.test.ts`, `proxy.test.ts` |

- The tests listed as existing assert the old base URL for scenarios this change modifies; they are those scenarios' tests and change their expected base only. No other existing assertion changes.
- No QA test is expected to go stale. Any that does is listed in the build's report, not edited.

## 6. Browser checks at the end (design lead and Product owner)

Run on a production build (`npm run build` + `npm start`) with `API_INTERNAL_URL=http://localhost:8000`, `NEXT_PUBLIC_API_URL=https://localhost:8443`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, and the API's environment of Open 1 and 2. Then repeat in Docker, and then over ngrok, when Product owner builds them.

1. "Sign in" opens the popup at `http://localhost:3000/oauth/authorize?…`; `/login` loads with its styles and fonts; every redirect stays on `:3000` (DevTools Network, `Location` headers).
2. Coffee shop and specialist sign in end to end. The popup closes, the page is signed in, and `POST /oauth/token`, `GET /user` and every JSON call go to `https://localhost:8443`.
3. Step-up (edit profile) opens the popup on `:3000` with `login_hint`; a different user gets `access_denied`.
4. Silent re-authentication after a reload works with the session cookie on `:3000`.
5. User menu → Security opens `:3000/user/security` in a popup; the confirm-password screen, two-factor enable/confirm (Livewire) and passkey options work without `419`.
6. "Verify email" and "Forgot your password?" open on `:3000`; the reset form posts and redirects on `:3000`.
7. Headers: a front page has CSP + COOP + security headers; `/callback` has CSP and no COOP; `/login` has none of the front's headers.
8. Cookies: the API's session and `XSRF-TOKEN` cookies are on `localhost:3000`, not on `:8443`.
9. Server-side reads: the landing lists the verified offerings with `API_INTERNAL_URL` set and with it unset.

## 7. Open — Product owner's

1. **The API's `APP_URL` under the router role** (point d). Passkeys take their relying party from `APP_URL` (API notes C8). The passkey screens now run on the front's origin, so a passkey ceremony fails while `APP_URL` names the API's address. Today the API's request-time URLs follow the request root, not `APP_URL` (§2).
   - A: `APP_URL` = the front's public origin. Passkeys work on the forwarded pages, and console-generated URLs point to the front. Registered passkeys bound to the old host stop working (local data only today).
   - B: `APP_URL` stays the API's address. Passkeys fail on the forwarded pages.
   - Recommendation: A, from the API notes C8 ("passkeys ... `allowed_origins` = `[APP_URL]`") and D10. The front notes B3 table ("`NEXT_PUBLIC_API_URL` must match `APP_URL`") would then change to "`NEXT_PUBLIC_APP_URL` must match `APP_URL`".
   - Blocks propose: no (the front code is the same either way; it blocks browser check 5 for passkeys).
2. **`TRUSTED_PROXIES`, `SESSION_DOMAIN` and `SESSION_SECURE_COOKIE`** (point d). D3 needs the API to trust the front's forwarded headers.
   - Recommendation: `TRUSTED_PROXIES` names the front's address as the API sees it: `127.0.0.1` locally (already in the local Caddy setup), the compose subnet in Docker (already `172.30.0.0/24`), the front server's address when the two are split. Keep `SESSION_DOMAIN` unset (host-only cookie on the front's origin). `SESSION_SECURE_COOKIE=true` works on `http://localhost:3000` in Chromium and Firefox (localhost counts as secure) and on any `https` front; it does not on a plain-`http` front outside localhost.
   - Options: A as recommended; B trust `'*'`, which is rejected by the decision of 2026-10-08 (API notes C8).
   - Blocks propose: no.
3. **The demo's tunnels** (point b, D9). The front needs `NEXT_PUBLIC_API_URL` to be a public `https` address reachable from the other device.
   - A: a second ngrok endpoint for the API (to Caddy, or to the API's `http` port with ngrok's TLS); its origin becomes `NEXT_PUBLIC_API_URL` and the API's `APP_URL` side follows Open 1.
   - B: one ngrok agent with a configuration file that starts both endpoints. Technically the same as A, in one command; it depends on the ngrok plan's endpoint limit [not verified].
   - C: forward the JSON calls too for the demo. Rejected: it contradicts D10 and adds a demo-only code path.
   - Recommendation: A (or B if the plan allows two endpoints).
   - Blocks propose: no.
4. **`X-Powered-By` on forwarded responses.** PHP sends `X-Powered-By: PHP/…` unless `expose_php=Off`. The front's spec forbids it on the front's own responses only (D6).
   - Recommendation: `expose_php=Off` in the API image's `php.ini` (the production `php.ini` already has it off).
   - Options: A as recommended; B accept it.
   - Blocks propose: no.
5. **Email-verification link after registration.** The registration (`POST /register`) is a JSON call sent directly to the API, so the verification e-mail's signed link is built on the API's address. Opening it lands on the API's origin, where the user has no web session, so the API asks for the login there, outside the front. The password-reset link is unaffected: `/forgot-password` is requested through the front, so its link is built on the front's origin.
   - A: accept for now. It works, with one extra login on the API's address.
   - B: an API change later (the link built on `FRONT_URL`), as a backlog entry.
   - Recommendation: B, as a separate entry; not part of this change.
   - Blocks propose: no.

Not a question: Caddy's role becomes "TLS for the browser's direct calls" (JSON and `/oauth/token`); the web routes reach the API from the front over the internal network (front notes C9 point 5). Nothing in the front depends on it.

## 8. Risks and unverified points

- [Likely, not verified] `rewrites()` in `next.config.ts` are compiled at build time. D2 does not depend on it: the ordering and header reasons hold on their own.
- [Unverified] Whether Next.js, when it proxies an external rewrite, appends its own `X-Forwarded-*` after the ones the proxy sets. Browser check 1 (the `Location` headers stay on `:3000`) settles it. If Next overrides them, the build reports it and the design falls back to the API trusting Next's own values, which carry the same host but `http` as scheme behind ngrok.
- [Unverified] Laravel 13's CSRF check, if it compares `Origin` with the request's host, passes only with the trusted forwarded host (Open 2). Browser check 5 (no `419`).
- [Unverified] The Livewire path hash (`livewire-<hex>`) is stable per installation. The pattern of D1 does not depend on its value.
- Same-origin exposure of D10. Backlog candidate (for Product owner to add or not): a CSP and `frame-ancestors` on the API's web pages, so a script injected into an API page cannot reach the front's storage or be framed.
- Request size and time limits of the proxy's forwarding (Next.js defaults) are far above the size of these forms. There are no uploads besides Livewire's, which the front does not use.

## 9. Tests and checks to keep green

- `proxy.test.ts`, `src/shared/api/client.test.ts`, `src/shared/api/tokens.test.ts`, `src/features/auth/api/authorize.test.ts`, `src/features/auth/model/session.test.ts`, `src/pages/callback/ui/CallbackScreen.test.tsx`, `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/pages/account/ui/AccountClient.test.tsx`, `src/features/user-account/ui/PasswordForm.test.tsx`, the guards.
- `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Review log

- 2026-10-12, design lead, first draft.
  - Settled by Product owner's mandate: a (D4, no new variable: `NEXT_PUBLIC_APP_URL` and one helper), c (D8, the issuer stays, verified in code), the front side of b (D9, no JSON forwarding), the forwarding mechanism and list (D1, D2), headers, cookies and redirects (D3, D6, D7), `API_INTERNAL_URL` (D5).
  - Semantic (criterion B): the decisions log entry of 2026-10-09 (2) is superseded by R74 point 3.
  - Left to Product owner: the API's environment (Open 1, 2, 4), the demo's tunnels (Open 3), and an API link (Open 5). None blocks propose.
