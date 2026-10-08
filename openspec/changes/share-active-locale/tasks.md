## 1. Shared derivation in the authorization request

- [x] 1.1 Add `localeFromPath` to `src/shared/config/locales.ts` as design.md D1 states, and make `activeLang()` in `src/features/auth/api/authorize.ts` use it with the `DEFAULT_LOCALE` fallback of D2, removing the now unused `isSupportedLocale` import. Protecting tests: `src/features/auth/api/authorize.test.ts` and `qa/src/features/auth/api/authorize.test.ts`, unchanged. Verify: `npx vitest related` on the changed files passes with the same test count as before; `npx vitest run --config vitest.qa.config.mts qa/src/features/auth/api/authorize.test.ts` passes; `npx tsc --noEmit` and `npm run lint` report no errors; `authorize.ts` no longer splits the path.

## 2. Shared derivation in sign out and the return route

- [x] 2.1 Make `localeRoot()` in `src/features/auth/model/session.ts` use `localeFromPath` with the `DEFAULT_LOCALE` fallback of design.md D2, removing the now unused `isSupportedLocale` import. Protecting tests: `src/features/auth/model/session.test.ts` and `qa/src/features/auth/model/session.test.ts`, unchanged. Verify: `npx vitest related` on the changed file passes with the same test count as before; `npx vitest run --config vitest.qa.config.mts qa/src/features/auth/model/session.test.ts` passes; `npx tsc --noEmit` and `npm run lint` report no errors; `session.ts` no longer splits the path.
- [ ] 2.2 Make `toAppRoute()` in `src/features/auth/model/return-route.ts` refuse the route when `localeFromPath(url.pathname)` is `null` (design.md D2), removing the now unused `isSupportedLocale` import. Protecting tests: `src/features/auth/model/return-route.test.ts` and `qa/src/features/auth/model/return-route.test.ts`, unchanged. Verify: `npx vitest related` on the changed file passes with the same test count as before; `npx vitest run --config vitest.qa.config.mts qa/src/features/auth/model/return-route.test.ts` passes; `npx tsc --noEmit` and `npm run lint` report no errors; no non-test file under `src/features/auth` splits a path to read the locale.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every test passes with the same file and test counts as on `origin/qa`, no typecheck or lint errors, and the build succeeds.
