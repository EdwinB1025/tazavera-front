## 1. Split the row card

- [ ] 1.1 Create `src/widgets/evaluation-row/ui/EvaluationRowParts.tsx` (design.md D1), `src/widgets/evaluation-row/ui/SpecialistEvaluationRowCard.tsx` (D2) and `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx` (D3), taking the logic of `EvaluationRowCard.tsx` without changing markup, classes or texts, and export the two components and their texts types from `src/widgets/evaluation-row/index.ts` next to the current exports (D4). Protecting tests: `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx`. Verify: `npx vitest related` on the changed files passes with the same test count as before; `npx tsc --noEmit` reports no errors; `npm run lint` reports no errors and no complexity warning in the new files.

## 2. Callers

- [ ] 2.1 Make `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx` render `SpecialistEvaluationRowCard` and widen its `EvaluationRowTexts` with `viewLabel` (D4). Protecting tests: `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.test.tsx` ("My evaluations list" scenarios). Verify: `npx vitest related` on the changed file passes with the same test count as before; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 2.2 Make `src/pages/public-evaluations/ui/ListScreen.tsx` render `PublicEvaluationRowCard` and `src/pages/public-evaluations/ui/texts.ts` return `EvaluationListTexts & PublicEvaluationRowCardTexts` (D4). Update the row slot of `PublicEvaluationList.test.tsx` and `EvaluationListPresentation.test.tsx` in `src/widgets/public-evaluation-list/ui/` and `qa/src/widgets/public-evaluation-list/ui/` to render `PublicEvaluationRowCard` without `variant` (import and rendered component only). Protecting tests: those four files ("Public evaluations list" scenarios). Verify: `npx vitest related` on the changed files passes with the same test count as before, and `npx vitest run --config vitest.qa.config.mts qa/src/widgets/public-evaluation-list` passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Remove the flag-driven card

- [ ] 3.1 Delete `src/widgets/evaluation-row/ui/EvaluationRowCard.tsx` and its exports from `src/widgets/evaluation-row/index.ts` (D4); update `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx` to render `PublicEvaluationRowCard` with `PublicEvaluationRowCardTexts` (D4; import, rendered component and props only); add `qa/src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx` to the `exclude` list of `tsconfig.json` (D5). Protecting tests: `src/widgets/evaluation-row/ui/EvaluationRowCard.test.tsx`. Verify: it passes with the same test count as before; no file under `src/` or `qa/` outside the stale QA copy references `EvaluationRowCard` from the widget; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Full checks

- [ ] 4.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every test passes with the same file and test counts as on `origin/qa`, no typecheck or lint errors, and the build succeeds.
