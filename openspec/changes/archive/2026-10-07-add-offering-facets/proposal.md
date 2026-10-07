## Why

The public offerings list (`/{locale}/offerings`, `add-offering-catalog`) reads its filters and sort from the URL, but nothing on the page lets a visitor set them. Part 3 of 4 of the approved `add-filter-controls` design (split by Product owner on 2026-10-06) puts the offering facets in the shell sidebar of that list, Amazon-style, with a sort select and a "Filters" trigger in the page body.

## What Changes

- The eleven offering facets of `docs/design/add-filter-controls/design-summary.md` §3.1, in that order, in the sidebar of `/{locale}/offerings` for every visitor: Coffee (search), Verification (radio list), Average score (score range), Taste notes (flavour cascade), Origin country, Origin region, Process and Variety (radio lists with "see more"), Producer (combobox over loaded options), Roastery (combobox that searches the API while typing), City (text input).
- Facet option data loaded once on the server from `GET /coffees` (distinct countries, regions, processes, varieties, producers) and `GET /taxonomies` (levels 0 and 1); roastery options searched from the browser with `GET /roasteries?name=`. A facet whose option data fails renders disabled with "Options unavailable"; the rest keeps working.
- URL state (§5.1): the query is the only state; every committed change navigates to the same path without `page`, adds one history entry, keeps focus and scroll; hand-edited keys or values outside the contract limits are dropped and the facet shows its empty state.
- Applied-filter chips and "Clear all" for the offering facets, and the applied count in the trigger. "Clear all" keeps the sort.
- The body toolbar in the catalog's filter slot: the "Filters" trigger (rendered below `md`, and from `md` only while the sidebar is collapsed) and the "Sort by" select with the six offering sort options (§3.3).
- In the catalog host: the "No results match these filters." empty state with a "Clear all" button when facets are applied, and a polite announcement of the result count after each change.
- New texts in the `filters` area and one key in the `catalog` area, es/en/ca.

## Capabilities

### New Capabilities

- `filtering`: this change adds the offering facet set, its URL state, sort, toolbar and the catalog's filtered-result states. The capability's generic facet controls come from `add-facet-controls` (part 2), merged.

### Modified Capabilities

None. The catalog host's empty state and result announcement are filtering behaviour stated here; the host's files are touched under this change's scope.

## Impact

- **Routes:** `app/[locale]/@sidebar/offerings/page.tsx` (from `add-sidebar-slot`) passes the route's params and query; `app/[locale]/offerings/page.tsx` (from `add-offering-catalog`) passes the toolbar.
- **Code:** a new `src/features/offering-facets` slice; the offerings sidebar screen in `src/pages/offerings-sidebar` and a toolbar screen in `src/pages/offerings`; the catalog screen and its list widget (from `add-offering-catalog`); shared helpers in `src/shared/api` (coffees read) and `src/shared/lib/filter-query` (URL writes), shared with `add-evaluation-facets`; `messages/{es,en,ca}/filters.json` and `catalog.json`.
- **API:** `listCoffees`, `listRoasteries`, `listOlfactoryTaxonomies` (read); `listOfferings` receives the query (fetched by the catalog).
- **Dependencies:** none new. The combobox dependency (`cmdk`) belongs to `add-facet-controls`.
- **Apply preconditions:** met: `add-offering-catalog`, `add-sidebar-slot` and `add-facet-controls` are merged into `develop` and `develop` (`589b358`) into `feature/add-offering-facets`.

## Non-goals

- The generic facet controls, facet rows, shadow tokens, icons and the `form-fields` delta (`add-facet-controls`).
- The `@sidebar` slot, the sidebar's collapse and overlay fixes and the shell control that expands a collapsed sidebar (`add-sidebar-slot`).
- The catalog route, its fetch, pagination, loading and error states and its grid by available width (`add-offering-catalog`).
- The evaluation facets (`add-evaluation-facets`).
- Facets for `coffeeshopUlid`, `locationUlid`, the evaluation and defective counts, the affective-axis bounds and the per-axis taste arrays (summary §3.1, "Not offered").
- Result counts per facet value (no contract operation returns them).
- Regions narrowed by country (Open 11 (a): independent lists).
