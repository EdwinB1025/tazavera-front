# Design — add-evaluation-facets

## Context

- Source: `docs/design/add-filter-controls/design-summary.md` (status approved) §2, §3.2, §3.3, §5.1, §5.4, §5.5, §6.4, §9.2, §10 and §11, with every Open answered on 2026-10-06, and the decisions log of `docs/general-context.md` ("catálogo: detalle y consenso; filtros: cascada y división" (F3: the split into four changes), "add-filter-controls: resto de puntos", "lecturas de evaluaciones: decisión final", "add-specialist-evaluations: preguntas del explore", "filtros: preguntas de los explore en la nube"). Product owner split the approved design into four changes on 2026-10-06; this is part 4. There is no `docs/design/add-evaluation-facets/` folder: the routine that launched this propose names the add-filter-controls summary as the source.
- The list route `/{locale}/manage/evaluations` is designed in `add-specialist-evaluations` (its proposal, design and tasks on `feature/add-specialist-evaluations`), whose apply is a precondition of this one. The facets filter its client fetch of `listMyEvaluations`, which under the final decision "lecturas de evaluaciones: decisión final" serves only the token user's evaluations: the query carries no `evaluatorId` and none is ever sent.
- Parts 1 (`add-sidebar-slot`), 2 (`add-facet-controls`) and 3 (`add-offering-facets`) were proposed in parallel; part 3's artifacts were read for this design. **This design is written against the interfaces those parts describe; D2 lists each assumed interface, and task 0.1 checks them before any code is written.**
- `filtering` has no main spec on `develop`. This delta adds the evaluation requirements; `add-facet-controls` adds the generic control requirements and `add-offering-facets` the offering ones.
- Backlog (`docs/backlog.md`, R1, R3–R5, R8): no entry names this change or the files it touches. The duplication this change would introduce (a second host-side "Clear all" button beside `add-offering-facets`' one) is reported to Product owner as a backlog candidate instead of being folded in here.

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

### D2. Assumed interfaces of the parallel changes (checked by task 0.1)

| From | Assumed interface | Used by |
|---|---|---|
| `add-sidebar-slot` | A parallel route slot `app/[locale]/@sidebar/` with a `default` and a catch-all that render nothing; the shell places the slot content inside the sidebar's content region, below the sidebar header and its collapse control and below the management navigation entries where they exist, so on `/{locale}/manage/evaluations` an authenticated session sees the entries and then the slot content | D3 slot page |
| `add-sidebar-slot` | The sidebar state provider wraps both the sidebar region and the main content at shell level, so a component in the page body reads and changes it with `useSidebar()` from `@/shared/ui` (`open`, `setOpen`, `isMobile`); the sidebar starts closed below `md` (summary F1), a collapsed sidebar can be expanded again (F2), and its element carries an id exported for `aria-controls` | D8 trigger |
| `add-facet-controls` | Exported from `@/shared/ui`: the facet panel (`form`, `role="search"`, named by its visible title, rendering the applied chips and "Clear all" from a list it receives), the text field committing on Enter or on leaving the field, the radio list with "Any" first and "see more" after 5 options (applied values always visible), the score range with "From"/"To" inputs (emits `[min, max]` on commit, clamping typed values), each with a `disabled` state and help text | D7 panel |
| `add-facet-controls` | Icons `SlidersHorizontal` and `X` in `src/shared/ui/icons.ts`; the `filters` message area with the generic control texts (`clearAll`, `removeFilter`, `seeMore`, `seeLess`, `any`, the score range texts) | D8, D10 |
| `add-offering-facets` | `src/shared/lib/filter-query`: `buildFilterHref(pathname, current: URLSearchParams, changes: FilterChanges): string`, `clearFiltersHref(pathname, current, keep: readonly string[]): string` and `useFilterNavigation()` returning `navigate(changes)` and `navigateTo(href)`, with `FilterChanges = Record<string, string \| readonly string[] \| undefined>` | D4, D5 |
| `add-offering-facets` | `src/shared/api/coffees.ts` exported through `@/shared/api`: `fetchCoffees()` (plain `GET /coffees`, no credential header, returns `data`, throws on a non-2xx status and on a transport failure) and `distinctCoffeeValues(coffees, field)` (removes duplicates, `null` and empty strings, sorts alphabetically), with the `CoffeeSummary` and `RoasterySummary` aliases in `src/shared/api/index.ts` | D1, D7 |
| `add-offering-facets` | `src/shared/ui/FiltersTrigger.tsx` exported from `@/shared/ui`: `Button` `primary` with the `SlidersHorizontal` icon, visible text from the caller, `aria-expanded` mirroring `open`, `aria-controls` set to the sidebar id, activating it calls `setOpen(true)`; renders when `isMobile` is true and otherwise only while `open` is false | D8 |
| `add-specialist-evaluations` | `src/pages/evaluations-list` with `EvaluationsListScreen` (async server wrapper resolving the `evaluations` catalog and rendering `EvaluationsList` inside the `EvaluationsAccess` gate) and `EvaluationsList` (the client list: fetch of `listMyEvaluations` and per-row `fetchOffering`, states, rows, `Pagination`, delete); `src/entities/evaluation/api/user-evaluations.ts` with `listMyEvaluations`; `messages/{es,en,ca}/evaluations.json` | D3, D9 |

The three shared pieces (`filter-query`, the coffees read, `FiltersTrigger`) serve both facet sets: whichever of `add-offering-facets` and `add-evaluation-facets` applies first creates them with the behaviour stated here, and the second finds them on `develop` and reuses them unchanged. Both designs state the same signatures. When an interface differs, the build stops at task 0.1 and reports the differences; the architect updates these artifacts before apply continues. Names that come from those changes are their artifacts' names, not verified code.

### D3. Files and FSD layers

| Path | Layer | New / modified | Content |
|---|---|---|---|
| `app/[locale]/@sidebar/manage/evaluations/page.tsx` | app (routing) | New | Awaits `params` and `searchParams`, renders `EvaluationsSidebarScreen`; no logic |
| `app/[locale]/manage/evaluations/page.tsx` | app (routing) | Modified (from add-specialist-evaluations) | Also awaits and passes `searchParams` to `EvaluationsListScreen` |
| `src/pages/evaluations-list/ui/EvaluationsSidebarScreen.tsx` | pages | New | Async thin wrapper: texts, the settled coffees read, the options of D7, `parseEvaluationFilters`, renders `SidebarSeparator` and `EvaluationFacets` |
| `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx` | pages | Modified | Parses `searchParams` (D4), computes the applied list (D5), renders `EvaluationsToolbar` and `EvaluationsList` with their props (D9) |
| `src/pages/evaluations-list/index.ts` | pages | Modified | Also exports `EvaluationsSidebarScreen` |
| `src/features/evaluation-facets/model/query.ts` (+ `query.test.ts`) | features | New | Keys, limits, `parseEvaluationFilters`, `evaluationListQuery`, the sort options (D4, D6) |
| `src/features/evaluation-facets/model/applied.ts` (+ `applied.test.ts`) | features | New | `appliedEvaluationFilters` (D5) |
| `src/features/evaluation-facets/ui/EvaluationFacets.tsx` (+ `EvaluationFacets.test.tsx`) | features | New | `"use client"` panel with the four facets (D7) |
| `src/features/evaluation-facets/ui/EvaluationsToolbar.tsx` (+ `EvaluationsToolbar.test.tsx`) | features | New | `"use client"` toolbar: `FiltersTrigger` and the sort field (D8) |
| `src/features/evaluation-facets/ui/ClearEvaluationFiltersButton.tsx` (+ `ClearEvaluationFiltersButton.test.tsx`) | features | New | `"use client"` "Clear all" of the empty state (D9) |
| `src/features/evaluation-facets/index.ts` | features | New | Public API of the slice |
| `src/entities/evaluation/api/user-evaluations.ts` (+ `user-evaluations.test.ts`) | entities | Modified (from add-specialist-evaluations) | `listMyEvaluations` takes the serialized request query (D1) |
| `src/pages/evaluations-list/ui/EvaluationsList.tsx` (+ `EvaluationsList.test.tsx`) | pages | Modified | The `values`, `page`, `query`, `emptyAction` and `resultCountText` props (D9) |
| `src/shared/lib/filter-query/index.ts` (+ `filter-query.test.ts`) | shared | New, shared with add-offering-facets | `buildFilterHref`, `clearFiltersHref`, `useFilterNavigation`, `FilterChanges` (D2) |
| `src/shared/api/coffees.ts`, `src/shared/api/index.ts` | shared | New / modified, shared with add-offering-facets | `fetchCoffees`, `distinctCoffeeValues`; `CoffeeSummary`, `RoasterySummary` |
| `src/shared/ui/FiltersTrigger.tsx`, `src/shared/ui/index.ts` | shared | New / modified, shared with add-offering-facets | The body "Filters" trigger (D2) |
| `messages/{es,en,ca}/filters.json` | — | New / modified | Texts of D10 |
| `messages/{es,en,ca}/evaluations.json` | — | Modified | `resultCount` (D10) |

Tests live next to the file they test. The shared card is not used by this change (the rows and their card mapping stay `add-specialist-evaluations`'), so there is no card field mapping to state.

### D4. URL state and request query

- The URL writes go through `src/shared/lib/filter-query` (D2): each key of `FilterChanges` replaces that key, `page` is always removed, every other key is kept in its current order.
- Evaluation keys and limits (contract `listMyEvaluations`): `status` `"open"` or `"closed"`; `process` and `city` trimmed non-empty text of at most 90 characters; `scoreMin` and `scoreMax` finite numbers 0–100 with min ≤ max (when min > max both are dropped); the sort pair must be one of D6's options (else both are dropped). A repeated single-value key keeps its first value. Values within the limits but not among a facet's options reach the request as-is and the facet shows "Any" (none of its options is checked).
- `parseEvaluationFilters(params)` returns `EvaluationFilterValues` (D11) from a `URLSearchParams` or the Next `searchParams` record (`Record<string, string | string[] | undefined>`, `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`, "searchParams").
- `evaluationListQuery(values, page): string` builds the request query in contract key order — `city`, `process`, `status`, `scoreMin`, `scoreMax`, `orderBy`, `orderDirection`, `page` — from the parsed values only (unknown keys and dropped values never reach the request), with the sort pair of D6 and `page` last. When `values.sort` is `default` it writes `orderBy=created_at&orderDirection=desc`: the list's settled default order (decisions log, "add-specialist-evaluations: preguntas del explore", Q4), so the select's "Default order" (which writes no sort key to the URL) still lists the newest first. *Decided by the orchestrator under Product owner's delegation* (the sources settle the URL behaviour and the default order separately and do not join them). Alternative: send no sort keys for `default` and rely on the API's own default; rejected — the contract documents no default order.
- Score writes: each bound is written only when it differs from its end (min > 0, max < 100); the full range writes neither. A typed bound is applied on Enter or when the input loses focus and clamps to 0–100 and to the other bound (summary Open 15).
- Navigation goes through `useFilterNavigation()` (D2), which calls `router.push(href, { scroll: false })`: `push` adds one history entry and `scroll: false` keeps the position (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md`, "Disabling scroll to top"). Focus stays on the control that changed because the panel is not re-mounted by the navigation (the slot page re-renders with new props).
- Pagination keeps every other key: `EvaluationsList` passes the current `searchParams` record to `Pagination`'s `query` prop ("every key is kept and `page` is replaced", `Pagination.tsx`), so a value the parse dropped stays in the URL and in the pagination links until a change rewrites it, and is dropped again before every request. Rewriting the URL on load was rejected (extra machinery for a hand-edited URL that already renders as its empty state).

### D5. Applied chips and count

- `appliedEvaluationFilters(values, texts)` returns, in facet order, one `AppliedFilter` per applied value: Status ("Open"/"Closed" from the catalog), Score (one chip "{min}–{max}" built from the `scoreRange` text for the pair), Process (its value), City (its value). Each entry carries the facet label, the value label and the `FilterChanges` that remove only it (the score entry removes both bounds). `AppliedFilter` is the UI type of D11, the same shape `add-offering-facets` D11 defines (`facet`, `value`, `remove: FilterChanges`).
- The trigger count and the chips use the same list; the sort is never a chip and "Any" is never an entry.
- "Clear all" (panel and empty state) navigates to `clearFiltersHref(pathname, current, ["orderBy", "orderDirection"])`: summary §11 leaves keeping the sort to the architect, and *decided by the orchestrator under Product owner's delegation* it keeps the sort keys — the choice `add-offering-facets` already made for the parallel facet set.

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

- `EvaluationFacets` ("use client") receives `values` (D4), `options` (`processes: string[] | null`, `null` = unavailable) and `texts`. It renders the facet panel of `add-facet-controls` titled `filters.title`, with the chips of D5 and the four facets of the spec table, each wired to `navigate` with its key.
- Status: the radio list with `filters.any`, `filters.statusOpen` and `filters.statusClosed`; choosing one writes `status` (`open` or `closed`), "Any" removes it.
- Score: the score range with `filters.score` as the legend and `filters.scoreMin`/`filters.scoreMax` as the bound names, writing `[min, max]` per D4.
- Process: the radio list over `options` with `filters.process` as the legend and the "see more" threshold of the shared control; choosing one writes `process`, "Any" removes it. The options are `distinctCoffeeValues(coffees, "process")` over the read of D1, fetched once on the server in `EvaluationsSidebarScreen` and passed down.
- City: the text field labelled `filters.city` with help `filters.cityHelp`, writing `city`; an empty value removes the key.
- With `processes: null` the Process facet renders disabled with help `filters.optionsUnavailable` and the other facets, the sort and the list keep working (summary Open 9 (a)).
- The sidebar screen renders the existing `SidebarSeparator` (`@/shared/ui`) before the panel, so the separator of summary §6.1 sits between the management entries and the facet panel on this route only.
- Alternative considered: fetch the coffees in the client panel; rejected — the settled data-loading rule fetches public reads on the server, and a failed read must render a disabled facet, not a loading one.

### D8. Body toolbar

- `EvaluationsToolbar` ("use client") sits at the top of the list section, 2rem above the list (summary §6.4). Layout: a flex row that wraps, items aligned to the bottom, `gap-x-4 gap-y-3`, the trigger at the start and the sort field at the end (`justify-between`); no padding, border or radius; the sort field grows between 12rem and 16rem.
- `FiltersTrigger` (D2, shared) with the visible text `filters.trigger` or `filters.triggerWithCount` where `{count}` is the applied count (D5).
- Sort: `Field` with the visible label `filters.sortBy` and `Select` default variant, options of D6.

### D9. Evaluations list host states

- `EvaluationsListScreen` (async, thin) resolves `getMessages("evaluations", locale)` and `getMessages("filters", locale)`, computes `values = parseEvaluationFilters(searchParams)` and the applied list (D5), and renders `EvaluationsToolbar` (count, `values.sort`) above `EvaluationsList`, passing it `values`, `page`, `query` (the `searchParams` record, for `Pagination`), its texts, `resultCountText` (`evaluations.resultCount`) and — only when the applied list is not empty — `emptyAction`, a `ClearEvaluationFiltersButton` (`Button` `primary` with the text `filters.clearAll`) that this slice owns (features cannot import features, so it cannot reuse `add-offering-facets`' button of the same role).
- `EvaluationsList` (client, from `add-specialist-evaluations`) gains the `values`, `page`, `query`, `emptyAction` and `resultCountText` props and keeps its fetch, states, rows and delete. Its request query is `evaluationListQuery(values, page)` (D4), passed to `listMyEvaluations` (D1); when any of these props changes it reloads and shows its loading state while the facets keep their values. With `emptyAction` its empty state shows `filters.noMatches` and the action instead of its unfiltered empty message. `resultCountText` renders as a visually hidden `role="status"` (polite) element whose text fills the `{count}` placeholder with `meta.total` (0 in the empty state); the element stays mounted in every state of the list so a change is announced (the same risk `add-offering-facets` records for its host).
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

UI-specific types, declared in `src/features/evaluation-facets/model` before any component: `EvaluationFilterValues` (`status?: "open" | "closed"`, `scoreMin?: number`, `scoreMax?: number`, `process?: string`, `city?: string`, `sort: EvaluationSortId`), `EvaluationSortId` (`default`, `score-desc`, `score-asc`, `newest`, `oldest`) and `AppliedFilter` (`facet`, `value`, `remove: FilterChanges`, the shape of `add-offering-facets` D11). `FilterChanges` lives in `src/shared/lib/filter-query`. The named API aliases `CoffeeSummary` and `RoasterySummary` join `src/shared/api/index.ts` from `operations["listCoffees"]` and `operations["listRoasteries"]` (D2, shared with `add-offering-facets`). Nothing is derived from `listMyEvaluations` here: its `data` and `meta` types are `add-specialist-evaluations`' (`EvaluationItem`, `EvaluationPageMeta`) and this change consumes neither. `src/shared/api/schema.ts` is never edited.

## Risks / Trade-offs

1. **Parallel interfaces (D2)** → task 0.1 stops the apply on any difference and reports it; the architect updates these artifacts before apply continues.
2. **Shared pieces created by whichever facet change lands first (D2/D3)** → if both are applied on parallel branches the second merge conflicts on the same new files; the second build keeps the first one's files and adapts (the note `add-offering-facets` records).
3. **`listMyEvaluations` signature change (D1)** → its test's assertion is named in the task; the default request string stays `GET /user/evaluations?orderBy=created_at&orderDirection=desc&page={page}`, so only the call shape changes.
4. **Announcement across reloads (D9)** → the status element stays mounted in every state; a test asserts it does not unmount between loading and results.
5. **Dropped values persist in the URL and pagination links (D4)** → they render as the facet's empty state and never reach a request, which is the spec's stated behaviour; rewriting the URL on load is rejected.
6. **Duplicate host-side "Clear all" button (D9)** → `add-offering-facets` owns its own and FSD forbids feature-to-feature imports; reported to Product owner as a backlog candidate (a `ClearFiltersButton` in `src/shared/ui` would end the duplication). Not folded into this change.
7. **Status sort left out (D6)** → the contract accepts `orderBy=status` but its ordering is unverified and `tazavera-api` is unreadable in this session; Open 12's fallback (b) applies and adding it later touches D6 and two texts.
8. **`## Propose status` in the shared summary** → AGENTS.md has the architect record it in `design-summary.md`, and the only design summary for this part is the shared `docs/design/add-filter-controls/design-summary.md`, which the four parallel changes also touch. This change appends its own `## Propose status` section there (scoped to `add-evaluation-facets`) and includes it in the propose commit; if sibling branches append their own sections, Product owner reconciles them at merge.
9. **CORS (decisions log, "CORS de la API para el navegador")** → the evaluations list fetch is a browser call and shows the host's failure state until the API publishes its CORS configuration; this change's own reads run on the server and are unaffected.

## Migration Plan

None: the change adds a facet set and wires an existing list; it rolls back by reverting the merge. The apply starts only after `add-sidebar-slot`, `add-facet-controls` and `add-specialist-evaluations` are merged into `develop` and Product owner has merged `develop` into `feature/add-evaluation-facets`.
