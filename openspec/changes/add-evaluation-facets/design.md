# Design — add-evaluation-facets

## Context

- Source: `docs/design/add-filter-controls/design-summary.md` (status approved) §2, §3.2, §3.3, §5.1, §5.4, §5.5, §6.4, §9.2, §10 and §11, with every Open answered on 2026-10-06, and the decisions log of `docs/general-context.md` ("catálogo: detalle y consenso; filtros: cascada y división" (F3: the split into four changes), "add-filter-controls: resto de puntos", "lecturas de evaluaciones: decisión final", "add-specialist-evaluations: preguntas del explore", "filtros: preguntas de los explore en la nube"). Product owner split the approved design into four changes on 2026-10-06; this is part 4. There is no `docs/design/add-evaluation-facets/` folder: the routine that launched this propose names the add-filter-controls summary as the source.
- The list route `/{locale}/manage/evaluations` comes from `add-specialist-evaluations`, archived and merged into `develop`. The facets filter its client fetch of `listMyEvaluations`, which under the final decision "lecturas de evaluaciones: decisión final" serves only the token user's evaluations: the query carries no `evaluatorId` and none is ever sent.
- Parts 1 (`add-sidebar-slot`), 2 (`add-facet-controls`) and 3 (`add-offering-facets`) are archived and merged into `develop`, together with `add-specialist-evaluations`, `refine-facet-controls` and `extract-access-and-status-pieces`. **D2 lists the interfaces this change consumes as they are on `develop` (artifact update of 2026-10-07); task 0.1 re-checks them before any code is written.**
- **The apply runs after `extract-clear-filters-button` merges into `develop`** (backlog R9, its design-summary Open 1 option (b)): that change moves the catalog's "Clear all" button of the filtered empty state to `src/shared/ui` as `ClearFiltersButton` with the props `label` and `keep`. This change consumes it (D9) and never creates a button of its own.
- `openspec/specs/filtering/spec.md` on `develop` holds the generic control and offering requirements; `extract-clear-filters-button` adds "Clear all action for an empty filtered list". This delta adds the evaluation requirements.
- Backlog (`docs/backlog.md`): R9 is resolved by `extract-clear-filters-button`, which this change waits for (above). R10 (error boundary of the row facets in the traditional theme) names this change but no evaluation facet shows a validation error, so nothing here depends on it. R13 (move `EvaluationsAccess` onto the shared session gate) touches `EvaluationsListScreen`, which this change also edits; it is not folded in, and whichever merges second keeps the other's edit (Risk 10).

## Goals / Non-Goals

**Goals:** the evaluation facet set, its option data, URL state, applied chips, sort, body toolbar and the filtered states of the evaluations list, exactly as `specs/filtering/spec.md` states them, on the shared pieces of D2 with the signatures part 3 states.

**Non-Goals:** see proposal.md, "Non-goals". Design-level: no new token, no new shared control, no change to the rows, row actions or card mapping of the list (they stay `add-specialist-evaluations`').

## Decisions

### D1. Contract operations

| Operation | Method and path | Auth | Request | Response used | Errors and how they show |
|---|---|---|---|---|---|
| `listMyEvaluations` | `GET /user/evaluations` | Token (`Authorization: Bearer`), `specialist`, `profile:read` (the plain sign-in token) | Query built by D4/D6: `city` (≤90), `process` (≤90), `status` (`open`\|`closed`), `scoreMin`, `scoreMax` (0–100), `orderBy` (`cupping_score`\|`created_at`), `orderDirection` (`asc`\|`desc`), `page` | `200 {data, meta}`; `meta.total` feeds the announcement | Owned by the host (`add-specialist-evaluations`): its loading, empty and failure states. The contract documents no 422, and the facets cannot produce an out-of-range request (D4) |
| `listCoffees` | `GET /coffees` | none (`security: []`) | none (`name` filters by coffee name, unused here) | `data[]`: `process` (the only field this change reads) | Any non-2xx or transport failure: Process disabled with "Options unavailable" (summary Open 9 (a)) |

- The coffees read runs on the server with plain `fetch` (the settled data-loading rule) once per render of the sidebar screen. This change makes no browser-side API call: the search-as-you-type exception of `add-offering-facets` has no consumer here.
- Values are shown as the API returns them (general context, "Forma de trabajar"), e.g. `washed`. The `status` values `open` and `closed` are the contract enum, shown with the catalog labels "Open" and "Closed".
- `scoreMin`/`scoreMax` are `type: number` in the contract (scores carry decimals, e.g. `84.25`); the shared score range emits integer bounds (summary §4, step 1), which the API matches against decimal scores.
- Presentation of an API error: this change's only read failure shows the "Options unavailable" help of D7; every failure of `listMyEvaluations` shows the host's existing failure message with its retry action and keeps the facet values (spec "Filtered evaluation results").

### D2. Interfaces on `develop` (checked by task 0.1)

| From | Interface on `develop` | Used by |
|---|---|---|
| `add-sidebar-slot` | The `@sidebar` slot: `app/[locale]/@sidebar/default.tsx`, `page.tsx` and `[...rest]/page.tsx` render `DefaultSidebarScreen` (`src/pages/default-sidebar`), whose `DefaultSidebar` shows the sidebar frame only for an authenticated session on a `/[locale]/manage/*` route. A route with its own sidebar adds a slot page that renders a screen mounting the frame `AppSidebar` (`@/widgets/app-sidebar`) with its content as `children` (`OfferingsSidebar` in `src/pages/offerings-sidebar` is the existing example). `AppSidebar` renders the sidebar header with its collapse control, then a `nav` with the provider's role-based entries (on a management route with an authenticated session, here the specialist's "Manage evaluations" entry, `EvaluationsSidebarEntry` of `@/features/manage-evaluations`, supplied by `src/app/shell/SessionShell.tsx`) and its `entries` prop, then its `children` | D3 slot page, D7 |
| `add-sidebar-slot` | `@/shared/ui` re-exports the whole `Sidebar` module: `useSidebar()` (`open`, `setOpen`, `isMobile`), `SIDEBAR_ID` (the sidebar element's id, for `aria-controls`) and `SidebarSeparator`; the provider wraps the sidebar and the main content at shell level; the sidebar starts closed below `md` and a collapsed sidebar can be expanded again (`SidebarReopenControl`) | D7, D8 |
| `add-facet-controls`, `refine-facet-controls` | Exported from `@/shared/ui`: `FacetPanel` (`form`, `role="search"`, named by its `title`; props `title`, `applied: AppliedFilter[]`, `onRemove(id)`, `onClearAll()`, `texts` `{ clearAll, removeFilter }`, facets as `children`), `FacetTextField` (`label`, `value`, `onCommit(value)` with the trimmed value, `""` = remove, `maxLength`, `help`, `disabled`), `FacetRadioList` (`legend`, `options: FacetOption[]`, `value`, `onChange(value \| undefined)`, `anyLabel` listed first, "see more" texts, `help`, `disabled`) and `ScoreRangeFacet` (`legend`, `min`, `max`, `value: ScoreRange`, `onCommit([min, max])`, `texts` `{ minThumb, maxThumb, from, to }`, `disabled`); `AppliedFilter = { id, facet, value }`; the `filters` message area with the generic texts (`title`, `clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, `rangeFrom`, `rangeTo`) | D5, D7 |
| `add-offering-facets` | `src/shared/lib/filter-query` (`@/shared/lib/filter-query`): `buildFilterHref(pathname, current: URLSearchParams, changes: FilterChanges): string`, `clearFiltersHref(pathname, current, keep: readonly string[]): string`, `useFilterNavigation()` returning `navigate(changes)` and `navigateTo(href)` (both `router.push(href, { scroll: false })`), the types `FilterChanges = Record<string, string \| readonly string[] \| undefined>` and `QueryRecord = Record<string, string \| string[] \| undefined>` | D4, D5, D7 |
| `add-offering-facets` | `src/shared/api/coffees.ts` through `@/shared/api`: `fetchCoffees()` (plain `GET /coffees`, no credential header, returns `data`, rejects on a non-2xx status and on a transport failure) and `distinctCoffeeValues(coffees, field)` (removes duplicates, `null` and empty strings, sorts alphabetically); `CoffeeSummary` and `RoasterySummary` in `src/shared/api/index.ts` | D1, D7 |
| `add-offering-facets` | `FiltersTrigger` (`src/shared/ui/FiltersTrigger.tsx`, from `@/shared/ui`): props `{ label }`; `Button` `primary` with the `SlidersHorizontal` icon, `aria-expanded` mirroring `open`, `aria-controls={SIDEBAR_ID}`, activating it calls `setOpen(true)`; renders when `isMobile` is true and otherwise only while `open` is false | D8 |
| `extract-clear-filters-button` | `ClearFiltersButton` (`src/shared/ui/ClearFiltersButton.tsx`, from `@/shared/ui`): props `label` and `keep: readonly string[]`; one `Button` `primary`, `type="button"`; on click `navigateTo(clearFiltersHref(pathname, current, keep))` | D9 |
| `add-specialist-evaluations` | `src/pages/evaluations-list`: `EvaluationsListScreen` (thin server component resolving the `evaluations` and `landing` catalogs and rendering, inside `PageSection surface="page"`, `EvaluationsList` within the `EvaluationsAccess` gate of `@/features/manage-evaluations`) and `EvaluationsList` (`"use client"`: its heading, the fetch of `listMyEvaluations` and per-row `fetchOffering`, loading, empty and failure states, rows, `Pagination`, delete; today it reads `page` from `useSearchParams` and renders `Pagination` without `query`); `listMyEvaluations(page: number)` in `src/entities/evaluation/api/user-evaluations.ts`, exported from `@/entities/evaluation`; `messages/{es,en,ca}/evaluations.json` | D3, D9 |

Names in this table are the code on `develop` on 2026-10-07, except `ClearFiltersButton`, which is `extract-clear-filters-button`'s design until it merges. When an interface differs at apply, the build stops at task 0.1 and reports the differences; the architect updates these artifacts before apply continues.

### D3. Files and FSD layers

| Path | Layer | New / modified | Content |
|---|---|---|---|
| `app/[locale]/@sidebar/manage/evaluations/page.tsx` | app (routing) | New | Awaits `params` and `searchParams`, renders `EvaluationsSidebarScreen`; no logic |
| `app/[locale]/manage/evaluations/page.tsx` | app (routing) | Modified | Also awaits and passes `searchParams` to `EvaluationsListScreen` |
| `src/pages/evaluations-list/ui/EvaluationsSidebarScreen.tsx` | pages | New | Async thin wrapper: texts, the settled coffees read, the options of D7, `parseEvaluationFilters`, renders `AppSidebar` with `SidebarSeparator` and `EvaluationFacets` as its children |
| `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx` | pages | Modified | Takes `searchParams`, parses them (D4), computes the applied list (D5), renders `EvaluationsToolbar` and `EvaluationsList` with their props and `ClearFiltersButton` as `emptyAction` (D9) |
| `src/pages/evaluations-list/index.ts` | pages | Modified | Also exports `EvaluationsSidebarScreen` |
| `src/features/evaluation-facets/model/query.ts` (+ `query.test.ts`) | features | New | Keys, limits, `parseEvaluationFilters`, `evaluationListQuery`, the sort options (D4, D6) |
| `src/features/evaluation-facets/model/applied.ts` (+ `applied.test.ts`) | features | New | `appliedEvaluationFilters` (D5) |
| `src/features/evaluation-facets/ui/EvaluationFacets.tsx` (+ `EvaluationFacets.test.tsx`) | features | New | `"use client"` panel with the four facets (D7) |
| `src/features/evaluation-facets/ui/EvaluationsToolbar.tsx` (+ `EvaluationsToolbar.test.tsx`) | features | New | `"use client"` toolbar: `FiltersTrigger` and the sort field (D8) |
| `src/features/evaluation-facets/index.ts` | features | New | Public API of the slice |
| `src/entities/evaluation/api/user-evaluations.ts` (+ `user-evaluations.test.ts`) | entities | Modified | `listMyEvaluations` takes the serialized request query (D1) |
| `src/pages/evaluations-list/ui/EvaluationsList.tsx` (+ `EvaluationsList.test.tsx`) | pages | Modified | The `values`, `page`, `query`, `emptyAction` and `resultCountText` props (D9) |
| `messages/{es,en,ca}/filters.json` | — | Modified | Texts of D10 not yet present |
| `messages/{es,en,ca}/evaluations.json` | — | Modified | `resultCount` (D10) |

Used unchanged from `develop`: `src/shared/lib/filter-query`, `src/shared/api/coffees.ts` and the `CoffeeSummary`/`RoasterySummary` aliases, `FiltersTrigger`, the facet controls and `AppSidebar` (D2); `ClearFiltersButton` from `@/shared/ui` once `extract-clear-filters-button` merges. This change creates no "Clear all" button file.

Tests live next to the file they test. The shared card is not used by this change (the rows and their card mapping stay `add-specialist-evaluations`'), so there is no card field mapping to state.

### D4. URL state and request query

- The URL writes go through `src/shared/lib/filter-query` (D2): each key of `FilterChanges` replaces that key, `page` is always removed, every other key is kept in its current order.
- Evaluation keys and limits (contract `listMyEvaluations`): `status` `"open"` or `"closed"`; `process` and `city` trimmed non-empty text of at most 90 characters; `scoreMin` and `scoreMax` finite numbers 0–100 with min ≤ max (when min > max both are dropped); the sort pair must be one of D6's options (else both are dropped). A repeated single-value key keeps its first value. Values within the limits but not among a facet's options reach the request as-is and the facet shows "Any" (none of its options is checked).
- `parseEvaluationFilters(params)` returns `EvaluationFilterValues` (D11) from a `URLSearchParams` or the Next `searchParams` record (`QueryRecord` of `@/shared/lib/filter-query`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`, "searchParams").
- `evaluationListQuery(values, page): string` builds the request query in contract key order — `city`, `process`, `status`, `scoreMin`, `scoreMax`, `orderBy`, `orderDirection`, `page` — from the parsed values only (unknown keys and dropped values never reach the request), with the sort pair of D6 and `page` last. When `values.sort` is `default` it writes `orderBy=created_at&orderDirection=desc`: the list's settled default order (decisions log, "add-specialist-evaluations: preguntas del explore", Q4), so the select's "Default order" (which writes no sort key to the URL) still lists the newest first. *Decided by the orchestrator under Product owner's delegation* (the sources settle the URL behaviour and the default order separately and do not join them). Alternative: send no sort keys for `default` and rely on the API's own default; rejected — the contract documents no default order.
- Score writes: each bound is written only when it differs from its end (min > 0, max < 100); the full range writes neither. A typed bound is applied on Enter or when the input loses focus and clamps to 0–100 and to the other bound (summary Open 15).
- Navigation goes through `useFilterNavigation()` (D2), which calls `router.push(href, { scroll: false })`: `push` adds one history entry and `scroll: false` keeps the position (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`, "Disabling scroll to top"). Focus stays on the control that changed because the panel is not re-mounted by the navigation (the slot page re-renders with new props).
- Pagination keeps every other key: `EvaluationsList` passes the current `searchParams` record (its `query` prop) to `Pagination`'s `query` prop ("every key is kept and `page` is replaced", `src/shared/ui/Pagination.tsx`), which it does not pass today, so a value the parse dropped stays in the URL and in the pagination links until a change rewrites it, and is dropped again before every request. Rewriting the URL on load was rejected (extra machinery for a hand-edited URL that already renders as its empty state).

### D5. Applied chips and count

- `appliedEvaluationFilters(values, texts)` returns, in facet order, one `AppliedFilter` per applied value: Status ("Open"/"Closed" from the catalog), Score (one chip "{min}–{max}" built from the `scoreRange` text for the pair), Process (its value), City (its value). Each entry carries an `id`, the facet label, the value label and the `FilterChanges` that remove only it (the score entry removes both bounds). The entry type is `EvaluationAppliedFilter` (D11), the shared `AppliedFilter` of `FacetPanel` plus `remove`, as `OfferingAppliedFilter` is on `develop`.
- The trigger count and the chips use the same list; the sort is never a chip and "Any" is never an entry.
- "Clear all" (panel and empty state) navigates to `clearFiltersHref(pathname, current, ["orderBy", "orderDirection"])` — the panel's through `navigateTo` in `onClearAll`, the empty state's through `ClearFiltersButton` with `keep={["orderBy", "orderDirection"]}` (D9): summary §11 leaves keeping the sort to the architect, and *decided by the orchestrator under Product owner's delegation* it keeps the sort keys — the choice `add-offering-facets` already made for the parallel facet set.

### D6. Sort options

| Option id | Text key | `orderBy` | `orderDirection` |
|---|---|---|---|
| `default` | `sortDefault` | — | — |
| `score-desc` | `sortScoreDesc` | `cupping_score` | `desc` |
| `score-asc` | `sortScoreAsc` | `cupping_score` | `asc` |
| `newest` | `sortNewest` | `created_at` | `desc` |
| `oldest` | `sortOldest` | `created_at` | `asc` |

The select's option value is the id; choosing one calls `navigate({ orderBy, orderDirection })` (both `undefined` for `default`). There is no `status` sort: summary Open 12's accepted recommendation is "(a) if verified, else (b)", and the verification of the status column order in `tazavera-api` cannot be performed in this session (read-only access to that repository is denied), so its fallback (b) applies — *decided by the orchestrator under Product owner's delegation*. The contract's `orderBy` enum does list `status`, so adding the two options later is a change to this table and two texts only.

### D7. Facet panel composition

- `EvaluationFacets` ("use client") receives `values` (D4), `options` (`processes: string[] | null`, `null` = unavailable) and `texts`. It renders `FacetPanel` titled `filters.title`, with the chips of D5 (`onRemove` navigates with the entry's `remove`) and the four facets of the spec table, each wired to `navigate` with its key.
- Status: `FacetRadioList` with `filters.status` as the legend, `filters.any` as `anyLabel` and the options `filters.statusOpen` and `filters.statusClosed`; choosing one writes `status` (`open` or `closed`), "Any" removes it.
- Score: `ScoreRangeFacet` (0–100) with `filters.score` as the legend, `filters.scoreMin`/`filters.scoreMax` as the bound names and `filters.rangeFrom`/`filters.rangeTo` as the input labels, writing `[min, max]` per D4.
- Process: `FacetRadioList` over `options` with `filters.process` as the legend and the "see more" threshold of the shared control; choosing one writes `process`, "Any" removes it. The options are `distinctCoffeeValues(coffees, "process")` over the read of D1, fetched once on the server in `EvaluationsSidebarScreen` and passed down.
- City: `FacetTextField` labelled `filters.city` with help `filters.cityHelp` and `maxLength` 90, writing `city`; an empty value removes the key.
- With `processes: null` the Process facet renders disabled with help `filters.optionsUnavailable` and the other facets, the sort and the list keep working (summary Open 9 (a)).
- `EvaluationsSidebarScreen` renders `AppSidebar` (`@/widgets/app-sidebar`, D2) with the existing `SidebarSeparator` (`@/shared/ui`) and then `EvaluationFacets` as its children, so the frame shows the specialist's management entries and the separator of summary §6.1 sits between them and the facet panel on this route only.
- Alternative considered: fetch the coffees in the client panel; rejected — the settled data-loading rule fetches public reads on the server, and a failed read must render a disabled facet, not a loading one.

### D8. Body toolbar

- `EvaluationsToolbar` ("use client") sits at the top of the list section, 2rem above the list (summary §6.4). Layout: a flex row that wraps, items aligned to the bottom, `gap-x-4 gap-y-3`, the trigger at the start and the sort field at the end (`justify-between`); no padding, border or radius; the sort field grows between 12rem and 16rem.
- `FiltersTrigger` (D2, shared) with `label` `filters.trigger`, or `filters.triggerWithCount` where `{count}` is the applied count (D5).
- Sort: `Field` with the visible label `filters.sortBy` and `Select` default variant, options of D6.

### D9. Evaluations list host states

- `EvaluationsListScreen` (thin) also takes `searchParams`, resolves `getMessages("filters", locale)` beside its current catalogs, computes `values = parseEvaluationFilters(searchParams)` and the applied list (D5), and renders, inside the `EvaluationsAccess` gate, `EvaluationsToolbar` (count, `values.sort`) above `EvaluationsList`, passing it `values`, `page`, `query` (the `searchParams` record, for `Pagination`), its texts, `resultCountText` (`evaluations.resultCount`) and — only when the applied list is not empty — `emptyAction`: `<ClearFiltersButton label={filters.clearAll} keep={["orderBy", "orderDirection"]} />` from `@/shared/ui` (D2; backlog R9, resolved by `extract-clear-filters-button`). This change creates no "Clear all" button of its own.
- `EvaluationsList` (client, from `add-specialist-evaluations`) gains the `values`, `page`, `query`, `emptyAction` and `resultCountText` props and keeps its heading, fetch, states, rows and delete. The `page` prop replaces its current `useSearchParams` read of `page`. Its request query is `evaluationListQuery(values, page)` (D4), passed to `listMyEvaluations` (D1); when any of these props changes it reloads and shows its loading state while the facets keep their values. With `emptyAction` its empty state shows `filters.noMatches` and the action instead of its unfiltered empty message. `resultCountText` renders as a visually hidden `role="status"` (polite) element whose text fills the `{count}` placeholder with `meta.total` (0 in the empty state); the element stays mounted in every state of the list so a change is announced (the same risk `add-offering-facets` records for its host).
- The rows, row actions and card mapping stay `add-specialist-evaluations`' and are unchanged.
- Loading and error remain the host's; the facet panel lives in the sidebar slot, so it keeps its values while the list loads or fails.

### D10. Texts

Area `filters` (summary §10 strings) plus one key in `evaluations`. This change needs these keys to exist with these strings; a key already present from `add-facet-controls` or `add-offering-facets` is kept unchanged:

`title`, `trigger`, `triggerWithCount`, `clearAll`, `removeFilter`, `any`, `seeMore`, `seeLess`, `status`, `statusOpen`, `statusClosed`, `score`, `scoreMin`, `scoreMax`, `scoreRange`, `process`, `city`, `cityHelp`, `sortBy`, `sortDefault`, `sortScoreDesc`, `sortScoreAsc`, `sortNewest`, `sortOldest`, `noMatches`, as in summary §10, plus:

| Area | Key | es | en | ca |
|---|---|---|---|---|
| `filters` | `optionsUnavailable` | Opciones no disponibles | Options unavailable | Opcions no disponibles |
| `evaluations` | `resultCount` | Resultados: {count} | Results: {count} | Resultats: {count} |

`optionsUnavailable` reuses the drafts `add-offering-facets` D10 registers (unchanged). The `evaluations` placement of `resultCount` is *decided by the orchestrator under Product owner's delegation* — Open 13 makes the announcement the host's own catalog key, and this host's area is `evaluations`; its three strings are the drafts of `add-offering-facets`' `catalog.resultCount`, reused so both announcements read alike. Both drafts are Product owner's to confirm at artifact review (summary §10 leaves key names and drafts open to the architect). Taxonomy, API values and scores are data, never catalog text.

### D11. Derived types

UI-specific types, declared in `src/features/evaluation-facets/model` before any component: `EvaluationFilterValues` (`status?: "open" | "closed"`, `scoreMin?: number`, `scoreMax?: number`, `process?: string`, `city?: string`, `sort: EvaluationSortId`), `EvaluationSortId` (`default`, `score-desc`, `score-asc`, `newest`, `oldest`) and `EvaluationAppliedFilter` (`AppliedFilter` of `@/shared/ui` — `id`, `facet`, `value` — plus `remove: FilterChanges`, as `OfferingAppliedFilter` on `develop`). `FilterChanges` and `QueryRecord` live in `src/shared/lib/filter-query`. The named API aliases `CoffeeSummary` and `RoasterySummary` already exist in `src/shared/api/index.ts` (D2). Nothing is derived from `listMyEvaluations` here: its `data` and `meta` types are `add-specialist-evaluations`' (`EvaluationItem`, `EvaluationPageMeta`) and this change consumes neither. `src/shared/api/schema.ts` is never edited.

## Risks / Trade-offs

1. **Interfaces on `develop` (D2)** → task 0.1 stops the apply on any difference and reports it; the architect updates these artifacts before apply continues.
2. **`ClearFiltersButton` not yet on `develop` (D2, D9)** → the apply waits for `extract-clear-filters-button` to merge (Migration Plan); task 0.1 checks its props before any code is written.
3. **`listMyEvaluations` signature change (D1)** → its test's assertion is named in the task; the default request string stays `GET /user/evaluations?orderBy=created_at&orderDirection=desc&page={page}`, so only the call shape changes.
4. **Announcement across reloads (D9)** → the status element stays mounted in every state; a test asserts it does not unmount between loading and results.
5. **Dropped values persist in the URL and pagination links (D4)** → they render as the facet's empty state and never reach a request, which is the spec's stated behaviour; rewriting the URL on load is rejected.
6. **Host-side "Clear all" button (D9)** → backlog R9 is resolved by `extract-clear-filters-button` (Open 1 (b)): this change consumes the shared `ClearFiltersButton` with `keep={["orderBy", "orderDirection"]}` and writes no copy, so R9 gains no second copy to remove.
7. **Status sort left out (D6)** → the contract accepts `orderBy=status` but its ordering is unverified and `tazavera-api` is unreadable in this session; Open 12's fallback (b) applies and adding it later touches D6 and two texts.
8. **`## Propose status` in the shared summary** → AGENTS.md has the architect record it in `design-summary.md`, and the only design summary for this part is the shared `docs/design/add-filter-controls/design-summary.md`, which the four parallel changes also touch. This change appends its own `## Propose status` section there (scoped to `add-evaluation-facets`) and includes it in the propose commit; if sibling branches append their own sections, Product owner reconciles them at merge.
9. **Signed-out visitors on the list route (D7)** → `DefaultSidebar` hides the frame without an authenticated session, but a route's own slot screen mounts `AppSidebar` for every session state (as the public catalog does). Open for Product owner at artifact review: whether the evaluation facets show beside the sign-in message of `EvaluationsAccess`.
10. **Backlog R13 edits the same host (D9)** → moving `EvaluationsAccess` onto `SessionGate` touches `EvaluationsListScreen`; whichever change merges second merges `develop` and keeps the other's edit.
11. **CORS (decisions log, "CORS de la API para el navegador")** → the evaluations list fetch is a browser call and shows the host's failure state until the API publishes its CORS configuration; this change's own reads run on the server and are unaffected.

## Migration Plan

None: the change adds a facet set and wires an existing list; it rolls back by reverting the merge. `add-sidebar-slot`, `add-facet-controls`, `add-offering-facets` and `add-specialist-evaluations` are merged into `develop` and `develop` is merged into `feature/add-evaluation-facets`. The apply starts only after `extract-clear-filters-button` is merged into `develop` and `develop` is merged again into `feature/add-evaluation-facets`.
