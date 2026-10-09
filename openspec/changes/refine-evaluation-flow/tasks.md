# Tasks

## 1. Close readiness (D3)

- [x] 1.1 Tests first. Create `src/entities/evaluation/model/closing.test.ts` for `isReadyForClosing`: a complete evaluation → `true`; one score 0 → `false`; no `main_tastes` → `false`; no `mouthfeel` → `false`; only `defects` besides `main_tastes` and `mouthfeel` → `false`. Expected: fails only because the module is missing.
- [x] 1.2 Implement `src/entities/evaluation/model/closing.ts` and export it from `src/entities/evaluation/index.ts`. Verify: related tests, `npx tsc --noEmit`, `npm run lint`.

## 2. Card actions (D3, D5)

- [x] 2.1 Tests first in `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`: add `viewOfferingLabel` to TEXTS and a `COMPLETE` open fixture (15 scores > 0, `main_tastes`, `mouthfeel` and `aroma` tastes). New tests: "Viewing an open evaluation" (View pushes `/en/manage/evaluations/{ulid}?mode=view`), "Actions of a complete open row" (button names in order View, View offering, Close evaluation, Edit, Delete), "No close on an incomplete open row" (`OPEN` has View, View offering, Edit, Delete and no Close), "Viewing the offering of a row" (pushes `/en/offerings/{offeringId}`). Update the assertions that break:
  - "offers Edit for an open row and View for a closed one…" → the open row also has View; Edit keeps `bg-action-4-bg` and its route; the closed row has no Edit and its View opens the route without the query;
  - "Closing an open evaluation from its row" and "The row's close finds the evaluation incomplete" → render `COMPLETE`; the order becomes the one above;
  - the orphan "offers View and Delete…" → also no View offering; its View opens `?mode=view`.
  In `src/pages/evaluations-list/ui/EvaluationsList.test.tsx`: add `isReadyForClosing` (the original) to the entity mock and `viewOfferingLabel` to TEXTS; "The row's close succeeds" → the first item is complete. Expected: the new and updated tests fail only because the actions are missing.
- [x] 2.2 Implement D5 and D3's list part: `ViewOfferingButton` in `EvaluationRowParts.tsx`, used by `PublicEvaluationRowCard.tsx` and exported by the widget; `SpecialistEvaluationRow.tsx` (actions and order, `viewOfferingLabel` in its texts); `EvaluationsListScreen.tsx` (`viewOfferingLabel` from `public-evaluations`). Verify: related tests (including `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx` unchanged), typecheck, lint.

## 3. Form: read-only mode, Close readiness, close returns (D1, D3, D4)

- [x] 3.1 Tests first in `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, with a `COMPLETE_EVALUATION` fixture in `form-fixtures.ts`. New tests: "An open evaluation opened with View" (`viewOnly` on an open evaluation: no slider, no Save draft, Close evaluation or Cancel, two "My evaluations" buttons), "No close on an incomplete saved evaluation" (`OPEN_EVALUATION` has no Close evaluation). Update the assertions that break:
  - "Close on a saved open evaluation" → renders `COMPLETE_EVALUATION`;
  - "saves first, then closes, then shows the read-only view…" → renders `COMPLETE_EVALUATION`, keeps the save-then-close order and expects `router.push("/en/manage/evaluations")` instead of the read-only view;
  - "shows the incomplete message on a 409…" and "expands exactly the incomplete groups on a 409 close" → render `COMPLETE_EVALUATION`, set the Acidity intensity to 0 before closing, and expect only `acidity` highlighted and expanded;
  - "shows the not-yours message on a 403…" → renders `COMPLETE_EVALUATION`;
  - "expands every group when a successful close turns the form read-only" → after a successful close the groups keep their state and `router.push("/en/manage/evaluations")` is called.
  In `src/pages/evaluation-form/ui/EvaluationDetail.test.tsx`: new test, `viewOnly` passes through (an open evaluation renders no Save draft). Expected: fails only because `viewOnly`, `closable` and the navigation are missing.
- [x] 3.2 Implement D1, D3's form part and D4 in `form-model.ts`, `use-evaluation-form.ts`, `EvaluationForm.tsx`, `EvaluationDetail.tsx`, `EvaluationScreen.tsx` and `app/[locale]/manage/evaluations/[ulid]/page.tsx`. Verify: related tests, typecheck, lint.

## 4. Optional extrinsic notes (D2)

- [x] 4.1 Tests first in `src/pages/evaluation-form/ui/EvaluationGroupCard.test.tsx`: new test "Extrinsic notes start behind Add note" (the four labels shown, four "Add note (…)" buttons and no textarea). Update "shows the Extrinsic group's five fields in the contract's order" → the five "Add note" controls in contract order. In `EvaluationForm.test.tsx` and `src/entities/evaluation/model/load.test.ts` / `body.test.ts`: update only the assertions that break. Expected: fails only because the fields are always open.
- [x] 4.2 Implement D2 in `ExtrinsicField.tsx` and `GroupParts.tsx`. Verify: related tests, typecheck, lint.

## 5. Full checks

- [ ] 5.1 Run each on its own: `npm run test:run`, `npm run test:qa` (only failures also on `origin/develop` allowed; stale `qa/` copies listed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
