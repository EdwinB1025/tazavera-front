# Design — add-offering-facets

## Context

- Source: `docs/design/add-filter-controls/design-summary.md` (status approved) §2, §3.1, §3.3, §5.1, §5.4, §5.5, §6.4, §9.2, §10, §11, with every Open answered on 2026-10-06, and the decisions log of `docs/general-context.md` ("add-filter-controls: resto de puntos", "catálogo: detalle y consenso; filtros: cascada y división", "lecturas de evaluaciones: decisión final"). Product owner split the approved design into four changes on 2026-10-06; this is part 3. There is no `docs/design/add-offering-facets/` folder: the routine that launched this propose names the add-filter-controls summary as the source.
- The catalog route `/{locale}/offerings` is designed in `docs/design/add-offering-catalog/design-summary.md` (approved; §3.1 query interface, §4 filter slot, §6.2 layout). Its propose had not been pushed when this design was written (no `feature/add-offering-catalog` branch on the remote).
- Parts 1 (`add-sidebar-slot`) and 2 (`add-facet-controls`) are proposed in parallel; neither branch (`origin/claude/add-sidebar-slot-propose`, `origin/claude/add-facet-controls-propose`) existed when this design was written. **This design is written against the interfaces the summary describes; D2 lists each assumed interface, and task 0.1 checks them before any code is written.**
- `filtering` has no main spec on `develop`. This delta adds the offering requirements; `add-facet-controls` adds the generic control requirements.
- Backlog (`docs/backlog.md`, R1, R3–R5, R8): no entry names this change or the files it touches.

## Goals / Non-Goals

**Goals:** the offering facet set, its option data, URL state, applied chips, sort, body toolbar and the catalog's filtered empty state and result announcement, as stated in `specs/filtering/spec.md`.

**Non-Goals:** see proposal.md, "Non-goals".

## Decisions

### D1. Contract operations

| Operation | Method and path | Auth | Request | Response used | Errors and how they show |
|---|---|---|---|---|---|
| `listCoffees` | `GET /coffees` | none (`security: []`) | no query (`name` filters by coffee name, unused) | `data[]`: `country`, `region`, `process`, `variety`, `producer` | Any non-2xx or transport failure: the five coffee-based facets disabled with "Options unavailable" (Open 9 (a)) |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | none | none | `data[]` tree: `ulid`, `level`, `nameEs`/`nameEn`/`nameCa`, `children` | Failure: Taste notes disabled with "Options unavailable" |
| `listRoasteries` | `GET /roasteries?name={typed}` | none | `name`, at most 150 characters | `data[]`: `name` (option value and line 1), `description` (line 2) | Failure: the combobox's "Results could not be loaded" row (add-facet-controls) |
| `listOfferings` | `GET /offerings` | none | the facet and sort keys of D4 plus `page`, built by the catalog | `meta.total` for the announcement | Owned by the catalog: loading, error with Retry. The contract documents no 422; a rejected `cataRef` ends in the catalog's error state |

- Coffees and taxonomies are fetched on the server with plain `fetch` (settled data-loading rule), once per render of the sidebar screen, with `Promise.allSettled` so one failure does not hide the other.
- Roasteries are searched from the browser while typing (Open 16, accepted exception to the data-loading rule). The request goes to `NEXT_PUBLIC_API_URL` with no credential header.
- `cataRef` values are taxonomy `ulid`s: the offering's `sensoryTaxonomy[].ref` is resolved by `ulid` in `buildTaxonomyLookup` (`src/entities/taxonomy`). The contract only says "Must match an existing stored value" (Unverified against the API: Risk 3).

### D2. Assumed interfaces of the parallel changes (checked by task 0.1)

| From | Assumed interface | Used by |
|---|---|---|
| `add-sidebar-slot` | A parallel route slot `app/[locale]/@sidebar/` with a `default` and a catch-all that render nothing; the shell renders the sidebar only when the slot renders content, places that content inside the sidebar's content region (below the sidebar header and its collapse control), on `/{locale}/offerings` for every session state | D6 slot page |
| `add-sidebar-slot` | The sidebar state provider wraps both the sidebar region and the main content at shell level, so a component in the page body can read and change it with `useSidebar()` from `@/shared/ui` (`open`, `setOpen`, `isMobile`); the sidebar starts closed below `md` (F1) and its element carries an id exported for `aria-controls` | D8 trigger |
| `add-facet-controls` | Exported from `@/shared/ui`: the facet panel (`form`, `role="search"`, named by its title, renders the applied chips and "Clear all" from a list it receives), the search and text fields with commit on Enter or on leaving the field, the radio list with "Any" first and "see more" after 5 options, the flavour cascade (selection rule F1 of the decisions log; emits the set of selected node ids), the score range with "From"/"To" inputs (emits `[min, max]` on commit), the combobox in two modes (static options with local filtering; search function `(term, signal) => Promise<rows>` with its own 2-character, 300 ms, abort and state rows), each with a `disabled` state and help text | D7 panel |
| `add-facet-controls` | Icons `SlidersHorizontal` and `X` in `src/shared/ui/icons.ts`; the `filters` message area with the generic control texts (`clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, `noOptionMatches`, the combobox state rows, the score range texts) | D8, D10 |
| `add-offering-catalog` | `src/pages/offerings` with `OfferingsScreen` reading `searchParams`, forwarding the contract's `listOfferings` keys plus `page`, rendering a filter slot 2rem below the heading block and the list in `Suspense`; the list rendered by `OfferingList` (`@/widgets/offering-list`) with its `empty` branch and `texts.emptyMessage`; the `catalog` message area | D9 host |

When an interface differs, the build stops at task 0.1 and reports the differences; the architect updates these artifacts before apply continues. Names in this design that come from those changes are their summaries' names, not verified code.

### D3. Files and FSD layers

| Path | Layer | New / modified | Content |
|---|---|---|---|
| `app/[locale]/@sidebar/offerings/page.tsx` | app (routing) | New | Awaits `params` and `searchParams`, renders `OfferingsSidebarScreen`; no logic |
| `src/pages/offerings/ui/OfferingsSidebarScreen.tsx` | pages | New | Async server composition: texts, settled coffees and taxonomy reads, options, parsed values, renders `OfferingFacets` |
| `src/pages/offerings/ui/OfferingsScreen.tsx` | pages | Modified (from add-offering-catalog) | Filter slot → `OfferingsToolbar`; sanitized query (D4); filtered empty state and result count text (D9) |
| `src/pages/offerings/index.ts` | pages | Modified | Also exports `OfferingsSidebarScreen` |
| `src/features/offering-facets/model/query.ts` | features | New | Keys, limits, parse, sanitize, sort options (D4, D5) |
| `src/features/offering-facets/model/options.ts` | features | New | Taste-note options from the taxonomy tree (D7) |
| `src/features/offering-facets/model/applied.ts` | features | New | Applied values → chips and count (D5) |
| `src/features/offering-facets/api/search-roasteries.ts` | features | New | Browser search of `GET /roasteries?name=` |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features | New | `"use client"` panel with the eleven facets (D7) |
| `src/features/offering-facets/ui/OfferingsToolbar.tsx` | features | New | `"use client"` toolbar: `FiltersTrigger` + sort field (D8) |
| `src/features/offering-facets/ui/ClearFiltersButton.tsx` | features | New | `"use client"` "Clear all" of the empty state (D9) |
| `src/features/offering-facets/index.ts` | features | New | Public API of the slice |
| `src/widgets/offering-list/ui/OfferingList.tsx` | widgets | Modified | Optional `emptyAction` and `resultCountText` (D9); landing passes neither and keeps its output |
| `src/shared/lib/filter-query/index.ts` | shared | New, shared with add-evaluation-facets | `buildFilterHref`, `clearFiltersHref`, `useFilterNavigation` (D4) |
| `src/shared/api/coffees.ts`, `src/shared/api/index.ts` | shared | New / modified, shared with add-evaluation-facets | `CoffeeSummary`, `RoasterySummary` types; `fetchCoffees`, `distinctCoffeeValues` |
| `src/shared/ui/FiltersTrigger.tsx`, `src/shared/ui/index.ts` | shared | New / modified, shared with add-evaluation-facets | The body "Filters" trigger (D8) |
| `messages/{es,en,ca}/filters.json`, `messages/{es,en,ca}/catalog.json` | — | Modified | Texts of D10 |

The three shared pieces are used by both facet sets. The one of `add-offering-facets` and `add-evaluation-facets` that applies first creates them with the behaviour stated here; the second finds them on `develop` and reuses them unchanged (the pattern of summary §9.2 for the coffees read). Both designs state the same signatures.

### D4. URL state

- `buildFilterHref(pathname, current: URLSearchParams, changes: FilterChanges): string`, with `FilterChanges = Record<string, string | readonly string[] | undefined>`. Each key of `changes` replaces that key: a string writes one value, an array writes one repeated key per element, `undefined`, `""` or `[]` removes it. `page` is always removed. Every other key is kept in its current order; new keys are appended. The result is `pathname` alone when no key remains, else `pathname?query`.
- `clearFiltersHref(pathname, current, keep: readonly string[]): string` keeps only the `keep` keys (offerings: `orderBy`, `orderDirection`) and drops `page`.
- `useFilterNavigation()` (client) returns `navigate(changes)` and `navigateTo(href)`, which call `router.push(href, { scroll: false })` with the current `usePathname()` and `useSearchParams()`. `push` adds one history entry; `scroll: false` keeps the position (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`, "Disabling scroll to top"). Focus stays where it is because the panel is not re-mounted by the navigation (the slot page re-renders with new props).
- Offering keys and limits (contract `listOfferings`): `coffeeName` ≤150, `roasteryName` ≤150, `producer` ≤150, `originCountry` ≤90, `originRegion` ≤90, `process` ≤90, `variety` ≤90, `city` ≤90 (trimmed, non-empty); `verified` `"1"` or `"0"`; `cuppingAvgMin`, `cuppingAvgMax` finite numbers 0–100 with min ≤ max (when min > max both are dropped); `cataRef` repeated, non-empty values; sort pair one of D6's options (else both dropped). A repeated single-value key keeps its first value.
- `parseOfferingFilters(params)` returns `OfferingFilterValues` (D11) from a `URLSearchParams` or the Next `searchParams` record. `sanitizeOfferingQuery(query: URLSearchParams): URLSearchParams` returns the query with the facet and sort keys replaced by their parsed values and every other key untouched; the catalog uses it before its request.
- Score range write: each bound is written only when it differs from its end (min > 0, max < 100); the full range writes neither.

### D5. Applied chips and count

- `appliedOfferingFilters(values, context)` returns, in facet order, one `AppliedFilter` per applied value: Coffee, Verification ("Verified"/"Provisional"), Average score (one chip "{min}–{max}" for the pair), each taste note that is a listed node (named in the locale), Origin country, Origin region, Process, Variety, Producer, Roastery, City. Each entry carries the facet label, the value label and the `FilterChanges` that remove only it (a taste note removes its own value from `cataRef`, keeping the others).
- The trigger count and the chips use the same list; the sort is never a chip.
- "Clear all" (panel and empty state) navigates to `clearFiltersHref(pathname, current, ["orderBy", "orderDirection"])` (summary §11 left keeping the sort to the architect).

### D6. Sort options

| Option id | Text key | `orderBy` | `orderDirection` |
|---|---|---|---|
| `default` | `sortDefault` | — | — |
| `score-desc` | `sortScoreDesc` | `cupping_avg` | `desc` |
| `score-asc` | `sortScoreAsc` | `cupping_avg` | `asc` |
| `most-evaluated` | `sortMostEvaluated` | `evaluation_count` | `desc` |
| `newest` | `sortNewest` | `created_at` | `desc` |
| `oldest` | `sortOldest` | `created_at` | `asc` |

The select's option value is the id; choosing one calls `navigate({ orderBy, orderDirection })` (both `undefined` for `default`).

### D7. Facet panel composition

- `OfferingFacets` receives `values` (D4), `options` (`countries`, `regions`, `processes`, `varieties`, `producers`: `string[] | null`; `tasteNotes`: `TasteNoteOption[] | null`; `null` = unavailable), `locale` and `texts`. It renders the panel of `add-facet-controls` titled `filters.title`, with the chips of D5 and the eleven facets of the spec table, each wired to `navigate` with its key.
- Taste-note options: the level-0 nodes of `GET /taxonomies` in API order, each with its level-1 children in API order, named by `nameEs`/`nameEn`/`nameCa` for the locale; level 2 is not offered (Open 7 (a)). Every category is included: the summary sets no category filter for offerings.
- The taste-note facet writes `cataRef` as the cascade's selected set, one repeated value each, in the cascade's order. Which nodes are selected when a parent or child is checked is the cascade's rule (decisions log, "Filtros F1"), owned by `add-facet-controls`.
- Producer: the combobox's static mode over `producers`. Roastery: the search mode with `searchRoasteries`, rows of name + `description`; choosing a row writes `roasteryName` = the row's `name`; clearing the input removes it.
- City: help `filters.cityHelp`. Coffee: placeholder `filters.coffeeNamePlaceholder`.
- A facet with `null` options renders disabled with help `filters.optionsUnavailable`.

### D8. Body toolbar

- `OfferingsToolbar` fills the catalog's filter slot (catalog §6.2: 2rem below the heading block). Layout (summary §6.4): a flex row that wraps, items aligned to the bottom, `gap-x-4 gap-y-3`, the trigger at the start and the sort field at the end (`justify-between`); no padding, border or radius. The sort field grows between 12rem and 16rem.
- `FiltersTrigger` (`src/shared/ui`): `Button` `primary`, icon `SlidersHorizontal`, visible text passed by the caller ("Filters" or "Filters ({count})"), `aria-expanded` = the sidebar's `open`, `aria-controls` = the sidebar id; activating it calls `setOpen(true)`. It renders when `isMobile` is true, and otherwise only while `open` is false.
- Sort: `Field` with the visible label `filters.sortBy` and `Select` default variant, options of D6.

### D9. Catalog host states

- `OfferingsScreen` computes the applied list (D5) from its `searchParams`. When it is not empty, the list's empty state shows `filters.noMatches` and, as `emptyAction`, `ClearFiltersButton` (`Button` `primary`, text `filters.clearAll`), centered below the message 1rem apart (as the catalog's error block); otherwise the catalog's own empty message.
- The result announcement: `OfferingList` renders, when `resultCountText` is given, a visually hidden element with `role="status"` (polite) whose text is `catalog.resultCount` with `{count}` = `meta.total` (0 in the empty state), in the success and empty states. The element must stay mounted across a facet navigation for the change to be announced (Risk 2).
- The request: `OfferingsScreen` passes the forwarded query through `sanitizeOfferingQuery` before calling the catalog fetch.
- Loading and error remain the catalog's; the sidebar panel is a separate slot, so it keeps its values while the list loads or fails.

### D10. Texts

Area `filters` (summary §10 strings). This change needs these keys to exist with these strings; keys already present from `add-facet-controls` or `add-evaluation-facets` are kept unchanged:

`title`, `trigger`, `triggerWithCount`, `clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, `noOptionMatches`, `coffeeName`, `coffeeNamePlaceholder`, `roastery`, `originCountry`, `originRegion`, `process`, `variety`, `producer`, `city`, `cityHelp`, `verification`, `verified`, `provisional`, `averageScore`, `scoreMin`, `scoreMax`, `scoreRange`, `tasteNotes`, `sortBy`, `sortDefault`, `sortScoreDesc`, `sortScoreAsc`, `sortMostEvaluated`, `sortNewest`, `sortOldest`, `noMatches`, as in summary §10, plus:

| Area | Key | es | en | ca |
|---|---|---|---|---|
| `filters` | `optionsUnavailable` | Opciones no disponibles | Options unavailable | Opcions no disponibles |
| `catalog` | `resultCount` | Resultados: {count} | Results: {count} | Resultats: {count} |

"Options unavailable" is the summary's (Open 9); its es and ca strings and the three `resultCount` strings are the architect's drafts (Open 13 gives no wording; the form "Results: {count}" needs no plural forms, which the flat catalogs do not support). Product owner confirms them at artifact review.

### D11. Derived types

In `src/shared/api/index.ts`: `CoffeeSummary = NonNullable<ListCoffeesResponse["data"]>[number]`, `RoasterySummary = NonNullable<ListRoasteriesResponse["data"]>[number]`, from `operations["listCoffees"]` and `operations["listRoasteries"]`.

In the feature (UI-specific, before any component): `OfferingFilterValues` (`coffeeName?`, `verified?: "1" | "0"`, `cuppingAvgMin?: number`, `cuppingAvgMax?: number`, `cataRef: string[]`, `originCountry?`, `originRegion?`, `process?`, `variety?`, `producer?`, `roasteryName?`, `city?`, `sort: OfferingSortId`), `OfferingSortId`, `TasteNoteOption` (`id`, `label`, `children: { id, label }[]`), `AppliedFilter` (`facet`, `value`, `remove: FilterChanges`). `FilterChanges` lives in `src/shared/lib/filter-query`.

## Risks / Trade-offs

1. **Parallel interfaces (D2).** Three changes this one builds on were not proposed when it was written. Mitigation: task 0.1 stops the apply on any difference.
2. **Announcement under `Suspense`.** If the catalog keys its `Suspense` boundary by query, the status element is re-created on each change and screen readers may not announce it. The build then moves the status element outside the boundary in the catalog screen, keeping the text of D9 (a single-component detail).
3. **`cataRef` semantics.** That `cataRef` takes taxonomy `ulid`s, and whether a parent matches offerings tagged with its children, are unverified in the API (summary Open 7). The cascade sends what is checked; results depend on the API.
4. **CORS.** Browser calls to the API fail until the API publishes its CORS configuration (decisions log, "CORS de la API para el navegador"). Until then the Roastery combobox shows "Results could not be loaded"; every other facet loads on the server and works.
5. **City exact match.** Case sensitivity depends on the database collation (summary Open 10, Unverified).
6. **Shared pieces created by whichever lands first (D3).** If both facet changes are applied in parallel branches, the second merge conflicts on the same new files; the second build keeps the first one's files and adapts.
7. **`## Propose status`.** Not written in `docs/design/add-filter-controls/design-summary.md`: the routine allows commits only under `openspec/changes/add-offering-facets/`, and that summary is shared by the four changes.
