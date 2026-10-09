No derived API types are needed: the change only moves `variant` values. Each implementation task changes only `variant` values (other sessions edit some of these files in parallel).

## 1. Confirmation dialog (feedback)

- [ ] 1.1 Update `src/shared/ui/ConfirmDialog.test.tsx` ("calls onConfirm when the primary confirm action is activated"): the confirm action carries `bg-action-2-bg` instead of `bg-action-primary`. Verify: the updated assertion fails on the current dialog; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 1.2 In `src/shared/ui/ConfirmDialog.tsx` the confirm action takes `action-2`. Verify: `npx vitest related` on the changed file passes, the test of 1.1 included; typecheck and lint report no errors.

## 2. Pagination (content-structure)

- [ ] 2.1 In `src/shared/ui/Pagination.tsx` Previous and Next take `action-3`. No validation test asserts their variant; none is added. Verify: `npx vitest related` on the changed file passes; typecheck and lint report no errors.

## 3. Map and offering detail (offering-catalog)

- [ ] 3.1 Zoom in and Zoom out in `src/shared/ui/LocationsMap.tsx`, and "Back to list" in `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx`, take `action-3`; "Evaluate" in `src/widgets/offering-detail/ui/DetailHeader.tsx` takes `action-1`. No validation test asserts these variants; none is added. Verify: `npx vitest related` on the changed files passes; typecheck and lint report no errors.

## 4. Add location (offering-management)

- [ ] 4.1 `AddLocationButton` in `src/features/location-management/ui/LocationsPanelStates.tsx` takes `action-1`. No validation test asserts its variant; none is added. Verify: `npx vitest related` on the changed file passes; typecheck and lint report no errors.

## 5. Add contact details (user-account)

- [ ] 5.1 For the `base-controls` scenario "Create or start", add to an existing test of `src/features/user-account/ui/ContactSection.test.tsx` that renders the empty state an assertion that "Add contact details" carries `bg-action-1-bg`. Keep `qa/src/features/user-account/ui/ContactSection.test.tsx` (it asserts the old `bg-action-primary`) out of `vitest.qa.config.mts` with a comment naming this change. Verify: the new assertion fails on the current section; the other tests of the file pass; typecheck and lint report no errors.
- [ ] 5.2 "Add contact details" in `src/features/user-account/ui/ContactSectionStates.tsx` takes `action-1`. Verify: `npx vitest related` on the changed file passes, the assertion of 5.1 included; typecheck and lint report no errors.

## 6. Evaluation actions (evaluations)

- [ ] 6.1 Update `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`: in "offers Edit for an open row and View for a closed one, both opening the form route", Edit carries `bg-action-4-bg` instead of `bg-action-3-bg` and View carries `bg-action-3-bg` (added, `base-controls` scenario "Navigate or consult"); in "Closing an open evaluation from its row", Close evaluation carries `bg-action-2-bg` instead of `bg-action-3-bg`. Update the variant names in the header comment of `src/pages/evaluation-form/ui/FormActions.test.tsx`. Verify: the Edit and Close assertions fail on the current rows; the other tests pass; typecheck and lint report no errors.
- [ ] 6.2 Save draft takes `primary` and Close evaluation `action-2` in `src/pages/evaluation-form/ui/FormActions.tsx`; Close evaluation takes `action-2` in `src/pages/evaluations-list/ui/CloseEvaluationAction.tsx`; Edit takes `action-4` and View keeps `action-3` in `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`; View offering takes `action-3` in `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx`. Verify: `npx vitest related` on the changed files passes, the tests of 6.1 included; typecheck and lint report no errors.

## 7. Explore actions (landing)

- [ ] 7.1 The explore actions in `src/pages/home/ui/ExploreButton.tsx` and `src/pages/about/ui/ExploreButton.tsx` take `action-3`. No validation test asserts their variant; none is added. Verify: `npx vitest related` on the changed files passes; typecheck and lint report no errors.

## 8. Full checks

- [ ] 8.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds. Any QA test that fails on the old variants is reported to Product owner, not edited.
