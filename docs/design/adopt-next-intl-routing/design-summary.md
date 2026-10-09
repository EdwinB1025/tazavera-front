Status: draft — pending Product owner review

# Design summary — adopt-next-intl-routing

Input for `/opsx:propose` once Product owner approves it. Drafted by the design lead on 2026-10-09 from `develop` at `3ff777d`. The design lead decides nothing: what a source settles is listed in §0 with that source, and everything else is under "Open" with options and a recommendation.

- Change-id: `adopt-next-intl-routing` (backlog R43). Type: `Change` (normal flow; not the fast lane).
- Capability: `app-shell` (owns locale routing, the CSP and the response headers), with `auth` (the locale of the sign-in flow). One commit per capability.
- Branch and folders: `feature/adopt-next-intl-routing`, `openspec/changes/adopt-next-intl-routing/`, `docs/design/adopt-next-intl-routing/`.
- Depends on: R5 `share-active-locale`, R28 `reduce-shared-client-bundle` and R31 `harden-response-headers`, all archived on 2026-10-08 (`openspec/changes/archive/`). Nothing waits on this change.
- Installed versions (`package.json`, `node_modules`): `next` 16.4.0, `next-intl` 4.14.9, `react` 19.2.8. No dependency is added, removed or upgraded.

## 0. Settled inputs (not re-decided here)

| Source | What it settles |
|---|---|
| `docs/backlog.md` R43 | Replace the hand-written locale handling with next-intl: `defineRouting` instead of the list in `src/shared/config/locales.ts`, the next-intl middleware instead of the prefix logic in `proxy.ts`, `useLocale()` / `getLocale()` instead of reading the locale from the URL. R5's function (`localeFromPath`) is removed. Texts keep reaching components as props: no `useTranslations`. Condition: measure the JS per route before and after; the change must not exceed R28's target. Last priority. |
| Decisions log, 2026-10-08 "respuestas sobre R4, R5, R8 y R18" | "el idioma solo se elige con el botón de idioma de la cabecera": the locale is chosen only with the header's language button, never detected from the browser. |
| `openspec/specs/app-shell/spec.md` | Behaviour that stays: "Locale routing" (prefix always; `/` → `/es`; an unsupported prefix is redirected under `/es` and resolves to not-found), "Language selection", "Content-Security-Policy", "Cross-Origin-Opener-Policy", "Response security headers", "Client code loaded per route". |
| R31 `harden-response-headers` (proposal) | The CSP, its per-request nonce and COOP stay exactly as they are; the three security headers are set on every document response the proxy handles (locale page, locale redirect, `/callback`); framework and asset paths stay untouched. |
| R5 `share-active-locale` design D1 | `src/shared/lib/i18n` is server-only (`node:fs`); client code must not import it. Client-safe locale data lives in `src/shared/config/`. |
| R28 `reduce-shared-client-bundle` design | Measurement method for First Load JS per route (union of `rootMainFiles` and each route's `entryJSFiles`, plus its `@sidebar` page, gzipped with `zlib.gzipSync`), and the post-R28 figures (191.5–215.6 KB gz on locale routes). Technical review §R28: target "≤ 170 KB gz", marked *not verified*; R28 did not reach it. |
| next-intl 4.14.9 docs, `routing/middleware.mdx` "Composing other middlewares" ([source](https://raw.githubusercontent.com/amannn/next-intl/v4.14.9/docs/src/pages/docs/routing/middleware.mdx)) | `createMiddleware(routing)` returns `(request: NextRequest) => NextResponse`; "you can either modify the request before the `next-intl` middleware receives it, modify the response or even create the middleware based on dynamic configuration." |
| `node_modules/next-intl/dist/esm/development/middleware/middleware.js` | The middleware copies `request.headers` into the forwarded request headers and adds `X-NEXT-INTL-LOCALE`; it answers with `NextResponse.next`, `NextResponse.rewrite` (only when the internal path differs) or `NextResponse.redirect`; it sets the `NEXT_LOCALE` cookie when `localeCookie` is on and a `Link` header when `alternateLinks` is on. On a pathname `decodeURI` cannot decode it returns a bare `NextResponse.next()`. |
| `node_modules/next-intl/dist/esm/development/routing/config.js`, `middleware/resolveLocale.js` | Defaults: `localePrefix: 'always'`, `localeDetection: true` (cookie, then `Accept-Language`), `localeCookie: { name: 'NEXT_LOCALE', sameSite: 'lax' }`, `alternateLinks: true`. With `localeDetection: false` an unprefixed path resolves to `defaultLocale`. |
| `node_modules/next-intl/dist/esm/development/server/react-server/RequestLocale.js` | `requestLocale` in `getRequestConfig`, and so `getLocale()`, read the `X-NEXT-INTL-LOCALE` request header the middleware sets (or `setRequestLocale`). Today no middleware sets it, so `src/shared/lib/i18n/request.ts` always falls back to `es`; no code reads it yet. |
| next-intl 4.14.9 docs, `usage/configuration.mdx` ([source](https://raw.githubusercontent.com/amannn/next-intl/v4.14.9/docs/src/pages/docs/usage/configuration.mdx)), and `react-server/NextIntlClientProviderServer.js` | `NextIntlClientProvider` rendered from a Server Component inherits `locale`, `messages`, `now`, `timeZone` and `formats`; `messages={null}` opts out of sending messages to the client. In v4 the client `useLocale` comes from `use-intl/react` and needs the provider. |
| next-intl 4.14.9 docs, `routing/setup.mdx` ([source](https://raw.githubusercontent.com/amannn/next-intl/v4.14.9/docs/src/pages/docs/routing/setup.mdx)) | Standard files: `routing.ts` (`defineRouting`), `proxy.ts`, `navigation.ts` (`createNavigation`), `request.ts`, `app/[locale]/layout.tsx`. `request.ts` in the docs reads the locale from `next/root-params` (Next 16.3+), which assumes `[locale]` is the root layout; `hasLocale` is exported from `next-intl`. |

## 1. Scope

**In:**
- One routing definition with `defineRouting` (locales `es`, `en`, `ca`; default `es`; prefix `always`).
- `proxy.ts` delegates locale routing to the next-intl middleware and keeps the CSP nonce, the CSP, the three security headers and COOP exactly as today.
- Server code reads the active locale with `getLocale()` (root layout, its metadata, the `[locale]` not-found boundary) instead of the `x-locale` header.
- A `NextIntlClientProvider` so client code reads the locale with `useLocale()`; the auth flow gets its locale from it instead of `localeFromPath(window.location.pathname)`.
- The language selector switches locale through next-intl's navigation (Open 4).
- `localeFromPath` is removed; `src/shared/config/locales.ts` gives way to the routing definition (Open 3).

**Out (non-goals):**
- `useTranslations` / `getTranslations`: every text keeps reaching components as props from `getMessages` (R43).
- Message catalogs, their structure and the catalog guard.
- Static rendering (`generateStaticParams`, `setRequestLocale`, `next/root-params`): pages stay dynamic, as the CSP nonce and the theme cookie already require.
- Localized pathnames, domains, locale detection from the browser.
- Rewriting the ~50 non-test files that build `/${locale}/…` links by hand to next-intl's `Link` (Open 4 limits navigation to the selector; the rest is a backlog candidate, see review log).
- Any change to the CSP directives, COOP, the security headers or `/callback`.

## 2. Routing definition

`defineRouting` (from `next-intl/routing`) with:
- `locales: ["es", "en", "ca"]`, `defaultLocale: "es"`, `localePrefix: "always"`: the spec "Locale routing";
- `localeDetection: false`: the decisions log of 2026-10-08 (locale chosen only with the header button). Without it, `/` and bare paths would redirect by the `NEXT_LOCALE` cookie or `Accept-Language`, which today's proxy never does;
- `localeCookie: false`: with detection off the cookie is never read, so setting it would only add a `Set-Cookie` to document responses (a header change against R31's response set);
- `alternateLinks`: Open 2.

Location: a client-safe module under `src/shared/config/` (R5 D1: `src/shared/lib/i18n` is server-only). Its exact shape (keep `LOCALES`/`DEFAULT_LOCALE`/`Locale` as derived exports or replace every importer) is Open 3.

## 3. `proxy.ts` and the next-intl middleware (CSP nonce and headers)

End state, in request order:
1. Framework and asset paths (`/_next/*`, any last segment with a file extension) return untouched, as today. The matcher stays `["/:path*"]`; the next-intl docs' matcher (`/((?!api|trpc|_next|_vercel|.*\\..*).*)`) is not adopted, because `/callback` must still reach the proxy for its CSP.
2. The nonce and the CSP string are built as today.
3. `/callback` keeps its own branch unchanged (CSP, nonce, security headers, no COOP, no locale). The next-intl middleware never sees it.
4. Every other path: the proxy builds the forwarded request headers (`x-nonce`, `Content-Security-Policy`) and hands the next-intl middleware a request that carries them (the documented "modify the request before the middleware receives it"); the middleware copies them into the request it forwards and adds `X-NEXT-INTL-LOCALE`.
5. On the response the middleware returns (next, or the redirect of `/` and of bare or unsupported-prefix paths), the proxy sets `Content-Security-Policy`, the three security headers and COOP, exactly as today on both branches.
6. `x-locale` is no longer set; its readers move to `getLocale()` (§4).

How the build gives the middleware a request with the extra headers (a new `NextRequest` built from the incoming one with the new headers, or setting them on `request.headers`) is an implementation detail for design.md; the outcome is checked by the existing `proxy.test.ts` cases (nonce forwarded upstream, CSP on request and response) plus the page-level check of §8.

Outcomes that must stay identical (spec "Locale routing", "Content-Security-Policy", "Response security headers", COOP): `/` → 307 to `/es`; `/about` → `/es/about`; `/fr/x` → `/es/fr/x` → not-found; query kept on redirects; the same headers on the redirect and the page response; no header on assets; `/callback` unchanged.

## 4. Server-side locale

- `app/layout.tsx` (`<html lang>`, `generateMetadata`) and `app/[locale]/not-found.tsx` read `await getLocale()` from `next-intl/server` instead of `headers().get("x-locale") ?? DEFAULT_LOCALE`. On `/callback` no middleware runs, `requestLocale` is empty and `request.ts` falls back to `es`: the same `lang="es"` as today.
- The theme cookie read (`headers()`) stays.
- `src/shared/lib/i18n/request.ts` keeps reading `requestLocale` (the header path), not `next/root-params` (Open 1).
- `app/[locale]/layout.tsx` keeps receiving `params.locale` for `AppShell`; whether it switches to `getLocale()` too is the architect's choice (same value).

## 5. Provider

- One `NextIntlClientProvider` in `app/[locale]/layout.tsx`, wrapping `AppShell`. Not in the root layout: `/callback` sits outside `[locale]`, needs no active locale (its return-route check only validates a path, §6), and keeping it out keeps the callback page's client code as it is.
- `messages={null}`: texts stay props (R43), so no catalog is serialized to the client. `locale` is inherited from the request config. No `formats`, `now` or `timeZone` are configured.
- The `[locale]` layout is a Server Component, so the provider's server variant is used and the routing files need no `"use client"`.

## 6. How the sign-in code receives the locale (replacing `localeFromPath`)

Today (R5 D2) three functions of `src/features/auth` read a path:
- `activeLang()` (`api/authorize.ts`): the `lang` of `GET /oauth/authorize`, used by `signIn`, `requestProfileWrite`, `signInWithRegistration` and `startSilent`; `startSilent` is also called from a non-React seam (`onUnrecoverable`, `model/session.ts:231`).
- `localeRoot()` (`model/session.ts`): where `signOut` lands.
- `toAppRoute()` (`model/return-route.ts`): refuses a return route without a supported locale prefix. This is validation of a path, not the active locale; it switches to `hasLocale(routing.locales, <first segment>)`, and the refusal is unchanged.

Ten call sites in pages, features and the shell call `signIn` / `signOut`. How the first two receive the locale is Open 5. In every option the `lang` value and the sign-out landing are unchanged; `/callback` code keeps no dependency on the active locale.

## 7. Texts as props

Unchanged: screens read `getMessages(area, locale)` on the server and pass texts down; no component calls `useTranslations`, `getTranslations` or `useMessages`. The provider carries no messages (§5). The catalog guard and the `react/jsx-no-literals` rule stay.

## 8. Verification (condition of R43)

- `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- **JS per route (R28 condition).** Before the first code task and after the last, on the same base commit plus the change, the build measures First Load JS per route with R28's method (design.md "Measurement" of `reduce-shared-client-bundle`) and records both tables in design.md. Pass criterion: Open 6. The spec scenario "Route without a combobox" must still hold.
- **Headers (R31 risk).** Against `next start`: `/`, `/about`, `/fr/x`, `/es`, `/es/about`, `/callback` and one `/_next/static/…` asset answer with the same status, `Location` and the same `Content-Security-Policy` (modulo nonce), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` set as on `develop`; no `X-Powered-By`, no `Set-Cookie: NEXT_LOCALE`, and no `Link` header unless Open 2 says otherwise.
- **CSP in the browser.** In Chromium, `/es`, `/en/offerings` and `/ca/register` hydrate with no CSP violation in the console, and every framework `<script>` carries the request's nonce.
- **Locale.** `<html lang>` and the metadata description follow the prefix on `/es`, `/en`, `/ca`; the language selector opens the same route in the chosen locale; the authorization URL carries `lang` equal to the route's locale; sign-out lands on `/{locale}`.

## 9. Files that change

| File | Layer | Change |
|---|---|---|
| `src/shared/config/locales.ts` | shared | Holds the `defineRouting` definition; `localeFromPath` removed; the rest per Open 3 |
| `src/shared/lib/<navigation segment>/` (new, Open 4) | shared | `createNavigation(routing)`: `useRouter`, `usePathname` for the selector |
| `proxy.ts` | root | Delegates locale routing to `createMiddleware(routing)`; CSP, nonce, headers, COOP, `/callback` and asset exclusion unchanged; `x-locale` removed |
| `app/layout.tsx` | app (routing) | `getLocale()` instead of `x-locale` (lang and metadata) |
| `app/[locale]/layout.tsx` | app (routing) | `NextIntlClientProvider` with `messages={null}` around `AppShell` |
| `app/[locale]/not-found.tsx` | app (routing) | `getLocale()` instead of `x-locale` |
| `src/shared/lib/i18n/request.ts`, `messages.ts` | shared | Use the routing definition for the supported-locale check (per Open 3) |
| `src/app/shell/ShellChrome.tsx` | app | Locale switch through next-intl navigation (Open 4); sign-in/out per Open 5 |
| `src/app/shell/AppShell.tsx`, `SessionShell.tsx` | app | Locale list and check from the routing definition (per Open 3); per Open 5 if the session records the locale |
| `src/widgets/app-header/ui/LanguageSelect.tsx` | widgets | Supported-locale check from the routing definition (per Open 3) |
| `src/pages/not-found/ui/NotFoundScreen.tsx` | pages | Same (per Open 3) |
| `src/features/auth/api/authorize.ts`, `model/session.ts`, `model/return-route.ts` | features | §6 and Open 5 |
| The ~10 `signIn`/`signOut` call sites | pages, features | Only under Open 5 option A or B |
| Tests: `proxy.test.ts`, `app/layout.test.tsx`, `src/features/auth/**/*.test.ts`, `AppShell.test.tsx`, `ShellChrome`/header tests, and their `qa/` mirrors | — | Mocks move from the `x-locale` header and `window.location` to next-intl's `getLocale` / `useLocale` and navigation; assertions keep their expected values |

`next.config.ts` stays (`createNextIntlPlugin` with the explicit request path, `poweredByHeader: false`). `contracts/openapi.yaml` and the API are untouched.

## 10. Spec delta (`app-shell`, `auth`)

No observable behaviour changes, so the delta is the smallest one the architect needs: likely none to "Locale routing" and "Language selection"; at most a wording note that the locale is chosen only with the selector (no browser detection), if Product owner wants that decision in the spec (it is today only in the decisions log). The architect proposes it; it does not block the summary.

## 11. Risks

- **R31 headers.** The middleware's response replaces the hand-built one; any header the proxy forgets on one of the two branches (next, redirect) is a regression. The next-intl defaults would add `Set-Cookie: NEXT_LOCALE` and a `Link` header; §2 and Open 2 switch them off. Covered by `proxy.test.ts` and §8.
- **CSP nonce.** If the forwarded request lacks `x-nonce` or the CSP request header, Next.js stamps no nonce and `'strict-dynamic'` blocks every framework script: a blank, non-hydrating page. Covered by the nonce test in `proxy.test.ts` and the browser check of §8.
- **Malformed paths.** On a path `decodeURI` rejects, the middleware returns a bare `NextResponse.next()` without the forwarded headers; Next.js answers 400. The proxy still sets the response headers; no page renders, so no script needs the nonce. Noted, no action.
- **JS per route (R28).** The provider and `use-intl/react` (plus `createNavigation`, Open 4) enter the client bundle of every locale route. Measured per §8; Open 6 sets the limit.
- **Server cost.** `getLocale()` runs `request.ts`, which loads every catalog of the locale from disk (`getCatalogs`) once per request (React `cache`). No component uses those messages. Open 7.
- **Redirect differences.** next-intl normalizes trailing slashes and decodes the pathname before matching; today's proxy does neither. Spec scenarios are unaffected; §8 compares the redirect targets.

## Open

1. **`request.ts`: middleware header or `next/root-params`.** The 4.14.9 setup docs read the locale with `next/root-params`, which assumes `app/[locale]/layout.tsx` is the root layout. Here `app/layout.tsx` is the root (it renders `<html>` with `lang` and the theme) and `/callback` lives outside `[locale]`.
   - A: keep `requestLocale` (the `X-NEXT-INTL-LOCALE` header the middleware sets). No layout moves; still a documented API.
   - B: adopt `next/root-params`: move `<html>` into `app/[locale]/layout.tsx` and give `/callback` its own root layout. Closer to the current docs; more files, and a second root layout to keep in line with the CSP and theme.
   - Recommendation: A. Pages are dynamic anyway (nonce, theme cookie), so B buys nothing measurable.
   - Blocks propose: yes (decides which layout files move).
2. **`alternateLinks`.** Default `true` adds a `Link` header with `hreflang` alternates to every locale page.
   - A: `false`: response headers identical to today.
   - B: `true`: an SEO gain, but a new response header not in the app-shell spec.
   - Recommendation: A (behaviour-preserving; B can come later as its own change).
   - Blocks propose: no.
3. **Fate of `src/shared/config/locales.ts` and its importers (14 files).**
   - A: the file holds `routing` and keeps `LOCALES`, `DEFAULT_LOCALE`, `Locale` and `isSupportedLocale` as thin aliases of it; importers unchanged except the three auth files. Small diff; two names for one thing.
   - B: importers use `routing.locales`, `routing.defaultLocale`, `hasLocale` and next-intl's `Locale` type (declared with `AppConfig` augmentation); the aliases go. "One library, standard structure" as R43 asks; ~14 files plus tests.
   - Recommendation: B, which is what R43 sizes (L, "every importer of the locale config").
   - Blocks propose: yes (scope and size).
4. **Language selector navigation.**
   - A: `createNavigation(routing)` in a new `src/shared/lib` segment; `ShellChrome` switches with `router.push(pathname, { locale: next })` using next-intl's `usePathname`. The ~50 hand-built `/${locale}/…` links stay (backlog candidate).
   - B: keep `next/navigation` and the current prefix replacement; only the locale source changes.
   - C: A plus every link moves to next-intl's `Link`. Far beyond R43's size.
   - Recommendation: A. Name of the new segment (e.g. `src/shared/lib/navigation`) left to the architect. Measure its JS cost under §8.
   - Blocks propose: no (A is the default unless Product owner says otherwise).
5. **How the auth flow receives the locale.**
   - A: explicit parameter: `signIn`, `signOut`, `requestProfileWrite`, `signInWithRegistration` take the locale; each of the ~10 call sites passes `useLocale()`. The non-React seam (`onUnrecoverable` → `startSilent`) has no hook to call, so it still needs a stored locale.
   - B: a feature hook (e.g. `useAuthActions()`) that reads `useLocale()` and returns bound actions; call sites switch from the functions to the hook. Same gap for the seam.
   - C: `useSession()` (already called under the provider by the shell and the gated pages) reads `useLocale()` and records it in the session store the module already keeps; `activeLang()` and `localeRoot()` read the recorded locale, falling back to `es`. Call sites unchanged, and the seam is covered by the same mechanism.
   - Recommendation: C, one mechanism for React and non-React paths and the smallest diff; its tests mock `useLocale` instead of `window.location`.
   - Blocks propose: yes (R43 asks the summary to settle it).
6. **Pass criterion for the JS condition.** R43 says "must not exceed R28's target", but that target (≤ 170 KB gz, technical review, not verified) was not reached by R28 itself: locale routes are at 191.5–215.6 KB gz.
   - A: no locale route grows beyond gzip noise (≤ +0.5 KB gz) against the measured "before".
   - B: a fixed budget per locale route (e.g. ≤ +3 KB gz), with the before/after table in design.md.
   - C: the absolute 170 KB gz: unreachable today, so the change could never pass.
   - Recommendation: B with the number set by Product owner; A would likely reject the provider itself. If the "after" exceeds the budget, the build stops and reports (no task works around it).
   - Blocks propose: yes (it is the change's acceptance condition).
7. **Catalog loading in `request.ts`.** Once the middleware sets the locale, every `getLocale()` also loads all catalogs of the locale, which nothing uses.
   - A: keep `messages: getCatalogs(locale)` (unchanged file behaviour).
   - B: return only `locale` from `getRequestConfig`; `getMessages(area, locale)` stays the only reader.
   - Recommendation: B; it matches "texts as props" and the provider's `messages={null}`.
   - Blocks propose: no.

## Review log

- **2026-10-09, design lead (draft).** Generated from `docs/backlog.md` R43, the decisions log of `docs/general-context.md` (2026-10-08 entries), `AGENTS.md`, the archived designs of R5, R28 and R31, `openspec/specs/app-shell/spec.md`, the code of `proxy.ts`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/not-found.tsx`, `src/shared/config/locales.ts`, `src/shared/lib/i18n/`, `src/features/auth` (`authorize.ts`, `session.ts`, `return-route.ts`), `src/app/shell/ShellChrome.tsx`, `src/widgets/app-header/ui/LanguageSelect.tsx`, and next-intl 4.14.9 (installed sources and the docs at tag `v4.14.9` on GitHub; `next-intl.dev` was not reachable from the session).
  - Settled from sources: `localeDetection: false` (decisions log), `localeCookie: false` (follows from it and from R31's header set), provider in the `[locale]` layout with `messages={null}` (docs, R43 "texts as props"), CSP composition by modifying the request before the middleware and the response after it (docs "Composing other middlewares", `middleware.js`), `/callback` and assets kept outside the middleware (R31, COOP spec), `getLocale()` for the server readers (R43).
  - Not measured: the before/after JS per route; it belongs to apply (§8), on the base the change starts from.
  - Findings for Product owner: (1) `docs/workflow_sdd.md` (and `.claude/workflow_sdd.md`, which `docs/general-context.md` names) does not exist on `develop`, so §3's summary format could not be read; this draft follows the structure of the existing summaries (e.g. `replace-offering-card-session`). (2) R28's target is not met on `develop` (Open 6). (3) Backlog candidate, not folded in: ~50 non-test files build `/${locale}/…` hrefs by hand; next-intl's `Link` would replace them in a later change.

## Propose status

- Change-id: `adopt-next-intl-routing`
- Date: 2026-10-09
- `openspec validate adopt-next-intl-routing --strict`: valid
- Resolves backlog entry: R43
- Open answers (decisions log "2026-10-09 — R43 `adopt-next-intl-routing`: respuestas a los Open", Product owner): Open 1 A (`request.ts` reads the middleware's `requestLocale`; `<html>` does not move; design.md D3, D4); Open 2 A (`alternateLinks: false`; D1); Open 3 B (importers use `routing.locales`, `routing.defaultLocale`, `hasLocale` and next-intl's `Locale`; the aliases go; D1); Open 4 A (`createNavigation` only for the language selector, in `src/shared/lib/locale-navigation.ts`; D6); Open 5 C (`useSession()` records `useLocale()` and the session flow reads it, `es` by default; D7); Open 6 B with a budget of +3 KB gz per locale route against the "before" measurement, raised to +14 KB gz by Product owner on 2026-10-09 after task 7.1 measured +13.4/+13.5 KB gz (decisions log "2026-10-09 — R43: margen de JS por ruta a +14 KB gz", option A) (design.md "Measurement", "Before" measured at propose on `6fbe210`); Open 7 B (`request.ts` returns no catalogs; `getCatalogs` removed; D4).
- Decided by the architect (design.md): the middleware receives `new NextRequest(request, { headers })` (D2); `app/[locale]/layout.tsx` keeps passing `params.locale` (D3); the recorded locale lives in `src/features/auth/model/active-locale.ts` (D7); `ShellChrome` keeps `next/navigation` for `currentPath` and `signOut` (D6); spec delta: one app-shell requirement "Locale chosen only by the user" stating the decisions-log rule (§10), no auth delta.
- Open: nothing. The "After" measurement is recorded in design.md once apply ends.
