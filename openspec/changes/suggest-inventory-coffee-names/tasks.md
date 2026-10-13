No derived API types are needed: the change reads no new API field (`CoffeeSummary` already exists in `@/shared/api`).

## 1. Coffee search in the `coffee` entity (design.md D1)

- [x] 1.1 `git mv` `src/features/offering-facets/api/search-by-name.ts`, `search-coffees.ts` and `search-coffees.test.ts` to `src/entities/coffee/api/`; add `src/entities/coffee/index.ts` exporting only `searchCoffees` and `searchByName`; `search-roasteries.ts` imports `searchByName` from `@/entities/coffee` and `OfferingFacets.tsx` imports `searchCoffees` from `@/entities/coffee`; in `src/features/offering-facets/ui/OfferingFacets.test.tsx` change only `vi.mock("../api/search-coffees", …)` to `vi.mock("@/entities/coffee/api/search-coffees", …)`, same factory. Code bodies unchanged except import paths and doc comments. Verify: `npx vitest related` on every changed file passes with no assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Padded combobox in `shared/ui` (design.md D2)

- [x] 2.1 Move `PaddedCombobox`, `asComboboxValue` and `comboboxTexts` from `src/features/offering-facets/ui/OfferingFacetParts.tsx` to the new `src/shared/ui/PaddedCombobox.tsx` ("use client"), same names and markup, `comboboxTexts` taking `{ searching: string; noOptionMatches: string; searchFailed: string; optionCount: string; loading?: string }`; export the three from `src/shared/ui/index.ts` in one line right after the `ComboboxLoader` line; `OfferingFacets.tsx` and `OfferingFacetParts.tsx` import them from `@/shared/ui`. Verify: `npx vitest related` on every changed file passes with no assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Inventory Coffee name combobox (spec "Inventory facets in the sidebar"; design.md D2, D3)

- [x] 3.1 `InventoryFilterTexts` gains `searching`, `noOptionMatches`, `searchFailed`, `optionCount` and `coffeeNamePlaceholder` from the `filters` catalog; `InventoryFacets.tsx` renders Coffee name as `PaddedCombobox` first (D2), then the other five keys as `FacetTextField` without `type`; `InventoryFacetsProps.texts` becomes `InventoryFilterTexts & { loading?: string }`; `ManageInventorySidebarScreen.tsx` adds `loading` from the `account` catalog. Update the test "Facets in order" in `src/features/inventory-facets/ui/InventoryFacets.test.tsx` (approved by the orchestrator): the test becomes `async` and Coffee name is found with `await screen.findByRole("combobox", { name: "Coffee name" })` instead of `getByRole("searchbox", …)`; every other assertion stays (Coffee name shows "geisha"); add only the jsdom stubs the combobox needs (matchMedia, ResizeObserver, scrollIntoView) as test infrastructure. If `src/pages/manage-inventory/ui/InventoryResults.test.tsx` "Trigger count: Filters (2) and no sort control" fails only on `expect(screen.queryByRole("combobox")).toBeNull()`, narrow that line to `queryByRole("combobox", { name: "Sort by" })` (approved by the orchestrator). Verify: `npx vitest related` on every changed file passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 4. Scenario "Choosing a coffee name"

- [x] 4.1 New test "Choosing a coffee name" in `src/features/inventory-facets/ui/InventoryFacets.test.tsx`, built like "writes the chosen coffee's name to coffeeName without page" in `OfferingFacets.test.tsx`: `vi.mock("@/entities/coffee/api/search-coffees", …)` returning the "Huila El Mirador" option; render with `originCountry=Colombia`; type "hui" in the combobox "Coffee name", click "Huila El Mirador"; `nav.push` is called with the URL carrying `originCountry=Colombia` and `coffeeName=Huila El Mirador` (key order as the shared navigation writes it) and `{ scroll: false }`. Verify: `npx vitest related src/features/inventory-facets/ui/InventoryFacets.tsx --run` passes; `npm run lint` reports no errors.

## 5. Full checks

- [x] 5.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, the validation suite with one more test than before, lint with 0 errors. Any failure is fixed in its own `fix(filtering): …` commit, never by changing an assertion or a QA test; a failing QA test is reported.

## Workflow follow-up

- Verify, then archive the change and remove R88 and its priority row from `docs/design/backlog.md`.
