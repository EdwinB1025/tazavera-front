# Proposal

## Why

The "My evaluations" list (`/{locale}/manage/evaluations`, `add-specialist-evaluations`) forwards the filters and sort its query carries, and `listMyEvaluations` documents those query fields, but nothing on the page lets a specialist set them. Part 4 of 4 of the approved `add-filter-controls` design (split by Product owner on 2026-10-06) puts the evaluation facets in the management sidebar of that list, Amazon-style, with a sort select and a "Filters" trigger in the page body.

## What Changes

- The four evaluation facets of `docs/design/add-filter-controls/design-summary.md` §3.2, in that order, in the sidebar of `/{locale}/manage/evaluations` below the management navigation entries: Status (single choice: Any, Open, Closed), Score (score range 0–100 with typed bounds), Process (single choice with "see more"), City (text field with exact-match help).
- Process options loaded once on the server from `GET /coffees` (distinct `process` values); when that read fails the Process facet renders disabled with "Options unavailable" and the rest keeps working.
- URL state (§5.1): the query is the only state; every committed change navigates to the same path without `page`, adds one history entry, keeps focus and scroll; hand-edited keys or values outside the contract limits are dropped and the matching facet shows its empty state; pagination keeps every other key.
- Applied-filter chips and "Clear all" for the evaluation facets, and the applied count in the trigger. "Clear all" keeps the sort.
- The body toolbar at the top of the list section: the "Filters" trigger (always below `md`, and from `md` only while the sidebar is collapsed) and the "Sort by" select with the five evaluation sort options (§3.3): Default order, Highest score, Lowest score, Newest, Oldest.
- In the evaluations list host: the "No results match these filters." empty state with a "Clear all" button when facets are applied, and a polite announcement of the result total after each change.
- New texts in the `filters` area and one key in the `evaluations` area, es/en/ca.

## Capabilities

### New Capabilities

- `filtering`: this change adds the evaluation facet set, its URL state, sort, toolbar and the filtered-result states of the evaluations list. The capability's generic facet controls are added by `add-facet-controls` (part 2) and its offering facet set by `add-offering-facets` (part 3), both proposed in parallel.

### Modified Capabilities

None. The evaluations list host's filtered empty state and result announcement are filtering behaviour stated here; the host's files are touched under this change's scope.

## Impact

- **Routes:** `app/[locale]/@sidebar/manage/evaluations/page.tsx` (new, in the `@sidebar` slot of `add-sidebar-slot`).
- **Code:** a new `src/features/evaluation-facets` slice; a sidebar screen in `src/pages/evaluations-list`; the evaluations list screen and its route file (from `add-specialist-evaluations`); `src/shared/lib/filter-query` (URL writes), the `GET /coffees` read in `src/shared/api` and the `FiltersTrigger` in `src/shared/ui`, all reused unchanged from `develop` (`add-offering-facets`); the filtered empty state's "Clear all" is the shared `ClearFiltersButton` of `src/shared/ui` (`extract-clear-filters-button`, backlog R9), with no copy in this change; `messages/{es,en,ca}/filters.json` and `evaluations.json`.
- **API contract** (read-only): `listMyEvaluations` receives the query the facets write (fetched by the list on the client with the session token); `listCoffees` feeds the Process options (fetched on the server).
- **Dependencies:** none new. The combobox dependency of `add-facet-controls` (`cmdk`) is not used here.
- **Apply preconditions:** `extract-clear-filters-button` merged into `develop` (the earlier parts and `add-specialist-evaluations` already are), and `develop` merged into `feature/add-evaluation-facets` after it.

## Non-goals

- The generic facet controls, facet rows, shadow tokens, icons and the `form-fields` delta (`add-facet-controls`).
- The `@sidebar` slot, the sidebar's collapse and overlay fixes and the shell control that expands a collapsed sidebar (`add-sidebar-slot`).
- The evaluations list route, its client fetch with the session token, its rows, row actions and pagination (`add-specialist-evaluations`).
- The offering facets (`add-offering-facets`).
- Facets for `coffeeId` and `locationId` (ID-based fields, excluded by the summary's settled rule (a)).
- A sort by `status` (summary Open 12: its verification condition cannot be met, so its accepted fallback (b) leaves it out).
- Result counts per facet value (no contract operation returns them).
