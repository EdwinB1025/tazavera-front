# Tasks

## 1. Remove the intra-segment import cycles

- [x] 1.1 In `src/shared/ui/Sidebar.tsx`, import `Button` from `./Button` instead of `@/shared/ui` (design.md D2). No test import moves. Verify: `npx vitest related src/shared/ui/Sidebar.tsx --run` passes (including `src/shared/ui/Sidebar.test.tsx`), `npx tsc --noEmit` reports no errors and `npm run lint` reports no errors.
- [ ] 1.2 Define `CoffeeSummary` in `src/shared/api/coffees.ts` from `./schema` and re-export it from `src/shared/api/index.ts`, removing the `./index` import of `coffees.ts` and the local definition and unused alias in `index.ts` (design.md D1). Touch only the import and type lines of `coffees.ts`. No test import moves. Verify: `npx vitest related src/shared/api/coffees.ts src/shared/api/index.ts --run` passes, `npx tsc --noEmit` reports no errors, `npm run lint` reports no errors, and `@/shared/api` still exports `CoffeeSummary`, `CoffeeFacetField`, `distinctCoffeeValues` and `fetchCoffees`.
- [ ] 1.3 Delete `src/widgets/offering-list/ui/RetryButton.tsx`, import `RetryButton` from `@/shared/ui` in `src/widgets/offering-list/ui/OfferingList.tsx`, and remove the two `RetryButton` lines of `src/widgets/offering-list/index.ts` (design.md D3). No test import moves. Verify: `npx vitest related src/widgets/offering-list/ui/OfferingList.tsx src/widgets/offering-list/index.ts --run` passes (including `src/widgets/offering-list/ui/OfferingList.test.tsx`), `npx tsc --noEmit` reports no errors, `npm run lint` reports no errors, and a search for `RetryButton` under `src/widgets/offering-list` finds only the `@/shared/ui` import and its uses in `OfferingList.tsx`.

## 2. Full checks

- [ ] 2.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every suite passes with the same number of test files and tests as on `origin/qa`, the typecheck and lint report no errors, and the build succeeds.
