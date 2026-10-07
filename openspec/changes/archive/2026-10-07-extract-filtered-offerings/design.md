# Design

## Context

See `proposal.md` — Why. The product decisions are settled in `docs/design/extract-filtered-offerings/design-summary.md` (Status: approved, no open point; cited as "summary §n") and backlog R12. This document records the end states that follow from them, against the code on `develop` `8f1e416` (`add-offering-catalog`, `add-specialist-evaluations` and `add-offering-facets` merged). The constraints that shape the approach:

- Today the composition lives in two page slices: `src/pages/offerings/ui/OfferingsScreen.tsx` (heading block, toolbar region filled through its `toolbar` prop, results `PageSection` with `Suspense`, skeletons, `Offerings`, the filtered empty message and `ClearFiltersButton`), `src/pages/offerings/ui/OfferingsToolbarScreen.tsx` (async: taxonomy read, applied count, `OfferingsToolbar`; passed by `app/[locale]/offerings/page.tsx` as `toolbar`), and `src/pages/offerings-sidebar/ui/{OfferingsSidebarScreen,OfferingsSidebar}.tsx` (async reads and option building; `AppSidebar` frame with `OfferingFacets`).
- FSD: a layer imports only from layers below, never between slices of one layer; slices are imported through their `index.ts`. `widgets → features`, `widgets → entities` and `widgets → shared` are allowed; `offering-list` already imports `@/features/evaluate-offering`.
- Async Server Components cannot be tested with Vitest (AGENTS.md): the async compositions stay thin and every sync piece is tested.
- No Next.js API is added or changed: route files are untouched, `PageProps` stays as it is, `Suspense` is React's. The Next.js docs rule therefore adds no reading for this change.

## Goals / Non-Goals

**Goals:**

- One filtered-offerings composition (toolbar, results, facets) in `src/widgets/offering-list`, reusable by the directory's "Ofertas" tab with a fixed `coffeeshopUlid` (summary §0.2, §3).
- No visible or audible change on `/{locale}/offerings` and its sidebar: same markup, classes, texts, requests, pagination addresses and states.
- Every existing case kept, moved to the module that now owns its behaviour.

**Non-Goals:**

- No consumer of `fixedQuery`; no directory code.
- No shared-card use is added, so the card field mapping rule is not applicable.
- No generalisation beyond the summary's props: no option for the pagination query, no extra empty-state slot, no texts loading inside the widget.

## Decisions

### D1 — Placement in `src/widgets/offering-list` (summary §2)

The three compositions go into the existing `offering-list` widget, which owns `Offerings`, `OfferingSkeletonCard`, `CATALOG_GRID_CLASSES` and `buildOfferingsQuery`; a new `widgets/filtered-offerings` slice would import `offering-list` and `app-sidebar`, both widget → widget imports. The `AppSidebar` frame stays in the page layer. Each composition is exported from `src/widgets/offering-list/index.ts` with its props type; existing exports are unchanged.

Texts arrive as props: the page slices load the catalogs (`catalog`, `landing`, `filters`) with `getMessages`; no composition calls `getMessages` (summary §3).

### D2 — `FilteredOfferingsToolbar` (`ui/FilteredOfferingsToolbar.tsx`, async)

| Prop | Type | Use |
|---|---|---|
| `locale` | `string` | the taste-note names of the applied count |
| `searchParams` | `OfferingsQuery` | parsed with `parseOfferingFilters` |
| `texts` | `OfferingFilterTexts` (`@/features/offering-facets`) | passed to `OfferingsToolbar` |

End state: the body of today's `OfferingsToolbarScreen` without the text loading — the settled `fetchTaxonomies()` read, `tasteNoteOptions` only when it fulfilled, `appliedOfferingFilters(values, { tasteNotes, texts }).length` as `count`, and `<OfferingsToolbar count sort={values.sort} texts />`. `locale` is added to summary §3.1's props because the count resolves taste-note names by locale today; it is not a new behaviour.

### D3 — `FilteredOfferingsResults` (`ui/FilteredOfferingsResults.tsx`, sync)

| Prop | Type | Use |
|---|---|---|
| `locale` | `string` | passed to `Offerings` |
| `searchParams` | `OfferingsQuery` | the address query |
| `path` | `string` | passed to `Offerings` for `Pagination` (`/${locale}/offerings` in the catalog) |
| `fixedQuery` | `OfferingsQuery`, optional | keys forced on the request (spec "Filtered offerings scoped by a host") |
| `texts` | `FilteredOfferingsResultsTexts` | see below |

UI-specific type, declared before the component and exported: `FilteredOfferingsResultsTexts = OfferingListTexts & { noMatches: string; clearAll: string }`. `emptyMessage` carries the unfiltered empty message.

End state, moved unchanged from `OfferingsScreen`:

- Request query: `{ ...sanitizeOfferingQuery(buildOfferingsQuery(searchParams)), ...fixedQuery }` — fixed keys applied **after** sanitizing, overriding any same key of the address. Without `fixedQuery` it equals today's query for the same address.
- Filtered: `hasOfferingFilters(parseOfferingFilters(searchParams))`, from the address only; a fixed key is not a facet value and never makes the list "filtered".
- Render: a `Suspense` whose fallback is three `OfferingSkeletonCard`s in `div.@container` > `div` with `CATALOG_GRID_CLASSES`, and `Offerings` with `locale`, the request query, `path`, `gridClassName={CATALOG_GRID_CLASSES}`, no `session`, `texts` = exactly the `OfferingListTexts` keys with `emptyMessage` replaced by `noMatches` while filtered, and `emptyAction` = `<ClearFiltersButton label={texts.clearAll} />` while filtered, `undefined` otherwise. No `PageSection`: the caller keeps it.
- Pagination: `Offerings` passes the request query to `Pagination`, as today. In the catalog that is the sanitized contract query (unchanged); with `fixedQuery` the links also carry the fixed key, which the next render overrides again. See Risk 2 about other address keys.

### D4 — `FilteredOfferingsFacets` (`ui/FilteredOfferingsFacets.tsx`, async)

| Prop | Type | Use |
|---|---|---|
| `locale` | `string` | option names |
| `searchParams` | `OfferingsQuery` | parsed values for the panel |
| `texts` | `OfferingFilterTexts` | passed to `OfferingFacets` |

End state: the body of today's `OfferingsSidebarScreen` without the frame and the text loading — `Promise.allSettled([fetchCoffees(), fetchTaxonomies()])`, then `<OfferingFacets values={parseOfferingFilters(searchParams)} options={offeringFacetOptions(coffees, taxonomies, locale)} texts />`. One failed read still disables only the facets it feeds; the facets keep their values while the list loads or fails (separate slot).

### D5 — Page callers

| File | End state |
|---|---|
| `src/pages/offerings/ui/OfferingsScreen.tsx` | Props unchanged (`locale`, `searchParams`, `toolbar`). Loads `catalog`, `landing`, `filters`; builds `FilteredOfferingsResultsTexts` (the 18 `OfferingListTexts` values of today with `emptyMessage: catalog.listEmptyMessage`, plus `noMatches: filters.noMatches`, `clearAll: filters.clearAll`). Keeps `div.flex-1`, both `PageSection surface="page"`, the heading block, `HEADER_CONTAINER_CLASSES` and the toolbar region; the second `PageSection` holds `<FilteredOfferingsResults locale searchParams path={\`/${locale}/offerings\`} texts />` with no `fixedQuery`. No longer imports from `@/features/offering-facets`. |
| `src/pages/offerings/ui/OfferingsToolbarScreen.tsx` | Becomes sync, props unchanged: renders `<FilteredOfferingsToolbar locale searchParams texts={offeringFacetsTexts(getMessages("filters", locale))} />`. It stays (rather than `OfferingsScreen` rendering the toolbar) so `app/[locale]/offerings/page.tsx` is unchanged (summary §4). |
| `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.tsx` | Becomes sync, props unchanged: `<AppSidebar><FilteredOfferingsFacets locale searchParams texts={offeringFacetsTexts(getMessages("filters", locale))} /></AppSidebar>`. |
| `src/pages/offerings-sidebar/ui/OfferingsSidebar.tsx` | Removed, with its two exports in `src/pages/offerings-sidebar/index.ts`: its frame is now the screen's, and nothing else imports it (verified in code). |
| `app/[locale]/offerings/page.tsx`, `app/[locale]/@sidebar/offerings/page.tsx` | Unchanged. |

The sidebar page slice is `src/pages/offerings-sidebar` (the path `add-offering-facets` kept when it merged; summary §2 left it to this check).

### D6 — "Clear all" wiring and the R9 overlap (summary §4, §6)

The empty-state button moves into `FilteredOfferingsResults` as it stands when this change applies: the feature `ClearFiltersButton` from `@/features/offering-facets` with `label` only (current `develop`). If `extract-clear-filters-button` (R9) has merged first, the build uses its end state instead: `ClearFiltersButton` from `@/shared/ui` with `label` and `keep={["orderBy", "orderDirection"]}`, moved unchanged. Whichever change merges second merges `develop` and keeps the other's edit: R12 keeps the wiring's location in the widget, R9 keeps the shared import (both summaries, §6 and §5). See Risk 1.

### D7 — Tests

| File | End state |
|---|---|
| `src/widgets/offering-list/ui/FilteredOfferingsResults.test.tsx` (new) | `Offerings` and `OfferingSkeletonCard` replaced by stubs at their modules (`Offerings` records its props and can suspend). Moved from `OfferingsScreen.test.tsx`, restated against the widget's props: three skeleton cards in the catalog grid inside `@container` while loading, and no list; the kept query (`verified`, repeated `cataRef`, `page`; `foo` and a direction-less `orderBy` dropped), `locale`, `path` and `CATALOG_GRID_CLASSES` passed to the list; no `session`; the list texts equal exactly the 18 `OfferingListTexts` values given; the filtered empty message and a defined `emptyAction` with `?process=washed`; the unfiltered empty message and no action with only a sort. New: with `searchParams={{ coffeeshopUlid: "X", process: "washed" }}` and `fixedQuery={{ coffeeshopUlid: "Y" }}` the list query is `{ coffeeshopUlid: "Y", process: "washed" }`; with `fixedQuery={{ coffeeshopUlid: "Y" }}` and an empty address the list texts keep the unfiltered empty message and there is no action. |
| `src/pages/offerings/ui/OfferingsScreen.test.tsx` | `FilteredOfferingsResults` replaced by a stub recording its props. Kept: the two heading cases, the empty toolbar region case, the page background case (the stub's closest `section` has `bg-surface-page` and not `bg-surface-section`). New wiring case: the stub receives `locale="es"`, the raw `searchParams`, `path="/es/offerings"`, no `fixedQuery`, and texts equal to the 18 values plus `noMatches` and `clearAll` of the `es` catalogs. The six results cases leave this file (moved above). |
| `src/pages/offerings/ui/OfferingsToolbarScreen.test.tsx` (new) | `FilteredOfferingsToolbar` replaced by a stub: it receives `locale`, the raw `searchParams` and `offeringFacetsTexts(getMessages("filters", locale))` for `es` and `ca`. |
| `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.test.tsx` (replaces `OfferingsSidebar.test.tsx`) | `FilteredOfferingsFacets` replaced by a stub. For each session state (`anonymous`, `loading`, `coffeeshop`): the sidebar renders (`complementary`), no navigation, and the stub is inside the sidebar with `locale`, `searchParams` and the `es` facet texts. The facet panel's own `search` landmark stays covered by `OfferingFacets.test.tsx`. |

`FilteredOfferingsToolbar` and `FilteredOfferingsFacets` are async and thin (their bodies move unchanged); their sync parts (`OfferingsToolbar`, `OfferingFacets`, `appliedOfferingFilters`, `offeringFacetOptions`, `parseOfferingFilters`) keep their own tests.

Kept green unchanged: `OfferingList`, `OfferingSkeletonCard`, `grid`, `query`, `resolve-taxonomies`, `offerings` (api) tests; `HomeScreen` and the landing's tests (the landing does not use the compositions); every `offering-facets` test; `app/[locale]/@sidebar/route-files.test.tsx`; every guard (`client-boundary`, `color-guard`, `focus-guard`, `radius-guard`, `xss-guard`, `catalog-guard`, `badge-geometry-guard`, `icons`); `theme-tokens.test.ts`.

## API endpoints

Consumed exactly as today; none added.

| Method and path | Auth | Request | Response | Errors and presentation |
|---|---|---|---|---|
| `GET /offerings` (`listOfferings`) | none | the request query of D3 (contract names plus `page`; `coffeeshopUlid` is a declared parameter, `contracts/openapi.yaml` line 6798) | paginated offerings with `meta` | any failure → the list's error state with Retry, facets keep their values (unchanged) |
| `GET /taxonomies` | none | — | taxonomy tree | in the list: error state (unchanged); in the toolbar and facets: settled, only the taste notes go uncounted or unavailable (unchanged) |
| `GET /coffees` | none | — | coffees for the facet options | settled: only the facets it feeds show "unavailable" (unchanged) |

## Files (FSD layer)

| Path | Layer | Change |
|---|---|---|
| `src/widgets/offering-list/ui/FilteredOfferingsToolbar.tsx` | widgets | new (D2) |
| `src/widgets/offering-list/ui/FilteredOfferingsResults.tsx` (+ `.test.tsx`) | widgets | new (D3, D7) |
| `src/widgets/offering-list/ui/FilteredOfferingsFacets.tsx` | widgets | new (D4) |
| `src/widgets/offering-list/index.ts` | widgets | exports appended: the three compositions, their props types and `FilteredOfferingsResultsTexts` |
| `src/pages/offerings/ui/OfferingsScreen.tsx` (+ test) | pages | thin caller (D5, D7) |
| `src/pages/offerings/ui/OfferingsToolbarScreen.tsx` (+ new test) | pages | thin caller (D5, D7) |
| `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.tsx` (+ new test) | pages | frame + composition (D5, D7) |
| `src/pages/offerings-sidebar/ui/OfferingsSidebar.tsx` (+ test), `src/pages/offerings-sidebar/index.ts` | pages | removed / exports removed (D5) |

## Risks / Trade-offs

1. **Overlap with `extract-clear-filters-button` (R9).** Both edit the catalog's `emptyAction` wiring (today in `OfferingsScreen.tsx`; after this change in `FilteredOfferingsResults.tsx`) and the facet feature's exports. No hard order: whichever merges second merges `develop` and keeps the other's edit — the widget location from this change, the shared `ClearFiltersButton` import with `keep={["orderBy", "orderDirection"]}` from R9 (D6). If R9 lands first, R9 edits `OfferingsScreen.tsx` and this change's task 2.2 moves that edit into the widget.
2. **Pagination does not keep non-contract address keys.** Summary §3.2 says pagination "keeps every query key of the URL (`tab` included for the directory), as it does today". In the code, `Offerings` pages with its request query, which `buildOfferingsQuery` restricts to contract names plus `page`, so a `tab` key is dropped from the links. This change keeps today's behaviour (no visible change in the catalog). The directory's "Ofertas" tab needs `tab` kept (directory summary §5: "`query` keeps `tab`"); that needs a decision before the directory's apply (reported in `## Propose status`, not settled here).
3. **Async compositions untested in Vitest.** `FilteredOfferingsToolbar` and `FilteredOfferingsFacets` move unchanged and stay thin; the build's `npm run build` and the feature tests cover them, as they covered the page-slice originals.
4. **Shared files.** `src/widgets/offering-list/index.ts` (append-only) and `OfferingsScreen.tsx` (also edited by R9).

## Migration Plan

Not applicable: no data, route or contract change. Rollback is a revert of the change's commits.

## Open Questions

None for this change. Risk 2 is open for `add-coffeeshop-directory`.
