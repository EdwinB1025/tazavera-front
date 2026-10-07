# Design — add-offering-facets

## Context

- Source: `docs/design/add-filter-controls/design-summary.md` (status approved) §2, §3.1, §3.3, §5.1, §5.4, §5.5, §6.4, §9.2, §10, §11, with every Open answered on 2026-10-06, and the decisions log of `docs/general-context.md` ("add-filter-controls: resto de puntos", "catálogo: detalle y consenso; filtros: cascada y división", "lecturas de evaluaciones: decisión final"). Product owner split the approved design into four changes on 2026-10-06; this is part 3. There is no `docs/design/add-offering-facets/` folder: the routine that launched this propose names the add-filter-controls summary as the source.
- The catalog route `/{locale}/offerings` (`add-offering-catalog`), the `@sidebar` slot (`add-sidebar-slot`) and the facet controls (`add-facet-controls`) are merged into `develop` (`589b358`) and into this branch. This design was first written against their summaries; on 2026-10-07 it was aligned with the merged code (D2), with no change to any product decision (facet set, order, behaviour, texts, URL keys), under Product owner's autonomy mandate (decisions log, 2026-10-07).
- Decisions log: R9 is closed as option (b): this change writes the first `ClearFiltersButton` copy in its own slice; R10: no facet shows an error state in this change.
- `filtering` has a main spec on `develop` with the generic control requirements of `add-facet-controls`. This delta adds the offering requirements.
- Backlog (`docs/backlog.md`): R9 and R10 as above; R12 (filtered-offerings widget) runs after this change merges and changes nothing here.

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

### D2. Interfaces of the merged changes (verified on 2026-10-07)

| From | Interface on this branch | Used by |
|---|---|---|
| `add-sidebar-slot` | `app/[locale]/@sidebar/offerings/page.tsx` renders `OfferingsSidebarScreen` from the page slice `@/pages/offerings-sidebar`, which mounts `AppSidebar` (`@/widgets/app-sidebar`) with no props. `AppSidebar` takes `children` and renders them after its navigation inside `SidebarContent`; on `/{locale}/offerings` it renders no navigation for any session state. The slot's `default.tsx`, `page.tsx` and `[...rest]/page.tsx` render `DefaultSidebarScreen`, so every other route shows no offering facets. The shell (`SessionShell`) renders the slot inside `SidebarProvider` | D7 sidebar |
| `add-sidebar-slot` | `useSidebar()` and `SIDEBAR_ID` (`"app-sidebar"`, the id of the desktop column and of the sheet content) exported from `@/shared/ui`; `useSidebar()` returns `open`, `setOpen`, `toggleSidebar`, `isMobile`. `SidebarProvider` wraps the header, the sidebar and the main content; below `md` the sidebar is the full-screen `Sheet`, closed on arrival | D8 trigger |
| `add-facet-controls` | From `@/shared/ui`: `FacetPanel` (`title`, `applied: AppliedFilter[]` with `{ id, facet, value }`, `onRemove(id)`, `onClearAll()`, `texts: { clearAll, removeFilter }`, children); `FacetTextField` (`label`, `value`, `onCommit(trimmed)`, `type`, `maxLength`, `placeholder`, `help`, `disabled`); `FacetRadioList` (`legend`, `options: FacetOption[]`, `value`, `onChange(value \| undefined)`, `anyLabel`, `texts: { seeMore, seeLess }`, `help`, `disabled`); `FacetCascade` (`legend`, `options: CascadeOption[]`, `value: string[]`, `onChange(values)`, `texts: { seeMore, seeLess, toggleChildren }`, `help`, `disabled`); `ScoreRangeFacet` (`legend`, `min`, `max`, `value: [min, max]`, `onCommit(range)`, `texts: { minThumb, maxThumb, from, to }`, `disabled`, no `help`); `Combobox` (`label`, `value: ComboboxOption \| null`, `onChange(option \| null)`, `variant`, `texts: { searching, noMatches, loadError, optionCount }`, `help`, `disabled`, `placeholder`, `maxLength`, and either `options` or `search: (term, signal) => Promise<ComboboxOption[]>`; `ComboboxOption` is `{ value, label, detail? }`) | D7 panel |
| `add-facet-controls` | Icons `SlidersHorizontal` and `X` in `src/shared/ui/icons.ts`. `messages/{es,en,ca}/filters.json` holds `title`, `clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, `noOptionMatches`, `searching`, `searchFailed`, `optionCount`, `toggleChildren`, `rangeFrom`, `rangeTo`, `optionsUnavailable` | D7, D8, D10 |
| `add-offering-catalog` | `app/[locale]/offerings/page.tsx` renders `OfferingsScreen` (`@/pages/offerings`) with `locale` and the awaited `searchParams`. `OfferingsScreen` takes `toolbar?: ReactNode` and renders it in the toolbar region 2rem below the heading block (nothing when absent); it keeps the contract's names with `buildOfferingsQuery` (`@/widgets/offering-list`, record type `OfferingsQuery`) and renders the async widget `Offerings` inside `Suspense`. `Offerings` runs the offerings and taxonomy fetches and renders `OfferingList` with `{ state: "success", items, meta }`, `{ state: "empty" }` or `{ state: "error" }`; `meta.total` exists only there. `OfferingList`'s empty branch shows `texts.emptyMessage` | D9 host |

`src/shared/lib/filter-query`, `src/shared/api/coffees.ts` and `src/shared/ui/FiltersTrigger.tsx` do not exist yet (`add-evaluation-facets` has not applied): this change creates them.

### D3. Files and FSD layers

| Path | Layer | New / modified | Content |
|---|---|---|---|
| `app/[locale]/@sidebar/offerings/page.tsx` | app (routing) | Modified | Awaits `params` and `searchParams`, renders `OfferingsSidebarScreen` with them; no logic |
| `app/[locale]/offerings/page.tsx` | app (routing) | Modified | Also passes `toolbar={<OfferingsToolbarScreen locale searchParams />}` to `OfferingsScreen`; no logic |
| `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.tsx` | pages | Modified | Async, thin: texts, settled coffees and taxonomy reads, options, parsed values; renders `OfferingsSidebar` |
| `src/pages/offerings-sidebar/ui/OfferingsSidebar.tsx` | pages | New | Sync: `<AppSidebar><OfferingFacets … /></AppSidebar>` (the facet panel as the frame's `children`) |
| `src/pages/offerings-sidebar/index.ts` | pages | Modified | Also exports `OfferingsSidebar` |
| `src/pages/offerings/ui/OfferingsToolbarScreen.tsx` | pages | New | Async, thin: texts, settled taxonomy read, parsed values, applied count; renders `OfferingsToolbar` |
| `src/pages/offerings/ui/OfferingsScreen.tsx` | pages | Modified | Sanitized query (D4); filtered empty state and result count text (D9) |
| `src/pages/offerings/index.ts` | pages | Modified | Also exports `OfferingsToolbarScreen` |
| `src/features/offering-facets/model/query.ts` | features | New | Keys, limits, parse, sanitize, `hasOfferingFilters`, sort options (D4, D6) |
| `src/features/offering-facets/model/options.ts` | features | New | Facet options from the settled reads (D7) |
| `src/features/offering-facets/model/applied.ts` | features | New | Applied values → chips and count (D5) |
| `src/features/offering-facets/api/search-roasteries.ts` | features | New | Browser search of `GET /roasteries?name=` |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features | New | `"use client"` panel with the eleven facets (D7) |
| `src/features/offering-facets/ui/OfferingsToolbar.tsx` | features | New | `"use client"` toolbar: `FiltersTrigger` + sort field (D8) |
| `src/features/offering-facets/ui/ClearFiltersButton.tsx` | features | New | `"use client"` "Clear all" of the empty state (D9; R9 option (b)) |
| `src/features/offering-facets/index.ts` | features | New | Public API of the slice |
| `src/widgets/offering-list/ui/OfferingList.tsx`, `Offerings.tsx` | widgets | Modified | Optional `emptyAction` prop and optional `texts.resultCount` (D9); landing passes neither and keeps its output |
| `src/shared/lib/filter-query/index.ts` | shared | New, shared with add-evaluation-facets | `buildFilterHref`, `clearFiltersHref`, `useFilterNavigation`, `FilterChanges`, `QueryRecord` (D4) |
| `src/shared/api/coffees.ts`, `src/shared/api/index.ts` | shared | New / modified, shared with add-evaluation-facets | `CoffeeSummary`, `RoasterySummary` types; `fetchCoffees`, `distinctCoffeeValues` |
| `src/shared/ui/FiltersTrigger.tsx`, `src/shared/ui/index.ts` | shared | New / modified, shared with add-evaluation-facets | The body "Filters" trigger (D8) |
| `messages/{es,en,ca}/filters.json`, `messages/{es,en,ca}/catalog.json` | — | Modified | Texts of D10 |

The three shared pieces are used by both facet sets. `add-evaluation-facets` finds them on `develop` and reuses them unchanged (the pattern of summary §9.2 for the coffees read). Both designs state the same signatures.

### D4. URL state

- `buildFilterHref(pathname, current: URLSearchParams, changes: FilterChanges): string`, with `FilterChanges = Record<string, string | readonly string[] | undefined>`. Each key of `changes` replaces that key: a string writes one value, an array writes one repeated key per element, `undefined`, `""` or `[]` removes it. `page` is always removed. Every other key is kept in its current order; new keys are appended. The result is `pathname` alone when no key remains, else `pathname?query`.
- `clearFiltersHref(pathname, current, keep: readonly string[]): string` keeps only the `keep` keys (offerings: `orderBy`, `orderDirection`) and drops `page`.
- `useFilterNavigation()` (client) returns `navigate(changes)` and `navigateTo(href)`, which call `router.push(href, { scroll: false })` with the current `usePathname()` and `useSearchParams()`. `push` adds one history entry; `scroll: false` keeps the position (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`, "Disabling scroll to top"). Focus stays where it is because the panel is not re-mounted by the navigation (the slot page re-renders with new props).
- Offering keys and limits (contract `listOfferings`): `coffeeName` ≤150, `roasteryName` ≤150, `producer` ≤150, `originCountry` ≤90, `originRegion` ≤90, `process` ≤90, `variety` ≤90, `city` ≤90 (trimmed, non-empty); `verified` `"1"` or `"0"`; `cuppingAvgMin`, `cuppingAvgMax` finite numbers 0–100 with min ≤ max (when min > max both are dropped); `cataRef` repeated, non-empty values; sort pair one of D6's options (else both dropped). A repeated single-value key keeps its first value.
- `parseOfferingFilters(params: URLSearchParams | QueryRecord)` returns `OfferingFilterValues` (D11). `QueryRecord = Record<string, string | string[] | undefined>` (in `src/shared/lib/filter-query`) is the Next `searchParams` shape, structurally the catalog's `OfferingsQuery`. `sanitizeOfferingQuery(query: QueryRecord): QueryRecord` returns the record with the facet and sort keys replaced by their parsed values (dropped values absent, `cataRef` as an array when it has values) and every other key untouched; the catalog screen applies it to the output of `buildOfferingsQuery` before the request and the pagination.
- `hasOfferingFilters(values): boolean` is true when any facet value is present (`cataRef` non-empty included); the sort never counts.
- Score range write: each bound is written only when it differs from its end (min > 0, max < 100); the full range writes neither.

### D5. Applied chips and count

- `appliedOfferingFilters(values, context)`, with `context = { tasteNotes: TasteNoteOption[] | null, texts }` (the facet and value texts of D10), returns, in facet order, one `OfferingAppliedFilter` per applied value: Coffee, Verification ("Verified"/"Provisional"), Average score (one chip "{min}–{max}" for the pair), each taste note that is a listed node (named in the locale), Origin country, Origin region, Process, Variety, Producer, Roastery, City. Each entry carries a stable `id` (the key, plus the value for `cataRef`), the facet label, the value label and the `FilterChanges` that remove only it (a taste note removes its own value from `cataRef`, keeping the others). With `tasteNotes: null` no `cataRef` value is listed, so none is a chip.
- The trigger count and the chips use the same list; the sort is never a chip. The chips are computed in the sidebar, the count in `OfferingsToolbarScreen`; both read the taxonomy with a settled read, so they agree.
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

- `OfferingsSidebarScreen({ locale, searchParams })` (async, thin) reads the `filters` texts, runs `Promise.allSettled([fetchCoffees(), fetchTaxonomies()])`, builds the options with `offeringFacetOptions` and the values with `parseOfferingFilters`, and renders `OfferingsSidebar`, which mounts `<AppSidebar>` with `<OfferingFacets … />` as its `children` (after the frame's navigation, which the offerings route never shows).
- `OfferingFacets` receives `values` (D4), `options` (`countries`, `regions`, `processes`, `varieties`, `producers`: `string[] | null`; `tasteNotes`: `TasteNoteOption[] | null`; `null` = unavailable), `locale` and `texts`. It renders `FacetPanel` titled `filters.title`, with the chips of D5 (`onRemove(id)` navigates with that entry's `remove`) and the eleven facets of the spec table, each wired to `navigate` with its key:
  - Coffee: `FacetTextField` `type="search"`, `maxLength` 150, placeholder `filters.coffeeNamePlaceholder`.
  - Verification: `FacetRadioList` with options Verified (`1`) and Provisional (`0`), `anyLabel` `filters.any`.
  - Average score: `ScoreRangeFacet` 0–100, value `[cuppingAvgMin ?? 0, cuppingAvgMax ?? 100]`, texts `scoreMin`, `scoreMax`, `rangeFrom`, `rangeTo`; the write rule of D4.
  - Taste notes: `FacetCascade` over `tasteNotes`, `toggleChildren` from `filters.toggleChildren`.
  - Origin country, Origin region, Process, Variety: `FacetRadioList` over the lists, value = label.
  - Producer: `Combobox` local mode over `producers`. Roastery: `Combobox` search mode with `searchRoasteries`; choosing a row writes `roasteryName` = the row's `name`; clearing the input removes it. Both pass `variant="inverse"` (the panel's scope) and the texts `searching`, `noOptionMatches`, `searchFailed`, `optionCount`.
  - City: `FacetTextField` `type="text"`, `maxLength` 90, help `filters.cityHelp`.
- Taste-note options: the level-0 nodes of `GET /taxonomies` in API order, each with its level-1 children in API order, `value` = `ulid`, `label` = `nameEs`/`nameEn`/`nameCa` for the locale; level 2 is not offered (Open 7 (a)). Every category is included: the summary sets no category filter for offerings.
- The taste-note facet writes `cataRef` as the cascade's selected set, one repeated value each, in the cascade's order. Which nodes are selected when a parent or child is checked is the cascade's rule (decisions log, "Filtros F1"), owned by `add-facet-controls`. `value` passed to the cascade keeps only listed ids.
- A facet with `null` options renders disabled with help `filters.optionsUnavailable` (the five coffee-based facets for a failed coffees read; Taste notes for a failed taxonomy read). No facet shows an error state (R10).

### D8. Body toolbar

- The catalog route passes `toolbar={<OfferingsToolbarScreen locale={locale} searchParams={…} />}` to `OfferingsScreen`, which renders it in its toolbar region (catalog §6.2: 2rem below the heading block). `OfferingsToolbarScreen` (async, thin) reads the `filters` texts, runs a settled `fetchTaxonomies()`, parses the values and renders `OfferingsToolbar` with `count` = the length of `appliedOfferingFilters` (D5), the current sort id and the texts.
- `OfferingsToolbar` layout (summary §6.4): a flex row that wraps, items aligned to the bottom, `gap-x-4 gap-y-3`, the trigger at the start and the sort field at the end (`justify-between`); no padding, border or radius. The sort field grows between 12rem and 16rem.
- `FiltersTrigger` (`src/shared/ui`, `"use client"`): `Button` `primary`, icon `SlidersHorizontal`, visible text passed by the caller (`filters.trigger`, or `filters.triggerWithCount` with `{count}` when the count is above 0), `aria-expanded` = `useSidebar().open`, `aria-controls` = `SIDEBAR_ID`; activating it calls `setOpen(true)`. It renders when `isMobile` is true, and otherwise only while `open` is false.
- Sort: `Field` with the visible label `filters.sortBy` and `Select` default variant, options of D6.

### D9. Catalog host states

- `OfferingsScreen` parses its `searchParams` (D4). When `hasOfferingFilters` is true, the list texts carry `emptyMessage` = `filters.noMatches` and `Offerings` receives `emptyAction` = `ClearFiltersButton` (`Button` `primary`, text `filters.clearAll`), which `OfferingList` renders centered below the empty message 1rem apart (as its error block); otherwise the catalog's own empty message and no action. A `cataRef` value that is not a listed taste note counts as a filter here: the request still carries it.
- The result announcement: the list texts carry `resultCount` = `catalog.resultCount` (optional in `OfferingListTexts`). When it is given, `OfferingList` renders a visually hidden element with `role="status"` (polite) whose text is `resultCount` with `{count}` = `meta.total` (0 when absent) in the success state and 0 in the empty state. `meta.total` is read inside `OfferingList`, where the result of `Offerings` arrives. The element must stay mounted across a facet navigation for the change to be announced (Risk 2).
- The request: `OfferingsScreen` passes `sanitizeOfferingQuery(buildOfferingsQuery(searchParams))` to `Offerings` as `query`, so the request and the pagination carry the same sanitized keys.
- Loading and error remain the catalog's; the sidebar panel is a separate slot, so it keeps its values while the list loads or fails.

### D10. Texts

Area `filters` (summary §10 strings). This change needs these keys to exist with these strings; keys already present from `add-facet-controls` (D2) are kept unchanged:

`title`, `trigger`, `triggerWithCount`, `clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, `noOptionMatches`, `searching`, `searchFailed`, `optionCount`, `toggleChildren`, `rangeFrom`, `rangeTo`, `coffeeName`, `coffeeNamePlaceholder`, `roastery`, `originCountry`, `originRegion`, `process`, `variety`, `producer`, `city`, `cityHelp`, `verification`, `verified`, `provisional`, `averageScore`, `scoreMin`, `scoreMax`, `scoreRange`, `tasteNotes`, `sortBy`, `sortDefault`, `sortScoreDesc`, `sortScoreAsc`, `sortMostEvaluated`, `sortNewest`, `sortOldest`, `noMatches`, as in summary §10, plus:

| Area | Key | es | en | ca |
|---|---|---|---|---|
| `catalog` | `resultCount` | Resultados: {count} | Results: {count} | Resultats: {count} |

`optionsUnavailable` already exists (from `add-facet-controls`). The three `resultCount` strings are the architect's drafts (Open 13 gives no wording; the form "Results: {count}" needs no plural forms, which the flat catalogs do not support). Product owner confirms them at artifact review.

### D11. Derived types

In `src/shared/api/index.ts`: `CoffeeSummary = NonNullable<ListCoffeesResponse["data"]>[number]`, `RoasterySummary = NonNullable<ListRoasteriesResponse["data"]>[number]`, from `operations["listCoffees"]` and `operations["listRoasteries"]`.

In the feature (UI-specific, before any component): `OfferingFilterValues` (`coffeeName?`, `verified?: "1" | "0"`, `cuppingAvgMin?: number`, `cuppingAvgMax?: number`, `cataRef: string[]`, `originCountry?`, `originRegion?`, `process?`, `variety?`, `producer?`, `roasteryName?`, `city?`, `sort: OfferingSortId`), `OfferingSortId`, `TasteNoteOption` = `CascadeOption` of `@/shared/ui` (`value`, `label`, `children?: { value, label }[]`), `OfferingAppliedFilter` = `AppliedFilter` of `@/shared/ui` (`id`, `facet`, `value`) plus `remove: FilterChanges`. `FilterChanges` and `QueryRecord` live in `src/shared/lib/filter-query`.

## Risks / Trade-offs

1. **Parallel interfaces (D2).** Resolved: the three changes are merged and D2 states their code as verified on 2026-10-07.
2. **Announcement under `Suspense`.** If the catalog keys its `Suspense` boundary by query, the status element is re-created on each change and screen readers may not announce it. The build then moves the status element outside the boundary in the catalog screen, keeping the text of D9 (a single-component detail).
3. **`cataRef` semantics.** That `cataRef` takes taxonomy `ulid`s, and whether a parent matches offerings tagged with its children, are unverified in the API (summary Open 7). The cascade sends what is checked; results depend on the API.
4. **CORS.** Browser calls to the API fail until the API publishes its CORS configuration (decisions log, "CORS de la API para el navegador"). Until then the Roastery combobox shows "Results could not be loaded"; every other facet loads on the server and works.
5. **City exact match.** Case sensitivity depends on the database collation (summary Open 10, Unverified).
6. **Shared pieces (D3).** This change creates them; if `add-evaluation-facets` is applied in parallel, its merge conflicts on the same new files and its build keeps these and adapts.
7. **`## Propose status`.** The 2026-10-07 alignment is recorded in `docs/design/add-filter-controls/design-summary.md`, `## Propose status`, one dated line per change.
8. **Taxonomy read per render.** The sidebar, the toolbar and the list each read `GET /taxonomies` on the server; with plain `fetch` each may be a separate request. Accepted: the read is public and small, and a failure only disables Taste notes and drops the taste-note chips and count.
