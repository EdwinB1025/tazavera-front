No derived API types are needed: the change reads no new API field (design.md Context).

## 1. A registration sign-in lands on the landing page (user-account)

- [x] 1.1 In `src/pages/register/ui/RegisterClient.test.tsx`, the test of "Signed in by the registration" (line 169) changes only its expected destination: its title says `/{locale}` instead of `/{locale}/account`, it expects `routerReplace` to have been called with `"/es"` instead of `"/es/account"`, and it expects `routerReplace` not to have been called with `"/es/account"` instead of `"/es"`. No other assertion, query, structure or test changes. Verify: the edited test fails only because `routerReplace` is called with `"/es/account"`; the rest of the file passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/pages/register/ui/RegisterClient.tsx`. Verify: `npx vitest related src/pages/register/ui/RegisterClient.tsx --run` passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [ ] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, lint with 0 errors. A QA test that fails only because it expects `/{locale}/account` after a registration sign-in gets only that expected destination changed and is listed in the final report; any other failure is fixed in its own `fix(user-account): …` commit, or reported when it lies outside this change.
