# Tasks

## 1. Tighten the list toolbar spacing (content-structure)

- [x] 1.1 Test first. In `src/pages/offerings/ui/OfferingsScreen.test.tsx` and `src/pages/coffeeshops/ui/CoffeeshopsScreen.test.tsx`, add one test per screen for the scenarios "Catalog toolbar close to its results" and "Directory toolbar close to its results": the heading and the results (the stubbed results block) sit in the same `section`, and the container holding the header column and the results carries `gap-6` (one class assertion per screen). Keep "Toolbar region contributes nothing" as it is (the heading block stays the only child of its header column when the toolbar is empty); update other existing assertions only where the structure change breaks them. No `qa/` test changes.

  Verify: `npx vitest related src/pages/offerings/ui/OfferingsScreen.test.tsx src/pages/coffeeshops/ui/CoffeeshopsScreen.test.tsx --run`. Expected: only the two new tests fail. `npx tsc --noEmit` and `npm run lint` pass.

- [ ] 1.2 In `src/pages/offerings/ui/OfferingsScreen.tsx` and `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx`, render one `PageSection surface="page"` per screen. Its `containerClassName` is `flex flex-col gap-6`; its children are the existing header column (heading block + toolbar, `flex flex-col gap-8`, unchanged) and the results (`FilteredOfferingsResults`; the directory's `Suspense` boundary). No margin or padding on the toolbar or the list block; `PageSection` unchanged.

  Verify: `npx vitest related src/pages/offerings/ui/OfferingsScreen.tsx src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
