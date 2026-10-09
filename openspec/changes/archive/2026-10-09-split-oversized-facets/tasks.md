# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite). Each task moves code of one unit unchanged into the sibling files of design.md, Files, and is verified with: the related tests pass with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors and no size or complexity warning for the unit.

## 1. Combobox

- [x] 1.1 Create `src/shared/ui/use-combobox-input.ts` and `src/shared/ui/ComboboxPopup.tsx` and split `Combobox` as design.md D2. Commit `refactor(filtering): split the combobox`.

## 2. Score range facet

- [x] 2.1 Create `src/shared/ui/ScoreRangeParts.tsx` and split `ScoreRangeFacet` as design.md D3. Commit `refactor(filtering): split the score range facet`.

## 3. Evaluation facets

- [x] 3.1 Create `src/features/evaluation-facets/ui/EvaluationFacetParts.tsx` and split `EvaluationFacets` as design.md D4. Commit `refactor(filtering): split the evaluation facet panel`.

## 4. Evaluation filter parsing

- [x] 4.1 Split `parseEvaluationFilters` in `src/features/evaluation-facets/model/query.ts` as design.md D5. Commit `refactor(filtering): split the evaluation filter parsing`.

## 5. Offering facets

- [x] 5.1 Create `src/features/offering-facets/ui/OfferingFacetParts.tsx` and split `OfferingFacets` as design.md D6. Commit `refactor(filtering): split the offering facet panel`.

## 6. Full checks

- [x] 6.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; lint reports no size or complexity warning in the scope; no public index changes; each list route's First Load JS grows by at most 1 KB gzipped (design.md D1; measured before the split: offerings 229113 B, evaluations 225293 B, coffee shop detail 244854 B, directory unchanged). This task changes no files: check it off in a commit containing only the checkbox, `chore(filtering): complete tasks for split-oversized-facets`.
