No derived API types are needed: the change reads no new API field and adds no request; `contracts/openapi.yaml` and `src/shared/api/schema.ts` do not change.

Every test below belongs to the validation suite. Test values: front `https://tazavera.test` as `NEXT_PUBLIC_APP_URL`, `https://tazavera.test/api` as `NEXT_PUBLIC_API_URL` where a test needs the new value, internal API `http://api.internal:8000` as `API_INTERNAL_URL`. A test file that already defines its own front value keeps it (for example `APP_URL` = `https://app.tazavera.test` in `authorize.test.ts`).

## 1. Forwarding through the front (auth)

- [x] 1.1 Tests in `proxy.test.ts`, one per scenario of the auth requirement "One public entry point", each with `API_INTERNAL_URL` and `NEXT_PUBLIC_APP_URL` stubbed (except where stated) and its title naming its scenario:
  - "A path under the prefix is forwarded without it": for `GET /api/offerings?page=2`, `POST /api/oauth/token`, `PUT /api/users/01J0` and `POST /api/logout`, the response's `x-middleware-rewrite` is `http://api.internal:8000/offerings?page=2`, `…/oauth/token`, `…/users/01J0` and `…/logout`.
  - "A listed web route is forwarded unchanged": for `GET /login`, `POST /oauth/authorize`, `GET /user/security`, `GET /reset-password/abc123?email=a%40b.test`, `POST /livewire-eb65e81f/update`, `GET /flux/flux.js` and `GET /build/assets/app.css`, `x-middleware-rewrite` is `http://api.internal:8000` followed by the same path and query.
  - "A forwarded response is served as the API sends it": the response to `GET /login` and to `GET /api/offerings` carries no `Content-Security-Policy`, no `Cross-Origin-Opener-Policy`, no `X-Content-Type-Options`, no `Referrer-Policy` and no `Permissions-Policy`.
  - "The forwarded request carries the public origin": a `GET /api/offerings` sent with `x-forwarded-host: evil.example`, `x-forwarded-proto: http` and `x-forwarded-port: 8080` yields `x-middleware-request-x-forwarded-host` `tazavera.test`, `x-middleware-request-x-forwarded-proto` `https` and `x-middleware-request-x-forwarded-port` `443`.
  - "No internal API address": with `API_INTERNAL_URL` unset, `GET /api/offerings` and `GET /login` answer status `502` and carry no `x-middleware-rewrite`.
  - "Paths that are not forwarded": for `/logout`, `/api`, `/_next/static/x.js`, `/favicon.ico`, `/callback`, `/es/offerings`, `/user` and `/offerings`, no `x-middleware-rewrite` header names `http://api.internal:8000` and the status is not `502`.
  Verify: the first five tests fail because nothing is forwarded yet (the sixth may already pass); the existing tests of the file keep passing; `npm run lint` passes.
- [x] 1.2 Implement design.md D1, D2, D3 and D5 (forwarding part): `src/shared/api/forwarding.ts` (`API_PREFIX`, the web list of the auth delta, `apiPathFor`, `forwardToApi` with the rewrite, the three forwarded headers from `NEXT_PUBLIC_APP_URL` and the `502` with an empty body when `API_INTERNAL_URL` is unset or empty); export `API_PREFIX` and `forwardToApi` from `src/shared/api/index.ts`; in `proxy.ts` call `forwardToApi(request)` first and return its response when it gives one, before the `/_next/` and file-extension early return (order of design.md D2). `next.config.ts` does not change. Keep `proxy()` within 80 lines (design.md D11). Verify: `npx vitest related proxy.ts src/shared/api/forwarding.ts src/shared/api/index.ts --run` passes, 1.1 included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Content-Security-Policy without the API origin (app-shell, auth callback)

- [x] 2.1 In `proxy.test.ts`, the expected `connect-src` of `expectedCsp` becomes `connect-src 'self' https://nominatim.openstreetmap.org`. This is the expected value of the existing tests of the scenarios "Connections to the API are allowed" (app-shell, "sets Content-Security-Policy to exactly the design.md D9 directive list") and "Policy present on the callback" (auth, "sets Content-Security-Policy to exactly the design.md D9 directive list, the API origin in connect-src", whose title now says `connect-src` names no API origin). A constant left unused by this edit is removed. No other assertion changes. Verify: those two tests fail while `NEXT_PUBLIC_API_URL` is stubbed, because the policy still names the API origin; `npm run lint` passes.
- [x] 2.2 Implement design.md D6: `proxy.ts` builds `connect-src` from `'self'` and `NOMINATIM_ORIGIN` only and no longer reads `NEXT_PUBLIC_API_URL`. Verify: `npx vitest related proxy.ts --run` passes, 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Authorization page and token endpoint on the front's origin (auth)

- [x] 3.1 Tests:
  - "The authorization page is on the application's origin": in `src/features/auth/api/authorize.test.ts`, the test "opens {NEXT_PUBLIC_API_URL}/oauth/authorize with exactly the parameters of design.md D5…" expects `url.origin` to be `APP_URL` instead of `API_URL`, and its title names `{NEXT_PUBLIC_APP_URL}`. The tests "navigates the current page to the authorization URL…" and "opens {NEXT_PUBLIC_API_URL}/oauth/authorize in a popup with scope=profile:write…" take the same expected origin (and title) only. No other assertion changes.
  - "The token requests go to the application's origin": a new test in `src/shared/api/tokens.test.ts` that stubs `NEXT_PUBLIC_API_URL` = `${APP_URL}/api`, runs `exchangeCode` and then `refreshTokens` against mocked `200` grants, and asserts that both requests were sent to `${APP_URL}/api/oauth/token`. It passes immediately: `tokens.ts` does not change (design.md D4, D8).
  Verify: the three `authorize.test.ts` tests fail on the origin only; the new `tokens.test.ts` test passes; `npm run lint` passes.
- [x] 3.2 Implement design.md D4 for auth: `src/shared/api/web-pages.ts` (`apiWebPageUrl`), exported from `src/shared/api/index.ts`; `authorizeUrl` in `src/features/auth/api/authorize.ts` builds `apiWebPageUrl("/oauth/authorize")` and the file's `apiUrl()` is removed. Verify: `npx vitest related src/shared/api/web-pages.ts src/shared/api/index.ts src/features/auth/api/authorize.ts --run` passes, 3.1 included, and `src/features/auth/model/session.test.ts` and `src/pages/callback/ui/CallbackScreen.test.tsx` keep passing unedited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. User menu security entry on the front's origin (app-shell)

- [x] 4.1 Test "The security entry points at the application's origin": in `src/widgets/app-header/ui/AppHeader.test.tsx`, the signed-in `beforeAll` also sets `NEXT_PUBLIC_APP_URL` = `https://tazavera.test`, and "renders the security entry as an external link, natively" expects `https://tazavera.test/user/security`; "opens the security entry in a popup window on a plain click…" expects the same URL in its `open` call. No other assertion changes. Verify: both tests fail on the URL only; `npm run lint` passes.
- [x] 4.2 Implement design.md D4 in `src/widgets/app-header/ui/UserMenu.tsx`: the security entry's URL is `apiWebPageUrl("/user/security")` from `@/shared/api`. Verify: `npx vitest related src/widgets/app-header/ui/UserMenu.tsx --run` passes, 4.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 5. Account links on the front's origin (user-account)

- [x] 5.1 Tests, with `NEXT_PUBLIC_APP_URL` = `https://tazavera.test` stubbed where the file stubs `NEXT_PUBLIC_API_URL` and the expected base of the links moved from the API value to it:
  - "Two-factor authentication and passkeys": `src/pages/account/ui/AccountClient.test.tsx` "shows its description and external same-tab links to {API}/user/security…" expects `https://tazavera.test/user/security`.
  - "Verifying the email": `AccountClient.test.tsx` "while the email is unverified lists a same-tab Verify email link to {API}/email/verify…" expects `https://tazavera.test/email/verify`.
  - "The password-reset link": `src/features/user-account/ui/PasswordForm.test.tsx` "renders the forgot-password line as a same-tab external link to {API}/forgot-password…" expects `https://tazavera.test/forgot-password`.
  - The `AccountClient — Security section popup` tests (`ENTRIES` and the blocked-popup `open` call) take the same base as their expected value only.
  Test titles that name `{API}` name the front's base. No other assertion changes. Verify: these tests fail on the URL only; `npm run lint` passes.
- [x] 5.2 Implement design.md D4 in `src/pages/account/ui/SecuritySection.tsx` (`/user/security` and `/email/verify`) and `src/features/user-account/ui/PasswordForm.tsx` (`/forgot-password`) with `apiWebPageUrl` from `@/shared/api`. Verify: `npx vitest related src/pages/account/ui/SecuritySection.tsx src/features/user-account/ui/PasswordForm.tsx --run` passes, 5.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 6. Server-side reads at the internal address (app-shell)

- [x] 6.1 Test "Server and browser reads take their own base" in `src/shared/api/client.test.ts`: with `API_INTERNAL_URL` = `http://api.internal:8000` and `NEXT_PUBLIC_API_URL` = `https://tazavera.test/api`, `publicRequest("/offerings")` run with no `window` (the server) requests `http://api.internal:8000/offerings`, and run with `window` present (the browser) requests `https://tazavera.test/api/offerings`. Verify: the test fails on the server half only; `npm run lint` passes.
- [x] 6.2 Implement design.md D5 in `src/shared/api/client.ts`: `apiUrl()` returns `API_INTERNAL_URL` when there is no `window` and `NEXT_PUBLIC_API_URL` otherwise, each read per call and `""` when unset; no fallback between them. Verify: `npx vitest related src/shared/api/client.ts --run` passes, 6.1 included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 7. Full checks

- [ ] 7.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite, the typecheck, lint and the build pass, with eight new tests (six in `proxy.test.ts`, one in `tokens.test.ts`, one in `client.test.ts`). QA tests that assert the old API base or the old `connect-src` (for example the `'unsafe-eval'` test of `qa/proxy.test.ts`, which compares the whole policy) may go stale: they are left untouched and listed in the final report. Any other failure is fixed in its own `fix(auth): …` commit. The build's final report states whether `npm run build` prerenders any page that reads the API (design.md Risks, "Prerendered pages").

## 8. Browser checks (Product owner and design lead, not the build)

- [ ] 8.1 Run the browser checks 1–13 of `docs/design/route-api-web-pages-through-front/design-summary.md` §6 on a production build served over `https`, with the environment §6 lists: one origin; sign-in popup; both roles; step-up; silent re-authentication; security page; email links; headers; cookies; server-side reads; no internal address; sign out ends the web session; a step-up by another account. Check 2 also settles the `X-Forwarded-Host` risk of design.md (every `Location` stays on the front's origin), and check 6 the CSRF one (no `419`). The build leaves this task unchecked.
