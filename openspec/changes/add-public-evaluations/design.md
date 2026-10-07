# Design

## Context

See proposal.md for motivation. The settled product source is `docs/design/add-public-evaluations/design-summary.md` (Status: approved; every Open settled in its "Settled by the orchestrator" paragraph) and the decisions-log entries it cites; this document records how those end states are reached in code and settles only the single-component details the summary leaves free. Current state that shapes the approach:

- The contract (`contracts/openapi.yaml`, `92328fc`) documents `listEvaluations` (with `offeringId` and `evaluationType`), `getAnEvaluation`, `getAnOffering`, `listOlfactoryTaxonomies` and `listCoffees`, all public (`security: []`). `src/shared/api/schema.ts` is generated from it (`npm run types:api`) and is never edited.
- Since `290d22e`, the `deleteAnOffering` and `deleteMultipleOfferings` descriptions state that specialists' evaluations are kept without an offering, while the evaluation response schemas still type `offeringId` as a non-nullable string. The front treats `offeringId` as `string | null` (summary §2 "Assumption: `offeringId` may be null"; decisions log 2026-10-07; Product owner's artifact review of 2026-10-07).
- Of the dependency changes, `add-offering-catalog`, `add-sidebar-slot`, `add-facet-controls` and `add-specialist-evaluations` are merged into `develop` (and `develop` into this change's branch on 2026-10-07); `add-evaluation-facets` and `extract-clear-filters-button` (backlog R9, the shared `ClearFiltersButton`) are not merged yet. Every piece this change takes from them is listed in the summary §10 and verified by the merge gate (tasks 1.1).
- `src/shared/ui` holds on `develop` `Card` (`layout="default" | "stacked"`), `PageSection` (`surface="page" | "section"`), `Pagination` (`path`, `query`, `currentPage`, `lastPage`, texts), `Tabs`, `LabelValueRow`, `Link`, `Button`, `Badge`, `RetryButton`, the three read-only scales (`BeanScale`, `IntensitySlider`, `DescriptorChipGroup`), the facet controls (`FacetPanel`, `FacetRadioList`, `ScoreRangeFacet`, `FacetTextField`, `FilterChip`) and the sidebar primitives (`useSidebar`, `SIDEBAR_ID`, from `Sidebar.tsx`); `ClearFiltersButton` (`label`, `keep`) joins it with `extract-clear-filters-button`. No new shared component is created here (summary §4.3).
- FSD rules the composition relies on: a layer imports only from layers below, and no two slices of one layer import each other (AGENTS.md; `fsd-architecture`). This is why the provisional tab's panel is composed in `src/pages/offering-detail` and passed down as a slot.
- The shared pieces already on `develop`: `fetchTaxonomies`, `buildTaxonomyLookup` and the descriptor-row builder `buildDescriptorRows` (`model/descriptor-rows.ts`) in `src/entities/taxonomy`; `ratingTierFor` and `fetchOffering` in `src/entities/offering`; `fetchCoffees` and `distinctCoffeeValues` in `@/shared/api`; `src/shared/lib/filter-query` (`buildFilterHref`, `clearFiltersHref`, `useFilterNavigation`); the `@sidebar` route slot (`app/[locale]/@sidebar/`, with its `[...rest]` catch-all and `default.tsx`) and the `AppSidebar` frame in `src/widgets/app-sidebar`. Still to come: the facet parse/query/sort of `features/evaluation-facets` (`add-evaluation-facets`).
- `fetchOffering` had two drafted contracts (finding F2). The orchestrator closed it on the `add-specialist-evaluations` D1 contract, which is the shape on `develop`: `fetchOffering(ulid): Promise<OfferingResult>`, with `OfferingResult` = `{ status: "found"; offering }` \| `{ status: "not-found" }` \| `{ status: "failed" }` (`src/entities/offering/api/offering.ts`). This change adapts to that shape.

## Goals / Non-Goals

**Goals:**

- Three public surfaces (list, read-only view, offering detail delta) built entirely from existing controls and tokens, with every state (loading, empty, success, error) assertable in jsdom by class, role and attribute.
- One read-only evaluation presentation shared by the view and the provisional tab, fed only by the fields the contract returns.
- Deterministic requests: fixed `evaluationType`/`status` keys on the list, deterministic ordering of the baseline, no browser-side reads on these screens.

**Non-Goals:**

- No new shared UI component, no new semantic or primitive token, and no contrast pair to register, provided `add-offering-catalog` (D15) and `add-evaluation-scales` (D9) land first (summary §6).
- No `notFound()` on these routes: the API documents only `200` for the reads involved, so the catalog's rule applies (summary §2, `add-offering-catalog` design.md `getAnOffering` row).
- No change to the offering detail's Inventory data and Consensus tabs, and no fix for the Consensus score's contrast failure (finding F1, routed to `add-offering-catalog`'s architect).
- No flavor wheel, no header entry, no browser-side combobox over `GET /offerings` (summary Open 4, 7, 1).
- No change to the specialist "my evaluations" rendering beyond the row-card move of D6.

## Decisions

### D1 — Consumed API operations and error presentation

All reads run on the server with plain `fetch` against `NEXT_PUBLIC_API_URL` and no credential header (the contract attaches no security scheme; the settled rule of `src/entities/*/api`), throwing on any non-2xx or transport failure. No session is read on these screens, except by the offering detail's existing Evaluate link.

| operationId | Method and path | Auth | Request | Response (200) | Errors |
|---|---|---|---|---|---|
| `listEvaluations` | `GET /evaluations` | none (`security: []`) | query, in this key order: `offeringId` (ULID string), `evaluationType` (`"specialist"` \| `"baseline"`), `city`, `process`, `status`, `scoreMin`, `scoreMax` (numbers), `orderBy` (`"cupping_score"` \| `"created_at"` \| `"status"`), `orderDirection` (`"asc"` \| `"desc"`), `page` (number) | `data[]` of evaluation resources, `meta` (`current_page`, `last_page`) and `links` | only `200` is documented (gap F7); the front never adapts to an error body |
| `getAnEvaluation` | `GET /evaluations/{evaluation_ulid}` | none | path ULID | `data` of the evaluation resource | only `200` is documented; an unknown ULID's `404` is undocumented, so it lands in the generic error state |
| `getAnOffering` | `GET /offerings/{offering_ulid}` | none | path ULID | `data` of the offering resource (`coffeeInventory.coffee.name`, `location.name`, `coffeeInventory.roastery.name` are the fields read) | not-found and failure both map to the offering-unavailable fallback (D6, D8); never requested for a null `offeringId` |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | none | none | `data[]` of taxonomy nodes (`ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`) | a failure joins the host error state of the view or of the provisional panel |
| `listCoffees` | `GET /coffees` | none | `name` is accepted but not sent | `data[]` of coffees (`process` is the field read) | a failure disables the Process facet only (D7) |

The evaluation resource fields this change reads: `cuppingScore`, `closedAt`, `extractionMethod`, `isDefective`, `descriptive.{fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel}.{score, note}`, `affective.{the same seven, overall}.{score, note}`, `tastes[]` (`ref`, `type`), `extrinsics.{farming, processing, trading, certifications, generalObservation}`. Not shown: `ulid`, `offeringId`, `status`, `evaluationType`, `createdAt`; the roast level is not shown (it is not in the resource, and the offering's roast level is in the Inventory data tab).

**How each API error reaches the user** (summary §2 "Response states"):

| Failure | Presented as |
|---|---|
| The list request (any non-2xx, 422 included, or transport) | `listErrorMessage` with Retry in the list area; the facet values stay in the URL and in the controls |
| One row's `getAnOffering` | `offeringUnavailable` as that row's heading, no captions, no "View offering" link; other rows unaffected |
| A row with `offeringId: null` (not a failure: the offering was deleted) | no `getAnOffering`; the offering-missing text of the `evaluations` area (D3) as that row's heading, no captions, no "View offering" link; score, date and "View" stay; other rows unaffected |
| `getAnEvaluation` or `fetchTaxonomies` on the view | section 1 keeps the back link; section 2 shows `viewErrorMessage` with Retry |
| The view's `getAnOffering` | the `h1` shows `offeringUnavailable` with no captions and no "View offering" link; the presentation still renders |
| The view's evaluation with `offeringId: null` | no `getAnOffering`; the `h1` shows the offering-missing text with no captions and no "View offering" link; the back link and the presentation render as usual |
| The provisional panel's baseline request | `detailProvisionalError` with Retry inside the panel only (its own `Suspense` boundary); header and other tabs unaffected |
| The sidebar's `listCoffees` | the Process facet renders disabled with `filters.optionsUnavailable` |
| The sidebar's `getAnOffering` for the active `offeringId` | the Offering option and its chip read `offeringFilterFallback` |

### D2 — Derived and UI-specific types, declared before any component

No generated type is edited or redefined. Named API aliases follow the `src/shared/api/index.ts` pattern (built from `operations`, because `components.schemas` is `never`), and are declared before any component that consumes them; UI-specific types live in the slice that owns them, above the component (the `BeanScale.tsx` precedent). If `add-specialist-evaluations` already introduced an alias for the same shape, this change reuses it and adds nothing: one alias per shape.

`add-specialist-evaluations` ships on `develop`, in `src/shared/api/index.ts`, `EvaluationItem` (one item of `listMyEvaluations` `data`, with `offeringId` already narrowed to `string | null`) and `EvaluationPageMeta` (its `meta`), plus the block aliases `EvaluationDescriptive`, `EvaluationAffective`, `EvaluationExtrinsics` and `EvaluationTaste`; `src/entities/evaluation/api/user-evaluations.ts` exports `EvaluationPage` (`{ data: EvaluationItem[]; meta: EvaluationPageMeta }`). In the generated `schema.ts`, the `listEvaluations` item, the `getAnEvaluation` `data` and the `listMyEvaluations` item are the same type, and the two `meta` types are the same type (checked with `tsc` on 2026-10-07). So this change reuses `EvaluationItem` for both public reads (the list item and the single evaluation), `EvaluationPageMeta` for the list's `meta` and `EvaluationPage` for the list's result, and adds only the two request aliases below. The aliases drafted earlier as `EvaluationDetail` and `EvaluationsPageMeta` are not added (`EvaluationDetail` is also the name of a component in `src/pages/evaluation-form`).

```ts
// src/shared/api/index.ts (added beside the evaluation aliases)
/** The `evaluationType` values the contract accepts. */
export type EvaluationType = NonNullable<
  operations["listEvaluations"]["parameters"]["query"]["evaluationType"]
>;
/** The `orderBy` values the contract accepts. */
export type EvaluationSortField = NonNullable<
  operations["listEvaluations"]["parameters"]["query"]["orderBy"]
>;
```

```ts
// src/entities/evaluation/api (UI/request type, before the fetchers)
export type EvaluationsQuery = {
  offeringId?: string;
  evaluationType: EvaluationType;
  status?: "closed";
  scoreMin?: number;
  scoreMax?: number;
  process?: string;
  city?: string;
  orderBy?: EvaluationSortField;
  orderDirection?: "asc" | "desc";
  page?: number;
};
```

```ts
// src/features/evaluation-facets (public facet state, before its components)
export type PublicEvaluationFilters = {
  offeringId: string | null;
  scoreMin: number | null;
  scoreMax: number | null;
  process: string | null;
  city: string | null;
};
export type EvaluationFacetSet = "mine" | "public";
```

The `offeringId` narrowing is the single point where the front widens the generated type (summary §2 "Assumption"; decisions log 2026-10-07): `schema.ts` stays untouched, every consumer reads the nullable type through `EvaluationItem`, and no other file re-declares it. The narrowing is `add-specialist-evaluations`' (its correction round 2, point 2), already on `develop`; this change reuses it unchanged. When the contract adds `nullable: true` and the types are regenerated, the narrowing becomes redundant and is removed.

Widget prop types (`EvaluationRowCardProps`, `EvaluationSheetProps`, the async wrapper props) are declared above their components in their own files. The reads are `fetchEvaluations(query: EvaluationsQuery): Promise<EvaluationPage>` and `fetchEvaluation(ulid: string): Promise<EvaluationItem>` in `src/entities/evaluation/api` (a file beside `user-evaluations.ts`), both throwing on non-2xx, exported from the entity's `index.ts`.

### D3 — Messages and document metadata

Texts are props throughout; the catalogs are the message areas of `messages/{locale}/`:

- a new area `public-evaluations` (`messages/{locale}/public-evaluations.json`) with every key of summary §8 (`listEyebrow` … `offeringFilterFallback`, `metaDescription`), the MVC-cited Spanish strings as they stand and the rest as the approved proposals (Open 9, answered "the proposed texts stand");
- four additions to the `catalog` area owned by the offering detail: `detailViewEvaluations`, `detailTabProvisional`, `detailProvisionalEmpty`, `detailProvisionalError`;
- reused areas unchanged: `evaluations` (group, part and axis names, descriptor block names, LOW/MEDIUM/HIGH, "/15", the nine extraction labels, `closedOnLabel`, `resultCount`, and the offering-missing text `offeringMissingLabel` — es "Oferta inexistente", en "Offering no longer exists", ca "Oferta inexistent" — added by `add-specialist-evaluations` corrections.md Round 2 point 2, written `offeringMissing` in the summary), `scales` (bean `valueText`/`valueLabel`), `landing` (tier words, captions, pagination and retry labels), `filters` (facet, sort and chip texts, `clearAll` included).

Dependency: this change adds no key for the offering-missing text; it consumes `evaluations.offeringMissingLabel`, on `develop` since `add-specialist-evaluations`, which the merge gate (task 1.1) re-checks before any work. If it does not exist when this change is built, the build stops and reports instead of adding it.

The existing message guard (`src/shared/lib/i18n/catalog-guard.test.ts`) keeps es, en and ca key-identical in both areas. The document title is the catalog metadata rule of `add-offering-catalog` D17: `Tazavera` plus the `metaDescription` of `public-evaluations`.

### D4 — List query, URL and sort behaviour

- Parsing and query building extend `features/evaluation-facets` (D7): `add-evaluation-facets` D4 limits and dropped values, D6 sort ids with `default` → `created_at desc`, and the public set adds `offeringId` (any non-empty string, never validated by the front: an unknown ULID ends in the API's answer) and drops `status` from the facets.
- Fixed keys: the request always carries `evaluationType=specialist` and `status=closed`; URL values for those two keys are ignored. The query emits keys in the order of D1's table.
- URL writes go through `src/shared/lib/filter-query`: every facet or sort change removes `page` and pushes with `scroll: false`; pagination keeps every other key and replaces `page`.
- The provisional panel's request is `offeringId` + `evaluationType=baseline` + `orderBy=created_at` + `orderDirection=desc`, and the first item is shown (Open 6, answered a).
- Offerings per row: after the list returns, one `getAnOffering` per distinct non-null `offeringId` on the page, in parallel, on the server; a null `offeringId` is never requested and marks its row as offering-missing. The view runs `getAnEvaluation` first, then `getAnOffering(offeringId)` and `fetchTaxonomies()` in parallel; when `offeringId` is null it runs only `fetchTaxonomies()` and renders the offering-missing header.
- The provisional tab and the Offering facet are unaffected by null `offeringId`s: the baseline is deleted with its offering, and a deleted offering's ULID in the URL ends in `offeringFilterFallback` (summary §2 "Assumption").
- `closedAt` formats with `Intl.DateTimeFormat` in the route's locale, medium date style, no time (summary §7). The summary gives the row date of `add-specialist-evaluations` as its model, but the specialist row on `develop` shows the ISO date part (`YYYY-MM-DD`, in a `<time>`); the public format stays as settled and the specialist rendering is not changed (D6; see Risks). Taxonomy names follow the route's locale (`nameEs`, `nameEn`, `nameCa`). Taste notes map by `type` with `add-specialist-evaluations` D7; level 2 is not shown.

### D5 — Files, layers and entry points

| File | FSD layer | Change |
|---|---|---|
| `app/[locale]/evaluations/page.tsx` | app | new — passes `locale` and the raw `searchParams` to the list screen; no logic |
| `app/[locale]/evaluations/[ulid]/page.tsx` | app | new — passes `locale` and `ulid` to the view screen; no logic |
| `app/[locale]/@sidebar/evaluations/page.tsx` | app | new — the list's sidebar slot page (`add-sidebar-slot` D1); the view route falls to the slot's catch-all and has no sidebar |
| `src/pages/public-evaluations/` (`ui/ListScreen.tsx`, `ui/EvaluationsSidebar.tsx`, `ui/texts.ts`, `index.ts`) | pages | new — list screen (texts, heading block, toolbar, list in `Suspense`) and sidebar screen (texts, `listCoffees` read through `fetchCoffees`, `getAnOffering` read through `fetchOffering` for the active offering, parsing, `AppSidebar` frame with the facet panel) |
| `src/pages/public-evaluation/` (`ui/ViewScreen.tsx`, `ui/texts.ts`, `index.ts`) | pages | new — view screen (texts, two `PageSection`s, content in `Suspense`) |
| `src/widgets/public-evaluation-list/` (`ui/PublicEvaluationList.tsx`, `ui/EvaluationListPresentation.tsx`, `api/`, `index.ts`) | widgets | new — async fetch component (list plus offerings per row) and sync presentation, on the `Offerings`/`OfferingList` pattern |
| `src/widgets/evaluation-sheet/` (`ui/EvaluationSheet.tsx`, `ui/EvaluationSheetView.tsx`, `ui/EvaluationSheetBaseline.tsx`, `index.ts`) | widgets | new — the sync read-only presentation and its two async wrappers (view: `getAnEvaluation` + `getAnOffering` + `fetchTaxonomies`; baseline: `listEvaluations` + `fetchTaxonomies`) |
| `src/widgets/evaluation-row/` (`ui/EvaluationRowCard.tsx`, `index.ts`) | widgets | moved from `src/pages/evaluations-list/ui/EvaluationRowCard.tsx` (`add-specialist-evaluations`, on `develop`; Open 2, answered a) — optional status badge, actions slot (D6) |
| `src/pages/evaluations-list/` (`ui/EvaluationsList.tsx`, `ui/DeleteEvaluationAction.tsx`) | pages | modified — imports the card from `@/widgets/evaluation-row` and passes the specialist actions (Edit/View and `DeleteEvaluationAction`) through its actions slot (D6) |
| `src/features/evaluation-facets/` | features | modified (created by `add-evaluation-facets`) — `parseEvaluationFilters` gains `offeringId`, `EvaluationFacetSets` gains `"public"` (Offering, Score, Process, City), the query builder takes the fixed keys, `EvaluationFacets` renders the Offering facet (D7) |
| `src/entities/evaluation/api` | entities | holds `user-evaluations.ts` (`add-specialist-evaluations`); this change adds a file beside it with `EvaluationsQuery`, `fetchEvaluations(query)` and `fetchEvaluation(ulid)` over the public reads, exported from `src/entities/evaluation/index.ts` |
| `src/entities/evaluation/model` (`groups.ts`, `load.ts`) | entities | reused as shipped by `add-specialist-evaluations`, through the entity's `index.ts`: `EVALUATION_GROUPS` (group, part and axis order, descriptor blocks) and `formStateFromEvaluation`, whose `descriptors` carry the `tastes` → block mapping (its `SELECTION_BY_TYPE` map is internal) |
| `src/entities/offering/api` and `src/entities/offering/lib/rating.ts` | entities | reused — `fetchOffering` (returning `OfferingResult`, Context) and `ratingTierFor` |
| `src/entities/taxonomy` | entities | reused — `fetchTaxonomies`, `buildTaxonomyLookup` and the shared descriptor-row builder `buildDescriptorRows` of F3 (whose `ChipRow[]` output feeds the five blocks) |
| `src/widgets/offering-detail/` | widgets | modified — the header actions row in `ui/DetailHeader.tsx` (D9), `DetailTab` and `toDetailTab` in `lib/tab.ts` gain `"provisional"`, `ui/DetailTabs.tsx` takes a third panel slot beside `inventory` and `consensus`, and `ui/OfferingDetail.tsx` and `ui/OfferingDetailContent.tsx` pass it through |
| `src/pages/offering-detail/` | pages | modified — `ui/OfferingDetailScreen.tsx` passes the baseline wrapper of `evaluation-sheet` as the third panel slot (D9) |
| `src/shared/api/index.ts` | shared | modified — the two request aliases of D2 (`EvaluationType`, `EvaluationSortField`); `EvaluationItem` and `EvaluationPageMeta` reused unchanged |
| `messages/{locale}/public-evaluations.json` | message catalogs | new area (D3) |
| `messages/{locale}/catalog.json` | message catalogs | modified — the four detail keys (D3) |
| tests beside each file above | — | new/modified |

Slices are imported only through their `index.ts`; `shared` is imported by segment (`@/shared/ui`, `@/shared/api`, `@/shared/lib`). No file is added to the root `pages/` directory.

### D6 — The row card in `src/widgets/evaluation-row` (with card field mapping)

The public row is `add-specialist-evaluations`'s row card without the status badge and with public links. Per Open 2 (answered a, the `RetryButton` precedent of `add-offering-catalog` D4) the card moves, in this change, from `src/pages/evaluations-list` to the `src/widgets/evaluation-row` slice with an optional status badge and an actions slot; the specialist list keeps its rendering and its tests (only its import changes). The move has no visible change for `/manage/evaluations`.

The card on `develop` (`src/pages/evaluations-list/ui/EvaluationRowCard.tsx`, `"use client"`) renders the status badge in `CardContent`, the coffee name as an `h3`, the date as the ISO date part in a `<time>`, and in `CardFooter` the Edit/View `Button` (`router.push` to the form route) and `DeleteEvaluationAction`, a component of the same page slice whose texts type (`DeleteEvaluationTexts`) its `EvaluationRowTexts` extends. A widget cannot import a page slice, so after the move those two actions and their texts stay in `src/pages/evaluations-list` and reach the card through the actions slot; the specialist's heading level, date text and status badge stay as they render today, the public variant takes the values of the table below. How the card receives the per-variant values is the build's choice.

`Card layout="default"` field mapping (MVC `layouts/evaluations/partials/evaluation-card.blade.php` as reference):

| Card section | Content | API field |
|---|---|---|
| `CardAside` | the score row: `type-score` value, `type-meta` "/100", `Badge variant={ratingTierFor(cuppingScore)}` with the tier word; empty aside when the score is null | `cuppingScore` |
| `CardContent` | `h2` coffee name (`type-card-heading`); the date line (`type-meta`, "{closedOnLabel} {date}"); the coffeeshop caption and the roaster caption (`type-label`) | offering `coffeeInventory.coffee.name`; `closedAt`; offering `location.name`; offering `coffeeInventory.roastery.name` |
| `CardFooter` | the actions slot: "View" → `/{locale}/evaluations/{ulid}`, "View offering" → `/{locale}/offerings/{offeringId}`, each `Link` default with a visually hidden " {coffee name}"; the specialist variant keeps its own actions and may show the status badge | `ulid`; `offeringId` |

The date, "/100" and tier word come from the reused areas (D3). The offering fields reach the card as props from the list's per-row offering read; when that read failed the card takes an "unavailable" flag and renders `offeringUnavailable` as its heading with no captions and no "View offering" link (D1). When the row's `offeringId` is null, the card renders the offering-missing text (D3) the same way: same parts and spacing, no captions, no "View offering" link, score row, date line and "View" kept.

Link names (Open 12, answered a by Product owner's artifact review of 2026-10-07): on a row with an offering the hidden suffix is " {coffee name}"; on a row without a coffee name (offering-missing or offering-unavailable) the hidden suffix is " {row heading}, {closed date}", the date being the same formatted text as the row's date line and omitted with its comma when `closedAt` is null. Uniqueness is guaranteed only for rows with an offering.

### D7 — The public facet set in `features/evaluation-facets`

Open 3 (answered a): the facet code of the public list extends `add-evaluation-facets` rather than copying it, so `/manage/evaluations` behaviour is unchanged. Concretely: `parseEvaluationFilters` gains `offeringId` (non-empty string, trimmed; `page` reset rules unchanged), the query builder accepts the fixed keys `evaluationType=specialist` and `status=closed` and emits the D1 key order, `EvaluationFacetSets` gains `"public"` (Offering, Score, Process, City; no Status facet), and `EvaluationsToolbar` and the sort ids are reused unchanged.

The list's empty-state "Clear all" (backlog R9, resolved by `extract-clear-filters-button`) is the shared `ClearFiltersButton` from `@/shared/ui`, rendered in the public list's filtered empty state with `label={filters.clearAll}` and `keep={["orderBy", "orderDirection"]}`, the same props `add-evaluation-facets` passes on `/manage/evaluations`. Its behaviour is the `filtering` contract: every facet key and `page` leave the URL, the sort keys stay, and the URL is pushed with `scroll: false`. This change writes no "Clear all" button of its own and no `ClearEvaluationFiltersButton` exists to reuse.

The Offering facet is a `FacetRadioList` (Open 1, answered a) with "Any" and the active offering labelled "{coffee name} · {coffeeshop}", rendered only while `offeringId` is in the URL; the Score facet is `ScoreRangeFacet` 0–100 (`add-evaluation-facets` D4 rules), Process is a `FacetRadioList` over `distinctCoffeeValues(coffees, "process")` (`add-evaluation-facets` D7) and City is a `FacetTextField` of at most 90 characters with `filters.cityHelp`. The chips follow `add-evaluation-facets` D5, the Offering chip reading "Offering: {coffee name}" or `offeringFilterFallback` when its read failed. The controls live in the `FacetPanel` (`role="search"`, `add-facet-controls` D4) inside the `AppSidebar` frame with no `<nav>` and no separator (a public route has no entries); below `md` the panel opens full screen (`add-sidebar-slot` D3).

### D8 — `src/widgets/evaluation-sheet`, the read-only presentation (with card field mapping)

One presentation for the view and the provisional tab, in the Consensus-tab style (decisions log "estilo de la pestaña futura"; `add-offering-catalog` D12). The sync `EvaluationSheet` takes already-fetched data and texts; the two async wrappers (`EvaluationSheetView`, `EvaluationSheetBaseline`) own the reads of D1 and D4 and render it, each in its own `Suspense` boundary supplied by its host.

`Card layout="stacked"` field mapping (`CardContent` only, 1.5rem padding, 4px left `border-accent`, `rounded-container`, `shadow-lg`):

| Card | Content | API fields |
|---|---|---|
| Summary (`h2` `summaryHeading`) | header row (the `h2` and the score row: `type-score`, `type-meta` "/100", `Badge` tier word) over a `dl` of `LabelValueRow`s: Closed on (omitted when null), Extraction method (the `evaluations` catalog label for the nine values, raw value otherwise), Defective cup (Yes/No text) | `cuppingScore`, `closedAt`, `extractionMethod`, `isDefective` |
| Intensity (`h2` `intensityHeading`) | seven `IntensitySlider readOnly`, `valueText` "{v}/15", `valueLabel` "{v} de 15", `scaleLabels` LOW/MEDIUM/HIGH, label = axis name; a null score renders as 0 | `descriptive.*.score` |
| Preference (`h2` `preferenceHeading`) | eight `BeanScale readOnly size="responsive"`, `valueText` "{v}/9", `valueLabel` "{v} de 9"; a null score omits its scale | `affective.*.score` |
| Descriptors (`h2` `descriptorsHeading`) | five `DescriptorChipGroup readOnly` blocks (Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects) with `legend` = block name and `emptyText` `noDescriptors`; an unresolved `ref` renders no badge | `tastes[]` by `type` |
| Notes (`h2` `notesHeading`, only when a note is non-null) | one `dl`: `dt` "{Intensity or Preference} · {axis}", `dd` the note | `descriptive.*.note`, `affective.*.note` |
| Extrinsic attributes (`h2` `extrinsicsHeading`, only when a field is non-null) | one `dl`: `dt` the field label of `public-evaluations`, `dd` the value | `extrinsics.*` |

The descriptor rows come from the shared descriptor-row builder `buildDescriptorRows` of `src/entities/taxonomy` (F3; levels 0–1, `add-specialist-evaluations` D7), and the `tastes` → block mapping is `src/entities/evaluation/model`'s `load.ts`, read through `formStateFromEvaluation(…).descriptors` (D5). The score row sits on `surface-card` only (D10). Widget prop types are declared above the component (D2).

### D9 — Offering detail delta and the tab's composition

- The header actions row is the last child of the catalog's title group (the root of `DetailHeader`, which on `develop` renders the specialist-only Evaluate `Link` to `/{locale}/manage/evaluations/new?offering={ulid}` as its last child), 0.5rem below the last caption (the group's own gap): a wrapping flex row, 1rem apart both ways, start-aligned, holding "View evaluations" (`Link` default, Open 8 answered a) and then Evaluate (specialist only, unchanged). This replaces the catalog's standalone Evaluate placement at the same distance from the captions (summary §5.4).
- The third tab: `DetailTab` gains `"provisional"`, `detailTabProvisional` as its label, `?tab=provisional` in the URL, manual activation, and an absent or unknown `tab` value still opens `inventory` (`add-offering-catalog` D7). The third trigger follows the other two in the same flex row.
- Composition (settled; criterion B): `widgets/offering-detail` cannot import `widgets/evaluation-sheet` (FSD same-layer rule), so `src/pages/offering-detail` composes the baseline wrapper and passes it down as a `ReactNode` panel slot — the mechanism `DetailTabs` already uses for its panels (`add-offering-catalog` D7). No visible change and no new mechanism.
- The panel shows the `EvaluationSheet` of the newest baseline, `detailProvisionalEmpty` centred with no box, or `detailProvisionalError` with Retry, and two skeleton cards while loading (D1).

### D10 — Layout, tokens and contrast

Summary §5 (page sections, list, view, detail delta, `EvaluationSheet`, the 375px/1280px arithmetic and the ASCII mock-ups of §5.7) and §6 (tokens and measured contrast) are the end state; every value in them is final and the tasks assert them as written. Two consequences are design rules here:

- **No new token and no pair to register** (summary §6): every pair used is registered on `develop` or by `add-offering-catalog` D15 / `add-evaluation-scales` D9, which the merge gate guarantees. If this change were applied without the catalog, it would have to register those pairs itself (summary §6, last bullet) — ruled out by the gate.
- **The rating badge sits only on `surface-card`** (the row card's aside, the Summary card's header row), because `badge-text` on the rating tiers fails 4.5:1 on `surface-section` in the traditional theme (commercial 4.38, summary §6 measured). The skeleton bars, the `border-subtle` separators and the tab list's bottom edge are decorative and not gated.

### D11 — Accessibility and metadata

Summary §9 is the end state: one `h1` per route (`h2` per row and per card, `legend`s for the chip groups), unique link names via the visually hidden " {coffee name}" (" {row heading}, {closed date}" on a row without a coffee name, D6), read-only `meter`s with `aria-valuetext` whose value is also visible text, no state by colour alone (the tier word beside the score, Yes/No text for Defective cup, named chips), the facet and tab contracts of their capabilities, `focus-visible:focus-ring` on every interactive element (inside the sidebar it resolves to the inverse ring, `add-sidebar-slot` D8), and the document title of D3.

## Risks / Trade-offs

- [Contract gaps (F7): only `200` documented for the three reads; the descriptions claim an embedded offering while the resource carries only `offeringId`; `getAnEvaluation` returns open evaluations] → the front never adapts: every non-2xx goes to the error state of D1, the offering is always a second read per row or per view, and `status` other than closed renders the 404 page. Routed to Product owner for the Scribe annotations.
- [Schema gap: `offeringId` is typed non-nullable while the contract describes evaluations kept without an offering] → the front narrows the type once at the D2 aliases and never edits `schema.ts`; the narrowing is removed when the contract adds `nullable: true`.
- [An unknown ULID's `404` is undocumented] → no `notFound()` (the catalog's rule); the unknown ULID lands in the error state with Retry. Revisit only if Scribe documents the 404.
- [Baseline uniqueness is guaranteed only by the API seeder] → the panel sends `orderBy=created_at&orderDirection=desc` and shows the first item (Open 6 answered a), so several baselines still render deterministically (the newest).
- [`src/entities/evaluation/model` exports] → verified on `develop` (2026-10-07): `EVALUATION_GROUPS` (`groups.ts`) and `formStateFromEvaluation` (`load.ts`, whose `descriptors` carry the `tastes` mapping) through the entity's `index.ts`; task 1.1 re-checks them and stops to report if they changed.
- [Row date format: the summary (§7) models the public `Intl.DateTimeFormat` medium date on the specialist row, which on `develop` shows the ISO date part] → the public row and view keep the settled `Intl` format and the specialist rendering is not changed, so the two lists show dates differently. Reported to Product owner as an open question; any alignment is a correction, not part of this update.
- [Two `fetchOffering` contracts (F2)] → closed by the orchestrator (decisions log, "add-public-evaluations aprobado y piezas compartidas"): one function on the `add-specialist-evaluations` D1 contract (found / not-found / failed); this change consumes that shape and maps not-found and failed to the `offeringUnavailable` fallback of D6/D8.
- [Descriptor-row builder duplication (F3)] → the first change that applies it leaves it in `src/entities/taxonomy` and the others reuse it (the same orchestrator entry); this change consumes it and never copies it. The candidate is reported to Product owner for `docs/backlog.md` (entries are Product owner's to add).
- [R9 ("Clear all" duplicated)] → resolved by `extract-clear-filters-button`: this change renders the shared `ClearFiltersButton` from `@/shared/ui` with `keep={["orderBy", "orderDirection"]}` (D7) and writes no copy. Its apply waits for that change on `develop` (task 1.1).
- [The `add-flavor-wheel` summary still records this change as withdrawn (F5)] → semantic drift only; no wheel is consumed here (Open 4 answered a). Routed to the orchestrator.

## Migration Plan

None. The change is additive and lands after the merge gate of task 1.1; rollback is reverting the change's commits, which leaves the six dependency changes intact.
