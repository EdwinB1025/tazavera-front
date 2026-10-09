# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions and imports. "Related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite). "Verify" for every unit task: the related tests pass with no test file changed; `npx tsc --noEmit` reports 0 errors; `npx eslint <changed files>` reports no `max-lines-per-function`, `complexity` or `max-lines` warning and no error. Each task is one commit with its checkbox.

## 1. evaluations

- [x] 1.1 Split `EvaluationsList` as design.md, Files states (D2, D3). Commit `refactor(evaluations): split the my evaluations list`.
- [x] 1.2 Split `EvaluationsListScreen` (D1). Commit `refactor(evaluations): move the my evaluations list texts to a function`.
- [x] 1.3 Split `useEvaluationForm` (D4). Commit `refactor(evaluations): move the evaluation form failure helpers out of the hook`.
- [x] 1.4 Split `formTextsFrom` (D1). Commit `refactor(evaluations): move the evaluation group texts to a function`.
- [x] 1.5 Split `EvaluationSheet` into `EvaluationSheetCards.tsx` (D3). Commit `refactor(evaluations): move the evaluation sheet cards to their own file`.
- [x] 1.6 Split `EvaluationSheetView` (D3). Commit `refactor(evaluations): split the evaluation view states`.

## 2. offering-catalog

- [ ] 2.1 Split `OfferingCard` (D4). Commit `refactor(offering-catalog): move the offering card labels to a function`.
- [ ] 2.2 Split `CoffeeshopsScreen` (D1). Commit `refactor(offering-catalog): move the coffee shop directory texts to functions`.
- [ ] 2.3 Split `OfferingDetailScreen` (D1, D3). Commit `refactor(offering-catalog): split the offering detail screen`.
- [ ] 2.4 Split `CoffeeshopsMapView` (D3). Commit `refactor(offering-catalog): split the coffee shop map view`.

## 3. user-account

- [ ] 3.1 Split `RegisterForm` into `useRegisterForm` (D2). Commit `refactor(user-account): move the registration form state to a hook`.
- [ ] 3.2 Split `PasswordForm` into `usePasswordForm` (D2). Commit `refactor(user-account): move the password form state to a hook`.
- [ ] 3.3 Split `ProfileForm` into `useProfileForm` (D2). Commit `refactor(user-account): move the profile form state to a hook`.
- [ ] 3.4 Split `DangerZone` (D1, D3). Commit `refactor(user-account): split the danger zone blocks`.

## 4. offering-management

- [ ] 4.1 Split `LocationForm` (D3). Commit `refactor(offering-management): move the location form fieldsets to a component`.

## 5. Full checks

- [ ] 5.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `npm run lint` reports no size or complexity warning for a file of the four capabilities in the pages, widgets, features or entities layers; `git diff origin/develop --stat -- src qa` lists only the files of design.md, Files. This task changes no files: check it off in a commit containing only the checkbox, `chore(offering-management): complete tasks for split-oversized-screens`.
