# Design — route-api-web-pages-through-front

## Context

- Source of truth: `docs/design/route-api-web-pages-through-front/design-summary.md` (`Status: approved`, commit `4e02d8c3`), its §0 answers and decisions D1–D10, and `handoff.md`. This design carries them as decided and places them in the code; it re-decides nothing.
- Backlog entry R74, revised by Product owner to option A on 2026-10-12: the front is the only door to the API. R74's end-state point 2 and point 3's fallback are superseded, and so is the decisions log entry of 2026-10-09 (2) that called reading `API_INTERNAL_URL` a deploy matter.
- Today (summary §1): every API address is built on `NEXT_PUBLIC_API_URL` (`client.ts`, `tokens.ts`, `authorize.ts`, `UserMenu.tsx:123`, `SecuritySection.tsx:43` and `:56`, `PasswordForm.tsx:92`); `proxy.ts` sets the security headers and the locale routing and forwards nothing; `next.config.ts` has no rewrites; `API_INTERNAL_URL` is read nowhere.
- The API's routes (summary §2): no path prefix of its own, no route under `/api`; the web routes listed in the auth delta; `POST /oauth/token` and every JSON route; `POST /logout` exists only as the `api` route.
- Contract: unchanged. `contracts/openapi.yaml` keeps the API's own paths; `/api` is a routing detail of the front.
- Next.js 16.4.0 guides read for this change: `03-file-conventions/proxy.md` (execution order, Node.js runtime, request headers, producing a response), `04-functions/next-response.md` (`rewrite()`), `05-config/01-next-config-js/rewrites.md` (order, external URLs), `05-config/01-next-config-js/proxyClientMaxBodySize.md`, `02-guides/environment-variables.md` (server-only and runtime variables), `02-guides/content-security-policy.md`.

## Goals / Non-Goals

**Goals**
- One public entry point: the browser reaches the API only through the front's origin.
- Two forwarded groups (the `/api/` prefix, the web list), forwarded before any other handling.
- Server-side reads go to `API_INTERNAL_URL` directly; the browser never sees it.
- The front's own pages keep their headers; forwarded responses carry none of them; `connect-src` drops the API origin.

**Non-Goals**
- Any API code; the API's environment and the OAuth client's `redirect_uris` (Product owner's, summary §0).
- Deploy files and how the front is served over `https`.
- Rewriting `Location` headers or bodies; following absolute URLs from JSON bodies.
- Token storage, PKCE, scopes and the authorization parameters.

## Decisions

### D1 — Two forwarded groups: the `/api` prefix and the web list (summary D1)

- Prefix group: every path starting with `/api/` is forwarded with `/api` removed. `/api` alone is not forwarded. `/logout` belongs only to this group (`/api/logout`).
- Web list: the API's web routes, forwarded with the path unchanged. Exact paths; three parameterised paths (`/reset-password/{token}`, `/email/verify/{id}/{hash}`, `/user/passkeys/{passkey}`, one non-empty segment per parameter); three prefixes (`/build/`, `/flux/`, and the Livewire group matched as `/livewire-` followed by one or more lowercase hexadecimal characters and `/`). The full list is the one the auth delta's "One public entry point" states; Fortify's web `/logout` is not in it.
- Correction round 1 (`corrections.md`, Round 1, item 1): `/favicon.svg`, the tab icon the API's pages ask for, joins the web list as an exact path, forwarded unchanged like `/login`; this supersedes the summary §2 row that kept it on the front. `/favicon.ico` stays not forwarded (the front serves `app/favicon.ico`), and `/apple-touch-icon.png` stays out of scope (neither app has one).
- Every method is forwarded with its query string, headers and body.

**Placement (FSD).** A new file `src/shared/api/forwarding.ts` holds:
- `API_PREFIX = "/api"`, the one place the prefix lives;
- the web list (exact paths, parameterised paths, prefixes);
- `apiPathFor(pathname): string | null` — the path to request on the API (prefix removed for the prefix group, unchanged for the web list), or `null` when the path is not forwarded;
- `forwardToApi(request: NextRequest): NextResponse | null` — `null` when `apiPathFor` returns `null`; otherwise the `502` of D5 or the rewrite of D2 with the headers of D3.

`src/shared/api/index.ts` exports `API_PREFIX` and `forwardToApi` (the proxy imports them through the segment's public index, like every other consumer of `@/shared/api`). `apiPathFor` stays internal unless the build needs it from outside the segment. The module is business-agnostic routing of the API's surface and has no dependency on the auth flow, so `shared/api` is its layer (fsd-architecture: "generic and business-agnostic" → `shared`; requests live in the `api` segment).

### D2 — Forwarding happens in `proxy.ts` with `NextResponse.rewrite` (summary D2)

- A forwarded path answers `NextResponse.rewrite(<API_INTERNAL_URL><apiPath><search>, { request: { headers } })` with the headers of D3, and sets none of the front's response headers.
- Why the proxy (verified): the proxy runs before the `beforeFiles` rewrites (`proxy.md` "Execution order", items 3 and 4; `rewrites.md` "order Next.js routes are checked"); it runs on the Node.js runtime by default (`proxy.md` "Runtime") and reads `process.env.API_INTERNAL_URL` per request; `next.config.ts` rewrites are loaded at build time (`next/dist/build/index.js`: `load-custom-routes` at line 593, written to the routes manifest at line 883), so a runtime target cannot live there. `next.config.ts` does not change.
- `NextResponse.rewrite` to an absolute URL proxies the request and keeps the browser's URL (`next-response.md` `rewrite()`; source `next/dist/server/lib/router-server.js:470` calls `proxyRequest` with the buffered body).

**Order of checks in `proxy.ts`** (first match wins):
1. `/api/…` → forward with the prefix stripped (D1);
2. a path in the web list → forward unchanged (D1);
3. `/_next/…` or a path whose last segment has a file extension → `NextResponse.next()` untouched (today's early return);
4. `/callback` → its branch: CSP with nonce and the security headers, no COOP, no locale;
5. anything else → locale routing with the CSP, the security headers and COOP.

Steps 1–2 are one call, `forwardToApi(request)`, at the top of `proxy()`, before step 3: the API's assets carry file extensions. `config.matcher` stays `["/:path*"]`.

### D3 — The forwarded request carries the front's public origin (summary D3)

- On every forwarded request the proxy sets, from `NEXT_PUBLIC_APP_URL`, replacing any incoming value: `X-Forwarded-Host` = its host (with the port when the URL names one), `X-Forwarded-Proto` = its scheme without `:`, `X-Forwarded-Port` = its port, or `443` for `https` and `80` for `http` when it names none.
- `X-Forwarded-For`, `Authorization` and the cookies pass through unchanged; no `Location` header or body is rewritten.
- See Risks for what Next.js does to `X-Forwarded-Host` after the proxy.

### D4 — Bases: web pages at the front's root, JSON and token under the prefix (summary D4)

- `NEXT_PUBLIC_API_URL` keeps its name and role (base of the JSON calls and of the token endpoint) and takes the value `{NEXT_PUBLIC_APP_URL}/api` in every setup. `tokens.ts` does not change; its `issuer` and `token_endpoint` move with the value (D8).
- A new file `src/shared/api/web-pages.ts` holds `apiWebPageUrl(path: string): string` = `{NEXT_PUBLIC_APP_URL}{path}`, read per call like every env value in the segment. `src/shared/api/index.ts` exports it.
- Call sites that move to the helper:

| Call site | Path |
|---|---|
| `src/features/auth/api/authorize.ts` `authorizeUrl` (popup, full-page fallback, silent `prompt=none`, step-up) | `/oauth/authorize` |
| `src/widgets/app-header/ui/UserMenu.tsx:123` | `/user/security` |
| `src/pages/account/ui/SecuritySection.tsx:43` | `/user/security` |
| `src/pages/account/ui/SecuritySection.tsx:56` | `/email/verify` |
| `src/features/user-account/ui/PasswordForm.tsx:92` | `/forgot-password` |

- `authorize.ts` loses its private `apiUrl()`; its `appUrl()` stays for `redirect_uri`, the message origin check and the opener check. The authorization parameters do not change, and neither do the links' presentation and popup behaviour.

### D5 — `API_INTERNAL_URL`: required on the server, no fallback (summary D5)

- A server-only variable (no `NEXT_PUBLIC_` prefix, so Next.js never inlines it in the browser bundle: `environment-variables.md`), read per call.
- Forwarding: when it is unset or empty, `forwardToApi` answers `new NextResponse(null, { status: 502 })` with no rewrite and none of the front's headers.
- Server-side reads: `client.ts`'s private `apiUrl()` returns `process.env.API_INTERNAL_URL ?? ""` when `typeof window === "undefined"` (the front's server) and `process.env.NEXT_PUBLIC_API_URL ?? ""` otherwise. The three senders (`request`, `requestWithToken`, `publicRequest`) keep using `apiUrl()`, so the server calls the API's own paths directly and the browser calls `{APP}/api/<path>`. The `/api` prefix is never added on the server.
- Without `API_INTERNAL_URL`, a server-side request URL is the bare path, which `fetch` on the server rejects; the callers already treat a rejected request as an unreachable API and show their existing error states. Nothing is retried and `NEXT_PUBLIC_API_URL` is never used as a fallback (it points at the front itself).
- Values (environment, not code): Docker `http://api:80`; local `http://localhost:8000` in `.env.local`.

### D6 — Headers and CSP (summary D6)

- `connect-src` = `'self'` + `NOMINATIM_ORIGIN`. `proxy.ts` stops reading `NEXT_PUBLIC_API_URL`. The rest of the directive list, the nonce, `/callback`'s branch (CSP, no COOP) and the pages' COOP `same-origin-allow-popups` and security headers do not change.
- A forwarded response gets none of the front's headers because `forwardToApi` returns before the CSP is built.
- "No `X-Powered-By`" stays `poweredByHeader: false` for the front's own responses; the API's is removed by `expose_php=Off` (Q4, API environment).

### D7 — Cookies, CORS and redirects (summary D7)

Carried as decided: the API's session and `XSRF-TOKEN` cookies live on the front's origin; the JSON calls are same-origin, so CORS and preflights no longer apply; `Location` headers and form actions come from the API on the front's origin (D3); a session started on the API's own address does not carry over. No front code is involved.

### D8 — The OAuth `issuer` (summary D8)

`issuer` = `token_endpoint` base = `NEXT_PUBLIC_API_URL` (`{APP}/api`); nothing checks it (no `iss` check in `validateAuthResponse`, no `openid` scope, Passport sends no `iss`). A production build signs in only when the front is served over `https` (`oauth4webapi` refuses an `http` token endpoint outside development); `npm run dev` is unaffected.

### D9 — One public entry point (summary D9)

One public address, the front's. The API publishes no public port and is reached only from the front's server at `API_INTERNAL_URL`. Environment values are listed in summary D9 and §6.

### D10 — Same-origin consequences, accepted (summary D10)

The API's pages and their scripts run on the front's origin and share its storage and opener; accepted by Product owner and recorded as a risk. `authorize.ts` keeps its checks (messages only from `NEXT_PUBLIC_APP_URL` and the popup it opened; the callback posts only to an opener of the front's origin).

### D11 — Size limits

- `proxy.ts`: the forwarding moves to `forwardToApi` (D1), so `proxy()` gains two lines. If `proxy()` would pass 80 lines, the directive list moves into a private function of `proxy.ts` that takes the nonce and returns the policy. The file stays under 300 lines.
- `src/shared/api/forwarding.ts`: the list as data plus two functions, each well under 80 lines and complexity 15; the match of a path runs over the list rather than as one branch per entry.
- `src/shared/api/web-pages.ts`: one function. `client.ts` and `authorize.ts` stay within the limits (one changed function each).

### Tests (one per scenario)

| Scenario (capability) | Test file | New or existing |
|---|---|---|
| A path under the prefix is forwarded without it (auth) | `proxy.test.ts` | new |
| A listed web route is forwarded unchanged (auth) | `proxy.test.ts` | new |
| A forwarded response is served as the API sends it (auth) | `proxy.test.ts` | new |
| The forwarded request carries the public origin (auth) | `proxy.test.ts` | new |
| No internal API address (auth) | `proxy.test.ts` | new |
| Paths that are not forwarded (auth) | `proxy.test.ts` | new |
| Connections to the API are allowed (app-shell) | `proxy.test.ts` "sets Content-Security-Policy to exactly the design.md D9 directive list" | existing, expected `connect-src` updated |
| Policy present on the callback (auth) | `proxy.test.ts` "sets Content-Security-Policy to exactly the design.md D9 directive list, the API origin in connect-src" | existing, expected `connect-src` updated |
| The authorization page is on the application's origin (auth) | `src/features/auth/api/authorize.test.ts` "opens {NEXT_PUBLIC_API_URL}/oauth/authorize with exactly the parameters of design.md D5…" | existing, expected origin updated |
| The token requests go to the application's origin (auth) | `src/shared/api/tokens.test.ts` | new |
| The security entry points at the application's origin (app-shell) | `src/widgets/app-header/ui/AppHeader.test.tsx` "renders the security entry as an external link, natively" | existing, expected base updated |
| Two-factor authentication and passkeys (user-account) | `src/pages/account/ui/AccountClient.test.tsx` "shows its description and external same-tab links to {API}/user/security…" | existing, expected base updated |
| Verifying the email (user-account) | `src/pages/account/ui/AccountClient.test.tsx` "while the email is unverified lists a same-tab Verify email link to {API}/email/verify…" | existing, expected base updated |
| The password-reset link (user-account) | `src/features/user-account/ui/PasswordForm.test.tsx` "renders the forgot-password line as a same-tab external link to {API}/forgot-password…" | existing, expected base updated |
| Server and browser reads take their own base (app-shell) | `src/shared/api/client.test.ts` | new |

Existing tests that assert the same destinations for unchanged scenarios follow the base with their expected value only: `authorize.test.ts` "navigates the current page to the authorization URL…" and "opens {NEXT_PUBLIC_API_URL}/oauth/authorize in a popup with scope=profile:write…"; `AppHeader.test.tsx` "opens the security entry in a popup window on a plain click…"; `AccountClient.test.tsx` "AccountClient — Security section popup" (its `ENTRIES` and the blocked-popup URL). A test title that names the old base names the new one. No other assertion changes.

## Risks / Trade-offs

- **[Verified, source] Next.js overwrites `X-Forwarded-Host` on an external rewrite.** `next/dist/server/lib/router-utils/proxy-request.js` (16.4.0) proxies through `httpxy` with `changeOrigin: true`, `xfwd` off and `headers: { 'x-forwarded-host': req.headers.host }`; `httpxy` copies the request headers (with the proxy's overrides applied first, `resolve-routes.js:415-440`) and then applies these option headers. So the API receives the proxy's `X-Forwarded-Proto` and `X-Forwarded-Port`, but `X-Forwarded-Host` is the `Host` header that reached the front's server, and `Host` is the internal address. The build environment's single public entry point, ngrok, keeps the public `Host`, so the value is the public host and D3's outcome holds. The unit test of D3 observes the proxy's request headers and passes either way. Product owner decided on 2026-10-12 not to override the forwarded `host` request header: D3 is unchanged, and browser check 2 confirms that every `Location` stays on the front's origin.
- **[Verified, docs] Body buffering.** With a proxy, Next.js buffers request bodies up to 10 MB and silently truncates beyond (`proxyClientMaxBodySize.md`); the forwarded requests (forms, JSON, Livewire updates, passkey options) are far below. The external-rewrite timeout is 30 s by default (`proxy-request.js`, `experimental.proxyTimeout`). An unreachable `API_INTERNAL_URL` answers `500 Internal Server Error` from Next.js (`proxy-request.js` `onProxyError`), not `502`; only the unset variable answers `502`.
- **[Verified, docs] Laravel 13 CSRF.** `PreventRequestForgery` first checks the browser's `Sec-Fetch-Site` and skips the token check for same-origin requests; otherwise it falls back to the token (https://laravel.com/docs/13.x/csrf). The API's forms post from the front's origin to the front's origin, so the check sees same-origin; browser check 6 (no `419`) confirms it. `Sec-Fetch-Site` is sent only over `https`; on `http` the token fallback applies with the session cookie on the front's origin.
- **[Verified] `rewrites()` are compiled at build** (see D2). D2 does not depend on it.
- **[Unverified] The Livewire path hash is stable per installation.** The pattern matches any hash.
- **Prerendered pages.** A page rendered at build time reads `API_INTERNAL_URL` from the build environment; without it, the read fails like an unreachable API during the build. `npm run build` in the final task shows whether any page reads the API at build time.
- Absolute URLs inside JSON bodies lack the `/api` prefix; the front does not read them. `X-Forwarded-Prefix` would be the later fix on the API side.
- Same-origin exposure of D10 (backlog candidate: a CSP and `frame-ancestors` on the API's pages).
- One extra local hop per API request through the front's server.

## Migration Plan

- Environment, before deploying: `NEXT_PUBLIC_API_URL={NEXT_PUBLIC_APP_URL}/api` (build time, it is inlined), `API_INTERNAL_URL` on the front's server (runtime), and the API's environment of summary §0 (Product owner's).
- The first sign-in after the switch shows the API's login once (D7).
- Rollback: revert the change and restore `NEXT_PUBLIC_API_URL` to the API's address.

## Open Questions

None.
