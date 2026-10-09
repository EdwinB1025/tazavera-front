## Context

Three functions of `src/features/auth` read the locale from a path: `activeLang()` (`api/authorize.ts`) and `localeRoot()` (`model/session.ts`) split `window.location.pathname`, check the first segment with `isSupportedLocale` and fall back to `DEFAULT_LOCALE`; `toAppRoute()` (`model/return-route.ts`) checks the first segment of the parsed route's pathname and returns `null` when it is not a supported locale (backlog R5). All three run in client code.

No API endpoint, request, response or error presentation changes. The `lang` parameter of `GET /oauth/authorize` keeps its value.

## Goals / Non-Goals

**Goals:** one derivation of the locale from a path; the three call sites return exactly what they return today.

**Non-Goals:** the locale readers outside `src/features/auth` (`LanguageSelect`, `AppShell`, `ShellChrome`, `NotFoundScreen`, `proxy.ts`, `navigation-history.ts`); next-intl on the client (R43).

## Decisions

### D1. The function and its location (`shared`, segment `config`)

`src/shared/config/locales.ts` gains, next to `LOCALES`, `DEFAULT_LOCALE` and `isSupportedLocale`:

```ts
export function localeFromPath(pathname: string): Locale | null;
```

It returns the first segment of `pathname` (the text between the first and second `/`) when `isSupportedLocale` accepts it, otherwise `null`. It is pure: it reads no global such as `window`. Callers import it from `@/shared/config/locales`.

Location by Product owner's decision of 2026-10-08, replacing the `src/shared/lib/i18n` location written in backlog R5: `src/shared/lib/i18n` loads the message catalogs with `node:fs` (`messages.ts`) and is server-only, so importing it from client code breaks the build. `src/shared/config/locales.ts` holds only constants and a stateless guard and is already imported by client and server code. No client module imports `@/shared/lib/i18n`.

### D2. Results at the call sites

- `activeLang()` (`src/features/auth/api/authorize.ts`): `localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE`. The `lang` of the authorization request is unchanged.
- `localeRoot()` (`src/features/auth/model/session.ts`): `` `/${localeFromPath(window.location.pathname) ?? DEFAULT_LOCALE}` ``. Sign out lands on the same root.
- `toAppRoute()` (`src/features/auth/model/return-route.ts`): returns `null` when `localeFromPath(url.pathname)` is `null`; every other check and its return value stay as they are. The refusal of a route without a supported locale is kept.

Imports that a call site no longer uses (`isSupportedLocale`) are removed from it.

### D3. Tests

No test is added, deleted or changed. The protecting tests are `authorize.test.ts`, `session.test.ts` and `return-route.test.ts` in `src/features/auth/` and `qa/src/features/auth/`; none mocks `@/shared/config/locales`, so no import or mock target changes.

## Risks / Trade-offs

- `toAppRoute()` reads `url.pathname` of a parsed URL while the other two read `window.location.pathname`; both are pathnames starting with `/`, so the same function serves both.
