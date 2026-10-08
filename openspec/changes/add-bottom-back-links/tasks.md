# Tasks

## 1. Foundation: types

- [x] 1.1 Confirm this change defines no derived API type and touches no generated type: `git status --short` shows nothing under `src/shared/api/` (checked off with task 2.1)

## 2. Detail views (R63, offering-catalog)

- [x] 2.1 In `OfferingDetailContent.test.tsx` add the case for "Back link at the end" (success: two links named `texts.backLabel`, both `href` `/es/offerings`; the last follows the `tabpanel` and is not inside it) and switch the "Back link" and "Detail on the page background" cases to `getAllByRole(...)[0]`; in `CoffeeshopDetailContent.test.tsx` add the same case ("Volver a cafeterías", `/es/coffeeshops`) and switch the "Back link" case to `getAllByRole(...)[0]` — verifying the two new cases fail because the second link is missing and every other related case passes
- [x] 2.2 Implement design.md D1 and D2 in `OfferingDetailContent.tsx` and `CoffeeshopDetailContent.tsx` — verifying `npx vitest related` over the changed files passes, and lint and typecheck exit 0

## 3. Evaluation views (R63, evaluations)

- [ ] 3.1 In `EvaluationSheetView.test.tsx` add the case for "Back link at the end" (a closed evaluation: two links named "Back", both `href` `/en/evaluations`; the last follows the "Context" heading and sits in the second section) and switch the null-offeringId case to `getAllByRole(...)[0]`; in `EvaluationForm.test.tsx` add, in the read-only block, the case for "Back link at the end of a read-only evaluation" (two links named "My evaluations", both `href` `/en/manage/evaluations`; the last follows the read-only status) and switch the deleted-offering "keeps the back link" case to `getAllByRole(...)[0]`; register `text-link`/`surface-section` and `text-link-hover`/`surface-section` (kind `text`) in `TRADITIONAL_PAIRS` and `DARK_PAIRS` of `src/app/styles/theme-tokens.test.ts` — verifying the two new component cases fail because the second link is missing, the matrix passes, and every other related case passes
- [ ] 3.2 Implement design.md D3 in `EvaluationSheetView.tsx` and D4 in `EvaluationForm.tsx` — verifying `npx vitest related` over the changed files passes, and lint and typecheck exit 0

## 4. Integration verification

- [ ] 4.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`, each exiting 0 (report every QA test excluded or failing because of this change)
