# Design

## Context

Backlog R43. Sources, all settled: `docs/design/adopt-next-intl-routing/design-summary.md` (the design lead's summary: §0 settled inputs, §1–§11) and the decisions log entry "2026-10-09 — R43 `adopt-next-intl-routing`: respuestas a los Open" in `docs/general-context.md`, which accepts every recommendation: Open 1 A, Open 2 A, Open 3 B, Open 4 A, Open 5 C, Open 6 B with a budget of +3 KB gz per locale route, raised by Product owner to +14 KB gz (decisions log "2026-10-09 — R43: margen de JS por ruta a +14 KB gz", option A), Open 7 B. Installed versions: `next` 16.4.0, `next-intl` 4.14.9, `react` 19.2.8; nothing is added, removed or upgraded.

Capabilities: `app-shell` (routing, proxy, CSP and headers, layouts, shell, selector) and `auth` (how the sign-in flow receives the locale). One commit per capability.

API: no endpoint is added or changed. `GET {API}/oauth/authorize` keeps its parameters; its `lang` keeps being the locale of the route that starts the flow (auth "The authorization page carries the theme and language").

## Decisions

### D1. One routing definition (summary §2; Open 3 B)

`src/shared/config/locales.ts` holds `routing = defineRouting({...})` from `next-intl/routing` with `locales: ["es", "en", "ca"]`, `defaultLocale: "es"`, `localePrefix: "always"` (spec "Locale routing"), `localeDetection: false` (decisions log 2026-10-08: the locale is chosen only with the header button), `localeCookie: false` (with detection off the cookie is never read; setting it would add a `Set-Cookie` to R31's response set) and `alternateLinks: false` (Open 2 A: no `Link` header with alternates). The file stays under `src/shared/config/` because it is client-safe (R5 D1: `src/shared/lib/i18n` is server-only).

The same file declares next-intl's `AppConfig` augmentation (`Locale: (typeof routing.locales)[number]`), so `Locale` from `next-intl` is the union of the three locales. `LOCALES`, `DEFAULT_LOCALE`, `Locale`, `isSupportedLocale` and `localeFromPath` are removed (Open 3 B, "the aliases go"); importers use `routing.locales`, `routing.defaultLocale`, `hasLocale(routing.locales, value)` (from `next-intl`) and `Locale` (from `next-intl`). Tests that imported `LOCALES` or `DEFAULT_LOCALE` read `routing` instead; their assertions keep their values.

### D2. `proxy.ts` composes the next-intl middleware (summary §3)

`const handleLocale = createMiddleware(routing)` (`next-intl/middleware`). Request order, end state:

1. `/_next/*` and any path whose last segment has a file extension return `NextResponse.next()` untouched, as today. The matcher stays `["/:path*"]`.
2. The nonce and the CSP string are built as today.
3. `/callback` keeps its branch unchanged; the middleware never sees it.
4. Every other path: the proxy builds the forwarded headers as today (`x-nonce`, `Content-Security-Policy`, no `x-locale`) and hands the middleware `new NextRequest(request, { headers: requestHeaders })` — the documented "modify the request before the middleware receives it" (summary §0, next-intl docs "Composing other middlewares"). The middleware copies those headers into the request it forwards and adds `X-NEXT-INTL-LOCALE`; a fresh request is chosen over mutating `request.headers` so the incoming request is never changed in place.
5. On the response the middleware returns (next, rewrite or the redirect of `/`, bare and unsupported-prefix paths), the proxy sets `Content-Security-Policy`, the three security headers and COOP with the existing helpers, exactly as today on both branches.

The existing outcomes stay: `/` → 307 `/es`; `/about` → `/es/about`; `/fr/x` → `/es/fr/x` (not-found there); the query is kept; the same headers on redirects and pages; nothing on assets; `/callback` unchanged. The forwarded locale is observable in unit tests as `x-middleware-request-x-next-intl-locale` (the encoding `NextResponse.next({ request })` uses), replacing `x-middleware-request-x-locale`.

### D3. Server code reads `getLocale()` (summary §4; Open 1 A)

`app/layout.tsx` (`<html lang>` and `generateMetadata`) and `app/[locale]/not-found.tsx` call `await getLocale()` from `next-intl/server` instead of reading `x-locale`. The theme cookie read through `headers()` stays. On `/callback` no middleware runs, `requestLocale` is empty and `request.ts` falls back to `es`: the same `lang="es"` as today. `<html>` stays in `app/layout.tsx`; `next/root-params` is not adopted (Open 1 A). `app/[locale]/layout.tsx` keeps passing `params.locale` to `AppShell` (same value as `getLocale()`; the summary leaves it to the architect, and keeping it changes nothing).

### D4. `request.ts` returns the locale only (Open 1 A, Open 7 B)

`getRequestConfig` keeps reading `requestLocale` (the middleware's header) and returns `{ locale }`, resolving an unsupported or missing value to `routing.defaultLocale` with `hasLocale`. It no longer loads catalogs; `getCatalogs` and the `MessageCatalogs` type of `messages.ts`, whose only reader was `request.ts`, are removed. `getMessages(area, locale)` stays the only catalog reader and rejects an unsupported locale with `hasLocale`.

### D5. Provider in the `[locale]` layout (summary §5)

`app/[locale]/layout.tsx` wraps `AppShell` in `<NextIntlClientProvider messages={null}>` (Server Component variant from `next-intl`): `locale` is inherited from the request config, no catalog reaches the client, and no `formats`, `now` or `timeZone` are configured. The root layout and `/callback` get no provider.

### D6. Language selector through next-intl navigation (summary §1; Open 4 A)

A new file `src/shared/lib/locale-navigation.ts` exports `usePathname` and `useRouter` from `createNavigation(routing)` (`next-intl/navigation`). `ShellChrome` switches locale with `router.push(pathname, { locale: next })`, where `pathname` is next-intl's locale-less pathname: the same route in the chosen locale (spec "Choosing a locale"). `ShellChrome` keeps `next/navigation`'s `usePathname` for the header's `currentPath` (the full path, used to mark the current entry) and `next/navigation`'s `useRouter().push` for `signOut`, which receives a full path (`/{locale}`). With `localeCookie: false`, next-intl's router writes no cookie. The ~50 hand-built `/${locale}/…` hrefs stay (backlog candidate). Tests that render the shell mock `@/shared/lib/locale-navigation` where they mocked `next/navigation` for the switch; no assertion changes.

### D7. The auth flow takes the locale `useSession()` records (summary §6; Open 5 C)

A new file `src/features/auth/model/active-locale.ts` keeps the recorded locale of the page: `recordLocale(locale: Locale)` and `activeLocale(): Locale`, which returns `routing.defaultLocale` (`es`) until a locale is recorded. `useSession()` calls `useLocale()` (from `next-intl`) on every render and records it, so every consumer under the provider keeps it current. `activeLang()` (`api/authorize.ts`, the `lang` of the authorization request for `signIn`, `requestProfileWrite`, `signInWithRegistration` and `startSilent`, including the non-React `onUnrecoverable` seam) and `localeRoot()` (`model/session.ts`, where `signOut` lands) read `activeLocale()`. The ten `signIn` / `signOut` call sites are unchanged. `/callback` code calls no `useSession()` and keeps no dependency on the active locale.

`toAppRoute()` (`model/return-route.ts`) validates a path, not the active locale: it refuses the route unless `hasLocale(routing.locales, <first path segment>)`; the refusal is unchanged.

Every test that renders the real `useSession()` outside a provider mocks `useLocale` of `next-intl`; the auth tests that set the route's locale through `location.pathname` to drive `lang` or the sign-out landing set it through that mock as well (with `useSession()` mounted where the case had none). Assertions keep their expected values.

### D8. Texts stay props (summary §7)

Screens keep reading `getMessages(area, locale)` on the server and passing texts down; no component calls `useTranslations`, `getTranslations` or `useMessages`. The catalog guard and `react/jsx-no-literals` stay.

## Measurement (summary §8; Open 6 B)

Method of R28 (`reduce-shared-client-bundle` design.md "Measurement"): after `npm run build`, for each route the union of `.next/build-manifest.json` `rootMainFiles` and the `entryJSFiles` of its page's client reference manifest, plus those of its `@sidebar` slot page (the `[...rest]` slot when the route has none of its own), each file gzipped with Node `zlib.gzipSync` (default level); cmdk is detected by its `cmdk-` attribute strings. Both builds run with the same environment (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`).

Pass criterion (Open 6 B, Product owner 2026-10-09; budget raised to +14 KB gz, option A, after task 7.1 measured +13.4/+13.5 KB gz from use-intl's core): every locale route (`/[locale]…`) grows by at most +14.0 KB gz against "Before"; routes that load no cmdk before load none after (spec "Route without a combobox"). If any route exceeds the budget, the build stops and reports the table; no task works around it.

Before, measured by the architect at propose on `origin/develop` `6fbe210`:

| Route | Before (KB gz) | cmdk |
|---|---:|---|
| `/_global-error` | 132.6 | no |
| `/_not-found` | 132.6 | no |
| `/[locale]` | 199.8 | no |
| `/[locale]/[...rest]` | 192.4 | no |
| `/[locale]/about` | 193.2 | no |
| `/[locale]/account` | 199.8 | no |
| `/[locale]/account/password` | 196.4 | no |
| `/[locale]/coffeeshops` | 205.4 | no |
| `/[locale]/coffeeshops/[ulid]` | 216.7 | yes |
| `/[locale]/evaluations` | 205.4 | no |
| `/[locale]/evaluations/[ulid]` | 200.1 | no |
| `/[locale]/manage/evaluations` | 208.2 | no |
| `/[locale]/manage/evaluations/[ulid]` | 208.0 | no |
| `/[locale]/manage/evaluations/new` | 207.1 | no |
| `/[locale]/manage/locations` | 198.9 | no |
| `/[locale]/manage/offerings` | 201.6 | no |
| `/[locale]/manage/offerings/new` | 204.2 | yes |
| `/[locale]/offerings` | 213.6 | yes |
| `/[locale]/offerings/[ulid]` | 204.5 | no |
| `/[locale]/register` | 196.2 | no |
| `/[locale]/register/coffeeshop` | 196.2 | no |
| `/callback` | 140.6 | no |

After, measured at task 7.1 on the change's last code commit `81b86d0` with the same method and environment (the method re-run on `6fbe210` reproduces the "Before" column exactly). Every locale route is within the +14 KB gz budget and cmdk loads on the same three routes; `/callback`, outside the budget, grows by the `next-intl` helpers the auth code now imports (`routing`, `hasLocale`):

| Route | Before (KB gz) | After (KB gz) | Δ | cmdk |
|---|---:|---:|---:|---|
| `/_global-error` | 132.6 | 132.6 | +0.0 | no |
| `/_not-found` | 132.6 | 132.6 | +0.0 | no |
| `/[locale]` | 199.8 | 213.2 | +13.4 | no |
| `/[locale]/[...rest]` | 192.4 | 205.9 | +13.5 | no |
| `/[locale]/about` | 193.2 | 206.6 | +13.4 | no |
| `/[locale]/account` | 199.8 | 213.2 | +13.4 | no |
| `/[locale]/account/password` | 196.4 | 209.8 | +13.4 | no |
| `/[locale]/coffeeshops` | 205.4 | 218.8 | +13.4 | no |
| `/[locale]/coffeeshops/[ulid]` | 216.7 | 230.1 | +13.4 | yes |
| `/[locale]/evaluations` | 205.4 | 218.9 | +13.5 | no |
| `/[locale]/evaluations/[ulid]` | 200.1 | 213.5 | +13.4 | no |
| `/[locale]/manage/evaluations` | 208.2 | 221.6 | +13.4 | no |
| `/[locale]/manage/evaluations/[ulid]` | 208.0 | 221.4 | +13.4 | no |
| `/[locale]/manage/evaluations/new` | 207.1 | 220.6 | +13.5 | no |
| `/[locale]/manage/locations` | 198.9 | 212.3 | +13.4 | no |
| `/[locale]/manage/offerings` | 201.6 | 215.1 | +13.5 | no |
| `/[locale]/manage/offerings/new` | 204.2 | 217.6 | +13.4 | yes |
| `/[locale]/offerings` | 213.6 | 227.0 | +13.4 | yes |
| `/[locale]/offerings/[ulid]` | 204.5 | 217.9 | +13.4 | no |
| `/[locale]/register` | 196.2 | 209.6 | +13.4 | no |
| `/[locale]/register/coffeeshop` | 196.2 | 209.6 | +13.4 | no |
| `/callback` | 140.6 | 151.7 | +11.1 | no |

## Header and browser checks (summary §8)

- **Headers.** Against `next start` of `develop` and of the change (same environment), with and without `Accept-Language: en`, `Cookie: NEXT_LOCALE=en` and `Sec-Fetch-Dest: document`: `/`, `/about`, `/fr/x`, `/es`, `/es/about`, `/en/offerings`, `/ca/register`, `/callback` and one `/_next/static/…` asset answer with the same status, `Location`, `Content-Security-Policy` (nonce aside), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy`, and the same header set otherwise (the font-preload `Link` header Next.js already sends, nonce aside). No `X-Powered-By`, no `Set-Cookie`, no alternates `Link`. Any other difference stops the apply.
- **Browser.** In Chromium (Playwright's pre-installed browser, no project dependency), `/es`, `/en/offerings` and `/ca/register` hydrate (the language menu opens) with no CSP violation or error in the console, and every `<script>` carries the response's nonce.
- **Locale.** `<html lang>` and the metadata description follow the prefix on `/es`, `/en/…`, `/ca/…`; the language selector opens the same route in the chosen locale; the authorization URL of sign in carries `lang` equal to the route's locale. Sign-out landing is covered by `session.test.ts` (no API is running in the session).

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/config/locales.ts` | shared | `routing` (`defineRouting`) and the `AppConfig` augmentation; old exports removed (D1) |
| `src/shared/config/locale-names.ts` | shared | `Locale` from `next-intl` (D1) |
| `src/shared/lib/locale-navigation.ts` (new) | shared | `createNavigation(routing)`: `usePathname`, `useRouter` (D6) |
| `src/shared/lib/i18n/request.ts` | shared | locale only, `hasLocale` (D4) |
| `src/shared/lib/i18n/messages.ts` | shared | `hasLocale`; `getCatalogs` removed (D4) |
| `proxy.ts` | root | next-intl middleware composed with the CSP and headers (D2) |
| `app/layout.tsx` | app (routing) | `getLocale()` (D3) |
| `app/[locale]/layout.tsx` | app (routing) | `NextIntlClientProvider messages={null}` (D5) |
| `app/[locale]/not-found.tsx` | app (routing) | `getLocale()` (D3) |
| `src/app/shell/AppShell.tsx`, `SessionShell.tsx` | app | `routing` / `hasLocale` / `Locale` (D1) |
| `src/app/shell/ShellChrome.tsx` | app | locale switch through `@/shared/lib/locale-navigation` (D6) |
| `src/widgets/app-header/ui/LanguageSelect.tsx` | widgets | `hasLocale` (D1) |
| `src/pages/not-found/ui/NotFoundScreen.tsx` | pages | `hasLocale`, `routing.defaultLocale` (D1) |
| `src/features/auth/model/active-locale.ts` (new) | features | recorded locale (D7) |
| `src/features/auth/api/authorize.ts`, `model/session.ts`, `model/return-route.ts` | features | D7 |

`next.config.ts`, `contracts/openapi.yaml` and `src/shared/api/schema.ts` are untouched.

## Risks

- **R31 headers.** The middleware's response replaces the hand-built one; a header forgotten on one branch is a regression. `localeCookie: false` and `alternateLinks: false` keep `Set-Cookie` and the alternates `Link` out. Covered by `proxy.test.ts` and the header comparison.
- **CSP nonce.** If the forwarded request lacks `x-nonce` or the CSP request header, Next.js stamps no nonce and `'strict-dynamic'` blocks every framework script. Covered by the nonce test of `proxy.test.ts` and the browser check.
- **Malformed paths.** On a path `decodeURI` rejects, the middleware returns a bare `NextResponse.next()` without the forwarded headers; Next.js answers 400 with the proxy's response headers and renders no page. Noted, no action (summary §11).
- **JS per route.** The provider, `use-intl/react` and `createNavigation` enter every locale route; budget +14 KB gz (Open 6 B, raised by Product owner 2026-10-09, option A).
- **Redirect differences.** next-intl normalizes trailing slashes, decodes the pathname and matches the prefix case-insensitively before redirecting; today's proxy does none of that (for example `/ES/x` went to `/es/ES/x` and now goes to `/es/x`). No spec scenario changes; the header comparison checks the §8 paths.
- **Render-time recording.** `useSession()` writes the recorded locale during render; the value is the same for every consumer of a page and is idempotent, so concurrent renders cannot disagree.

## Backlog candidate (not folded in)

~50 non-test files build `/${locale}/…` hrefs by hand; next-intl's `Link` would replace them in a later change (summary review log, finding 3).
