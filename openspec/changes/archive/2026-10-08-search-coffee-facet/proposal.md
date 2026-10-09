Type: Refactor (fast lane)

# Proposal

## Why

Production AUT finding 14 (backlog R46): the offerings "Coffee" facet (`coffeeName`) is a free-text search field that never shows options, so the visitor cannot pick a coffee name, and its native clear icon renders unthemed in Chrome. Product owner decided on 2026-10-08 that it "has to work the same as Roastery; both fields go together". The fast-lane typing is Product owner's; unlike a behaviour-keeping refactor, this change **changes observable behaviour by Product owner's decision**: it modifies the settled row 1 of the spec `filtering` requirement "Offering facets in the sidebar", so it updates the spec and adds the tests of the modified and new scenarios.

## What Changes

- The Coffee facet becomes the shared search-as-you-type combobox the Roastery facet already uses, over the public `GET /coffees?name=` (partial match): a search after 2 characters and 300 ms without typing, the older request aborted, the same state rows ("Searching…", "No matches", "Results could not be loaded").
- Each result row shows the coffee name on line 1 and `country · region · process · variety` on line 2, empty fields skipped, the line omitted when all are empty (add-filter-controls design summary, Open 16).
- Choosing a coffee writes `coffeeName` with its name; clearing the combobox removes the key. The chip, "Clear all", the URL rules and the 150-character limit stay as they are.
- A coffee search read is added to the `offering-facets` slice's `api` segment through `publicRequest`; the request mechanism it shares with the roastery search moves into one sibling helper of that segment, without changing the roastery request.

## Non-goals

- No API or contract change; `contracts/openapi.yaml` and `src/shared/api/schema.ts` are untouched.
- No change to the shared combobox, its search hook, its state rows or texts, nor to the Roastery facet's behaviour.
- No new catalog key, token, colour, icon or dependency.
- No change to the chips, "Clear all", the URL sanitising or the offerings list request.
- No change to the coffee shop or evaluation facets.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: the offerings Coffee facet becomes a combobox that searches the coffees while typing, like Roastery.

## Impact

- Code: `src/features/offering-facets/api/search-by-name.ts` (new), `src/features/offering-facets/api/search-coffees.ts` (new), `src/features/offering-facets/api/search-roasteries.ts`, `src/features/offering-facets/ui/OfferingFacets.tsx`.
- Tests: `src/features/offering-facets/api/search-coffees.test.ts` (new); `src/features/offering-facets/ui/OfferingFacets.test.tsx` (one new test, two assertions updated from the `searchbox` role to the `combobox` role). Protecting: `src/features/offering-facets/api/search-roasteries.test.ts`, `qa/src/features/offering-facets/api/search-roasteries.test.ts`, `qa/src/features/offering-facets/ui/OfferingFacets.test.tsx`.
- APIs, dependencies: none.

## Propose status

- **Change-id:** search-coffee-facet
- **Date:** 2026-10-08
- **`openspec validate search-coffee-facet --strict`:** valid
- **Backlog entry resolved:** R46 — The Coffee facet works like Roastery (production AUT finding 14)
- **Resolved:** the reused mechanism and the shared request helper (design.md D1), the coffee search read and its row mapping (D2), duplicate coffee names (D3), the facet wiring and texts (D4).
- **Open (Product owner):** (1) D3 shows one row per distinct coffee name, with the first coffee's origin line, because the combobox keys rows by the written value and `coffeeName` carries only the name; confirm, or decide another treatment of same-name coffees. (2) D4 keeps the existing "Search coffee" placeholder on the Coffee combobox, while the Roastery combobox has none; confirm, or drop it (the `coffeeNamePlaceholder` key would then become unused). Neither blocks the build.
