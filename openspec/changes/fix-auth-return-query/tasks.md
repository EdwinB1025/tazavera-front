## 1. Return-route validation

- [x] 1.1 Test `src/features/auth/model/return-route.test.ts` for `toAppRoute` (design.md D2). It must return the route unchanged for `/es`, `/en/offerings`, `/es/manage/evaluations/new?offering=01J0`, `/ca/offerings?tab=evaluations&page=2` and `/es/offerings?next=https://evil.example`; return `/es/offerings` for `/es/x/../offerings`; and return `null` for `undefined`, `""`, `https://evil.example/es`, `//evil.example/es`, `/\evil.example`, `/es?next=\evil.example`, `/es\offerings`, `/\t/evil.example` (with a real tab), `/es/offerings#top`, `es/offerings`, `/xx/offerings`, `/callback`, `/es/../evil` and `/es/..//evil.example`. Commit `test(auth): ...`; the only allowed failure is the missing module.
- [x] 1.2 Implement `src/features/auth/model/return-route.ts` per design.md D2. Verify: 1.1 passes; `npm run test:run`, `npm run lint`, `npx tsc --noEmit` pass.

## 2. Recording the path and the query

- [ ] 2.1 Tests. Add `search: ""` to the `location` mocks of `src/features/auth/api/authorize.test.ts`, `src/features/auth/model/session.test.ts` and `src/pages/callback/ui/CallbackScreen.test.tsx` (reset in their `beforeEach` where `pathname` is reset), keeping every existing assertion. New cases: in `authorize.test.ts`, `signIn()` with no argument on `/es/manage/evaluations/new` with search `?offering=01J0` and `window.open` returning `null` saves `returnRoute` `/es/manage/evaluations/new?offering=01J0`, and with a popup holds the same route; in `session.test.ts`, the startup silent restore on `/en/offerings/1` with search `?tab=evaluations` saves `returnRoute` `/en/offerings/1?tab=evaluations`; in `src/app/shell/AppShell.test.tsx`, the "Sign in" click asserts `signIn` was called with no argument (`toHaveBeenCalledWith()`). They fail today on the recorded route and on the `signIn` argument.
- [ ] 2.2 Implement design.md D1: `currentRoute()` in `authorize.ts` as `signIn`'s default, both `startSilent` calls in `session.ts`, and `signIn()` in `ShellChrome.tsx`. Verify: 2.1 passes; `npm run test:run`, `npm run lint`, `npx tsc --noEmit` pass.

## 3. Opening only an application route at the callback

- [ ] 3.1 Tests in `src/features/auth/api/authorize.test.ts` for `completeCallback` in redirect mode with a matching `state` and a successful exchange: a stored `returnRoute` `/es/manage/evaluations/new?offering=01J0` makes `replaceRoute` receive exactly that route; a stored `https://evil.example/es`, `//evil.example/es` and `/\evil.example` each make `replaceRoute` receive `/es`, with the exchange made, the flow record deleted and the marker set as for a valid route; a stored `/es/offerings?next=https://evil.example` makes `replaceRoute` receive it unchanged. In the error path (an `error` parameter), a stored `//evil.example/es` makes `replaceRoute` receive `/es`. They fail today on the invalid routes.
- [ ] 3.2 Implement design.md D3 in `completeCallback`. Verify: 3.1 passes; the existing callback cases in `authorize.test.ts` and `CallbackScreen.test.tsx` still pass.

## 4. Verification

- [ ] 4.1 Run `npm run test:run` (including `src/shared/ui/xss-guard.test.ts`, `proxy.test.ts` and `src/shared/api/tokens.test.ts`), `npm run lint`, `npx tsc --noEmit` and `npm run build`; all pass.
- [ ] 4.2 Browser check (Product owner or design lead): signed in, reload `/es/manage/evaluations/new?offering=<ulid>` and a catalog route with filters; after the silent restore the same URL, query included, is shown.
