## 1. My evaluations list adopts the shared loader

- [x] 1.1 Create `src/entities/evaluation/lib/offerings.ts` with `loadEvaluationOfferings` and its types as in design.md D1, export `loadEvaluationOfferings` from `src/entities/evaluation/index.ts` (D2), and make `loadPage` in `src/pages/evaluations-list/ui/EvaluationsList.tsx` use it with `fetchOffering`, keeping its error mapping (D3). In the `vi.mock("@/entities/evaluation", …)` factory of `src/pages/evaluations-list/ui/EvaluationsList.test.tsx` and `qa/src/pages/evaluations-list/ui/EvaluationsList.test.tsx`, also provide the real `loadEvaluationOfferings` (D4); no assertion changes. Verify: `npx vitest related` on the changed files passes with the same test count as before, and `npx vitest run --config vitest.qa.config.mts qa/src/pages/evaluations-list/ui/EvaluationsList.test.tsx` passes; `npx tsc --noEmit` reports no errors; `npm run lint` reports no errors.

## 2. Public evaluations list adopts the shared loader

- [x] 2.1 Make `src/widgets/public-evaluation-list/ui/PublicEvaluationList.tsx` use `loadEvaluationOfferings` with `fetchOffering` inside its `try`, keeping its error and empty mapping (D3). In the `vi.mock("@/entities/evaluation", …)` factory of `src/widgets/public-evaluation-list/ui/PublicEvaluationList.test.tsx` and `qa/src/widgets/public-evaluation-list/ui/PublicEvaluationList.test.tsx`, also provide the real `loadEvaluationOfferings` (D4); no assertion changes. Verify: `npx vitest related` on the changed files passes with the same test count as before, and `npx vitest run --config vitest.qa.config.mts qa/src/widgets/public-evaluation-list/ui/PublicEvaluationList.test.tsx` passes; `npx tsc --noEmit` reports no errors; `npm run lint` reports no errors; `src/entities/evaluation` imports nothing from `src/entities/offering`.

## 3. Full checks

- [x] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every test passes with the same file and test counts as on `origin/qa`, no typecheck or lint errors, and the build succeeds.
