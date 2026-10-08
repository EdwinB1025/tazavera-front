# Tasks

## 1. Configuration

- [x] 1.1 In `eslint.config.mjs`, add the entries of `design.md` D1–D4, every new rule at `"warn"`, after the existing `react/jsx-no-literals` entry and before `globalIgnores`, leaving both unchanged. Expected: only `eslint.config.mjs` changes; no dependency changes; `npm run lint` exits with code 0 and zero errors; the warnings it reports come only from `max-lines`, `max-lines-per-function`, `complexity` and `no-restricted-imports` on top of the warnings reported on `origin/qa`; no test file and no `src/shared/api/schema.ts` gets a new warning; `npx tsc --noEmit` passes.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: both suites pass with the same test files and cases as on `origin/qa`, typecheck and lint report no errors, the build succeeds. Record in the commit body the warning count per new rule (`max-lines`, `max-lines-per-function`, `complexity`, `no-restricted-imports`). If a rule reports no warning on the current code, show it on a known case and name the file.
