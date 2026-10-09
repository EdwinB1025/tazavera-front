# Tasks

## 1. Tighten the public evaluations toolbar spacing (content-structure)

- [x] 1.1 Test first. In `src/pages/public-evaluations/ui/ListScreen.test.tsx`, add one test for the scenario "Public evaluations toolbar close to its results": the heading and the results (the stubbed list) sit in the same `section`, and the container holding the header column and the results carries `gap-6` (one class assertion). Update existing assertions only where the structure change breaks them. No `qa/` test changes.

  Verify: `npx vitest related src/pages/public-evaluations/ui/ListScreen.test.tsx --run`. Expected: only the new test fails. `npx tsc --noEmit` and `npm run lint` pass.

- [ ] 1.2 In `src/pages/public-evaluations/ui/ListScreen.tsx`, render one `PageSection surface="page"`. Its `containerClassName` is `flex flex-col gap-6`; its children are the existing header column (heading block + toolbar, `flex flex-col gap-8`, unchanged) and the list's `Suspense` boundary. No margin or padding on the toolbar or the list block; `PageSection` unchanged.

  Verify: `npx vitest related src/pages/public-evaluations/ui/ListScreen.tsx --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
