Status: approved — by the orchestrator in Product owner's absence (overnight mandate, 2026-10-06): every Open point takes the design lead's recommendation (see "Settled by the orchestrator" under Open). Product owner may reopen any of them.

# Design summary — add-public-evaluations

- Change-id: `add-public-evaluations`. Branch (when created): `feature/add-public-evaluations`.
- Capabilities (no new capability, Product owner 2026-10-06; `openspec/config.yaml`):
  - `evaluations`: the public evaluations list with its filter, and the read-only evaluation view;
  - `offering-catalog`: the detail delta, meaning the "View evaluations" link and the "Provisional evaluation" tab.
- Replaces the withdrawn draft of 2026-10-06 (public list plus a specialist page, new capability `public-evaluations`).

Sources:
- the decisions log of `docs/general-context.md` (on `develop`): "evaluaciones públicas y evaluación provisional" and "API add-offering-baseline-seed: diseño final, integrado" (both supersede "evaluaciones públicas fuera del alcance"); also "estilo de la pestaña futura de evaluación provisional", "pestañas del detalle de oferta", "lecturas de evaluaciones: decisión final", D14, "piezas extraídas disponibles", "filtros…", "add-filter-controls: resto de puntos";
- `contracts/openapi.yaml` on `develop` (`92328fc`): `listEvaluations` (now with `offeringId` and `evaluationType`), `getAnEvaluation`, `getAnOffering`, `listOlfactoryTaxonomies`, `listCoffees`;
- the approved summary and the propose artifacts of `add-offering-catalog` (`feature/add-offering-catalog`: design.md D3–D16, summary §6.2–§6.3);
- the propose artifacts of `add-specialist-evaluations` (design.md D2, D7, D12, D14, card field mapping), `add-evaluation-scales` (design.md D2–D6), `add-sidebar-slot` (design.md D1–D9), `add-facet-controls` (design.md D3–D11), `add-evaluation-facets` (design.md D2–D10), and the `add-filter-controls` and `add-flavor-wheel` summaries;
- the MVC, read only: `layouts/offerings/show.blade.php` (an "Evaluaciones" tab lists the offering's evaluations under its consensus), `layouts/evaluations/partials/evaluation-card.blade.php`, `evaluation-list.blade.php`, `show.blade.php`, `partials/technical-info.blade.php`.

How numbers are marked:
- *(measured)*: from an executed script, `contrast.mjs` in the design lead's scratchpad, run on `develop`'s `globals.css` on 2026-10-06, WCAG 2.x relative luminance, translucent tokens blended over their surface;
- *(computed)*: the design lead's own arithmetic;
- *(unverified)*: not checked.

## 1. Scope

Three pieces, open to any visitor with or without a session:

1. **Public evaluations list**, at `/{locale}/evaluations`. Closed specialist evaluations, newest first, as row cards with Previous/Next pagination. The filter sidebar holds the facets Offering, Score, Process and City, and the body toolbar holds the sort. Every request sends `evaluationType=specialist` and `status=closed` (decisions log, "API add-offering-baseline-seed", 1a).
2. **Read-only evaluation view**, at `/{locale}/evaluations/{ulid}`. One evaluation (`getAnEvaluation`) with the offering it belongs to (`getAnOffering`), shown through the shared read-only evaluation presentation (§4.3).
3. **Offering detail delta** (the page of `add-offering-catalog`):
   - a "View evaluations" link that opens `/{locale}/evaluations?offeringId={ulid}`, so the list loads with the Offering facet active in the sidebar;
   - a third tab, "Provisional evaluation", that shows the coffee shop's `baseline` evaluation (`GET /evaluations?offeringId={ulid}&evaluationType=baseline`), read only, through the same presentation as the view. When there is no baseline, the tab shows an empty state.

Out of scope:
- the specialist's public page (`listTheEvaluationsOfAUser`), Product owner;
- open (draft) evaluations in public;
- the evaluator's identity, which no public response exposes;
- creating a baseline: the API keeps it on its backlog as a creation endpoint only;
- writing evaluations, which belongs to `add-specialist-evaluations`;
- a header entry for the list (Open 7).

## 2. Contract operations consumed

All of them are public (`security: []`). They run on the server with plain `fetch` against `NEXT_PUBLIC_API_URL`, with no credential (settled rule, `.claude/CLAUDE.md` §2). No session is read on these screens, except by the offering detail's existing Evaluate link.

| operationId | Request | Used by |
|---|---|---|
| `listEvaluations` | `GET /evaluations?evaluationType=specialist&status=closed` + facet keys (`offeringId`, `scoreMin`, `scoreMax`, `process`, `city`) + sort (`orderBy`, `orderDirection`; the default writes `created_at desc`) + `page` | Public list |
| `listEvaluations` | `GET /evaluations?offeringId={ulid}&evaluationType=baseline` (Open 6 on ordering) | Provisional tab |
| `getAnEvaluation` | `GET /evaluations/{ulid}` | View |
| `getAnOffering` | `GET /offerings/{ulid}` | Per row (one call per distinct `offeringId` on the page, in parallel; at most 15 per page, contract `per_page` example); the view header; the Offering facet's label |
| `listOlfactoryTaxonomies` | `GET /taxonomies` | Descriptor rows and names in the presentation (view and tab) |
| `listCoffees` | `GET /coffees` | The Process facet's options (`distinctCoffeeValues`, `add-evaluation-facets` D7) |

Fields shown (contract names, values as returned):
- **Row:** `cuppingScore`, `closedAt`; from the offering, `coffeeInventory.coffee.name`, `location.name` and `coffeeInventory.roastery.name`.
- **Presentation:**
  - `cuppingScore`, `closedAt`, `extractionMethod`, `isDefective`;
  - `descriptive.{fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel}.score` (0–15) and `.note`;
  - `affective.{…, overall}.score` (1–9) and `.note`;
  - `tastes[]` (`ref`, `type`);
  - the non-null `extrinsics.*`.
- **Not shown:** `ulid`, `offeringId`, `status`, `evaluationType`, `createdAt`. The roast level is not shown: the evaluation resource does not return it (`add-specialist-evaluations` D11), and the offering's roast level is already in the Inventory data tab.

Contract gaps (reported in §11, never adapted to):
- only `200` is documented for `listEvaluations`, `getAnEvaluation` and `getAnOffering`;
- the descriptions say the offering is "included", but the resource carries only `offeringId`.

### Response states

**Public list**

| State | Shown |
|---|---|
| Loading | Three row skeletons (§5.2) |
| 200 with items | Row cards and pagination |
| 200 with `data: []`, no facet applied | `listEmptyMessage` |
| 200 with `data: []`, with a facet applied | `filters.noMatches` and the "Clear all" button (`add-evaluation-facets` D9). This includes "View evaluations" for an offering without evaluations. |
| One row's `getAnOffering` fails | That row shows `offeringUnavailable` as its heading, with no captions and no "View offering" link. Other rows are unaffected. |
| Any non-2xx (422 included) or transport failure | `listErrorMessage` with Retry. The facets keep their values. |

**Read-only view**

| State | Shown |
|---|---|
| Loading | Section 1: the back link and three placeholder bars. Section 2: two skeleton cards. |
| 200, `status` closed | Header and presentation |
| 200, `status` not closed | The 404 page (Open 5) |
| `getAnOffering` fails | The h1 shows `offeringUnavailable`, with no captions and no "View offering" link. The presentation still renders. |
| Non-2xx or transport failure of `getAnEvaluation` or `listOlfactoryTaxonomies` | Section 1 keeps the back link; section 2 shows `viewErrorMessage` with Retry. An unknown ULID falls here: its 404 is undocumented, so the catalog's no-`notFound()` rule applies (`add-offering-catalog` design.md, `getAnOffering` row). |

**Provisional tab**

| State | Shown |
|---|---|
| Loading | Two skeleton cards in the panel |
| 200 with at least one item | The presentation of the first item |
| 200 with `data: []` | `detailProvisionalEmpty` |
| Non-2xx or transport failure | `detailProvisionalError` with Retry, inside the panel only. The header and the other tabs are unaffected. |

**Sidebar**

| State | Shown |
|---|---|
| `listCoffees` fails | The Process facet is disabled with `filters.optionsUnavailable` (`add-evaluation-facets` D7) |
| `getAnOffering` for the active `offeringId` fails | The Offering option and its chip read `offeringFilterFallback` |

## 3. Routes and composition (FSD)

| File or slice | Layer | Role |
|---|---|---|
| `app/[locale]/evaluations/page.tsx` | app | Passes `locale` and the raw `searchParams` to the list screen. No logic. |
| `app/[locale]/evaluations/[ulid]/page.tsx` | app | Passes `locale` and `ulid` to the view screen |
| `app/[locale]/@sidebar/evaluations/page.tsx` | app | The list's sidebar slot page (`add-sidebar-slot` D1). The view route `/evaluations/{ulid}` falls to the slot's catch-all, so it has no sidebar (D2). |
| `src/pages/public-evaluations` | pages | List screen: texts, heading block, toolbar, list in `Suspense`. Sidebar screen: texts, the `listCoffees` read, the `getAnOffering` read for the active offering, parsing, `AppSidebar` frame with the facet panel. |
| `src/pages/public-evaluation` | pages | View screen: texts, two `PageSection`s, content in `Suspense` |
| `src/widgets/public-evaluation-list` | widgets | Async fetch component (list, plus offerings per row) and a sync presentation, on the `Offerings`/`OfferingList` pattern |
| `src/widgets/evaluation-sheet` | widgets | `EvaluationSheet`: the sync read-only presentation (§4.3). Async wrappers for the view (`getAnEvaluation`, `getAnOffering`, `listOlfactoryTaxonomies`) and for the baseline (`listEvaluations` baseline, `listOlfactoryTaxonomies`). |
| `src/entities/evaluation/api` | entities | `fetchEvaluations(query)` and `fetchEvaluation(ulid)`, plain server `fetch`, throwing on non-2xx. The entity is created by `add-specialist-evaluations` D2. |
| `src/entities/evaluation/model` | entities | Reused from `add-specialist-evaluations`: the groups and axis order (`groups.ts`) and the `tastes` → block mapping (`load.ts`, D7). Exports are *(unverified)* until its apply. |
| `src/entities/offering/api` | entities | `fetchOffering` (F2), `ratingTierFor` |
| `src/entities/taxonomy` | entities | `fetchTaxonomies`, `buildTaxonomyLookup`, and the descriptor-row builder (F3) |
| `src/features/evaluation-facets` | features | Reused and extended for the public facet set (Open 3) |
| `src/widgets/offering-detail` | widgets | Modified: the header actions row (§5.4); `DetailTab` gains `"provisional"`; `DetailTabs` and the content take a third panel slot |
| `src/pages/offering-detail` | pages | Modified: passes the baseline wrapper of `evaluation-sheet` as the third panel slot |

Composition of the tab (settled; criterion B, verified constraint):
- `widgets/offering-detail` cannot import `widgets/evaluation-sheet`, because FSD forbids imports between slices of one layer (AGENTS.md).
- So the page (`src/pages/offering-detail`) composes the panel and passes it down as a `ReactNode` slot.
- This is the slot mechanism `DetailTabs` already uses for its panels (`add-offering-catalog` D7).
- No visible change and no new mechanism.

## 4. Components and reuse

### 4.1 Public list

| Part | Component and variant | Accessible name / semantics |
|---|---|---|
| Eyebrow, h1 | `<p class="type-eyebrow-strong">`, `<h1 class="type-heading">` | text |
| Toolbar | `EvaluationsToolbar` (`add-evaluation-facets` D8): `FiltersTrigger` (`Button` primary, `SlidersHorizontal`, count) and the sort (`Field` + `Select` default, options of its D6) | the trigger's text; the select's label |
| Row card | The row card of `add-specialist-evaluations` (`Card layout="default"`, its card field mapping), without the status badge and with its actions slot holding the public links (Open 2) | `h2` coffee name (`type-card-heading`) |
| Score row | `type-score` value, `type-meta` "/100", `Badge variant={ratingTierFor(cuppingScore)}` with the tier word (`OfferingCard` composition). Absent when `cuppingScore` is null. | text + word |
| Row links | `Link` default: "View" → `/{locale}/evaluations/{ulid}`; "View offering" → `/{locale}/offerings/{offeringId}` | the visible text plus a visually hidden " {coffee name}", so each name is unique and starts with the visible text (WCAG 2.5.3) |
| Pagination | `Pagination` (`@/shared/ui`). `path` is `/{locale}/evaluations`; `query` is the URL's `searchParams` record, so every key is kept and `page` is replaced. | button labels |
| Empty, error | `type-body` message; `RetryButton` (`@/shared/ui`, moved there by `add-offering-catalog` D4); `ClearEvaluationFiltersButton` (`add-evaluation-facets` D9) | label |
| Row skeleton | `Card layout="default"` with `OfferingSkeletonCard`'s placeholder bars | `aria-hidden`; the list region carries `aria-busy` |
| Result count | `evaluations.resultCount` as a polite `role="status"` element (`add-evaluation-facets` D9) | text |

### 4.2 Sidebar (public route)

- `AppSidebar` frame (`add-sidebar-slot` D4). There is no `<nav>` and no `SidebarSeparator`: no entries on a public route.
- Inside it, the `FacetPanel` of `add-facet-controls` D4 (`role="search"`, titled `filters.title`, applied chips and "Clear all"), with the facets in this order:

| # | Facet | Control | Key | Values |
|---|---|---|---|---|
| 1 | Offering | `FacetRadioList`: "Any", then the active offering labelled "{coffee name} · {coffeeshop}". Shown only while `offeringId` is in the URL (Open 1). | `offeringId` | the ULID from the URL |
| 2 | Score | `ScoreRangeFacet` 0–100 | `scoreMin`, `scoreMax` | `add-evaluation-facets` D4 rules |
| 3 | Process | `FacetRadioList` over `distinctCoffeeValues(coffees, "process")` | `process` | single value |
| 4 | City | `FacetTextField` (≤ 90 characters, help `filters.cityHelp`) | `city` | trimmed text |

- No Status facet: `status=closed` is fixed.
- Chips follow `add-evaluation-facets` D5. The Offering chip is "Offering: {coffee name}".
- "Clear all" keeps the sort keys (its D5).
- The sidebar is open from `md` and covers the full screen below `md` (`add-sidebar-slot` D3).

### 4.3 Read-only evaluation presentation (`EvaluationSheet`)

One presentation for the view and the provisional tab, in the style of the Consensus tab (decisions log, "estilo de la pestaña futura": read-only bean scales and the same layout; `add-offering-catalog` D12).

| Card | Content | API fields |
|---|---|---|
| Summary (`h2` `summaryHeading`) | Header row: the `h2` and the score row. Below it, a `dl` of `LabelValueRow`s: Closed on, Extraction method (catalog label for the nine values, raw value otherwise: `add-specialist-evaluations` D12), Defective cup (Yes/No). A null `closedAt` omits its row. | `cuppingScore`, `closedAt`, `extractionMethod`, `isDefective` |
| Intensity (`h2` `intensityHeading`) | Seven `IntensitySlider readOnly`: `valueText` "{v}/15", `valueLabel` "{v} de 15", `scaleLabels` LOW/MEDIUM/HIGH (from `evaluations`), label = axis name. A null score renders as 0 (scales D2). | `descriptive.*.score` |
| Preference (`h2` `preferenceHeading`) | Eight `BeanScale readOnly size="responsive"`: `valueText` "{v}/9", `valueLabel` "{v} de 9" (from `scales`). A null score omits its scale (catalog D12 rule). | `affective.*.score` |
| Descriptors (`h2` `descriptorsHeading`) | Five `DescriptorChipGroup readOnly` blocks, each with its block name as `legend` and `emptyText` `noDescriptors`: Fragrance / Aroma, Flavor / Aftertaste, Main tastes, Mouthfeel, Defects. Rows are built from `GET /taxonomies` by category with the settled rule (levels 0–1; `add-specialist-evaluations` D7; F3). An unresolved `ref` renders no badge. | `tastes[]` by `type`: `fragrance`/`aroma`, `flavor`/`aftertaste`, `main_tastes`, `mouthfeel`, `defects` |
| Notes (`h2` `notesHeading`), only when a note is non-null | `dl`: `dt` "{Intensity or Preference} · {axis}" (`type-label`), `dd` the note (`type-body`) | `descriptive.*.note`, `affective.*.note` |
| Extrinsic attributes (`h2` `extrinsicsHeading`), only when a field is non-null | `dl`: `dt` field label, `dd` value | `extrinsics.{farming, processing, trading, certifications, generalObservation}` |

Reused without change:
- `Card layout="stacked"` and `LabelValueRow` (`add-offering-catalog` D5);
- `Badge` and `ratingTierFor`;
- the three read-only scale controls of `add-evaluation-scales`.

New components in `src/shared/ui`: none.

### 4.4 Offering detail delta

| Part | Component | Notes |
|---|---|---|
| "View evaluations" | `Link` default (Open 8) → `/{locale}/evaluations?offeringId={ulid}` | Always shown (Open 10). Name: `detailViewEvaluations`. |
| Evaluate | Unchanged (`add-offering-catalog` D9) | Moves into the same actions row |
| Third tab trigger | `TabsTrigger` (`add-offering-catalog` D6), value `provisional`, label `detailTabProvisional` | `?tab=provisional`; an absent or unknown value still opens `inventory` (D7) |
| Third panel | `EvaluationSheet` of the baseline, or the empty or error state | — |

## 5. Layout and spacing (criterion A)

Breakpoints are Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Every value is an end state.

### 5.1 Page sections

- Every route uses `PageSection` (decisions log D14): full width; vertical padding 3rem below `md` and 4rem from `md`; a centred container of at most 72rem with side padding 1rem / 2rem; no border or radius.
- Each route has two sections: section 1 on `surface-page` and section 2 on `surface-section`. This mirrors the catalog list and detail (`add-offering-catalog` summary §6.2–§6.3).

### 5.2 Public list `/{locale}/evaluations`

**Section 1 (`surface-page`).** The container is a flex column.
- Heading block: eyebrow and h1, 0.5rem apart, no box. Sources: MVC `layouts/evaluations/index.blade.php:3-5`; catalog §6.2.
- Toolbar: 2rem below the heading block, full width (catalog §6.2 filter slot).
  - Its own layout, from `add-evaluation-facets` D8: a flex row that wraps, items aligned to the bottom, 1rem column gap and 0.75rem row gap, the trigger at the start and the sort at the end. The sort field is 12–16rem wide.
  - No padding, border or radius.

**Section 2 (`surface-section`).** The container is a flex column.
- List: one column at every width, 1rem between cards (`add-specialist-evaluations` D14; MVC `evaluation-list.blade.php:4`, `gap-2` rounded up to the project's list step). No padding, border or radius of its own.
- Pagination: 2rem below the list, as shipped (centred, buttons 1rem apart, wrapping).
- Empty state: a centred column, 1rem apart: the message, plus "Clear all" when filtered. No box.
- Error state: a centred column, 1rem apart: the message, then Retry at its own width. No box.
- Loading: three row skeletons, 1rem apart. Each is a `Card layout="default"` whose `CardContent` holds three bars, 0.5rem apart: 1.5rem tall at two thirds width, 1rem tall at half width, 1rem tall at a quarter width (`bg-surface-section`, `rounded-field`). No aside and no footer.

**Row card** (`Card layout="default"`; MVC `evaluation-card.blade.php`). Border, radius and shadow are the card's own: 4px left `border-accent`, `rounded-container`, `shadow-lg`.
- `CardAside`: the card's own 1.5rem padding. Below `lg`, a 1px bottom `border-subtle`; from `lg`, a 1px right border and a quarter of the card width.
  - It holds the score row: flex, wrapping, baseline-aligned, 0.5rem gap.
  - With a null `cuppingScore` the aside is empty.
- `CardContent`: 1.5rem padding; a vertical stack, 0.5rem apart:
  - the `h2` coffee name;
  - directly below it, the date line (`type-meta`, "{closedOnLabel} {date}");
  - the coffeeshop caption and the roaster caption (`type-label`).
- `CardFooter`: 1.5rem padding, below both regions. The links sit in a flex row that wraps, aligned to the end, 1rem apart (`add-specialist-evaluations` footer).

**Sidebar.**
- The sidebar keeps its own values: a 16rem column from `md`, `nav-surface-dark` under `variant-inverse` (`add-sidebar-slot` D5, D8).
- The panel keeps its own values (`add-facet-controls` D4):
  - a column with 1.25rem gaps;
  - the title with 0.75rem side padding;
  - chips in a wrapping row, 0.5rem apart, with 0.75rem side padding.
- Facet internals are the controls' own (D3, D5, D6, D8): rows 0.25rem apart, the legend at `px-3 py-1`.

### 5.3 Read-only view `/{locale}/evaluations/{ulid}`

**Section 1 (`surface-page`).** A flex column with two blocks 1.5rem apart, following the catalog detail (§6.3).
1. Back link: `Link variant="back"` → `/{locale}/evaluations`, plain, with no query (as the catalog detail's back link: spec "Back link"). No box.
2. Header block: a flex column, children 0.5rem apart, no border, background or padding:
   - the eyebrow (`viewEyebrow`, `type-eyebrow-strong`);
   - the h1 coffee name;
   - the coffeeshop caption and the roaster caption (`type-label`);
   - the meta line (`type-meta`, "{closedOnLabel} {date}");
   - the "View offering" `Link`.

**Section 2 (`surface-section`).** The `EvaluationSheet` (§5.5).

- Loading:
  - section 1 shows the back link and three bars, 0.5rem apart (1rem tall at a quarter, 1.5rem at two thirds, 1rem at half; `bg-surface-section`, `rounded-field`);
  - section 2 shows two skeleton cards in the sheet grid.
- Error: section 1 shows only the back link; section 2 shows the message and Retry in a centred column, 1rem apart.

### 5.4 Offering detail delta

- **Header actions row.** It is the last child of the catalog's title group, so it sits 0.5rem below the last caption (the group's own gap, `add-offering-catalog` D9).
  - A flex row that wraps, 1rem apart both ways, start-aligned.
  - It holds "View evaluations", then Evaluate (specialist only).
  - No padding, border or radius.
  - This replaces the catalog's standalone Evaluate placement, which is the same 0.5rem below the captions.
- **Tabs.** The catalog's treatment (D6) is unchanged: list with a 1px `border-subtle` bottom edge (decorative); triggers `0.5rem 0.75rem` padding, at least 2.5rem tall; panel 1.5rem below the list. The third trigger follows the other two in the same flex row.
- **Provisional panel:**
  - the `EvaluationSheet` (§5.5);
  - empty: `detailProvisionalEmpty` (`type-body`), centred, no box;
  - error: the message and Retry, centred, 1rem apart;
  - loading: two skeleton cards in the sheet grid.

### 5.5 `EvaluationSheet`

- **Grid.** One column below `lg`, two equal columns from `lg`, 1.5rem gap. Cards of a row stretch to equal height (catalog D12, §6.3).
  - Order: Summary (spans both columns), Intensity | Preference (one row from `lg`), Descriptors (spans both), Notes (spans both, when present), Extrinsic attributes (spans both, when present).
  - The sheet has no padding, border or radius of its own.
- **Each card.** `Card layout="stacked"` with `CardContent` only: 1.5rem padding, 4px left `border-accent`, `rounded-container`, `shadow-lg`. Inside it, a flex column with the `h2` (`type-subheading`) and its content 1rem apart.
- **Summary card:**
  - Header row: a flex row that wraps, space-between, centre-aligned, 0.5rem gap, with the `h2` and the score row (MVC `technical-info.blade.php:26-33`, `flex items-center justify-between`).
  - The score row sits on `surface-card`, never on `surface-section` (§6, measured).
  - Then the `dl`: `LabelValueRow`s in the catalog grid (D5): one column below `md`, two from `md`, 0.75rem between rows and 1.5rem between columns. The row's own layout is term at the start and value at the end, at least 1rem apart, wrapping.
- **Intensity and Preference cards.** The controls stack in a flex column, 1.5rem apart, as the catalog's SCA attributes card. Scale internals are the controls' own (scales D3, D5):
  - bean scale: label 0.5rem above, beans 0.25rem apart, value text with a 0.75rem column gap;
  - slider: header 0.5rem above the track, marks 0.25rem below.
- **Descriptors card.** An inner grid with one column below `md` and two from `md`, 1.5rem gap both ways, holding the five chip groups. Group internals are the control's own (scales D6): legend 0.5rem below, rows 0.75rem apart, badges 0.5rem apart.
- **Notes and Extrinsic attributes cards.** One `dl` each. Each entry is a stacked `dt` over `dd`, 0.25rem apart; entries are 1rem apart; one column; no separators.

### 5.6 At 375px and 1280px *(computed)*

**At 375px:**
- The container is 343px.
- A card's content box is 343 − 2 × 24 − 4 = 291px.
- The bean row at 24px is 9 × 24 + 8 × 4 = 248px, so it fits 291px; the value text wraps under it (scales D3).
- Row cards stack the aside above the content, and the links wrap.
- The summary header wraps the score row under the `h2`.
- The facets open full screen (sidebar sheet).
- No horizontal scroll.

**At 1280px:**
- On the list with the sidebar open, the content column is 1280 − 256 − 64 = 960px.
- On the view, the content is 72rem − 4rem = 1088px.

### 5.7 Visual reference (ASCII mock-ups)

The MVC has the row card (`evaluation-card.blade.php`) but no public list or provisional tab, so these mock-ups are the reference. The verification task captures all three routes, plus the detail's provisional tab, at 375px and 1280px in both themes.

Public list, 1280px, sidebar open, arriving from "View evaluations":
```
┌ header ───────────────────────────────────────────────────────────────────────┐
│▌Sidebar 16rem  ││ section 1 · surface-page · py-16                           │
│ Filters        ││   EVALUATIONS                         (eyebrow)            │
│ [Offering: Huila×]  Specialist evaluations                (h1)             │
│ Clear all      ││   2rem                                                     │
│ Offering       ││   [≡ Filters (1)]                    Sort by [Newest ▾]    │
│  ○ Any         │├───────────────────────────────────────────────────────────┤
│  ● Huila ·     ││ section 2 · surface-section                                │
│    Tazavera    ││ ┃┌ aside ────────┐┌ content ─────────────────────────────┐ │
│ Score  0──100  ││ ┃│ 84.25 /100    ││ Huila El Mirador              (h2)   │ │
│ Process        ││ ┃│ [Good]        ││ Closed on 2 Oct 2026                 │ │
│  ○ Any ○ washed││ ┃│               ││ Coffeeshop: Tazavera Gràcia          │ │
│ City [______]  ││ ┃│               ││ Roaster: Nómada Roasters             │ │
│                ││ ┃└───────────────┘└──────────── View  View offering ────┘ │
│                ││   1rem                                                     │
│                ││              [Previous] [Next]   (2rem below)              │
└───────────────────────────────────────────────────────────────────────────────┘
```

Read-only view and provisional tab content, 375px (`EvaluationSheet`):
```
│ section 1 · px-4 py-12          │
│ ← Back                          │
│ EVALUATION                      │
│ Huila El Mirador (h1)           │
│ Coffeeshop: Tazavera Gràcia     │
│ Roaster: Nómada Roasters        │
│ Closed on 2 Oct 2026            │
│ View offering                   │
├ section 2 · surface-section ────┤
│ ┃ Context      84.25 /100 [Good]│
│ ┃ Closed on        2 Oct 2026   │
│ ┃ Extraction method       V60   │
│ ┃ Defective cup            No   │
│   1.5rem                        │
│ ┃ Intensity                     │
│ ┃ Fragrance              11/15  │
│ ┃ ▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░            │
│ ┃ LOW     MEDIUM      HIGH      │
│ ┃ … six more, 1.5rem apart      │
│ ┃ Preference                    │
│ ┃ Fragrance                     │
│ ┃ ●●●●●●●○○  7/9                │
│ ┃ Descriptors                   │
│ ┃ Fragrance / Aroma             │
│ ┃ [Fruity] [Floral]             │
│ ┃ Main tastes  [Sweet]          │
```

Offering detail header with the delta, 1280px:
```
│ ← Back                                                        │
│ [✓ Verified]                                                  │
│ Huila El Mirador (h1)                                         │
│ Coffeeshop: Tazavera Gràcia                                   │
│ Roaster: Nómada Roasters                                      │
│ View evaluations   Evaluate          (row, 1rem apart)        │
├ section 2 ────────────────────────────────────────────────────┤
│ Inventory data | Consensus | Provisional evaluation           │
│ ───────────────────────────────── (selected: 2px accent edge) │
│ 1.5rem                                                        │
│ [EvaluationSheet of the baseline]                             │
```

## 6. Semantic tokens and contrast (criterion D)

Only existing semantic tokens. No new primitive and no new semantic token.

| Part | Token(s) | Sits on |
|---|---|---|
| Sections | `surface-page`, `surface-section` (`PageSection`) | — |
| Eyebrow, captions, `dt` | `text-label` | surface-page, surface-card |
| h1, `dd`, body, score | `text-primary` | surface-page, surface-card, surface-section (empty and error messages) |
| Meta, "/100" | `text-secondary` | surface-page, surface-card |
| Card `h2` (`type-subheading`) | `text-accent` | surface-card |
| Links | `text-link`, hover `text-link-hover` | surface-page (back link, View offering, View evaluations), surface-card (row links) |
| Rating badge | `badge-text` on `evaluation-rating-*` | **surface-card only** |
| Cards | `surface-card`, 4px `border-accent`, `rounded-container`, `shadow-lg`; `border-subtle` separators (decorative) | surface-section |
| Scales, chips, taxonomy badges | the controls' own tokens (`evaluation-bean-*`, `evaluation-slider-*`, `Badge taxonomy`) | surface-card |
| Tabs | `text-secondary` / selected `text-primary`, `border-accent` edge | surface-section |
| Sidebar and facets | `nav-*`, `variant-inverse` | nav-surface-dark |
| Focus | `focus-visible:focus-ring` | every surface above |

**Gated pairs** *(measured)*. Text gate 4.5:1; boundary and icon gate 3:1. Values are traditional / dark.

| Pair | surface-page | surface-card | surface-section | Registered |
|---|---|---|---|---|
| text-primary | 6.41 / 14.28 | 6.41 / 13.22 | 5.72 / 11.97 | yes |
| text-secondary | 6.05 / 8.57 | 6.05 / 7.93 | 5.39 / 7.18 | page, section yes; card by `add-offering-catalog` D15 |
| text-label | 5.97 / 10.28 | 5.97 / 9.51 | 5.32 / 8.61 | page yes; card and section by catalog D15 |
| text-accent | 6.85 / 7.37 | 6.85 / 6.82 | — | card yes |
| text-link | 6.41 / 14.28 | 6.41 / 13.22 | — | card yes; page by catalog D15 |
| text-link-hover | 11.53 / 15.93 | 11.53 / 14.75 | — | card yes; page by catalog D15 |
| focus-ring (bound) | 11.53 / 14.28 | 11.53 / 13.22 | 10.28 / 11.97 | yes |
| badge-text / rating-exceptional | — | 4.85 / 6.61 | **4.53** / 6.00 | card by catalog D15 |
| badge-text / rating-excellent | — | 5.04 / 6.48 | 4.71 / 5.88 | card by catalog D15 |
| badge-text / rating-good | — | 5.12 / 6.42 | 4.79 / 5.81 | card by catalog D15 |
| badge-text / rating-commercial | — | 4.69 / 7.08 | **4.38 (fails)** / 6.42 | card by catalog D15 |

- **Consequence.** The rating badge fails on `surface-section` in the traditional theme (commercial 4.38). It sits only on `surface-card`: in the row card's aside and in the Summary card.
  - An existing surface passes everywhere, so no token is proposed (contrast procedure, step 2).
  - The catalog's Consensus score has the same problem: see F1.
- **Not gated:** the read-only slider track (a `meter` whose value is also text; scales D5), the beans' disc artwork beyond the pairs registered by scales, the `border-subtle` separators, the skeleton bars, the tab list's bottom edge.
- **Pairs this change must register:** none, provided `add-offering-catalog` (D15) and `add-evaluation-scales` (D9) land first.
  - The scale controls sit on `surface-card`, which scales registers.
  - Every other pair above is registered on `develop` or by catalog D15.
  - If this change were applied before the catalog, it would register the catalog D15 pairs it uses: `text-secondary`, `text-label` and the four `badge-text` / rating pairs on `surface-card`, and `text-label` / `surface-section`.

## 7. Behaviour

- **List query.** Facet and sort parsing reuse `add-evaluation-facets` D4 and D6 (limits, dropped values, sort ids, `default` → `created_at desc`). The public set adds `offeringId` (a non-empty string; never validated by the front: an unknown ULID ends in the API's answer, Open 1) and drops `status` from the facets.
- **Fixed keys.** The request always carries `evaluationType=specialist&status=closed`. The URL never carries them, so a URL `status` or `evaluationType` value is ignored.
- **Contract key order:** `offeringId`, `evaluationType`, `city`, `process`, `status`, `scoreMin`, `scoreMax`, `orderBy`, `orderDirection`, `page`.
- **URL writes** go through `src/shared/lib/filter-query` (`add-evaluation-facets` D2): each change removes `page` and pushes with `scroll: false`. Pagination keeps every other key.
- **Offerings per row.** After the list returns, one `getAnOffering` per distinct `offeringId` on the page, in parallel, on the server.
- **View.** `getAnEvaluation`, then `getAnOffering(offeringId)` and `fetchTaxonomies()` in parallel.
- **Baseline.** The provisional panel's async wrapper requests the baseline with the page's offering ULID and `fetchTaxonomies()`. Its own `Suspense` boundary isolates it, so its failure stays inside the panel.
- **Dates.** `closedAt` is formatted as a date in the route's locale (`Intl.DateTimeFormat`, medium date style, no time), as the row date of `add-specialist-evaluations`.
- **Taste notes.** Mapped by `type` with `add-specialist-evaluations` D7. Names follow the route's locale (`nameEs`, `nameEn`, `nameCa`). Level 2 is not shown.
- **"View evaluations"** opens `/{locale}/evaluations?offeringId={ulid}`. The list arrives with the Offering facet showing the offering selected, and its chip applied.

## 8. Texts (message catalog es / en / ca, passed as props)

Reused areas (no new keys):
- `evaluations` (`add-specialist-evaluations` D14): group, part and axis names; descriptor block names; LOW/MEDIUM/HIGH; "/15"; the nine extraction labels; "Closed on" (`closedOnLabel` below stands for that key); `resultCount` (`add-evaluation-facets` D10);
- `scales`: the bean `valueText` and `valueLabel`;
- `landing`: tier words, coffeeshop and roaster captions, pagination and retry labels;
- `filters`: every generic facet, sort and chip text.

The English and Catalan strings below, and every Spanish string not cited to the MVC, are proposals (Open 9).

**New area `public-evaluations`** (`messages/{locale}/public-evaluations.json`):

| Key | es | en | ca |
|---|---|---|---|
| `listEyebrow` | Evaluaciones (MVC `index.blade.php:4`) | Evaluations | Avaluacions |
| `listHeading` | Evaluaciones de especialistas | Specialist evaluations | Avaluacions d'especialistes |
| `listEmptyMessage` | No hay evaluaciones registradas todavía. (MVC `evaluation-list.blade.php:8`) | There are no evaluations yet. | Encara no hi ha avaluacions. |
| `listErrorMessage` | No se pudieron cargar las evaluaciones. | The evaluations could not be loaded. | No s'han pogut carregar les avaluacions. |
| `viewLabel` | Ver (MVC `evaluation-card.blade.php:64`) | View | Mostra |
| `viewOfferingLabel` | Ver oferta | View offering | Mostra l'oferta |
| `offeringUnavailable` | Oferta no disponible | Offering unavailable | Oferta no disponible |
| `viewEyebrow` | Evaluación | Evaluation | Avaluació |
| `backLabel` | Volver (MVC `offerings/show.blade.php:4`) | Back | Tornar |
| `viewErrorMessage` | No se pudo cargar la evaluación. | The evaluation could not be loaded. | No s'ha pogut carregar l'avaluació. |
| `summaryHeading` | Contexto (MVC `technical-info.blade.php:28`) | Context | Context |
| `closedAtLabel` | Fecha de cierre | Closed on | Data de tancament |
| `extractionMethodLabel` | Método de extracción | Extraction method | Mètode d'extracció |
| `defectiveCupLabel` | Taza con defectos | Defective cup | Tassa amb defectes |
| `yes` / `no` | Sí / No | Yes / No | Sí / No |
| `intensityHeading` | Intensidad | Intensity | Intensitat |
| `preferenceHeading` | Preferencia | Preference | Preferència |
| `descriptorsHeading` | Descriptores | Descriptors | Descriptors |
| `noDescriptors` | Sin descriptores. | No descriptors. | Sense descriptors. |
| `notesHeading` | Notas | Notes | Notes |
| `extrinsicsHeading` | Atributos extrínsecos | Extrinsic attributes | Atributs extrínsecs |
| `extrinsicFarming` … `extrinsicGeneralObservation` | Cultivo, Procesado, Comercio, Certificaciones, Observación general | Farming, Processing, Trading, Certifications, General observation | Cultiu, Processament, Comerç, Certificacions, Observació general |
| `offeringFacet` | Oferta | Offering | Oferta |
| `offeringFilterFallback` | Oferta seleccionada | Selected offering | Oferta seleccionada |

**Additions to the `catalog` area** (owned by the offering detail):

| Key | es | en | ca |
|---|---|---|---|
| `detailViewEvaluations` | Ver evaluaciones (Product owner) | View evaluations | Mostra les avaluacions |
| `detailTabProvisional` | Evaluación provisional (Product owner) | Provisional evaluation | Avaluació provisional |
| `detailProvisionalEmpty` | Esta oferta aún no tiene evaluación provisional. | This offering has no provisional evaluation yet. | Aquesta oferta encara no té avaluació provisional. |
| `detailProvisionalError` | No se pudo cargar la evaluación provisional. | The provisional evaluation could not be loaded. | No s'ha pogut carregar l'avaluació provisional. |

The catalog guard checks that es, en and ca have the same keys in both areas.

## 9. Accessibility

- **Headings:**
  - list: one `h1`; `h2` per row;
  - view: the `h1` coffee name, card `h2`s, `legend`s for the chip groups;
  - tab: the page `h1` stays the offering's, and the card `h2`s sit under the tab panel.
- **Link names.** "View" and "View offering" carry a visually hidden " {coffee name}" per row. "View evaluations" is unique on the page.
- **Scales.** Read-only `meter`s with `aria-valuetext` (scales D3, D5); each value is also visible text.
- **Nothing by colour alone.** The tier word sits beside the score, Defective cup is Yes/No text, and chips carry names.
- **Facets** follow the controls' contracts (`role="search"` panel, radio groups with legends, chip removal names, focus after removal).
- **Tabs** use manual activation and `?tab=` (catalog D6, D7). The third tab follows the same contract.
- **Focus.** Every interactive element is an existing control with `focus-visible:focus-ring`; inside the sidebar the ring resolves to the inverse ring (`add-sidebar-slot` D8).
- **Document title:** `Tazavera`, with the description from `public-evaluations` (the catalog's metadata rule, D17); key `metaDescription` (es "Evaluaciones públicas de especialistas", a proposal).

## 10. Dependencies

**Capability layer:**
- `theming` → `base-controls` (`Link`, `Button`) → `form-fields` (read-only scales), `feedback` (`Badge`), `content-structure` (`Card`, `PageSection`, `Pagination`, `Tabs`, `LabelValueRow`), `filtering` (facet controls) → `app-shell` (`@sidebar` slot);
- then the features: `landing` (`ratingTierFor`, tier words), `offering-catalog` (the detail page), `evaluations` (entity, model, labels).

**Changes that must be merged into `develop` before the apply** (Product owner, plus one addition):

| Change | Phase (board) | What this change takes from it |
|---|---|---|
| `add-evaluation-scales` | Verify | `BeanScale`, `IntensitySlider`, `DescriptorChipGroup` in `readOnly`; the `scales` area |
| `add-offering-catalog` | Propose → Apply | The detail page, `Tabs`, `DetailTabs` slots, `LabelValueRow`, `RetryButton` in `shared/ui`, `fetchOffering`, the `catalog` area, the D15 contrast pairs |
| `add-sidebar-slot` | Apply | The `@sidebar` slot, `AppSidebar` frame, `useSidebar`, `SIDEBAR_ID` |
| `add-facet-controls` | Verify | `FacetPanel`, `FacetRadioList`, `ScoreRangeFacet`, `FacetTextField`, the `filters` area |
| `add-specialist-evaluations` | Propose → Apply | `src/entities/evaluation` (model: groups, `tastes` mapping), the `evaluations` area, the row card (Open 2). It ships no shared read-only widget (F4). |
| **`add-evaluation-facets`** (added) | Propose → Apply | `features/evaluation-facets` (parse, query, sort, `EvaluationsToolbar`, `ClearEvaluationFiltersButton`), `shared/lib/filter-query`, `fetchCoffees`, `FiltersTrigger` (Open 3). Its own dependencies are already in this list. |

`add-flavor-wheel` is not needed: aromatics show as chips (Open 4).

**Backlog.**
- R9 ("Clear all" duplicated) affects the facet button this change reuses. It adds no third copy if Open 3 (a) holds.
- R1, R3–R5 and R8 do not name this change.
- New candidate: F3 (descriptor rows by category).

**Decisions-log entries applied:**
- D14;
- "evaluaciones públicas y evaluación provisional";
- "API add-offering-baseline-seed" (1a: `evaluationType` always sent);
- "estilo de la pestaña futura" (Consensus style);
- "pestañas del detalle de oferta" (`?tab=`);
- "lecturas de evaluaciones: decisión final" (public reads, no evaluator);
- "piezas extraídas disponibles";
- "filtros…" and "add-filter-controls: resto de puntos" (sidebar facets, sort in the body);
- "add-offering-catalog: preguntas del propose".

**Contract coverage.** With this change, `listEvaluations` and `getAnEvaluation` are consumed. `listTheEvaluationsOfAUser` stays out of scope. All 26 operations are then covered except that one *(computed from the board's coverage table)*.

## 11. Findings on other changes and records (for the orchestrator to route)

- **F1. `add-offering-catalog`: the Consensus score's rating badge fails contrast on `surface-section`.**
  - Evidence: D12 places the score "above the grid, full width, no box" inside the section-2 panel (`surface-section`). `badge-text` on `evaluation-rating-commercial` there measures **4.38** in the traditional theme (exceptional 4.53, excellent 4.71, good 4.79) *(measured)*. D15 registers the badge pairs on `surface-card` only, so the guard will not catch it.
  - Path: a design decision of a change in Propose → Apply. It goes to the catalog's architect as an artifact update before its apply, or as a correction afterwards.
  - Fix with existing tokens, no new token (procedure step 2): put the score row inside a card on `surface-card`, for example a header row of the Status and consensus card, as §5.5 does here.
- **F2. Two changes create `src/entities/offering/api/offering.ts` with different contracts.**
  - Evidence: `add-offering-catalog` D3 defines `fetchOffering(ulid)` as a server read that throws on non-2xx. `add-specialist-evaluations` D1 (Files) defines `fetchOffering` "via `publicRequest`, distinguishing found, not-found and failed".
  - Path: a contradiction between two settled artifacts. The orchestrator may close it (§3): one function, kept by whichever change merges first, with the second adapting its call site.
  - This change needs only "throws on failure" on the server.
- **F3. Descriptor rows by category will exist in two or three copies.**
  - Evidence: `add-offering-catalog` D13 (Main tastes and Defects in `widgets/offering-detail`) and `add-specialist-evaluations` D7 (`pages/evaluation-form` `DescriptorBlock`) each build `ChipRow[]` from `GET /taxonomies` by category, with the same level 0–1 rule. This change needs the same builder for five blocks.
  - Path: backlog candidate (owning slice `entities/taxonomy`). Recommended: tell both architects now that the first to apply places the builder in `src/entities/taxonomy` (the "piezas extraídas disponibles" pattern) and the second reuses it.
- **F4. `add-specialist-evaluations` ships no shared read-only widget.**
  - Evidence: its D2 rejects a widgets layer. Its read-only view is `EvaluationForm` in read-only mode inside `src/pages/evaluation-form`, and its row card is `src/pages/evaluations-list/ui/EvaluationRowCard.tsx`. No other page can import either.
  - The dependency named in the task ("shared read-only widgets") therefore holds only for the entity model and the catalog labels.
  - This change builds the read-only presentation itself, in the Consensus style the decisions log settles. The row card is Open 2.
- **F5. `add-flavor-wheel` summary, "Possible later consumers".** It still says `add-public-evaluations` was withdrawn. This is semantic (outdated wording); the orchestrator may fix it. Today's decision gives the wheel no consumer here (Open 4).
- **F6. Decisions log.** The pending point "whether the button and the tab go into `add-offering-catalog` or a separate change" is now answered: `add-public-evaluations` carries both (Product owner). The orchestrator should record the answer in the log.
- **F7. Contract descriptions vs schema.**
  - `listEvaluations` ("each including … the offering it belongs to") and `getAnEvaluation` ("with … associated offering") describe an embedded offering, but the schema returns only `offeringId`.
  - Only `200` is documented for both.
  - `getAnEvaluation` returns open evaluations publicly (the example has `status: open`).
  - Path: report to Product owner for the Scribe annotations. The front does not adapt.

## Open

**Settled by the orchestrator, 2026-10-06 (overnight, Product owner away; reopenable):** 1 (a) radio list "Any" + the active offering; 2 (a) the row card moves to `src/widgets/evaluation-row` in this change; 3 (a) extend `features/evaluation-facets` with a public facet set; 4 chips; 5 the 404 page; 6 newest first, the first one shown; 7 no header entry; 8 a plain link beside Evaluate; 9 the proposed texts stand; 10 always shown; 11 the ASCII mock-ups stand until the verification captures. Nothing below blocks propose any longer.

1. **Offering facet control.**
   - Question: the sidebar must show the offering filter as active. Can a visitor also pick another offering from the sidebar?
   - Options:
     - (a) A radio list with "Any" and the active offering only, shown while `offeringId` is in the URL. An offering is chosen from its detail page ("View evaluations"); no new read in the browser.
     - (b) A `Combobox` in search mode over `GET /offerings?coffeeName=` from the browser. This extends the accepted search-as-you-type exception (decisions log, "add-filter-controls: resto de puntos": Roaster and management) to a third consumer.
     - (c) No facet: only the applied chip.
   - Recommendation: (a). It meets "the offering filter active in the sidebar" with existing controls and no new browser read. (b) can follow as its own change. Source: decisions log; `add-facet-controls` D6.
   - Blocks propose: yes (it decides the spec scenarios and the reads).
2. **One row card shared with `add-specialist-evaluations`.**
   - Question: the public row is that change's row card without the status badge and with other actions. Its card lives in `src/pages/evaluations-list`, where no other page can import it.
   - Options:
     - (a) This change moves it to a widget (`src/widgets/evaluation-row`): optional status badge, actions slot. The specialist list keeps its rendering and tests. Precedent: `add-offering-catalog` D4 moved `RetryButton` in-change.
     - (b) A refactor change first (`evaluations`), between `add-specialist-evaluations` and this one.
     - (c) A second copy plus a backlog entry.
   - Recommendation: (a). It is the fewest steps, has the precedent, and has no visible change for the specialist list. Under `.claude/CLAUDE.md` §3 ("shared components … solution in the current change"), the orchestrator may close it and register the backlog entry. Source: criterion C.
   - Blocks propose: yes (it decides which files of another change are touched).
3. **Facet code for the public list.**
   - Options:
     - (a) Extend `features/evaluation-facets` (`add-evaluation-facets`): `parseEvaluationFilters` gains `offeringId`; `EvaluationFacets` takes a facet set (`"mine"`: Status, Score, Process, City; `"public"`: Offering, Score, Process, City); the query builder takes the fixed keys. Toolbar, sort and "Clear all" are reused unchanged. This adds `add-evaluation-facets` to the apply dependencies, and its observable behaviour on `/manage/evaluations` stays unchanged.
     - (b) A new slice `features/public-evaluation-facets`, copying the parse, query and toolbar, plus a backlog entry.
   - Recommendation: (a). Criterion C, and R9 shows the cost of parallel facet copies. The orchestrator may close it as for Open 2.
   - Blocks propose: yes (dependency and files).
4. **Aromatic descriptors: chips or the flavor wheel?**
   - Options:
     - (a) `DescriptorChipGroup readOnly`, as the other four blocks;
     - (b) `FlavorWheel` with `total` 1. Its legend "n/total evaluators" means consensus, so every segment would read "1 of 1" (`add-flavor-wheel` summary).
   - Recommendation: (a). The decisions log says the wheel "could" be reused, but its meaning is consensus.
   - Blocks propose: no (the body follows (a)).
5. **An open evaluation opened by URL.**
   - Options:
     - (a) the 404 page (front decision: a draft is not public; the list never shows it);
     - (b) render it;
     - (c) the error state.
   - Recommendation: (a). Source: Product owner's `status=closed` on the list; F7.
   - Blocks propose: no.
6. **Several baselines for one offering.** Uniqueness is guaranteed only by the seeder (decisions log).
   - Options:
     - (a) add `orderBy=created_at&orderDirection=desc` to Product owner's query and show the first (newest);
     - (b) send the query exactly as given and show `data[0]`; the API's default order is *(unverified)*.
   - Recommendation: (a). The result is deterministic, it is additive to the query, and the contract supports it.
   - Blocks propose: no.
7. **Header entry for the list.**
   - Options:
     - (a) none: reached from "View evaluations" and by URL;
     - (b) a third `PrimaryNav` entry (an `app-shell` delta).
   - Recommendation: (a). Product owner's decision names only the detail link. The unfiltered list is one "Clear all" away.
   - Blocks propose: no.
8. **"View evaluations": link or button look.**
   - Product owner calls it a "botón", but it navigates.
   - Options:
     - (a) `Link` default, beside Evaluate, which is also a `Link` (catalog D9);
     - (b) a button-looking link. That needs a link form of `Button` (a `base-controls` mechanism that does not exist: `Button.tsx` has no `asChild` or `href`).
   - Recommendation: (a).
   - Blocks propose: no.
9. **Texts.** Every key of §8 is a proposal except those cited to the MVC or to Product owner.
   - Blocks propose: no.
10. **"View evaluations" when the offering has no evaluations.**
    - Options:
      - (a) always shown; the list's filtered empty state explains it;
      - (b) hidden when `evaluationCount` is 0. Whether `evaluationCount` counts specialist evaluations only is *(unverified)*.
    - Recommendation: (a).
    - Blocks propose: no.
11. **Visual reference.** The ASCII mock-ups of §5.7 stand until the verification captures.
    - Options: (a) accept them; (b) add an MVC capture of `evaluation-card` for the row card.
    - Recommendation: (a).
    - Blocks propose: no.

## Review log

- **2026-10-06, design lead, regeneration after the withdrawal.**
  - **Changed since the withdrawn draft:**
    - no new capability: `evaluations` plus an `offering-catalog` delta;
    - the specialist page and `listTheEvaluationsOfAUser` are removed;
    - the list sends `evaluationType=specialist&status=closed` and gets the sidebar facets (Offering, Score, Process, City) and the toolbar sort;
    - new: the "View evaluations" link and the "Provisional evaluation" tab (baseline);
    - the read-only presentation moves from the form-like CVA group cards to the Consensus-style card grid, as the decisions log entry "estilo de la pestaña futura" requires;
    - both routes now use two sections (page and section), as the catalog does;
    - contrast is measured by script in this session;
    - Opens 1–4, 6, 9 and 10 of the withdrawn draft are closed or replaced.
  - **Settled from sources (criterion B):**
    - the tab's composition through a page-level slot (FSD same-layer rule, verified in AGENTS.md; `add-offering-catalog` D7 slots);
    - the score row only on `surface-card` (measured failure on `surface-section`, existing surface passes);
    - the back link to the plain list (catalog spec "Back link" precedent);
    - extraction labels (`add-specialist-evaluations` D12);
    - the error rule for undocumented 404s (catalog design.md);
    - no roast level in the presentation (not in the evaluation resource);
    - texts split by area (catalog D16 precedent);
    - `RetryButton` from `shared/ui` (catalog D4).
  - **Blocking points:** Open 1, 2 and 3. The orchestrator may close 2 and 3 under §3.
