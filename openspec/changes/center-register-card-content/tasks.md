# Tasks

"Related tests" means `npx vitest related <changed files> --run`.

## 1. Centred registration content

- [x] 1.1 In `src/pages/register/ui/RegisterScreen.test.tsx`, test "fills the page container with the registration card, its content capped from md": also assert that the column found through `closest(".md\\:max-w-160")` carries the class that centres it horizontally from the medium breakpoint (the build chooses it; the `md:max-w-160` assertion and the other assertions stay). Verify: that test fails only on the new assertion; every other related test, `npx tsc --noEmit` and `npm run lint` pass. Commit `test(user-account): assert the registration content is centred from md`.
- [x] 1.2 In `src/pages/register/ui/RegisterClient.tsx`, add the centring class chosen in 1.1 to the `w-full md:max-w-160` column, applying only from the medium breakpoint; nothing else changes. Verify: the related tests pass; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `fix(user-account): center the registration card content`.

## 2. Full checks

- [ ] 2.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0, except `npm run test:qa` failures that also fail on `origin/develop`. This task changes no files: check it off in a commit containing only the checkbox, `chore(user-account): complete tasks for center-register-card-content`.
