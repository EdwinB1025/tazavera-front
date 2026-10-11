No derived API types are needed: the change reads no new API field. design.md is not created: the change is two class names with no technical decision to settle.

## 1. Inventory list eyebrow (offering-management)

- [ ] 1.1 Test in `src/pages/manage-inventory/ui/InventoryListClient.test.tsx` for "Inventory list eyebrow": render the list for a signed-in coffeeshop and assert the "Management" eyebrow's `className` is exactly `type-eyebrow-strong` (pattern of `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx`, header test). Verify: the test fails only because the eyebrow is still `type-eyebrow`; the rest of the file passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 1.2 In `src/pages/manage-inventory/ui/InventoryListClient.tsx`, change the eyebrow's class from `type-eyebrow` to `type-eyebrow-strong`; nothing else changes. Verify: `npx vitest related` on the changed files passes, 1.1 included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Inventory detail eyebrow (offering-management)

- [ ] 2.1 Test in `src/pages/inventory-detail/ui/InventoryDetailClient.test.tsx` for "Inventory detail eyebrow": when the read answers `200` with an item whose `ulid` is the route's, assert the "Coffee inventory" eyebrow's `className` is exactly `type-eyebrow-strong`. Verify: the test fails only because the eyebrow is still `type-eyebrow`; the rest of the file passes; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 2.2 In `src/pages/inventory-detail/ui/InventoryDetailView.tsx`, change the eyebrow's class from `type-eyebrow` to `type-eyebrow-strong`; nothing else changes. Verify: `npx vitest related` on the changed files passes, 2.1 included, with no existing assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass; no QA test asserts the inventory eyebrow's class, so none is expected to become stale. Any QA test made stale on purpose is left untouched and listed in the final report; any other failure is fixed in its own `fix(offering-management): …` commit.
