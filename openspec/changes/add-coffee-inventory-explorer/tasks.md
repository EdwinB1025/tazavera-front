## 1. Derived types (offering-management)

- [x] 1.1 Add `CoffeeInventoryQuery` and `CoffeeInventoryFilterKey` to `src/shared/api/index.ts` as design.md "Derived types" states. Verify: `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Inventory list (offering-management)

- [x] 2.1 Tests, one per scenario, for "Access to the coffee inventory pages" (Session loading, Anonymous visitor, Another role) and "Coffee inventory list" (Success, Loading, Empty, Error and retry) and "Coffee inventory card" (Card actions, through the list, whose cards carry the page's actions of design.md D4: each button's variant class and the route it pushes) in `src/pages/manage-inventory/ui/InventoryListClient.test.tsx`, and for "Coffee inventory card" (Card contents, No producer and no certification) in `src/entities/coffee-inventory/ui/InventoryCard.test.tsx`. Use the contract's example items. Verify: the new tests fail only because the modules they import do not exist yet (typecheck errors for those modules are allowed); lint is clean.
- [x] 2.2 Implement design.md D1, D2, D3, D4 and D6 without the facets (the toolbar and the filters come in task 5.2; the list reads with an empty query until then), D10's list and card texts, and `app/[locale]/manage/inventory/page.tsx`. `management.test.ts` keeps its assertions. Verify: `npx vitest related` on the changed files passes, 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Inventory detail (offering-management)

- [ ] 3.1 Tests, one per scenario, for "Coffee inventory detail" (Detail of an item, Detail loading, Detail error and retry, Unknown item) in `src/pages/inventory-detail/ui/InventoryDetailClient.test.tsx`. Verify: the new tests fail only because the module does not exist yet; lint is clean.
- [ ] 3.2 Implement design.md D7 (without its sidebar route, task 6.2), D10's detail texts and `app/[locale]/manage/inventory/[ulid]/page.tsx`. Verify: `npx vitest related` on the changed files passes, 3.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Create offering from an item (offering-management)

- [ ] 4.1 Tests, one per scenario, for "Creating an offering from an inventory item" (Preselected item, Unknown preselected item) in `src/pages/new-offering/ui/NewOfferingForm.test.tsx`. No existing assertion changes. Verify: the new tests fail only because the preselection is missing (a typecheck error for the missing `inventory` prop is allowed); the rest of the file passes; lint is clean.
- [ ] 4.2 Implement design.md D8. Verify: `npx vitest related` on the changed files passes, 4.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 5. Inventory filters (filtering)

- [ ] 5.1 Tests, one per scenario: "Inventory facets in the sidebar" (Facets in order) and "Applied inventory filters" (Remove one chip, Clear all) in `src/features/inventory-facets/ui/InventoryFacets.test.tsx`; "Inventory filter state in the URL" (Commit a text facet, Out-of-range value in the address), "Inventory filter toolbar" (Trigger count) and "Filtered inventory results" (Filtered empty, Result count announced) in `src/pages/manage-inventory/ui/InventoryResults.test.tsx`. Verify: the new tests fail only because the facets and their wiring do not exist yet (typecheck errors for the missing modules and props are allowed); lint is clean.
- [ ] 5.2 Implement design.md D5, wire the parsed filters, the toolbar and the filtered results into the list (D6), and add D10's facet labels. Verify: `npx vitest related` on the changed files passes, 5.1 and 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 6. Inventory sidebar (offering-management)

- [ ] 6.1 Test for "Coffee inventory sidebar" (Entries on the inventory list) in `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.test.tsx`: the three entries in order, their hrefs, only "Explore coffee inventory" with `aria-current="page"`, and the "Filters" toggle. Verify: the test fails only because the module does not exist yet; lint is clean.
- [ ] 6.2 Implement `ManageInventorySidebarScreen` (design.md D6), `app/[locale]/@sidebar/manage/inventory/page.tsx` and `app/[locale]/@sidebar/manage/inventory/[ulid]/page.tsx` (D7). Verify: `npx vitest related` on the changed files passes, 6.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 7. Explore coffee inventory in the user menu (app-shell)

- [ ] 7.1 Test in `src/widgets/app-header/ui/AppHeader.test.tsx` for "Explore coffee inventory entry for a coffeeshop": with a `coffeeshop` session, the menu item named `TEXTS.exploreInventory` points at `/es/manage/inventory` and comes right after the "Manage locations" item. Add `exploreInventory` to the file's texts fixture. No existing assertion changes. Verify: the new test fails only because the entry is missing; the rest of the file passes; lint is clean.
- [ ] 7.2 Implement design.md D9. Verify: `npx vitest related` on the changed files passes, 7.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 8. Full checks

- [ ] 8.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/qa`; no typecheck or lint errors; the build succeeds.
