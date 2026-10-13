Type: Refactor (fast lane)

## Why

Backlog entry R89, taken as a fast lane by Product owner's order (AUT, 2026-10-13, round 2; approval delegated to the orchestrator): on the inventory list the "Country", "Region" and "Process" facets are free text fields, while the offering facets offer the existing values of the coffee catalog as a single choice; a short closed set of values typed by hand invites misses. The "City" facet filters the roastery's contact city, but its label does not say so. Product owner settled the end state in R89; the orchestrator settled the details.

## What Changes

- On the inventory list (`/{locale}/manage/inventory`, sidebar sub-section "Filters"), "Country" (`originCountry`), "Region" (`originRegion`) and "Process" (`process`) offer the existing values of the coffee catalog as a single choice, with the same derivation and the same control as the offering facets' list facets: "Any" first, then the values, "see more". Choosing a value writes its key; choosing "Any" removes it.
- Region depends on Country: with a country chosen, Region lists only that country's regions; with no country, every region. Choosing a different country removes `originRegion` when the current region is not one of the new country's regions and keeps it when it is; choosing "Any" for Country keeps the region.
- When the coffee catalog cannot be read, Country, Region and Process render disabled with the existing help "Options unavailable"; every other facet keeps working.
- The "City" facet still writes `city` as a text field of at most 90 characters, relabelled "Ciudad del tostador" (es), "Roastery city" (en), "Ciutat del torrador" (ca); its chip follows.
- The option-list helper of the offering facets moves to the shared UI segment so both facet panels use it; the offering facets keep exactly their current behaviour.

## Non-goals

- No coffee municipality and no cascade beyond Country → Region.
- No roastery origin filters (R90).
- No change to Coffee name (R88) or Producer, nor to the offering facets; the offering "Origin region" stays independent of the country.
- No new request, API field, catalog key, dependency or contract change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: requirement "Inventory facets in the sidebar" (Country, Region and Process as single-choice facets, Region narrowed by the country, Roastery city, options unavailable; five added scenarios, "Facets in order" updated) and requirement "Inventory filter state in the URL" (scenario "Commit a text facet" now chooses "Huila" in Region; "Out-of-range value in the address" names the Roastery city facet).

## Impact

- New: `src/features/inventory-facets/model/options.ts`, `src/features/inventory-facets/ui/InventoryFacetParts.tsx`.
- Modified: `src/shared/ui/FacetRadioList.tsx`, `src/shared/ui/index.ts`, `src/features/offering-facets/ui/OfferingFacetParts.tsx`, `src/features/offering-facets/ui/OfferingFacets.tsx`, `src/features/inventory-facets/index.ts`, `src/features/inventory-facets/ui/InventoryFacets.tsx`, `src/features/inventory-facets/model/texts.ts`, `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx`, `messages/{es,en,ca}/offering-management.json` (`facetCity` values only).
- Tests: five new tests in `src/features/inventory-facets/ui/InventoryFacets.test.tsx`; the orchestrator-approved updates to "Facets in order" and `renderPanel` in the same file, to `page()`, the steps of "Commit a text facet" and the City lookup in `src/pages/manage-inventory/ui/InventoryResults.test.tsx`, and the async rendering of `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.test.tsx`. The QA suite is not touched.

## Propose status

- Change-id: `select-inventory-origin-and-process`
- Date: 2026-10-13
- `openspec validate select-inventory-origin-and-process --strict`: valid
- Resolves backlog entry: R89 (fast lane by Product owner's order, AUT 2026-10-13, round 2; approval delegated to the orchestrator).
- Resolved (R89 and the orchestrator's session prompt): `asOptions` moves to `src/shared/ui` (design.md D1); the inventory option model with regions by country (D2); the inventory list facets and the Country → Region rule (D3); the async sidebar composition reading the coffee catalog only on the list (D4); texts from the existing `filters` keys and the three new `facetCity` values (D5).
- Deviation from the session prompt: the prompt renames the scenario "Commit a text facet" to "Commit a facet". OpenSpec 1.14.1 rejects a MODIFIED block that drops a current scenario name ("omits scenario(s) the current spec still has"), and it rejects the same requirement in REMOVED and ADDED, so the scenario keeps its name "Commit a text facet" with the new WHEN; its test keeps its title for the same reason. The orchestrator may rename both later.
- Open: none.
