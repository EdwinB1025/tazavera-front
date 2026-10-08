No derived API types are needed: the change only moves layout classes.

## 1. Account page fills the container (user-account)

- [x] 1.1 Add to `src/pages/account/ui/AccountScreen.test.tsx` one test for the scenario "Sections fill the container" (spec `user-account`): it renders `AccountScreen` and asserts the column that holds the heading block and the client region has the class `w-full` and not `max-w-lg`; it then renders an `AccountSection` from `@/features/user-account` with one child and asserts the child's wrapper inside the card body has the class `md:max-w-160` and sits outside the header band (`.bg-surface-section`). Verify: the new test fails on `max-w-lg` and on the missing `md:max-w-160`; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/pages/account/ui/AccountScreen.tsx` and D2 in `src/features/user-account/ui/AccountSection.tsx`. Protecting tests: `src/pages/account/ui/AccountScreen.test.tsx`, `src/features/user-account/ui/AccountSection.test.tsx`, `src/pages/account/ui/AccountClient.test.tsx`. Verify: `npx vitest related` on the changed files passes, the test of 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Registration card fills the container (user-account)

- [x] 2.1 Add to `src/pages/register/ui/RegisterScreen.test.tsx` one test for the scenario "The registration card" (spec `user-account`, extended): with the session loading, it renders `RegisterScreen` and asserts the column that holds the heading block and the card has the class `w-full` and neither `max-w-lg` nor `mx-auto`, and the loading status sits inside an element with the class `md:max-w-160`. Verify: the new test fails on `max-w-lg` and on the missing `md:max-w-160`; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 2.2 Implement design.md D1 in `src/pages/register/ui/RegisterScreen.tsx` and D2 in `src/pages/register/ui/RegisterClient.tsx`. Protecting tests: `src/pages/register/ui/RegisterScreen.test.tsx`, `src/pages/register/ui/RegisterClient.test.tsx`, `src/features/user-account/ui/RegisterForm.test.tsx`. Verify: `npx vitest related` on the changed files passes, the test of 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Not-found card fills the container (app-shell)

- [ ] 3.1 Add to `src/pages/not-found/ui/NotFoundScreen.test.tsx` one test for the scenario "Not-found page content" (spec `app-shell`, extended): it renders `NotFoundScreen` and asserts the element that wraps the section card has the class `w-full` and neither `max-w-lg` nor `mx-auto`. Verify: the new test fails on `max-w-lg`; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 3.2 Implement design.md D1 in `src/pages/not-found/ui/NotFoundScreen.tsx`. Protecting tests: `src/pages/not-found/ui/NotFoundScreen.test.tsx`. Verify: `npx vitest related` on the changed file passes, the test of 3.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Full checks

- [ ] 4.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every test passes (three more tests than on `origin/develop`), no typecheck or lint errors, and the build succeeds. Any QA test that fails on the old classes is reported to Product owner, not edited.
