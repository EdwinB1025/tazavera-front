# Tasks

## 1. Foundation: types

- [x] 1.1 Confirm this change defines no derived API type and touches no generated type: `git status --short` shows nothing under `src/shared/api/` (checked off with task 2.1)

## 2. Evaluation form Cancel (R57, evaluations)

- [x] 2.1 Update the fixtures (design.md Tests): `FormActions.test.tsx` default props `cancelLabel="Cancel"` and `cancelHref="/es/manage/evaluations"`; `form-fixtures.ts` `actions.cancelLabel: "Cancel"`. In `EvaluationForm.test.tsx` add the case for "Cancel leaves for My evaluations without saving" (a new form: the link named "Cancel" has `href` `/es/manage/evaluations` and classes `text-text-link` and `self-center`; after activating it no request was sent) and, in the read-only block, the case for "No Cancel on a closed evaluation" — verifying the Cancel case fails because the link is missing, the closed case passes, and every other related case passes
- [x] 2.2 Implement design.md D1 and D2 in `FormActions.tsx`, `EvaluationForm.tsx` (`pb-36`) and `form-texts.ts` (`cancelLabel` from `deleteCancelLabel`); apply design.md D5 to `qa/src/pages/evaluation-form/ui/FormActions.test.tsx` if it fails the typecheck or the run — verifying `npx vitest related` over the changed files passes, and lint and typecheck exit 0

## 3. Registration Cancel (R57, user-account)

- [ ] 3.1 Update the fixtures: `RegisterForm.test.tsx` `TEXTS.cancelLabel` and `cancelHref="/es"` in its render helper; `RegisterClient.test.tsx` `TEXTS.cancelLabel`. In `RegisterClient.test.tsx` add the case for "Cancel opens the locale root without sending anything" (anonymous session, locale `es`: the link named with the fixture's `cancelLabel` has `href` `/es`, its parent has classes `flex-col` and `items-center`; after activating it no request was sent) — verifying it fails because the link is missing and every other related case passes
- [ ] 3.2 Implement design.md D3 in `RegisterForm.tsx`, `RegisterClient.tsx` and `RegisterScreen.tsx`; apply design.md D5 to `qa/src/features/user-account/ui/RegisterForm.test.tsx` and `qa/src/pages/register/ui/RegisterClient.test.tsx` where they fail — verifying `npx vitest related` over the changed files passes, and lint and typecheck exit 0

## 4. New offering Cancel scenario (R57, offering-management)

- [ ] 4.1 In `NewOfferingForm.test.tsx` add the case for "Cancel leaves for the list" (the link named "Cancel" has `href` `/es/manage/offerings` and follows the submit button) — verifying it passes on the current code (design.md D4), and lint and typecheck exit 0

## 5. Integration verification

- [ ] 5.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`, each exiting 0 (report every QA test excluded or failing because of this change)
