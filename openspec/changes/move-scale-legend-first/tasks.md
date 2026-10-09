# Tasks

"Related tests" means `npx vitest related <changed files> --run`.

## 1. The legend first

- [x] 1.1 In `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, test "sits after Flavor / Aftertaste and before Acidity, as no group and with no indicator": rename it to state that the legend is the first section, and replace its two position assertions with: the legend header follows the header's back link and precedes the roast level field (the context fields card); the assertions that it is no group and has no indicator stay. Verify: that test fails only on the new position assertion; every other related test, `npx tsc --noEmit` and `npm run lint` pass. Commit `test(evaluations): assert the scale legend is the first section`.
- [x] 1.2 Per design.md D1, render `ScaleLegend` in `EvaluationForm.tsx` between `EvaluationFormHeader` and `ContextFieldsCard` and remove it from `EvaluationGroupList.tsx`; nothing else changes. Verify: the related tests pass; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `fix(evaluations): move the scale legend to the top of the form`.

## 2. Full checks

- [ ] 2.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0, except `npm run test:qa` failures that also fail on `origin/develop`. This task changes no files: check it off in a commit containing only the checkbox, `chore(evaluations): complete tasks for move-scale-legend-first`.
