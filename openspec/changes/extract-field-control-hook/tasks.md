# Tasks

No test-writing task: this is a refactor (fast lane). The protecting tests keep their assertions. In every task, "related tests" means `npx vitest related <changed files> --run` (validation suite) and `npx vitest related <changed files> --run --config vitest.qa.config.mts` (QA suite, `qa/src/shared/ui/`).

## 1. Shared hook

- [x] 1.1 Create `src/shared/ui/use-field-control.ts` exactly as design.md D1–D2 (`"use client"` first; `FieldControlProps` and `FieldControl` declared before the hook; not exported from `src/shared/ui/index.ts`) and adopt it in `src/shared/ui/Input.tsx` as design.md D3, importing it as `./use-field-control`. Verify: the related tests pass, including `Input.test.tsx`, `Field.test.tsx`, `Combobox.test.tsx` and `client-boundary.test.ts` in both suites, with no test file changed; `npx tsc --noEmit` reports 0 errors; `npm run lint` reports 0 errors. Commit `refactor(form-fields): extract the field control hook from the input`.

## 2. Remaining controls

- [x] 2.1 Adopt the hook in `src/shared/ui/Select.tsx` and `src/shared/ui/PasswordInput.tsx` as design.md D3. Verify: the related tests pass, including `Select.test.tsx`, `PasswordInput.test.tsx` and `Field.test.tsx` in both suites, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(form-fields): resolve the select and password input through the field control hook`.
- [x] 2.2 Adopt the hook in `src/shared/ui/Textarea.tsx` as design.md D3 (no `variant`). Verify: the related tests pass, including `Textarea.test.tsx` and `Field.test.tsx` in both suites, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(form-fields): resolve the textarea through the field control hook`.
- [x] 2.3 Adopt the hook in `src/shared/ui/Checkbox.tsx` with its own field value as design.md D3; its rendered `id`, `aria-describedby`, `aria-invalid`, `required` and class names stay as today. Verify: the related tests pass, including `Checkbox.test.tsx` in both suites and the facet tests that render it, with no test file changed; `npx tsc --noEmit` 0 errors; `npm run lint` 0 errors. Commit `refactor(form-fields): resolve the checkbox through the field control hook`.

## 3. Full checks

- [ ] 3.1 Run, each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every one exits 0 with no test added, removed or changed; `git diff origin/qa --stat -- src qa` lists only the files of design.md, Files; `Combobox.tsx`, `Field.tsx`, `field-context.ts` and `index.ts` are untouched. This task changes no files: check it off in a commit containing only the checkbox, `chore(form-fields): complete tasks for extract-field-control-hook`.
