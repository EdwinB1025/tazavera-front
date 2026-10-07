## Context

See proposal.md — Why, and `docs/design/fix-auth-return-query/design-summary.md` (approved 2026-10-07) for the call-site map. Today every recorder of the return route reads the path only (`window.location.pathname` in `signIn`'s default and in both `startSilent` calls of `session.ts`; `usePathname()` in `ShellChrome`), and `completeCallback` opens the stored `returnRoute` with no validation at all. The record format in `sessionStorage` (`PendingFlow`) is a plain string and stays so. No length limit exists and none is added.

## Goals / Non-Goals

**Goals:**
- Record the return route as `pathname + search` everywhere it defaults to the current route.
- Validate the stored route once, where it is consumed, before `replaceRoute` opens it.

**Non-Goals:**
- Token storage, scopes, PKCE, CSP, headers, `proxy.ts`, the `PendingFlow` shape and the step-up route of `StepUpNotice` (`/${locale}/account`, no query) stay as they are.
- R5 of `docs/backlog.md`: the validation checks a route's own prefix and derives no active locale, so it adds no copy of that derivation.

## Decisions

### D1 — The current route

`src/features/auth/api/authorize.ts` gains an internal-to-the-slice `currentRoute(): string` returning `window.location.pathname + window.location.search` (the hash is never read). It is the default of `signIn(returnRoute?)`, and `src/features/auth/model/session.ts` passes it to both `startSilent` calls (startup silent check and the client's `onUnrecoverable`). `src/app/shell/ShellChrome.tsx` calls `signIn()` with no argument instead of `signIn(pathname ?? \`/${locale}\`)`, so the header's sign in uses the same default; `usePathname()` stays for the locale swap and `currentPath`. Alternative rejected: `useSearchParams()` in `ShellChrome` — it would need a Suspense boundary in the shell for statically rendered routes and duplicates what `window.location` already gives inside the click.

### D2 — Return-route validation

A new pure module `src/features/auth/model/return-route.ts` (layer `features`, slice `auth`, not exported from the slice's `index.ts`) exports `toAppRoute(route: unknown): string | null`. It returns `null` unless all of these hold:

1. `route` is a string with no backslash and no control character (U+0000–U+001F, U+007F) — the URL parser strips or rewrites them, which is how `/\evil` or `/\t/evil` turns into a protocol-relative URL;
2. it starts with `/` and its second character is not `/`;
3. it contains no `#`;
4. parsed with `new URL(route, base)` against a fixed placeholder base origin, the result keeps that origin;
5. the parsed `pathname` does not start with `//`, and its first segment is a supported locale (`isSupportedLocale` from `@/shared/config/locales`) — the prefix rule of `proxy.ts` (`/<locale>` or `/<locale>/…`).

When they hold it returns the parsed `pathname + search`, so dot segments are resolved before the prefix is checked (`/es/../evil` → `/evil` → `null`). A query's values are data: `/es/offerings?next=https://evil.example` is returned as is.

### D3 — Consuming the route at the callback

In `completeCallback` the return route becomes `toAppRoute(pending?.returnRoute) ?? \`/${DEFAULT_LOCALE}\``: an invalid stored route takes the destination already used when there is no pending flow. Nothing else in the outcome table changes (exchange, flow data deleted, marker, session). The check "the completion leaves the user on this route" compares the return route with `currentRoute()` instead of `window.location.pathname`.

### Files

| File | Layer | Change |
|---|---|---|
| `src/features/auth/model/return-route.ts` | features | new: `toAppRoute` (D2) |
| `src/features/auth/model/return-route.test.ts` | features | new: its cases |
| `src/features/auth/api/authorize.ts` | features | `currentRoute` (D1); `completeCallback` validation (D3) |
| `src/features/auth/model/session.ts` | features | both `startSilent` calls pass `currentRoute()` (D1) |
| `src/app/shell/ShellChrome.tsx` | app | `signIn()` with no argument (D1) |
| `src/features/auth/api/authorize.test.ts`, `src/features/auth/model/session.test.ts`, `src/pages/callback/ui/CallbackScreen.test.tsx`, `src/app/shell/AppShell.test.tsx` | — | `location` mocks gain `search`; new cases per tasks.md |

No API endpoint is added or changed; no error is presented differently (an invalid return route shows nothing, as every callback outcome).

## Risks / Trade-offs

- [A legitimate route outside a locale prefix, such as `/callback`, is rejected] → No flow starts on `/callback`; every application screen lives under `/<locale>`. The fallback is the default-locale root, as today without a pending flow.
- [Percent-encoding by the URL parser changes the string of a route with spaces or non-ASCII characters] → The encoded route opens the same screen; tests use ASCII routes and assert the exact string.
- [A browser that keeps a pre-fix record in `sessionStorage` during deployment] → The old record holds a path without query; it passes validation and behaves as today.
