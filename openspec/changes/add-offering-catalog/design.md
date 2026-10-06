# Design

## Context

See `proposal.md` for motivation. What shapes the approach:

- The two routes are already addressed by merged code: `src/widgets/app-header/ui/PrimaryNav.tsx` (the "Top rated" entry → `/{locale}/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc`) and `src/entities/offering/ui/OfferingCard.tsx` (the View link → `/{locale}/offerings/{ulid}`). Both 404 today.
- Everything the screens reuse is merged on `develop`: `PageSection` (the D14 page layout), `Pagination` (`path` + `query`), `Card` (`layout="stacked"`), `Badge`, `Link variant="back"`, `Button`, `OfferingSkeletonCard`, `OFFERING_GRID_CLASSES`, `ratingTierFor`, and `src/entities/taxonomy` (`fetchTaxonomies`, `buildTaxonomyLookup`).
- Three merged or parallel changes supply the parts this change must not rebuild: `add-evaluation-scales` (the read-only `BeanScale` and `DescriptorChipGroup`), `replace-offering-card-session` (the offering card's `actions` slot, filled by the `offering-list` widget), and `add-flavor-wheel` (the `FlavorWheel` sunburst). All three are apply dependencies (tasks.md §0).
- The design summary (`docs/design/add-offering-catalog/design-summary.md`) and the decisions log settle the product decisions. The latest decisions replace the summary's §6.3 card grid with two tabs ("Inventory data", "Consensus"), remove the score from the detail header, replace the tree cards with the flavor wheel, and add the consensus legend beside the Defects and Main tastes cards. Where this document and the summary differ, the newer decisions and this document govern.
- All reads are public, so all fetch on the server with plain `fetch` against `NEXT_PUBLIC_API_URL` and no credential header (the settled fetching rule, `fetchVerifiedOfferings`' pattern). No session module is read: the screens receive `Session` as a prop, as `HomeScreen` does today.

## Goals / Non-Goals

**Goals:**

- One thin async fetch component and one sync presentation per screen, so every branch is unit-testable (the project's testing rule).
- No new dependency and no new token: the tabs build on `@radix-ui/react-tabs` (1.1.21, inside the installed `radix-ui` package), and every colour, radius and type style is an existing semantic token.
- The single-offering fetch and the retry action live where later changes (`add-public-evaluations`, `add-specialist-evaluations`) can reuse them, instead of inside a widget they cannot import.

**Non-Goals:**

- No client-side data fetching and no session module: only `props` cross the client boundary.
- No flavour-wheel internals here (its rings, segments and interaction are `add-flavor-wheel`'s design); this change only feeds it.
- No change to landing's list behaviour, its classes or its tests.

## API consumed

| operationId | Method and path | Auth | Request | Response | Errors |
|---|---|---|---|---|---|
| `listOfferings` | `GET /offerings` | none (public) | Query only: the 41 names the contract declares for this operation (`coffeeName`, `roasteryName`, `originCountry`, `originRegion`, `process`, `producer`, `variety`, `city`, `coffeeshopUlid`, `locationUlid`, `verified`, `cuppingAvgMin`, `cuppingAvgMax`, `evaluationCountMin`, `evaluationCountMax`, `defectiveCountMin`, `defectiveCountMax`, the sixteen `fragranceMin`…`overallMax` bounds, `cataRef`, `fragranceCata`, `aromaCata`, `flavorCata`, `aftertasteCata`, `mouthfeelCata`, `orderBy`, `orderDirection`) plus `page`, which the contract does not declare but the pagination links use | 200: `data[]` (offering summaries) with `links` and `meta` (`current_page`, `last_page`, `per_page`, `total`) | Non-2xx or transport failure → the catalog's one error state (below). The contract documents no 422 for this operation; an invalid filter value ends in the same error state. |
| `getAnOffering` | `GET /offerings/{offering_ulid}` | none (public) | Path: `offering_ulid` | 200: `data` — `ulid`, `evaluationCount`, `defectiveEvaluationCount`, `cuppingAvg`, the eight `*AffectiveAvg`, `concordanceAffective`, `concordanceDescriptive`, `verificationStatus`, `location` (`ulid`, `name`, `description`, `latitud`, `longitud`), `coffeeInventory` (`ulid`, `roastLot`, `productionDate`, `coffee` with `ulid`, `name`, `roastLevel`, `process`, `variety`, `producer`, `country`, `region`, `altitude`, `lot`, `roastery` with `ulid`, `name`, `description`), `sensoryTaxonomy[]` and `cataConcordance[]` (trees of `ref`, `type`, `level`, `count`, `children`) | Only `200` is documented. Any non-2xx — an unknown ulid's `404` included (route model binding, undocumented) — or transport failure → the detail's one error state (below). `notFound()` is not used: this invents no error format the contract does not state. |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | none (public) | none | 200: `data[]` taxonomy nodes (`ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `children`) | Failure of either detail request (or of this one on the catalog) → the screen's one error state, as on landing: one `error` result for a failure of either read. |

**How errors reach the user.** No API error body is shown anywhere. The fetch layer throws on any non-2xx status or transport failure; the presentation maps every failure into one error state per screen — catalog: the centered message with the retry action (`RetryButton`, `router.refresh()`); detail: the back link and, below it, the message with the retry action. Loading (skeletons) and, on the catalog, the centered empty message cover the other states.

## Derived types (declared before any component)

In `src/shared/api/index.ts`, derived from the generated `operations` types (`schema.ts` is never edited):

- `OfferingDetail` — `NonNullable<operations["getAnOffering"]["responses"][200]["content"]["application/json"]["data"]>`: the detail payload shown by both tabs.
- The existing `OfferingSummary`, `OfferingsPageMeta`, `OfferingTaxonomyNode`, `TaxonomyNode`, `Session` are reused; `OfferingTaxonomyNode` types both trees (`sensoryTaxonomy` and `cataConcordance` share one node shape).

UI-specific types, declared in the module that uses them (the house rule, type before component):

- `src/widgets/offering-list/lib/query.ts`: `OfferingsQuery = Record<string, string | string[] | undefined>` (Next's `searchParams` shape).
- `src/widgets/offering-list/api/offerings.ts`: `OfferingsPayload` (the existing `VerifiedOfferingsPayload` shape: `data` + `meta`), reused by both fetches.
- `src/widgets/offering-detail/ui/*`: `DetailTab = "inventory" | "consensus"`, `OfferingDetailTexts`, `InventoryRow`, `ConcordanceBand = "low" | "moderate" | "high" | "excellent"`, `ConsensusLegendEntry = { label: string; count: number }`, `ChipRow` (the `DescriptorChipGroup` row shape of `add-evaluation-scales`).
- `src/shared/ui/LabelValueRow.tsx`: `LabelValueRowProps = { label: ReactNode; value: ReactNode }`.
- `src/shared/ui/Tabs.tsx`: `TabsProps` (controlled `value: string`, `onValueChange`), re-exporting the trigger/list/content parts.

## Decisions

**D1 — One query pass-through function feeds the request and the pagination.** `buildOfferingsQuery(searchParams)` (`src/widgets/offering-list/lib/query.ts`) keeps only the contract's `listOfferings` names plus `page`, preserving repeated keys, and drops everything else (spec "Catalog query pass-through"). The same returned record builds the request URL in `fetchOfferings(query)` and fills `Pagination`'s `query` prop, so the address and the request can never disagree. No front-end validation: a value the API rejects ends in the error state. Alternative (a filter per key at each call site) was dropped: two copies of the name list, and the pagination could keep a key the request drops.

**D2 — The offerings fetch is generalized in place; landing delegates to it.** `fetchOfferings(query: OfferingsQuery)` joins `fetchVerifiedOfferings` in `src/widgets/offering-list/api/offerings.ts`, and `fetchVerifiedOfferings(page)` becomes a one-line call of `fetchOfferings({ verified: "1", page: String(page) })`, keeping its name, payload type and tests. The catalog's async component (`Offerings`) calls `fetchOfferings(query)` with the URL's query and never forces `verified` (decisions log, "petición de ofertas con query"). Alternative (renaming the fetch and touching landing's tests) was dropped: the settled answer keeps landing's behaviour and tests.

**D3 — The single-offering fetch lives in `src/entities/offering/api/offering.ts`.** `fetchOffering(ulid: string): Promise<OfferingDetail>` follows `fetchTaxonomies`' placement (a read owned by the entity that owns the resource), so `add-public-evaluations` and `add-specialist-evaluations` reuse it instead of copying it (its Open 7 (a), explicitly passed to this propose). The alternative (inside `src/widgets/offering-detail/api/`) is unreachable from another widget (same-layer rule).

**D4 — `RetryButton` moves to `src/shared/ui`.** The retry action (`Button` + `router.refresh()`) is business-agnostic and the new detail widget cannot import it from `src/widgets/offering-list` (same-layer rule). It moves to `src/shared/ui/RetryButton.tsx` with its test and its export; the widget imports it from `@/shared/ui` and keeps re-exporting it, so `OfferingList` and landing's tests are untouched (its Open 8 (a): "the first change that needs it outside landing moves it").

**D5 — `LabelValueRow` (`src/shared/ui/LabelValueRow.tsx`) is one definition row.** It renders one `<div>` row wrapping a `<dt>` and a `<dd>`, so a consumer wraps its rows in one `<dl>` and keeps native semantics (spec "Description semantics"). Layout (design summary §6.3): `flex flex-wrap items-baseline justify-between gap-4` — the term (`type-label`) at the start, the value (`type-body`) at the end, at least 1rem apart, the value wrapping below the term when the row is too narrow. No margin, padding, border or radius: the consumer's grid spaces the rows (`grid gap-x-6 gap-y-3 md:grid-cols-2`, summary §6.3: 0.75rem between rows, 1.5rem between columns). Server component (no hook, no handler). Alternative (the row rendering its own `<dl>`) was dropped: it breaks the two-column row grid and the one-list semantics.

**D6 — `Tabs` (`src/shared/ui/Tabs.tsx`) is the shadcn tabs composition on Radix, rewired to tokens** (`@radix-ui/react-tabs` 1.1.21 inside the installed `radix-ui` package — verified in `node_modules/radix-ui/package.json`; no new dependency, and the `Sheet`/`Sidebar` precedent). It is a controlled `"use client"` composition — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` with `value` / `onValueChange` — and uses `activationMode="manual"`: the arrow keys move the focus along the triggers and only Enter or Space selects (spec "Arrow keys move the focus only"), because in this project a selection is also a navigation (D7) and automatic activation would fire one navigation per arrow press. Presentation, on `surface-section`: the list is a flex row with a 1px `border-subtle` bottom edge (decorative); each trigger is `type-label`, `text-secondary`, padding `0.5rem 0.75rem`, min height 2.5rem, with `focus-visible:focus-ring`; the selected trigger adds `text-primary` and a 2px `border-accent` bottom edge on the list's edge; panels render 1.5rem below the list. The selected state never rests on colour alone (`aria-selected` and the border weight carry it).

**D7 — The tab value lives in the URL and `DetailTabs` owns the navigation.** `src/widgets/offering-detail/ui/DetailTabs.tsx` is the client boundary: it receives `active: DetailTab`, `locale`, `ulid`, the two tab labels and two `ReactNode` slots (the panels' server-rendered content), composes the shared `Tabs`, and its `onValueChange` pushes `/{locale}/offerings/{ulid}?tab={value}` through `useRouter` (as `Pagination` does). Values are `inventory` (the default: absent or unrecognized `tab` shows it) and `consensus`; `tab` is the only query key the detail reads. The route passes the raw `tab` value to the screen, which maps it to a `DetailTab`. Panels stay server content passed as slots, so the client boundary holds no display logic (the `client-boundary` guard).

**D8 — Composition (FSD).** Routes only pass params and search params (the root `app/[locale]/page.tsx` pattern). `OfferingsScreen` loads the `catalog` texts and renders the heading block, the toolbar slot and the list in `Suspense`; `OfferingDetailScreen` loads the texts and renders the detail block in `Suspense`. `src/widgets/offering-list` gains the query-driven `Offerings` (async) beside `VerifiedOfferings`; `src/widgets/offering-detail` holds `OfferingDetail` (async: `fetchOffering` + `fetchTaxonomies`, one `error` result for a failure of either), `OfferingDetailContent` (sync: header + tabs with both panels), `DetailTabs` (client), `DetailHeader`, `InventoryPanel` and `ConsensusPanel` (sync). Everything else is a Server Component.

**D9 — Header and loading/error presentation** (design summary §2, §6.3, updated for the tab decision):
- Header block (on `surface-page`, below the back link, 1.5rem apart): a flex column with the status badge, the `h1` coffee name, the coffeeshop caption and the roaster caption (`type-label`, "Coffeeshop: {location.name}", "Roaster: {coffeeInventory.roastery.name}", landing's caption keys) 0.5rem apart; the Evaluate link (`Link`, default variant, `/{locale}/manage/evaluations/new?offering={ulid}`, landing's `cardEvaluateLabel`) 0.5rem below the last caption, only for a signed-in specialist (`session.state === "authenticated" && session.user.role === "specialist"`, the check `replace-offering-card-session` moves into the widget). No score in the header (the newest decision).
- The tabs render in section 2 (`surface-section`) inside one `PageSection surface="section"`; the panels hold the cards of D11–D13.
- Detail loading: the back link and three placeholder bars in the header's place (1rem tall at a quarter width, 1.5rem at two thirds, 1rem at half; `bg-surface-section`, `rounded-field`, `OfferingSkeletonCard`'s placeholder classes) and two skeleton cards in the tabs' place. Detail error: the back link, then 1.5rem below, the message (`type-body`) and `RetryButton` in a column 1rem apart. Catalog loading: three `OfferingSkeletonCard`s in `CATALOG_GRID_CLASSES` (D10); empty: the centered message; error: the message and `RetryButton` in a centered column 1rem apart (`OfferingList`'s existing branches).

**D10 — The catalog grid measures its own region (CSS container queries).** The settled decision (add-filter-controls Open 14 (a), decided here) is columns by available width, so the sidebar that `add-offering-facets` brings later narrows the columns instead of squeezing the cards. The results region (`OfferingList`'s block root, and the skeleton fallback's wrapper) carries `@container`, and the grid classes are `grid grid-cols-1 gap-6 @min-[768px]:grid-cols-2 @min-[1280px]:grid-cols-3` (`CATALOG_GRID_CLASSES` in `src/widgets/offering-list/lib/grid.ts`), a CSS container variant (Tailwind 4 built-in; a container cannot query itself, hence the wrapper). Landing keeps `OFFERING_GRID_CLASSES` (viewport variants) unchanged, because its spec pins "one column below 768px, two from 768px and three from 1280px" to the viewport. `OfferingList` gains optional `path`, `query` and `gridClassName` props, defaulting to landing's values (`/${locale}`, none, `OFFERING_GRID_CLASSES`), so landing's render and tests are untouched; the catalog passes `/{locale}/offerings`, the kept query and `CATALOG_GRID_CLASSES`.

**D11 — Inventory data panel** (one `Card layout="stacked"`, `CardContent` only, `h2` `detailInventoryHeading`): a `<dl>` of `LabelValueRow`s in the grid of D5 (two columns from `md`, the card spans the panel). Rows in the settled order, one per non-null value (spec "Inventory data tab"):

| Row label key | API field |
|---|---|
| `fieldRoastLot` | `coffeeInventory.roastLot` |
| `fieldProductionDate` | `coffeeInventory.productionDate` |
| `fieldCountry` | `coffeeInventory.coffee.country` |
| `fieldRegion` | `coffeeInventory.coffee.region` |
| `fieldProducer` | `coffeeInventory.coffee.producer` (nullable: the row is omitted) |
| `fieldVariety` | `coffeeInventory.coffee.variety` |
| `fieldProcess` | `coffeeInventory.coffee.process` |
| `fieldAltitude` | `coffeeInventory.coffee.altitude` |
| `fieldCoffeeLot` | `coffeeInventory.coffee.lot` |
| `fieldRoastLevel` | `coffeeInventory.coffee.roastLevel` |
| `fieldRoastery` | `coffeeInventory.roastery.name` (name only: no `description`) |
| `fieldCoffeeshop` | `location.name` (name only: no `description`, `latitud`, `longitud` or `ulid`) |

Values render as the API returns them, `type-body`; labels are `type-label` (the `LabelValueRow`'s own).

**D12 — Consensus panel.** The panel is the card grid of design summary §6.3 (one column below `lg`, two equal columns from `lg`, 1.5rem gap, cards of a row stretched), with the blocks in the settled order. Card field mapping (the shared-card rule):

| Block | Card and content | API field(s) |
|---|---|---|
| Score (above the grid, full width, no box) | the card's score composition: `type-score` value, `type-meta` "/100", `Badge variant={ratingTierFor(cuppingAvg)}` with the tier word (landing's four `cardRating*Label` keys) | `cuppingAvg` — rendered only when `verificationStatus === "verified"` and `ratingTierFor` returns a tier |
| SCA attributes (`h2` `detailAttributesHeading`, spans both columns) | eight `BeanScale readOnly` (`size="responsive"`), one per attribute, 1.5rem apart in a `<dl>`-less flex column | `fragranceAffectiveAvg`, `aromaAffectiveAvg`, `flavorAffectiveAvg`, `aftertasteAffectiveAvg`, `acidityAffectiveAvg`, `sweetnessAffectiveAvg`, `mouthfeelAffectiveAvg`, `overallAffectiveAvg`; labels `attrFragrance`…`attrOverall` |
| Status and consensus (`h2` `detailStatusHeading`) | a `<dl>` of `LabelValueRow`s (D5's grid): Total, Defective, Affective concordance, Descriptive concordance | `evaluationCount`, `defectiveEvaluationCount`, `concordanceAffective`, `concordanceDescriptive`; labels `fieldEvaluationCount`, `fieldDefectiveCount`, `fieldConcordanceAffective`, `fieldConcordanceDescriptive` |
| Main tastes (`h2` `detailMainTastesHeading`, spans both columns) | `DescriptorChipGroup readOnly` + its consensus legend beside the card (D13) | the `sensoryTaxonomy` nodes of type `main_tastes` |
| Defects (`h2` `detailDefectsHeading`, spans both columns) | `DescriptorChipGroup readOnly` + its consensus legend beside the card (D13) | the `sensoryTaxonomy` nodes of type `defects` |
| Sensory tree (`h2` `detailSensoryHeading`) | `FlavorWheel` (D14) | `sensoryTaxonomy` |
| CATA tree (`h2` `detailCataHeading`) | `FlavorWheel` (D14) | `cataConcordance` |

Each card is `Card layout="stacked"` with `CardContent` only (1.5rem padding, 4px left `border-accent`, `rounded-container`, `shadow-lg`), the `h2` (`type-subheading`) and its content 1rem apart (summary §6.3). The SCA scale values parse the decimal string (`"7.2"` → `7.2`); `valueText` is `{value}/9` and `valueLabel` `{value} de 9` / `{value} of 9` from the shared `scales` area (D16), the value formatted with one decimal in the route's locale (`Intl.NumberFormat`), matching the settled `valueLabel` example "7,2 de 9". A missing average omits its scale. The concordance rows show the API's value string as text and the band word beside it (`flex` row, 0.5rem apart, wrapping): `concordanceBand(v)` parses the 0–1 string — `v < 0.50` → `low`, `v < 0.75` → `moderate`, `v < 0.90` → `high`, else `excellent` — and the words come from `concordanceLow/Moderate/High/Excellent` (es Baja/Moderada/Alta/Excelente, the decisions log). Band boundaries: 0.50 → Moderate, 0.75 → High, 0.90 → Excellent (spec "Band boundaries"). Neither the band nor the score ever rests on colour alone (the word and the value are text).

**D13 — Defects and Main tastes selections and their consensus legends.** Each block spans both columns and renders a flex row from `md` — the card (`flex-1`) and its consensus legend beside it, 1.5rem apart — stacking with 1rem between them below `md`. Inside the card, `DescriptorChipGroup readOnly` (`add-evaluation-scales`) renders only the identified notes as taxonomy badges: its `rows` are built from the `main_tastes` / `defects` category of `GET /taxonomies` with the settled descriptor rule (a level-0 node with level-1 children in the category heads one row whose chips are those children; a childless level-0 node joins the shared row; level 2 is not shown), and `value` is the set of `ref`s identified in the offering's `sensoryTaxonomy` of that `type` (its own `children` included); an unresolved `ref` renders no badge; `emptyText` receives `detailTasteEmpty`. The control's `legend` receives the block name (its `fieldset` contract) and the card's `h2` carries the same name — the repeated name is accepted, because the selector's accessibility contract requires its own legend. The consensus legend beside the card is one `type-meta` line per identified note, in card order: `{name} {count}/{total}` with `name` from `buildTaxonomyLookup`, `count` the node's `count` and `total` the offering's `evaluationCount` (the same `n/total` reading as the wheel's segment legends); it renders nothing when the group is empty. (This legend's exact content is the one detail the newest decision states by name without spelling out; Open Questions.)

**D14 — The two trees render through `FlavorWheel`.** One `FlavorWheel` per tree inside its card, called as `<FlavorWheel tree={taxonomies.data} counts={counts} total={total} texts={texts} />` — the interface the orchestrator supplied (`<FlavorWheel tree counts total texts />`): `tree` the taxonomy tree of `GET /taxonomies`, `counts` a `Record<string, number>` of `ref` → `count` built from the offering's tree (each node and descendant contributing its own entry), `total` the offering's `evaluationCount`, and `texts` the `catalog` strings the wheel needs (its legend and description presentation are the wheel's own). Segment legend `n/total` and the hover/focus description of the olfactory taxonomy are the wheel's behaviour (its own spec, `add-flavor-wheel`); this change feeds it and states the two blocks' empty text (`detailTasteEmpty`, when the tree is `[]`). If `add-flavor-wheel`'s final prop names differ from the supplied sketch, only this call site adapts (Risks).

**D15 — Contrast pairs registered by this change** (`src/app/styles/theme-tokens.test.ts`, both theme matrices), design summary §5 plus the pairs the tab decision adds:

| Pair | Kind | Traditional | Dark | Source |
|---|---|---|---|---|
| `text-secondary` / `surface-card` | text | 6.05 | 7.93 | summary §5 *(measured)* |
| `text-label` / `surface-card` | text | 5.97 | 9.51 | summary §5 *(measured)* |
| `text-link` / `surface-page` | text | 6.41 | 14.28 | summary §5 *(measured)* |
| `text-link-hover` / `surface-page` | text | 11.53 | 15.93 | summary §5 *(measured)* |
| `badge-text` / `evaluation-rating-exceptional`, `-excellent`, `-good`, `-commercial` | text | 4.85 / 5.04 / 5.12 / 4.69 | 6.61 / 6.48 / 6.42 / 7.08 | summary F1 + Open 10 (a) *(measured)* |
| `text-label` / `surface-section` | text | ≥ 5.32 | ≥ 8.61 | tab labels and legends on the section surface; `add-evaluation-scales` §4 *(measured range)* |

The read-only scale and chip controls bring their own registrations (`add-evaluation-scales` §4); nothing already registered is repeated.

**D16 — Texts.** A new `catalog` area (`messages/{locale}/catalog.json`, es / en / ca) holds these screens' own texts; the card, pagination and retry labels keep coming from the `landing` area (summary Open 3 (a)), and the bean value texts go in the shared `scales` area (its Open 9 (b): `beanValue` `{value}/9`, `beanValueLabel` es/ca `{value} de 9`, en `{value} of 9`) — added here only if `add-evaluation-scales`' consumers have not added them first. The `catalog` keys are those of summary §7 (`listEyebrow`, `listHeading`, `listEmptyMessage`, `listErrorMessage`, `metaDescription`; `detailBackLabel`, `detailStatusHeading`, `detailAttributesHeading`, `detailTasteEmpty`, `detailErrorMessage`; `fieldCountry`, `fieldRegion`, `fieldProducer`, `fieldVariety`, `fieldProcess`, `fieldAltitude`, `fieldCoffeeLot`, `fieldRoastLot`, `fieldProductionDate`, `fieldRoastLevel`, `fieldEvaluationCount`, `fieldDefectiveCount`, `fieldConcordanceAffective`, `fieldConcordanceDescriptive`, `attrFragrance` … `attrOverall`) plus the keys the tab decision adds: `detailTabInventory` (es "Datos del inventario", en "Inventory data", ca "Dades de l'inventari"), `detailTabConsensus` ("Consenso" / "Consensus" / "Consens"), `detailInventoryHeading` ("Inventario" / "Inventory" / "Inventari"), `detailMainTastesHeading` ("Sabores principales" / "Main tastes" / "Sabors principals"), `detailDefectsHeading` ("Defectos" / "Defects" / "Defectes"), `detailSensoryHeading` ("Perfil sensorial" / "Sensory profile" / "Perfil sensorial"), `detailCataHeading` ("Concordancia CATA" / "CATA concordance" / "Concordança CATA"), `concordanceLow` ("Baja" / "Low" / "Baixa"), `concordanceModerate` ("Moderada" / "Moderate" / "Moderada"), `concordanceHigh` ("Alta" / "High" / "Alta"), `concordanceExcellent` ("Excelente" / "Excellent" / "Excelent"), `fieldRoastery` ("Tostadora" / "Roastery" / "Torradora"), `fieldCoffeeshop` ("Cafetería" / "Coffeeshop" / "Cafeteria"). The summary's `detailOriginHeading` and `detailLotHeading` are dropped (the tab holds one flat list) and `detailTasteHeading` is replaced by the two tree headings. Every English and Catalan string is a proposal (summary Open 14). The existing `catalog-guard` covers the three locales' key sets.

**D17 — Document metadata.** Both routes render `Tazavera` as the document title and `catalog.metaDescription` as the description (summary Open 12 (a), the landing metadata rule). Mechanism: the title already comes from `app/layout.tsx`'s `generateMetadata` (merged code, unchanged), and each new route file exports its own `generateMetadata` returning the description from the `catalog` area of its `params` locale — metadata, not screen logic, so the routes stay logic-free.

## Files touched (full path and FSD layer)

| File | Layer | Change |
|---|---|---|
| `app/[locale]/offerings/page.tsx` | app | New route: passes `locale` and the raw `searchParams` to `OfferingsScreen` |
| `app/[locale]/offerings/[ulid]/page.tsx` | app | New route: passes `locale`, `ulid` and the raw `tab` search param to `OfferingDetailScreen` |
| `src/pages/offerings/ui/OfferingsScreen.tsx`, `OfferingsScreen.test.tsx`, `index.ts` | pages | New screen: texts, heading block, toolbar slot, `Suspense` around the list |
| `src/pages/offering-detail/ui/OfferingDetailScreen.tsx`, `OfferingDetailScreen.test.tsx`, `index.ts` | pages | New screen: texts, `Suspense` around the detail block |
| `src/widgets/offering-list/api/offerings.ts`, `offerings.test.ts` | widgets | `fetchOfferings(query)` added; `fetchVerifiedOfferings` delegates (D2) |
| `src/widgets/offering-list/lib/query.ts`, `query.test.ts` | widgets | New `buildOfferingsQuery` (D1) |
| `src/widgets/offering-list/lib/grid.ts` | widgets | `CATALOG_GRID_CLASSES` added (D10) |
| `src/widgets/offering-list/ui/VerifiedOfferings.tsx` | widgets | Delegates to the new `Offerings` with `verified=1` |
| `src/widgets/offering-list/ui/Offerings.tsx` | widgets | New async fetch component for a query (D2) |
| `src/widgets/offering-list/ui/OfferingList.tsx`, `OfferingList.test.tsx` | widgets | `path`, `query`, `gridClassName` props (D10); `@container` on the block root |
| `src/widgets/offering-list/ui/RetryButton.tsx`, `RetryButton.test.tsx`, `index.ts` | widgets | Retry moves out to `shared/ui` (D4); re-export kept |
| `src/widgets/offering-detail/ui/OfferingDetail.tsx` | widgets | New async fetch component (`fetchOffering` + `fetchTaxonomies`) |
| `src/widgets/offering-detail/ui/OfferingDetailContent.tsx`, `.test.tsx` | widgets | New sync presentation (header + tabs with both panels) |
| `src/widgets/offering-detail/ui/DetailTabs.tsx`, `.test.tsx` | widgets | New client boundary for the tab value in the URL (D7) |
| `src/widgets/offering-detail/ui/DetailHeader.tsx`, `InventoryPanel.tsx`, `ConsensusPanel.tsx`, `.test.tsx`, `index.ts` | widgets | New sync pieces (D9, D11, D12, D13) |
| `src/entities/offering/api/offering.ts`, `offering.test.ts`, `index.ts` | entities | New `fetchOffering` (D3), exported |
| `src/shared/ui/LabelValueRow.tsx`, `.test.tsx` | shared | New container (D5) |
| `src/shared/ui/Tabs.tsx`, `.test.tsx` | shared | New container (D6) |
| `src/shared/ui/RetryButton.tsx`, `.test.tsx` | shared | Moved here (D4) |
| `src/shared/ui/index.ts`, `index.test.tsx` | shared | New exports and smoke cases |
| `src/shared/api/index.ts` | shared | `OfferingDetail` (derived types) |
| `messages/{es,en,ca}/catalog.json`, `messages/{es,en,ca}/scales.json` | shared (texts) | New `catalog` area; `scales` keys if absent (D16) |
| `src/app/styles/theme-tokens.test.ts` | app | The six guarded pairs of D15 |
| `src/widgets/offering-list/api/offerings.test.ts`, `lib/resolve-taxonomies.ts` | widgets | Existing tests keep passing unchanged |

Nothing in `contracts/openapi.yaml`, `src/shared/api/schema.ts`, `openspec/specs/` or `AGENTS.md` is touched.

## Risks / Trade-offs

- [`add-flavor-wheel`'s final props may differ from the supplied `<FlavorWheel tree counts total texts />` sketch] → the consumer is one call site per tree (D14); the props adapt at merge time without a design change. Its merge is a stated apply precondition.
- [The consensus legend's exact content is named in the newest decision but not spelled out] → designed as the per-note `n/total` figures, by parallel with the wheel's segment legend (D13); Product owner confirms or sends a correction. It changes no approach, file or task.
- [The scope — two screens, the shared containers and the widget generalization — exceeds one implementation session] → tasks.md is grouped in vertical slices with the list-page / detail-page boundary explicit, so the change can be split (reported to Product owner) without rewriting the artifacts.
- [Container queries are new in this codebase] → they are Tailwind 4 built-ins (`@container`, `@min-[…]`), no dependency; the class assertions cover them and jsdom asserts classes, not layout.
- [Radix tabs' automatic activation would navigate per arrow press] → `activationMode="manual"` (D6), stated as the spec scenario "Arrow keys move the focus only".
- [The `h2` and the selector's `fieldset` legend repeat the block name in the two selection cards] → accepted (D13): the control's accessibility contract requires its own legend. A later polish can visually hide one copy without a behaviour change.

## Migration Plan

No migration: two new public routes and one generalized fetch whose landing call is byte-compatible (D2). Rollback is removing the routes; landing, the shell and every merged capability are untouched. `develop` merges into this branch before the apply (tasks.md §0), which is where any `src/shared/ui/index.ts` conflict is resolved keeping both sides (the established rule).

## Open Questions

- The consensus legend beside the Defects and Main tastes cards is rendered here as one line per identified note (`{name} {count}/{total}`), matching the wheel's `n/total` segment legend; Product owner may confirm or correct its wording and content. Neither the specs' approach nor the tasks change with the answer.
- `FlavorWheel`'s final prop names and types (D14) settle at its merge; only the call site adapts.
