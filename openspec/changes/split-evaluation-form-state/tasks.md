# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite); "the form tests" means `EvaluationForm.test.tsx` (36 tests) and `EvaluationDetail.test.tsx`, and "the card tests" means `EvaluationGroupCard.test.tsx` and `FormActions.test.tsx`, each in `src/pages/evaluation-form/ui/` and `qa/src/pages/evaluation-form/ui/`. Every task moves code unchanged as design.md states, and verifies: the related tests pass, including the named protecting tests, with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors.

## 1. Value updaters

- [ ] 1.1 Create `src/pages/evaluation-form/model/form-updates.ts` with `FormValuesUpdate`, `FormStateUpdate` and the updaters of design.md D1; `EvaluationGroupCard.tsx` imports `FormStateUpdate` from it and every value edit of `EvaluationForm.tsx` and `EvaluationGroupCard.tsx` goes through an updater. Protecting tests: the form tests and the card tests. Commit `refactor(evaluations): move the form value edits into the model`.

## 2. Form reducer and hook

- [ ] 2.1 Create `src/pages/evaluation-form/model/form-model.ts` (design.md D2, `FormBusy` moved from `FormActions.tsx`, which imports it from there) and `src/pages/evaluation-form/model/use-evaluation-form.ts` (design.md D3); `EvaluationForm` replaces its nine `useState` calls, `initialState`, `allGroups`, `failureFor`, `save`, `onSave` and `onClose` with `useEvaluationForm`. Protecting tests: the form tests and the card tests. Commit `refactor(evaluations): move the form state into a reducer`.

## 3. Form parts

- [ ] 3.1 Create `src/pages/evaluation-form/ui/group-texts.ts` (design.md D6), `ui/EvaluationFormHeader.tsx`, `ui/ContextFieldsCard.tsx` and `ui/EvaluationGroupList.tsx` (design.md D4); `EvaluationForm` composes them and keeps only the read-only status or `FormActions`. Verify also: `EvaluationForm.tsx` and the new files are at most 300 lines, every function at most 80 lines and of complexity at most 15 (`npm run lint` reports no `max-lines`, `max-lines-per-function` or `complexity` warning for them). Protecting tests: the form tests. Commit `refactor(evaluations): split the evaluation form into parts`.

## 4. Group card parts

- [ ] 4.1 Create `src/pages/evaluation-form/ui/AxisControls.tsx` and `ui/GroupParts.tsx` (design.md D5); `EvaluationGroupCard` composes them with its props and uncontrolled open state unchanged. Verify also: `EvaluationGroupCard.tsx` and the new files raise no `max-lines`, `max-lines-per-function` or `complexity` warning in `npm run lint`. Protecting tests: the card tests and the form tests. Commit `refactor(evaluations): split the evaluation group card into parts`.

## 5. Full checks

- [ ] 5.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `git diff origin/qa --stat -- src qa` lists only the files of design.md, Files; `index.ts`, `EvaluationDetail.tsx`, `form-fixtures.ts` and `form-texts.ts` are untouched; `npx eslint src/pages/evaluation-form` reports no size or complexity warning except `formTextsFrom` in `form-texts.ts` (out of scope). This task changes no files: check it off in a commit containing only the checkbox, `chore(evaluations): complete tasks for split-evaluation-form-state`.
