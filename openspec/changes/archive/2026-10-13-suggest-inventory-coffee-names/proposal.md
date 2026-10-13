Type: Refactor (fast lane)

## Why

Backlog entry R88, taken as a fast lane by Product owner's order (AUT, 2026-10-13, round 1, maximum priority; approval delegated to the orchestrator): on the inventory list the "Coffee name" facet is a plain search field committed on Enter, while every other coffee and roastery filter suggests values while typing. Product owner settled the end state in R88: the inventory "Coffee name" facet becomes the same combobox as the offering facets' "Coffee" facet.

## What Changes

- The inventory list's "Coffee name" facet (`/{locale}/manage/inventory`, sidebar sub-section "Filters") becomes a combobox that fetches coffee suggestions by name while typing: the same search `GET /coffees?name=`, the same option lines (one option per distinct name, `country · region · process · variety` as the second line), the same searching, no-match, error and loading texts, the inverse variant, at most 150 characters and the placeholder "Search coffee" (es "Buscar café", ca "Cerca un cafè").
- Choosing an option writes its name to `coffeeName`; clearing the combobox removes the key. The chips and "Clear all" keep working.
- The coffee search moves to a layer both the offering facets and the inventory facets can import (no copy, no import between features); the padded combobox and its two helpers move to the shared UI segment. The offering facets render and behave exactly as before.
- The other five inventory facets (Country, Region, Process, Producer, City) stay text fields, unchanged.

## Non-goals

- No change to the other inventory facets (R89 covers Country, Region, Process and City in a later round).
- No new request, API field, catalog text or dependency.
- No change to the offering facets' behaviour or to the requirement "Inventory filter state in the URL".

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: requirement "Inventory facets in the sidebar" — Coffee name becomes a coffee combobox; one added scenario, "Choosing a coffee name".

## Impact

- New: `src/entities/coffee/` (`api/search-by-name.ts`, `api/search-coffees.ts` and its test, moved from `src/features/offering-facets/api/`; `index.ts`), `src/shared/ui/PaddedCombobox.tsx`.
- Modified: `src/shared/ui/index.ts` (one export line), `src/features/offering-facets/api/search-roasteries.ts`, `src/features/offering-facets/ui/OfferingFacets.tsx`, `src/features/offering-facets/ui/OfferingFacetParts.tsx`, `src/features/inventory-facets/ui/InventoryFacets.tsx`, `src/features/inventory-facets/model/texts.ts`, `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx`.
- Tests: one new test for "Choosing a coffee name" in `src/features/inventory-facets/ui/InventoryFacets.test.tsx`; "Facets in order" in the same file finds Coffee name as a combobox (approved by the orchestrator); `src/features/offering-facets/ui/OfferingFacets.test.tsx` changes only its mock path; `src/entities/coffee/api/search-coffees.test.ts` changes only its location; `src/pages/manage-inventory/ui/InventoryResults.test.tsx` narrows one combobox query to "Sort by" only if the new combobox makes it fail (approved by the orchestrator). The QA suite is not touched.

## Propose status

- Change-id: `suggest-inventory-coffee-names`
- Date: 2026-10-13
- `openspec validate suggest-inventory-coffee-names --strict`: valid
- Resolves backlog entry: R88 (fast lane by Product owner's order, AUT 2026-10-13, round 1, maximum priority; approval delegated to the orchestrator).
- Resolved (R88 and the orchestrator's session prompt): the coffee search and its name-search helper move to a new entity slice `coffee` (design.md D1); the padded combobox and its helpers move to `src/shared/ui` (D2); the inventory combobox texts come from the existing `filters` and `account` catalogs (D3).
- Open: none.
