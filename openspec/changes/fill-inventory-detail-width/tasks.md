No derived API types are needed: the change reads no new API field (design.md Context).

## 1. The inventory detail fills the page width (offering-management)

- [x] 1.1 In `src/pages/inventory-detail/ui/InventoryDetailClient.test.tsx`, inside the describe of spec 'Coffee inventory detail', add one test for the scenario "Detail fills the page width": with the read answering `200` and an item with the route's `ulid`, once the item's heading renders, the back link's parent element has the class name `flex flex-col items-start gap-6`, and the back link's next sibling element has the class name `self-stretch` and contains the item's heading. No other test changes. Verify: the new test fails only because the back link's next sibling is not the `self-stretch` wrapper; the rest of the file passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/pages/inventory-detail/ui/InventoryDetailClient.tsx`. Verify: `npx vitest related src/pages/inventory-detail/ui/InventoryDetailClient.tsx --run` passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [ ] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, lint with 0 errors. Any failure is fixed in its own `fix(offering-management): …` commit, or reported when the fix would go beyond the end state.
