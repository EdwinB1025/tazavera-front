Status: approved

# Design summary — route-api-web-pages-through-front

Drafted by the design lead on 2026-10-12 and revised the same day after Product owner's answers. Sources:
- backlog entry R74 and `docs/design/route-api-web-pages-through-front/handoff.md` (Product owner, 2026-10-12);
- decision D10 (`tazavera-documentation/docker-deploy-guideline.md`), revised by Product owner to option A;
- the front notes C8/C9, the API notes C8, the build steps C8/C9, `docker-dudas-y-guia-contenedores.md` §4.13;
- the front code on `develop`;
- the API's route list (`php artisan route:list`, read only) and views;
- the Next.js 16 guides in `node_modules/next/dist/docs/`.

Product owner delegated the open points a–d to the design lead; only what is genuinely Product owner's stays under "Open".

- Change-id: `route-api-web-pages-through-front`
- Type: Change (traditional workflow, section 3a). It adds behaviour and touches security (headers, the auth flow, the token exchange).
- Capabilities: `auth` (owner), `app-shell` (response headers, CSP), `user-account` (links to the API's pages).
- Branch and folders: `feature/route-api-web-pages-through-front`, `openspec/changes/route-api-web-pages-through-front/`, `docs/design/route-api-web-pages-through-front/`.
- Contract: no change. `contracts/openapi.yaml` keeps describing the API's own paths. The front reaches them under its prefix (D1), which is a routing detail of the front, not of the API.
- Interface: no visual element is added or changed, so no spacing, token or contrast value applies (criteria A and D). Every visible text stays as it is.
- Out of scope: any API code (none is needed), the deploy files (Dockerfile, compose, Caddyfile: Product owner builds them), the token storage, PKCE, the scopes.

## 0. Product owner's answers (2026-10-12), settled

- **Setup:** the build environment is a single server with one public entry point (one ngrok URL); there is no public API address.
- **D10 revised, option A: the front is the only door.**
  - It forwards the API's web routes, `POST /oauth/token` and every JSON call.
  - The front calls the API under a path prefix that the proxy strips when forwarding to `API_INTERNAL_URL`. No API code change.
  - `NEXT_PUBLIC_API_URL` becomes the front's own origin plus the prefix.
  - The CSP's `connect-src` drops the API origin.
  - This replaces R74 end-state point 2 and the first draft's D9.
- **Q1:** the API's `APP_URL` is the public front URL.
- **Q2:** the API trusts the front's address (`TRUSTED_PROXIES`); `SESSION_DOMAIN` unset; secure cookies on.
- **OAuth client redirect (API environment, Product owner's; added from the orchestrator's read-only check of the API, 2026-10-12).** The front client's registered `redirect_uris` live in the API database. `database/seeders/FrontClientSeeder.php` writes them as `{FRONT_URL}/callback` at seed time; today that is `http://localhost:3000/callback`. With one public entry point the client must have `https://<public origin>/callback` registered, or `/oauth/authorize` rejects the redirect. Product owner sets `FRONT_URL` to the public origin before seeding, or adds that URI to the existing client. Not a front code change; checked in §6 check 3.
- **Q3:** not needed (one tunnel, one URL).
- **Q4:** `expose_php=Off` in the API image.
- **Q5:** solved. The registration now reaches the API through the front, and `APP_URL` is the front's URL, so the verification link opens on the front, which forwards `/email/verify`. No backlog entry.

## 1. Today (verified 2026-10-12)

| What | Where | Base today |
|---|---|---|
| JSON calls (`request`, `publicRequest`, `requestWithToken`), browser and server | `src/shared/api/client.ts:128-130` | `NEXT_PUBLIC_API_URL` |
| Token exchange and refresh, OAuth `issuer` | `src/shared/api/tokens.ts:167-170` | `NEXT_PUBLIC_API_URL` |
| Authorization page (popup, full-page fallback, silent `prompt=none`) | `src/features/auth/api/authorize.ts:300`, `:344` | `NEXT_PUBLIC_API_URL` |
| User menu "Security" link | `src/widgets/app-header/ui/UserMenu.tsx:123` | `NEXT_PUBLIC_API_URL` |
| Account security section: security page, "Verify email" | `src/pages/account/ui/SecuritySection.tsx:43`, `:56` | `NEXT_PUBLIC_API_URL` |
| "Forgot your password?" | `src/features/user-account/ui/PasswordForm.tsx:92` | `NEXT_PUBLIC_API_URL` |
| CSP `connect-src` | `proxy.ts:80-90` | `'self'` + origin of `NEXT_PUBLIC_API_URL` + Nominatim |
| Forwarding | `next.config.ts` (no rewrites), `proxy.ts` (headers and locale only) | none |
| `API_INTERNAL_URL` | — | not read anywhere |

- `proxy.ts` matches every path (`/:path*`). It returns paths under `/_next/` and any path with a file extension untouched (`proxy.ts:74-76`), gives `/callback` its CSP without COOP, and sends every other path through next-intl, which redirects a path without a supported locale prefix (`/login` → `/es/login`).
- The front's routes all live under `/[locale]/…` (`es`, `en`, `ca`) plus `/callback`, the framework paths and the app icons. There is no `app/api` route handler, so no front route starts with `/api`.
- The server-side reads go through `publicRequest` (taxonomies, coffees, offerings, offering detail, coffee shops, public evaluations, management lists). The front never follows an absolute URL from a response body: no `links`, `next_page_url` or `path` is read (grep of `src/`).
- Decisions log, 2026-10-09 (2), said "reading `API_INTERNAL_URL` on the front's server is a deploy matter". R74 point 3 and option A supersede it. This is a semantic point (criterion B): the later decision prevails.

## 2. The API routes (read only, `php artisan route:list`, 2026-10-12)

The API has no path prefix of its own: JSON and web routes share the root (`/user` is JSON, `/user/security` is web). None of its routes starts with `/api`.

| Group | Paths | Middleware | Reached by the browser as |
|---|---|---|---|
| Authorization | `GET`/`POST`/`DELETE /oauth/authorize` | `web` | `{front}/oauth/authorize` (web list) |
| Fortify screens | `GET`/`POST /login`; `GET`/`POST /two-factor-challenge`; `GET`/`POST /forgot-password`; `GET /reset-password/{token}`, `POST /reset-password`; `GET /email/verify`, `GET /email/verify/{id}/{hash}`, `POST /email/verification-notification` | `web` | same path on the front (web list) |
| Security page and its actions | `GET /user/security`; `/user/confirm-password`; `/user/confirmed-password-status`; `/user/confirmed-two-factor-authentication`; `/user/two-factor-authentication`; `/user/two-factor-qr-code`; `/user/two-factor-recovery-codes`; `/user/two-factor-secret-key`; `/user/passkeys`, `/user/passkeys/options`, `/user/passkeys/{passkey}` | `web` | same path on the front (web list) |
| Passkey sign-in and confirmation | `/passkeys/login`, `/passkeys/login/options`, `/passkeys/confirm`, `/passkeys/confirm/options` | `web` | same path on the front (web list) |
| Assets of those pages | `/build/*` (Vite build), `/flux/*` (Flux scripts), `/livewire-<hash>/*` (Livewire scripts, `update`, uploads; the hash is per installation, `livewire-eb65e81f` locally) | none or `web` | same path on the front (web list) |
| Token endpoint | `POST /oauth/token` | `throttle` only | `{front}/api/oauth/token` (prefix) |
| JSON endpoints | every `api` route (`/user`, `/user/evaluations…`, `/offerings…`, `/register`, `/logout`…) | `api` | `{front}/api/<path>` (prefix) |
| Icons of the API's layout | `/favicon.ico`, `/favicon.svg`, `/apple-touch-icon.png` | — | not forwarded: the front serves its own icon at those paths (or none), the same brand |

**`/logout` (orchestrator's read-only check of the API, 2026-10-12).**
- Only one `POST /logout` is live: `routes/api.php:37` `UserController@logout`. It revokes all access and refresh tokens, deletes the user's web sessions from the sessions table and regenerates the remember token.
- Fortify's web `POST /logout` has the same method and path. The `api` route, registered after the web routes, replaces it, which is why `route:list` shows only the `api` one.
- The front calls it as JSON with the token: `src/features/auth/model/session.ts:103` (sign out) and `src/features/auth/api/identity.ts:52` (a step-up confirmed by another account). Under option A both go to `{front}/api/logout` → `{API_INTERNAL_URL}/logout`.
- The server-side session deletion does not depend on the cookie's origin. The session cookie left in the browser is orphaned and harmless.

The API's pages build every form action, link and asset URL with `route()`, `url()` and `@vite`, so they come out on whatever origin Laravel takes as the request's root. No `URL::forceRootUrl` or `forceScheme` exists in the API. This is why the forwarded request carries the front's public origin (D3).

## 3. Decisions

### D1 — Two forwarded groups: the `/api` prefix and the web list

- **Prefix group.** Every path that starts with `/api/` is forwarded to `API_INTERNAL_URL` with `/api` removed (`/api/offerings?page=2` → `{internal}/offerings?page=2`; `/api/oauth/token` → `{internal}/oauth/token`).
  - This is the token endpoint and every JSON call, whatever the path, with no list to keep in step with the API.
  - `/api` alone (no trailing segment) is not forwarded and keeps today's handling.
  - `POST /logout` belongs to this group only, as `/api/logout`. Fortify's web `/logout` is shadowed by the `api` route (§2) and must **not** be in the web list.
- **Web list.** The web-route groups of §2 are forwarded with their path unchanged, because the API's pages and their links, redirects and assets live at the API's root. The list is explicit (exact paths; `/reset-password/:token`, `/email/verify/:id/:hash`, `/user/passkeys/:passkey`; prefixes only for `/build/`, `/flux/` and the Livewire group, matched as `/livewire-<hex>/`). It is kept in one module in `src/shared/api` that `proxy.ts` and the tests read.
- Every HTTP method is forwarded, with the query string, headers and body unchanged.
- **How the proxy tells them apart.** One order of checks in `proxy.ts`, first match wins:
  1. `/api/…` → forward, prefix stripped;
  2. a path in the web list → forward as is;
  3. `/_next/…` or a path with a file extension → untouched (today's early return);
  4. `/callback` → its own branch;
  5. anything else → locale routing.

  Steps 1–2 come before step 3 because the API's assets (`/flux/flux.js`, `/build/assets/app-….css`, `/livewire-…/livewire.js`) carry file extensions. `/api` cannot clash with the front: no front route starts with it, `api` is not a supported locale, and `/_next` and the icons do not start with it.
- Why a prefix for JSON and not a list: the JSON surface is the whole contract and changes with it, while the web routes are a closed set. The prefix also keeps a JSON path and a web path of the same name apart (`/api/user` is JSON, `/user/security` is the web page).

### D2 — Forwarding happens in `proxy.ts`, not in `next.config.ts` rewrites

- A match answers `NextResponse.rewrite(<API_INTERNAL_URL><path><query>)` and sets none of the front's headers on it (D6).
- Why the proxy:
  1. Order: the proxy runs before the `beforeFiles` rewrites (`03-file-conventions/proxy.md` "Execution order"; `05-config/01-next-config-js/rewrites.md` lines 87-96), and today it would locale-redirect `/login` and `/api/…`.
  2. Runtime value: the target is a server value read when the server runs. The proxy runs on the Node.js runtime by default (`proxy.md` line 255) and reads `process.env` per request; `rewrites()` are compiled into the build [Likely, not verified in the docs].
  3. Headers: only the proxy sets the forwarded request's headers (D3).
- `NextResponse.rewrite` to an absolute URL proxies the method, headers and body and keeps the browser's URL (`04-functions/next-response.md` `rewrite()`).

### D3 — The forwarded request carries the front's public origin

- On every forwarded request (both groups), the proxy sets `X-Forwarded-Host`, `X-Forwarded-Proto` and `X-Forwarded-Port` from `NEXT_PUBLIC_APP_URL`, replacing any incoming value.
- `X-Forwarded-For` keeps the client's address, so the API's rate limits (login, two-factor, `/oauth/token`) keep counting per client.
- `Authorization` and the cookies pass through.
- The API honours these headers once the front's address is listed: its `TrustProxies` reads `config('trustedproxy.proxies')` (= `TRUSTED_PROXIES`) and trusts `X-Forwarded-For`/`-Host`/`-Port`/`-Proto`/`-Prefix` (orchestrator's read-only check of the API, 2026-10-12). So `X-Forwarded-Prefix` is available later if JSON bodies' absolute URLs ever need the `/api` prefix (§8).
- With the front's address trusted (Q2), every URL the API emits for the web pages (form actions, `Location`, assets, the reset and verification links) is on the front's origin. The front never rewrites a `Location` header or a body.
- Taking the origin from `NEXT_PUBLIC_APP_URL` keeps it right whatever terminates TLS before the front (the request reaching Next.js may be plain `http`).

### D4 — Bases: web pages at the front's root, JSON and token under the prefix (point a)

- `NEXT_PUBLIC_API_URL` keeps its name and its role as the base of the JSON calls and of the token endpoint. Its value in every setup is `{NEXT_PUBLIC_APP_URL}/api`, for example `https://<public origin>/api` or `http://localhost:3000/api`.
  - Keeping the variable means `client.ts` and `tokens.ts` do not change, and neither do the many tests that stub it.
  - The prefix is a fixed constant `/api` in `src/shared/api`, which the proxy uses. The variable's value must end with it (§6 check 1 shows a mismatch at once: every JSON call 404s).
- The web pages use `NEXT_PUBLIC_APP_URL` (the front's root), behind one helper in `src/shared/api` (for example `apiWebPageUrl(path)`). No second base variable is added.

| Call site | Path | After |
|---|---|---|
| `authorize.ts` `authorizeUrl` (popup, full-page fallback, silent `prompt=none`) | `/oauth/authorize` | `{APP}/oauth/authorize` |
| `UserMenu.tsx:123` | `/user/security` | `{APP}/user/security` |
| `SecuritySection.tsx:43` | `/user/security` | `{APP}/user/security` |
| `SecuritySection.tsx:56` | `/email/verify` | `{APP}/email/verify` |
| `PasswordForm.tsx:92` | `/forgot-password` | `{APP}/forgot-password` |
| `tokens.ts:168` token endpoint and `issuer` | `/oauth/token` | `{API}/oauth/token` = `{APP}/api/oauth/token` (code unchanged, value changes) |
| `client.ts` JSON calls in the browser | every JSON path | `{API}/<path>` = `{APP}/api/<path>` (code unchanged, value changes) |

- The parameters of the authorization request (`redirect_uri`, `client_id`, `scope`, `state`, PKCE, `theme`, `lang`, `prompt`, `login_hint`) do not change. The links keep their presentation and popup behaviour.

### D5 — `API_INTERNAL_URL`: required on the server, no fallback

- A server-only variable (no `NEXT_PUBLIC_` prefix, never in the browser bundle), read per call. It is the base of:
  1. the forwarding target of both groups (D1, D2);
  2. every request the front's **server** sends. Server components and the server-side `publicRequest` reads call the API directly at `API_INTERNAL_URL` + the API's own path, with no prefix and without going through the proxy. `client.ts` picks it only when it runs on the server (no `window`).
- **No fallback to `NEXT_PUBLIC_API_URL`** (this replaces R74 point 3's fallback). `NEXT_PUBLIC_API_URL` now points at the front itself, so falling back would forward the front to itself.
  - When `API_INTERNAL_URL` is unset, a forwarded request answers `502` with an empty body.
  - A server-side read fails as an unreachable API does today, showing the existing error states.
  - Nothing is retried or guessed.
- Values (environment): Docker `http://api:80`; local without Docker `http://localhost:8000` (`artisan serve`), in `.env.local`. Plain `http` inside the machine or network is enough, and Node needs no extra CA (front notes C7 row 3).

### D6 — Headers and CSP

- The front's own pages keep the CSP with its nonce, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and COOP `same-origin-allow-popups`. `/callback` keeps its CSP and no COOP.
- **`connect-src` = `'self'` + Nominatim.** The API origin is dropped (option A): every browser call to the API is same-origin. `proxy.ts` stops reading `NEXT_PUBLIC_API_URL` for the CSP.
- A forwarded response, page or JSON, carries none of the front's headers. It is served as the API sends it: a front CSP nonce would block the Livewire and Flux scripts, and the JSON responses need none.
- COOP across the popup (`add-auth` D11) is unchanged. The opener keeps `same-origin-allow-popups`, the same-origin authorization popup gets no COOP from the API, and `/callback` (no COOP) posts the result back as today.
- Spec impact:
  - app-shell "Content-Security-Policy": `connect-src` names the application itself and Nominatim only, and the forwarded paths are left untouched like the static assets.
  - "Cross-Origin-Opener-Policy" and "Response security headers": the forwarded paths are left untouched.
  - "No `X-Powered-By`": scoped to the front's own responses. The API's is removed by `expose_php=Off` (Q4).

### D7 — Cookies, CORS and redirects

- The API's web session cookie and `XSRF-TOKEN` are set by the API's responses and stored on the front's origin (host-only, `SESSION_DOMAIN` unset, secure; Q2). On `http://localhost` Chromium and Firefox accept secure cookies.
- The browser now sends those cookies on the JSON calls too, because they are same-origin. The `api` routes are stateless and read only the bearer token, so they ignore them. The front sets only its `theme` cookie, which Laravel ignores (it cannot decrypt it).
- CORS no longer applies to the browser: every call is same-origin, so no preflight is sent. The API's `FRONT_URL` CORS setting stays harmless.
- `Location` headers and form actions come from the API on the front's origin (D3). The rewrite returns the API's `302` to the browser as is.
- A session started on the API's own address before this change does not carry over: the first sign-in after the switch shows the login once.

### D8 — The OAuth `issuer` (point c)

- `tokens.ts` keeps `issuer` = `token_endpoint` base = `NEXT_PUBLIC_API_URL`, now `{APP}/api`. Verified that nothing checks the issuer:
  - `validateAuthResponse` gets only the `code` (`tokens.ts:101-106`), so no RFC 9207 `iss` check runs;
  - no `openid` scope is requested, so there is no ID token to validate;
  - Passport (league/oauth2-server) sends no `iss` in the authorization response.
- `oauth4webapi` refuses a non-`https` token endpoint in a production build (`tokens.ts:178-182`). With the token endpoint on the front's origin, **a production build signs in only when the front is served over `https`**. How the front is served over `https` in each setup belongs to the deployment documentation. `npm run dev` is unaffected: outside production `http` is allowed.

### D9 — One public entry point (replaces the first draft's D9)

- One public address: the front's. The API is reachable only from the front (forwarding, server-side reads), at `API_INTERNAL_URL`, and publishes no public port.
- The browser's network shows only the front's origin plus Nominatim and the map tiles.
- The build environment's public values are all the ngrok origin:
  - `NEXT_PUBLIC_APP_URL` = the ngrok origin;
  - `NEXT_PUBLIC_API_URL` = the ngrok origin + `/api`;
  - the API's `APP_URL` and `FRONT_URL` = the ngrok origin (Q1);
  - the client's redirect = `<ngrok origin>/callback`.

### D10 — Same-origin consequences, accepted

- The API's pages run on the front's origin. Their scripts (Livewire, Flux, the API's own) share the front's `sessionStorage` and `localStorage` and can reach the opener window, where the tokens live in memory.
- The API is first-party and option A is Product owner's decision, so this is accepted and recorded as a risk (§8).
- `authorize.ts` keeps its checks: messages only from `NEXT_PUBLIC_APP_URL` and the popup it opened (`:212`); the callback posts only to an opener of the front's origin (`:324`).

## 4. Requirements for propose (spec deltas)

- **auth**
  - ADDED "One public entry point":
    - paths under `/api/` are forwarded to the internal API address with the prefix removed;
    - the listed web routes (§2) are forwarded unchanged;
    - the forwarded request carries the front's public origin as `X-Forwarded-Host`/`-Proto`/`-Port`;
    - without an internal API address a forwarded request answers `502`;
    - every other path keeps its current handling.
  - MODIFIED "Sign in", "Silent re-authentication", "Step-up to the write scope": the authorization page opens at `{front origin}/oauth/authorize`, with the same parameters.
  - MODIFIED "Credential handling" (or the requirement that names the token exchange): the exchange and refresh go to `{NEXT_PUBLIC_API_URL}/oauth/token`, which is on the front's origin.
- **app-shell**
  - MODIFIED "Content-Security-Policy": `connect-src` allows the application itself and Nominatim only; the forwarded paths carry no policy from the front.
  - MODIFIED "Cross-Origin-Opener-Policy" and "Response security headers": the forwarded paths are left untouched.
  - ADDED (or within an existing requirement): a server-side read goes to the internal API address; the browser never uses it.
  - MODIFIED "Signed-in header and user menu" for the security entry's address.
- **user-account**
  - MODIFIED "Grouped security section" (security page and "Verify email" at `{front origin}/…`) and "Password change" ("Forgot your password?" at `{front origin}/forgot-password`).
- **auth "Content-Security-Policy on the callback"**: MODIFIED. Its `connect-src` names the application itself (and Nominatim, the shared list), no longer the API origin.

## 5. Scenarios and their tests (one test each)

| # | Scenario | Test (file) |
|:-:|---|---|
| 1 | `/api/<path>?<query>` (e.g. `GET /api/offerings?page=2`, `POST /api/oauth/token`, `PUT /api/users/{ulid}`, `POST /api/logout`) is rewritten to `{API_INTERNAL_URL}/<path>?<query>` | `proxy.test.ts` (`x-middleware-rewrite`) |
| 2 | A listed web route (e.g. `GET /login`, `POST /oauth/authorize`, `GET /user/security`, `GET /reset-password/{token}?email=…`, `POST /livewire-<hash>/update`, `GET /flux/flux.js`, `GET /build/assets/app.css`) is rewritten to `{API_INTERNAL_URL}{path}{query}` | `proxy.test.ts` |
| 3 | A forwarded response carries no CSP, no COOP and none of the security headers | `proxy.test.ts` |
| 4 | The forwarded request carries `X-Forwarded-Host`/`-Proto`/`-Port` of `NEXT_PUBLIC_APP_URL` | `proxy.test.ts` (`x-middleware-request-*`) |
| 5 | Without `API_INTERNAL_URL` a forwarded request answers `502` and is not rewritten | `proxy.test.ts` |
| 6 | Not forwarded: `/logout` (no prefix), `/api` alone, `/_next/…`, `/favicon.ico`, `/callback`, `/es/…`, `/user` (no prefix), `/offerings` (no prefix) keep their current handling | `proxy.test.ts` |
| 7 | The front's page CSP has `connect-src 'self' https://nominatim.openstreetmap.org`, on pages and on `/callback` | `proxy.test.ts` (existing scenarios, their expected `connect-src` updated) |
| 8 | The authorization page opens at `{NEXT_PUBLIC_APP_URL}/oauth/authorize` with the same parameters (popup, full-page, silent) | `src/features/auth/api/authorize.test.ts` (existing scenarios, their base updated) |
| 9 | The token exchange and refresh go to `{NEXT_PUBLIC_API_URL}/oauth/token` | `src/shared/api/tokens.test.ts` (existing, unchanged) |
| 10 | User menu, security section and "Forgot your password?" link to `{NEXT_PUBLIC_APP_URL}/…` | `AppHeader.test.tsx`, `AccountClient.test.tsx` / `SecuritySection`, `PasswordForm.test.tsx` (existing scenarios, their base updated) |
| 11 | A server-side read requests `{API_INTERNAL_URL}/<path>`; a browser read requests `{NEXT_PUBLIC_API_URL}/<path>` | `src/shared/api/client.test.ts` |

- The tests marked "existing" assert the old base or the old `connect-src` for scenarios this change modifies. They are those scenarios' tests and change their expected value only. No other existing assertion changes.
- No QA test is expected to go stale. Any that does is listed in the build's report, not edited.

## 6. Browser checks at the end (design lead and Product owner)

Run on a production build, on whatever `https` origin the environment provides for the front. Environment:
- `NEXT_PUBLIC_APP_URL=<https front origin>`, `NEXT_PUBLIC_API_URL=<https front origin>/api`;
- `API_INTERNAL_URL=http://localhost:8000` (or `http://api:80` in Docker);
- the API with `APP_URL`/`FRONT_URL` = the front's origin, the front client's `redirect_uris` containing `<front origin>/callback`, `TRUSTED_PROXIES` = the front's address, `SESSION_DOMAIN` unset, secure cookies.

1. **One origin.** DevTools Network on the landing, a list, sign-in and an authenticated page: every request goes to the front's origin, except Nominatim and the map tiles. The JSON calls are `/api/…`; nothing goes to the API's own address.
2. **Sign-in popup.** "Sign in" opens the popup at `{front}/oauth/authorize?…`. `/login` loads with its styles and fonts, and every `Location` header stays on the front's origin.
3. **Both roles.** The first sign-in reaches `/callback` on the public origin: `/oauth/authorize` accepts the `redirect_uri` `<public origin>/callback`, so the client's registered redirect matches (§0). Coffee shop and specialist sign in end to end: the popup closes, `POST /api/oauth/token` and `GET /api/user` answer `200`, and the page is signed in.
4. **Step-up.** Edit profile opens the popup on the front with `login_hint`; a different user gets `access_denied`.
5. **Silent re-authentication** works after a reload.
6. **Security page.** User menu → Security opens `{front}/user/security`. Password confirm, two-factor enable/confirm (Livewire) and passkey registration work, with no `419`.
7. **Email links.** "Verify email" and "Forgot your password?" open on the front, and the reset form posts and redirects on the front. The reset e-mail's link (in the API's log) is on the front's origin.
8. **Headers.**
   - A front page has CSP (`connect-src 'self' https://nominatim.openstreetmap.org`) + COOP + security headers.
   - `/callback` has CSP and no COOP.
   - `/login` and `/api/offerings` have none of the front's headers and no `X-Powered-By`.
9. **Cookies.** The API's session and `XSRF-TOKEN` cookies are on the front's origin.
10. **Server-side reads.** The landing and the offerings list render, and their reads appear in the API's log as coming from the front's server, not from the browser.
11. **No internal address.** With `API_INTERNAL_URL` unset, `/api/offerings` answers `502` and the landing shows its existing error state.
12. **Sign out ends the web session.** Sign out from the user menu (`POST /api/logout` answers), then sign in again: the login asks for credentials instead of approving silently.
13. **A step-up by another account.** Confirm a step-up with a different account: the previous session stays, and that other account's web session is ended (`POST /api/logout` with its token); a later sign-in as that account asks for credentials.

## 7. Open — Product owner's

None. Q1–Q5 are settled (§0). How the front is served over `https` in each setup is a deployment matter (Product owner, 2026-10-12), not part of this change (D8).

## 8. Risks and unverified points

- [Likely, not verified] `rewrites()` in `next.config.ts` are compiled at build time. D2 does not depend on it.
- [Unverified] Whether Next.js, when it proxies an external rewrite, appends its own `X-Forwarded-*` after the ones the proxy sets. Check 2 (every `Location` on the front) settles it. If Next overrides them, the build reports it.
- [Unverified] Laravel 13's CSRF check with the forwarded host. Check 6 (no `419`).
- [Unverified] The Livewire path hash is stable per installation. The pattern of D1 does not depend on its value.
- Absolute URLs inside JSON bodies (pagination `links`) are built by the API without the `/api` prefix. The front does not read them (verified, §1). A future feature that follows them would need `X-Forwarded-Prefix` support on the API. This is not needed now.
- The same-origin exposure of D10. Backlog candidate (for Product owner to add or not): a CSP and `frame-ancestors` on the API's web pages.
- Every API request now passes through the front's server, which adds one local hop. Request size and time limits of the forwarding (Next.js defaults) are far above these requests.

## 9. Tests and checks to keep green

- `proxy.test.ts`, `src/shared/api/client.test.ts`, `src/shared/api/tokens.test.ts`, `src/features/auth/api/authorize.test.ts`, `src/features/auth/model/session.test.ts`, `src/pages/callback/ui/CallbackScreen.test.tsx`, `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/pages/account/ui/AccountClient.test.tsx`, `src/features/user-account/ui/PasswordForm.test.tsx`, the guards.
- `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Review log

- 2026-10-12, design lead, first draft.
  - Decided D1–D10, with the web routes forwarded and JSON and the token direct.
  - Five questions for Product owner.
- 2026-10-12, design lead, revision after Product owner's answers (§0).
  - D1: forwarded set = the `/api/` prefix (token and JSON, prefix stripped) + the web list; the order of checks in the proxy.
  - D3: applies to both groups.
  - D4: `NEXT_PUBLIC_API_URL` = `{APP}/api`; the web pages on `NEXT_PUBLIC_APP_URL`; no second variable.
  - D5: `API_INTERNAL_URL` required, no fallback (a fallback would loop to the front); server components read it directly.
  - D6: `connect-src` without the API origin.
  - D7: CORS no longer applies; cookies on the JSON calls are ignored.
  - D8: issuer moves with `NEXT_PUBLIC_API_URL`; consequence on `https`.
  - D9: one public entry point.
  - Spec deltas, scenarios (11) and browser checks (11) rewritten.
  - Q1–Q5 recorded as settled.
  - New open point: `https` for the front outside ngrok (Open 1). It does not block propose. Withdrawn the same day (see below).
- 2026-10-12, design lead, addition from the orchestrator's read-only check of the API.
  - §0: the OAuth client's registered redirect (`FrontClientSeeder.php`, `{FRONT_URL}/callback` at seed time) must be `<public origin>/callback`. API environment, Product owner's.
  - §6: the environment line and check 3 cover it.
  - D3: the API's `TrustProxies` honours the forwarded headers, `-Prefix` included, once the front's address is in `TRUSTED_PROXIES`.
- 2026-10-12, design lead, Product owner's rewording.
  - "Demo" wording replaced by "the build environment" / "the ngrok origin"; meaning unchanged.
  - Open 1 removed (Product owner, 2026-10-12: serving the front over `https` is a deployment matter). Kept as a stated fact in D8.
  - No decision, scenario or browser check depends on Caddy or names a way of serving `https`.
  - "Open" is empty.
- 2026-10-12, design lead, `/logout` from the orchestrator's read-only check of the API.
  - §2 and D1: `/logout` is in the prefix group only; Fortify's shadowed web `/logout` stays out of the web list.
  - Scenario 1 lists `POST /api/logout`, and scenario 6 lists `/logout` (no prefix) as not forwarded. No new scenario.
  - Browser checks 12–13 added.
