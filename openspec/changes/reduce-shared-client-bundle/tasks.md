# Tasks

## 1. Declare the project's side effects

- [ ] 1.1 In `package.json`, add `"sideEffects": ["*.css"]` (design.md D1). No other file changes. Expected: `npx tsc --noEmit` and `npm run lint` pass; after `npm run build`, the First Load JS of every route matches the "After" column of design.md's measurement (within 0.5 KB gzipped), and no route that renders no combobox loads cmdk.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes with the same count as on `origin/qa`; `test:qa` fails only on the files that also fail on `origin/qa`; typecheck and lint report no errors; the build succeeds.
