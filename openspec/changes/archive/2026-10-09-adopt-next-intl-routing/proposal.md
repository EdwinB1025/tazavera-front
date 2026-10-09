## Why

Locale handling is written by hand next to next-intl, which the project uses only for its plugin and `getRequestConfig`: the locale list in `src/shared/config/locales.ts` instead of `defineRouting`, the locale prefix in `proxy.ts` instead of the next-intl middleware, and the active locale read from the URL (R5's `localeFromPath`) instead of `useLocale()` / `getLocale()` (backlog R43). One library for i18n, following its standard structure, removes the hand-written copy. The change must keep the CSP nonce and the response headers of R31 exactly as they are and stay within the JS budget Product owner set for R28's measurement.

## What Changes

- One routing definition with next-intl's `defineRouting` in `src/shared/config/locales.ts`: locales `es`, `en`, `ca`, default `es`, prefix always, no locale detection, no locale cookie, no alternate links. `LOCALES`, `DEFAULT_LOCALE`, `Locale`, `isSupportedLocale` and `localeFromPath` are removed; their importers use `routing.locales`, `routing.defaultLocale`, `hasLocale` and next-intl's `Locale` type.
- `proxy.ts` delegates locale routing to the next-intl middleware. Framework and asset paths, `/callback`, the CSP and its nonce, the three security headers and COOP stay exactly as today; `x-locale` is no longer forwarded.
- Server code reads the active locale with `getLocale()` (root layout and its metadata, the `[locale]` not-found boundary). `src/shared/lib/i18n/request.ts` reads the middleware's locale and returns no catalogs.
- A `NextIntlClientProvider` with no messages wraps the shell in the `[locale]` layout; the language selector switches locale through next-intl's navigation; the auth flow takes the locale `useSession()` records with `useLocale()`.
- No behaviour a user sees changes: the same routes, redirects, headers, texts, `lang` of the authorization request and sign-out landing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: adds the requirement that the locale is never taken from the browser (language preferences or a locale cookie), only from the URL and the language selector, which today is only in the decisions log of 2026-10-08. No existing requirement changes.
- `auth`: code only (how the sign-in flow receives the locale); no requirement changes, "One active-locale derivation for the auth flows" keeps holding.

## Non-goals

- No `useTranslations`, `getTranslations` or `useMessages`: texts keep reaching components as props from `getMessages`.
- No change to the message catalogs, their structure or the catalog guard.
- No static rendering (`generateStaticParams`, `setRequestLocale`, `next/root-params`); `<html>` stays in `app/layout.tsx`.
- No localized pathnames, domains or browser locale detection; no `Link` header with alternates.
- The ~50 non-test files that build `/${locale}/…` hrefs by hand keep them (backlog candidate, see design.md).
- No change to the CSP directives, COOP, the security headers, `/callback`, `next.config.ts`, `contracts/` or the API.
- No dependency added, removed or upgraded (next-intl 4.14.9 is installed).
- No other backlog entry is folded in.

## Impact

- New: `src/shared/lib/locale-navigation.ts`, `src/features/auth/model/active-locale.ts`.
- Modified: `src/shared/config/locales.ts`, `src/shared/config/locale-names.ts`, `proxy.ts`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/not-found.tsx`, `src/shared/lib/i18n/request.ts`, `src/shared/lib/i18n/messages.ts`, `src/app/shell/AppShell.tsx`, `src/app/shell/SessionShell.tsx`, `src/app/shell/ShellChrome.tsx`, `src/widgets/app-header/ui/LanguageSelect.tsx`, `src/pages/not-found/ui/NotFoundScreen.tsx`, `src/features/auth/api/authorize.ts`, `src/features/auth/model/session.ts`, `src/features/auth/model/return-route.ts`.
- Tests: `proxy.test.ts` (forwarded locale header, one new scenario), `app/layout.test.tsx` and `qa/app/layout.test.tsx` (mock moves to `getLocale`), the auth tests and the tests that render the real `useSession` or the shell (locale mock moves to `useLocale` and next-intl navigation); assertions keep their expected values.
- Risks: R31's headers and the CSP nonce (`proxy.ts`), JS per route (R28), see design.md.
