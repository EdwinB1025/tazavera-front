No derived API types are needed: the change only moves layout classes and adds two tokens.

## 1. Action width tokens (theming)

- [x] 1.1 Register the two width tokens in the existing radius-token test of `src/app/styles/theme-tokens.test.ts` (check items: the traditional `@theme` defines `--container-action-sm: 7.5rem` and `--container-action-base: 10rem`; the dark theme does not reassign them). Verify: the new items fail before 1.2; the rest of the file passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/app/styles/globals.css`. Verify: `npx vitest related src/app/styles/globals.css src/app/styles/theme-tokens.test.ts --run` passes; `npm run build` emits `min-w-action-sm` and `min-w-action-base`.

## 2. Button widths and action group (base-controls)

- [x] 2.1 Tests: in `src/shared/ui/Button.test.tsx` one test for "Minimum width per size" (a labelled `base` button has `min-w-action-base` and `whitespace-nowrap`, a labelled `sm` button `min-w-action-sm`); a new `src/shared/ui/RouteButton.test.tsx` (a `RouteButton` of size `sm` carries `min-w-action-sm`); a new `src/shared/ui/ActionGroup.test.tsx` for "Equal columns on mobile, predefined widths from 768px" (the group has `grid grid-cols-2 gap-3 max-md:*:w-full max-md:*:min-w-0 md:flex md:flex-wrap`, plus `md:justify-end` with `align="end"`). Update any existing `Button.test.tsx` assertion on the exact geometry string that breaks, naming it in the commit. Verify: the new tests fail only on the missing behaviour and module.
- [x] 2.2 Implement design.md D2–D3: `Button.tsx` (min width and `whitespace-nowrap` for labelled primary/positional buttons), `ActionGroup.tsx` (exported from `src/shared/ui/index.ts`), `Pagination.tsx` (important overrides). Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Dialog footer (feedback)

- [x] 3.1 Update `src/shared/ui/ConfirmDialog.test.tsx` ("orders cancel before confirm in a row from sm and stacks confirm above cancel at full width below it": the parent's class list and the buttons' `w-full` / `sm:w-auto`) for the modified scenarios "Actions on a narrow viewport" and "Actions on a wider viewport": cancel precedes confirm in one parent carrying `grid-cols-2` and `md:justify-end`, and neither button carries `w-full`. Verify: the updated test fails on the current dialog.
- [x] 3.2 `ConfirmDialog.tsx`: Cancel and the destructive action in one `ActionGroup align="end"` (keeping `mt-6`); remove `w-full sm:w-auto`. Verify: `npx vitest related` passes, 3.1 included; typecheck and lint clean.

## 4. Account screens (user-account)

- [x] 4.1 Test in `src/features/user-account/ui/RegisterForm.test.tsx` for "Register and Cancel share one action group": both buttons have the same parent element, which has `grid-cols-2`, and neither button has `w-full`. Verify: it fails on the current form.
- [x] 4.2 Implement design.md D4 in `RegisterForm.tsx` (group), `ContactForm.tsx` (group), `RegisterSuccessPanel.tsx` (lone, `w-full` removed). Verify: `npx vitest related` passes, 4.1 included; typecheck and lint clean.

## 5. Evaluation screens (evaluations)

- [x] 5.1 Update `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` (the Cancel test asserting the `self-center` parent, line 419) for "The form's actions share one action group": Save draft, Close evaluation and Cancel share one parent with `grid-cols-2` and `md:justify-end`. Verify: it fails on the current bar.
- [ ] 5.2 Implement design.md D4 in `FormActions.tsx` (status line, then one group of three; `flex-1 md:flex-none` removed), `SpecialistEvaluationRow.tsx` (status line, then a group) and `PublicEvaluationRowCard.tsx` (group). Verify: `npx vitest related` passes, 5.1 included; typecheck and lint clean.

## 6. Offering management screens (offering-management)

- [ ] 6.1 Implement design.md D4 in `LocationForm.tsx` (group), `NewOfferingForm.tsx` (group, end-aligned as today) and the manage-offerings card actions (through the offering card footer, task 7). No test is added. Verify: `npx vitest related` passes; typecheck and lint clean.

## 7. Catalog screens (offering-catalog)

- [ ] 7.1 Implement design.md D4 in `DetailHeader.tsx` (group), `OfferingCard.tsx` and `CoffeeshopCard.tsx` (the footer's actions in a group aligned to the end). No test is added. Verify: `npx vitest related` passes; typecheck and lint clean.

## 8. Full checks

- [ ] 8.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds. QA tests made stale by this change are reported, not edited.
