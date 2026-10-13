# Design

## Context

See proposal.md (Why). Today the offering facets' Coffee combobox (`src/features/offering-facets/ui/OfferingFacets.tsx`) reads its options from `searchCoffees`, built in `src/features/offering-facets/api/search-coffees.ts` over the shared name search `searchByName` (`search-by-name.ts` in the same segment, calling `publicRequest` from `@/shared/api`). The combobox is rendered by `PaddedCombobox` (a `px-3` wrapper around `ComboboxLoader`), with `asComboboxValue` and `comboboxTexts`, all in `src/features/offering-facets/ui/OfferingFacetParts.tsx`. The inventory facets (`src/features/inventory-facets/ui/InventoryFacets.tsx`) render all six facets as `FacetTextField`. A feature may not import another feature, so the search and the combobox parts must move down before the inventory facets can use them.

## Goals / Non-Goals

**Goals:**
- One coffee search and one padded combobox, imported by both facet panels.
- The inventory Coffee name facet behaves as the offering Coffee facet (spec delta "Inventory facets in the sidebar").

**Non-Goals:**
- Moving `searchRoasteries`, `asOptions` or any other offering facet part: they stay in `offering-facets`.
- Changing `ComboboxLoader`, `Combobox`, `FacetTextField` or any off-limits shared file.

## API consumed

| Method | Path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| GET | `/coffees?name=<typed text>` | none (public read through `publicRequest`, with the combobox's abort signal) | the typed text, URL-encoded | `{ data: CoffeeSummary[] }` | any non-OK status or network failure rejects the search; the combobox shows its "Results could not be loaded" row (filters `searchFailed`) |

Same request as the offering Coffee combobox; no new endpoint or field. Types: `CoffeeSummary` from `@/shared/api`.

## Decisions

### D1 — Entity slice `coffee` holds `searchCoffees` and `searchByName`

`search-by-name.ts` and `search-coffees.ts` (with `search-coffees.test.ts`) move with `git mv` to `src/entities/coffee/api/`. `src/entities/coffee/index.ts` exports only `searchCoffees` and `searchByName`. Code bodies move unchanged; only import paths and doc comments change. `src/features/offering-facets/api/search-roasteries.ts` stays where it is (a QA test imports it by that path) and imports `searchByName` from `@/entities/coffee`; `OfferingFacets.tsx` and `InventoryFacets.tsx` import `searchCoffees` from `@/entities/coffee`.

Why an entity: the coffee search reads a business concept (coffees) and both features consume it; the FSD rule puts it below features. Why not `@/shared/api` for `searchByName`: several validation tests mock `@/shared/api` with a factory holding only `publicRequest` and `request`; a new export there would be missing from those mocks, and editing them is out of scope. The roastery search importing `searchByName` from the coffee entity is a known naming compromise, accepted for this session.

### D2 — `PaddedCombobox`, `asComboboxValue` and `comboboxTexts` move to `shared/ui`

New file `src/shared/ui/PaddedCombobox.tsx` ("use client") with the three, same names and markup. `comboboxTexts` takes the structural type `{ searching: string; noOptionMatches: string; searchFailed: string; optionCount: string; loading?: string }` instead of the offering texts, so both panels can pass their texts. `src/shared/ui/index.ts` gains one export line right after the `ComboboxLoader` line. `OfferingFacetParts.tsx` drops the three and both offering files import them from `@/shared/ui`; the offering facets render exactly as before.

The inventory panel renders Coffee name first as `PaddedCombobox` (label `texts.coffeeName`, `variant="inverse"`, `search={searchCoffees}`, `value={asComboboxValue(values.coffeeName)}`, `onChange` navigating `{ coffeeName: option?.value }`, `texts={comboboxTexts(texts)}`, `maxLength={INVENTORY_LIMITS.coffeeName}`, `placeholder={texts.coffeeNamePlaceholder}`), then the other five keys of `INVENTORY_LIMITS` as `FacetTextField` without `type`, in the current order. `InventoryFacetsProps.texts` becomes `InventoryFilterTexts & { loading?: string }`. Inside the sidebar sub-section the combobox loads on the first opening (`ComboboxLoader`, spec "Facet comboboxes loaded on first opening"); the chips and "Clear all" are unchanged.

### D3 — Texts

No new catalog key. `InventoryFilterTexts` gains `searching`, `noOptionMatches`, `searchFailed`, `optionCount` and `coffeeNamePlaceholder`, read from the `filters` catalog (es, en and ca exist); `inventoryFacetsTexts(management, filters)` keeps its signature and the label stays `offering-management.facetCoffeeName`. The loading text is added at composition, as the offering list does: `ManageInventorySidebarScreen.tsx` passes `{ ...inventoryFacetsTexts(catalog, filters), loading: getMessages("account", locale).loading ?? "" }`.

## Files

| File | Layer | Change |
|---|---|---|
| `src/entities/coffee/api/search-by-name.ts` | entities | moved (D1) |
| `src/entities/coffee/api/search-coffees.ts` | entities | moved (D1) |
| `src/entities/coffee/api/search-coffees.test.ts` | entities | moved, unchanged (D1) |
| `src/entities/coffee/index.ts` | entities | new public API (D1) |
| `src/features/offering-facets/api/search-roasteries.ts` | features | import path (D1) |
| `src/shared/ui/PaddedCombobox.tsx` | shared | new, moved parts (D2) |
| `src/shared/ui/index.ts` | shared | one export line (D2) |
| `src/features/offering-facets/ui/OfferingFacetParts.tsx` | features | parts removed (D2) |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features | import paths (D1, D2) |
| `src/features/inventory-facets/ui/InventoryFacets.tsx` | features | Coffee name combobox (D2) |
| `src/features/inventory-facets/model/texts.ts` | features | five texts (D3) |
| `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx` | pages | loading text (D3) |

## Risks / Trade-offs

- [The combobox code now loads on the inventory route's first opening of Filters] → same lazy loading as the offerings list; no extra request until the user types.
- [`searchByName` lives in the coffee entity while the roastery search also uses it] → accepted (D1); a later refactor can move it if a roastery entity appears.
- [`InventoryResults.test.tsx` asserts no combobox at all] → the orchestrator approved narrowing that one query to "Sort by" if the new combobox makes it fail.
