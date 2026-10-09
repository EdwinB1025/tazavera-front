# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions and imports. "Related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite).

## 1. Types module

- [x] 1.1 Create `src/shared/ui/flavor-wheel-types.ts` with `FlavorWheelNode` and `FlavorWheelGroup` moved unchanged from `FlavorWheel.tsx` (design.md D1); point the type imports of `FlavorWheelChart.tsx`, `FlavorWheelLabels.tsx`, `FlavorWheelNoteList.tsx`, `FlavorWheelPanel.tsx`, `flavor-wheel-keys.ts`, `flavor-wheel-tree.ts` and `use-flavor-wheel-state.ts` at it; `FlavorWheel.tsx` imports both types from it and re-exports only `FlavorWheelNode` (design.md D2). Verify: the related tests pass with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors; `npx -y madge@8 --circular --extensions ts,tsx src/shared/ui` reports no circular dependency. Commit `refactor(feedback): move the flavor wheel types to their own module`.

## 2. Full checks

- [ ] 2.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npx -y madge@8 --circular --extensions ts,tsx src/shared/ui`. Expected: every one exits 0 with no test added, removed or changed, and madge reports no circular dependency; `git diff origin/develop --stat -- src qa` lists only the files of design.md, Files. This task changes no files: check it off in a commit containing only the checkbox, `chore(feedback): complete tasks for move-flavor-wheel-types`.
