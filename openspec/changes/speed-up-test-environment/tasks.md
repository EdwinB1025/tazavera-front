# Tasks

## 1. Test environment

- [x] 1.1 In `vitest.config.mts`, add the forks file list and the two inline projects of design.md D1 (`vm` with `pool: 'vmThreads'` excluding the list, `forks` including only the list, both `extends: true`). Do not change `vitest.qa.config.mts`, `package.json` or any test file. Expected: `npm run test:run` reports 183 files and 999 tests passed, `npm run test:qa` reports 337 files and 1781 tests passed, each in at most 120 s; `npx tsc --noEmit` and `npm run lint` pass. If any test fails or is flaky, stop and report it instead of widening the list beyond design.md D1.

## 2. Full checks

- [x] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa` (twice), `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes 183 files and 999 tests, both QA runs pass 337 files and 1781 tests (the same counts as on `origin/qa`), typecheck and lint report no errors, the build succeeds, and `git diff origin/qa --stat` lists no test file.
