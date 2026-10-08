Type: Refactor (fast lane)

## Why

The auth feature derives the active locale from a path in three places: `activeLang()` in `src/features/auth/api/authorize.ts` (the `lang` of the authorization request), `localeRoot()` in `src/features/auth/model/session.ts` (where sign-out lands) and `toAppRoute()` in `src/features/auth/model/return-route.ts` (the locale check of the return route). Each one reads the first path segment and checks it with `isSupportedLocale`; the first two then fall back to `DEFAULT_LOCALE`. Every new auth flow that needs the active locale would add another copy (backlog entry R5).

## What Changes

- One pure function in `src/shared/config/locales.ts`, `localeFromPath(pathname)`, returns the supported locale named by the first segment of a path, or `null`.
- `activeLang()`, `localeRoot()` and `toAppRoute()` call it; the `DEFAULT_LOCALE` fallback stays at the two call sites that have one, and `toAppRoute()` keeps refusing a route without a supported locale.
- No behaviour change: what users see, the routes opened after sign-in and sign-out, the return-route validation, the requests sent to the API (the `lang` parameter of the authorization request included), token, storage and redirect behaviour, and every requirement in `openspec/specs/` stay the same.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: adds the observable property that sign-in, sign-out and the return route take the active locale from the locale segment of the current route through one shared derivation. No requirement's behaviour changes.

## Non-goals

- No change to the other modules that read the locale (`LanguageSelect`, `AppShell`, `ShellChrome`, `NotFoundScreen`, `proxy.ts`, `src/shared/lib/navigation-history.ts`).
- No import of `@/shared/lib/i18n` from client code, and no next-intl adoption on the client (R43, a later change).
- No new tests; the existing tests keep their cases, names, assertions and expected values.
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/config/locales.ts`, `src/features/auth/api/authorize.ts`, `src/features/auth/model/session.ts`, `src/features/auth/model/return-route.ts`.
- Protecting tests, unchanged: `authorize.test.ts`, `session.test.ts` and `return-route.test.ts`, in `src/features/auth/` and in `qa/src/features/auth/`. None of them mocks `@/shared/config/locales`, so no import or mock target changes.

## Propose status

- Change-id: `share-active-locale`
- Date: 2026-10-08
- `openspec validate share-active-locale --strict`: valid
- Resolves backlog entry: R5
- Resolved: the shared function is `localeFromPath(pathname: string): Locale | null` in `src/shared/config/locales.ts`, by Product owner's decision of 2026-10-08 replacing the `src/shared/lib/i18n` location of the entry, because that module loads catalogs with `node:fs` and is server-only (design.md D1); the fallback stays at the call sites (D2).
- Open: nothing.
