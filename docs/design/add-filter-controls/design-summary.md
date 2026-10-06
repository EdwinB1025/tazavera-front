Status: draft — pending Product owner review

# Design summary — add-filter-controls

Input for `/opsx:explore` and `/opsx:propose` once approved. Drafted by the design lead on 2026-10-06 from the MVC filter views, `contracts/openapi.yaml` on `develop` (`78fc6e4`), the main specs in `openspec/specs/`, the components in `src/shared/ui/`, the decisions log in `docs/general-context.md`, and the `add-specialist-evaluations` summary (branch `feature/add-specialist-evaluations`, `08c62a9`).

- Change-id: `add-filter-controls`
- Capability: `filtering` ("facet controls and filtering behaviour", `openspec/config.yaml`)
- Settled by Product owner (brief of 2026-10-06):
  - (a) the evaluations filter belongs to this change and takes every `GET /evaluations` query field except the ID-based ones (`evaluatorId`, `coffeeId`, `locationId`): `city`, `process`, `status`, `scoreMin`/`scoreMax`, `orderBy`/`orderDirection`;
  - (b) `GET /coffees` and `GET /roasteries` are consumed by the filters of the offering list (and also by `add-offering-management`);
  - (c) the D14 page layout in the decisions log applies.

## 1. Scope

Two filters, each a search form whose state lives in the URL of the list it filters:

| Filter | List it filters | Query fields (contract names) |
|---|---|---|
| Offering filter | Public offerings list (`add-offering-catalog`) | see §3.1; the exact set is Open 2 |
| Evaluation filter | My evaluations list (`add-specialist-evaluations`, `/{locale}/manage/evaluations`) | `city`, `process`, `status`, `scoreMin`, `scoreMax`, `orderBy`, `orderDirection` (settled a) |

The change delivers the filter controls, their URL state, their validation, their option data and their responsive presentation. It does not deliver the list screens; how the screens mount the filters is Open 1.

## 2. Contract operations

All four are public (`security: []`). By the settled data-loading rule, public endpoints are fetched on the server with plain `fetch` and reach the filters as props.

| `operationId` | Use in this change | Response states shown |
|---|---|---|
| `listCoffees` (`GET /coffees`) | Option lists of the offering filter: distinct non-null `country`, `region`, `process`, `variety`, `producer`, sorted alphabetically; and the `process` options of the evaluation filter | 200: options. Failure: Open 7 |
| `listRoasteries` (`GET /roasteries`) | Option list of the roastery select: `name` of each roastery, sorted | 200: options. Failure: Open 7 |
| `listOlfactoryTaxonomies` (`GET /taxonomies`) | Taste-note options of `cataRef`, only if Open 2 keeps it | 200: options. Failure: Open 7 |
| `listOfferings` (`GET /offerings`) | Receives the filter query; fetched by the hosting list | Owned by the host: loading, success, empty, error (landing spec "Verified offerings list" pattern) |
| `listEvaluations` (`GET /evaluations`) | Receives the filter query plus the fixed `evaluatorId`; fetched by the hosting list on the client | Owned by the host |

- Neither `name` query parameter of `GET /coffees` or `GET /roasteries` is used: the full lists are fetched once per page render. The contract shows no pagination for either (`data` only), so each returns the whole catalog.
- Values are shown as the API returns them (general context, "los valores de la API se muestran tal cual"), e.g. `washed`.
- Matching semantics verified in `tazavera-api` (read-only): `coffeeName` and `roasteryName` are partial matches (`like %v%`); `originCountry`, `originRegion`, `process`, `producer`, `variety` and `city` are exact matches (`where field = v`), in both `Offering.php` and `Evaluation.php`. That is why those fields are selects fed by `GET /coffees`, not free text. `city` has no public source (only `GET /locations`, authenticated and limited to the user's own locations): Open 4.
- The contract documents no 422 for the list operations, although `FilterOfferingRequest` validates every field. The filters prevent invalid requests client-side (§5.3); any non-2xx response is the host's error state.

## 3. Controls

All controls reuse `src/shared/ui/` as they are. No new control is built except the score range group (§3.3) and the mobile panel wrapper (§4.2).

### 3.1 Offering filter (recommended set; Open 2 decides)

| # | Control | Component (variant) | Query field | Options / limits | Accessible name |
|---|---|---|---|---|---|
| 1 | Coffee name | `Field` + `Input` (`default`, `type="search"`, `maxLength={150}`) | `coffeeName` | free text, partial match | visible label |
| 2 | Roastery | `Field` + `Select` (`default`) | `roasteryName` | "Any" + `GET /roasteries` names | visible label |
| 3 | Origin country | `Field` + `Select` | `originCountry` | "Any" + distinct `country` | visible label |
| 4 | Origin region | `Field` + `Select` | `originRegion` | "Any" + distinct `region` (independent of 3; Open 11) | visible label |
| 5 | Process | `Field` + `Select` | `process` | "Any" + distinct `process` | visible label |
| 6 | Variety | `Field` + `Select` | `variety` | "Any" + distinct `variety` | visible label |
| 7 | Producer | `Field` + `Select` | `producer` | "Any" + distinct non-null `producer` | visible label |
| 8 | City | `Field` + `Input` (`maxLength={90}`) | `city` | free text, exact match (Open 4) | visible label |
| 9 | Verification | `Field` + `Select` | `verified` | "Any" / "Verified" (`1`) / "Provisional" (`0`) (Open 6) | visible label |
| 10 | Average score | score range group (§3.3) | `cuppingAvgMin`, `cuppingAvgMax` | 0–100, decimals allowed, max ≥ min | legend + per-input names |
| 11 | Taste notes | descriptor chip group from `add-evaluation-scales`, inside a disclosure (Open 9) | `cataRef[]` | level-0 and level-1 nodes of `GET /taxonomies`, any category; level 2 not shown (same rule as the evaluations summary §3) | disclosure button text + group label |
| 12 | Sort by | `Field` + `Select` | `orderBy` + `orderDirection` | "Default order" (both omitted), "Highest score" (`cupping_avg`,`desc`), "Lowest score" (`cupping_avg`,`asc`), "Most evaluated" (`evaluation_count`,`desc`), "Newest" (`created_at`,`desc`), "Oldest" (`created_at`,`asc`) | visible label |

Not offered (recommendation, Open 2): `coffeeshopUlid`, `locationUlid` (ID-based, the same rule Product owner applied to evaluations), `evaluationCountMin/Max`, `defectiveCountMin/Max`, the eight affective-axis ranges (`fragranceMin` … `overallMax`) and the five per-axis taste filters (`fragranceCata` … `mouthfeelCata`).

### 3.2 Evaluation filter (settled a)

| # | Control | Component (variant) | Query field | Options / limits | Accessible name |
|---|---|---|---|---|---|
| 1 | City | `Field` + `Input` (`maxLength={90}`) | `city` | free text, exact match (Open 4) | visible label |
| 2 | Process | `Field` + `Select` | `process` | "Any" + distinct `process` of `GET /coffees` | visible label |
| 3 | Status | `Field` + `Select` | `status` | "Any" / "Open" (`open`) / "Closed" (`closed`) | visible label |
| 4 | Score | score range group (§3.3) | `scoreMin`, `scoreMax` | 0–100, decimals allowed, max ≥ min | legend + per-input names |
| 5 | Sort by | `Field` + `Select` | `orderBy` + `orderDirection` | "Default order", "Highest score" (`cupping_score`,`desc`), "Lowest score" (`cupping_score`,`asc`), "Newest" (`created_at`,`desc`), "Oldest" (`created_at`,`asc`), and the `status` order (Open 8) | visible label |

`evaluatorId` is never a control: the host always sends the signed-in user's `ulid` (evaluations summary §6).

### 3.3 Score range group

- A `fieldset` whose `legend` is the visible label (`type-label`, `text-text-label`), so it reads like a `Field` label.
- Two `Input` controls (`type="number"`, `inputMode="decimal"`, `min={0}`, `max={100}`, `step="any"`), side by side, each with its own accessible name from the catalog ("Minimum score", "Maximum score"), since neither has a visible label of its own.
- Help text below the inputs (`type-meta`): "0 to 100".
- Errors as in §5.3: text below the inputs (`type-error`) plus the error border on the offending input (`aria-invalid`, `aria-describedby` to the message). The error is never shown by colour alone.

### 3.4 Actions

| Action | Component (variant) | Behaviour | Accessible name |
|---|---|---|---|
| Apply | `Button` `primary`, `type="submit"`, icon `Search` | Validates and applies (§5.1). Busy (`loading`) while the navigation is pending | visible text |
| Reset | `Link` (shared, `text-text-link`, hover `text-text-link-hover`) | Navigates to the list path with no filter or page parameters; rendered only when at least one filter is applied | visible text |
| Open filters (below `lg`) | `Button` `primary`, icon `SlidersHorizontal` | Opens the mobile panel. Text: "Filters", or "Filters (n)" when n filters are applied (count as text, not colour) | visible text |
| Close panel (below `lg`) | `Button` icon-only, icon `X`, `aria-label` from the catalog | Closes the panel without applying | `aria-label` "Close filters" |

- Reset is a link because it is navigation to a URL (the unfiltered list), and the link token passes on the filter surface where the positional action buttons do not (§7).
- Icons `Search`, `SlidersHorizontal` and `X` are added to `src/shared/ui/icons.ts` (the only `lucide-react` entry point; `lucide-react` is already a dependency).

## 4. Layout and spacing (criterion A)

The filters sit inside the host list's section container (D14: full-width section, centred container at most 72rem, side padding 1rem / 2rem from `md`, vertical padding 3rem / 4rem from `md`). The filter adds no container of its own.

Breakpoint: inline panel from `lg` (1024px), trigger and full-screen panel below it. Source: MVC `livewire/coffees/offering-filterbar.blade.php` and `livewire/evaluations/partials/evaluation-filterbar.blade.php` (`hidden lg:block` / `lg:hidden`).

### 4.1 Inline panel (from `lg`)

| Element | Value |
|---|---|
| Panel (`form`, `role="search"`) | background `surface-filter`; radius `radius-container`; no border; padding 1.5rem on every side (MVC `.tz-filter-stack` `p-6`); full width of the container; no shadow (no shadow token exists; MVC `shadow-2xl` not translated) |
| Space between panel and the list below it | 2rem (the same gap the offering list uses between its grid and its pagination, `OfferingList.tsx` `gap-8`) |
| Field grid | columns at least 14rem wide, as many as fit the panel (4 at 72rem, 3 at 1024px); 1rem between columns, 1.25rem between rows; each cell starts at the top |
| Field internals | as `Field` ships them: label, 0.5rem, control (height 2.5rem), help and error 0.25rem below |
| Score range group | one grid cell; the two inputs side by side with 0.5rem between them, each taking half the cell |
| Taste notes disclosure (if kept) | spans every column; disclosure button height 2.5rem; when open, the chip group sits 0.75rem below it; chip rows and gaps as defined by the descriptor chip group of `add-evaluation-scales` |
| Actions row | below the grid, 1.5rem above it; a 1px top border `border-filter-separator` (decorative, exempt from 3:1, theming spec) with 1rem padding above the actions; actions aligned to the end, 1rem apart, vertically centred; order: Reset, then Apply |
| Field cell hover | none. The MVC hover fill (`surface-filter-field-hover`) is not used: label text fails 4.5:1 on it in the traditional theme (§7), and the form-fields spec gives light-surface controls no hover change |

### 4.2 Mobile panel (below `lg`)

| Element | Value |
|---|---|
| Trigger | above the list, aligned to the start; 2rem between it and the list |
| Panel | the shared `Sheet` (Radix Dialog): full screen, focus trapped, Escape and Close dismiss, focus returns to the trigger. Surface: Open 3 |
| Panel header | `SheetHeader` as shipped (padding 1rem, 0.375rem between children): `SheetTitle` "Filters" at the start, Close button at the end, in one row with space between |
| Panel body | scrolls vertically; padding 0 1rem; fields stacked in one column, full width, 1.25rem between fields; score range inputs side by side, 0.5rem apart |
| Panel footer | `SheetFooter` as shipped (padding 1rem, 0.5rem between children, column): Apply full width, then Reset centred; a 1px top border `border-filter-separator` |
| Viewport | no horizontal scroll at 375px |

### 4.3 Mock-up (visual reference; MVC captures pending)

```
lg and up, inside the list section container (72rem max)
+-- surface-filter, radius-container, padding 1.5rem -----------------------------+
| Coffee name        Roastery           Origin country     Origin region           |
| [ search        ]  [ Any         v ]  [ Any         v ]  [ Any         v ]       |
|                                                                   (1.25rem)      |
| Process            Variety            Producer           City                    |
| [ Any        v ]   [ Any         v ]  [ Any         v ]  [               ]       |
|                                                                                  |
| Verification       Average score      Sort by                                    |
| [ Any        v ]   [ min ] [ max ]    [ Default order v ]                        |
|                    0 to 100                                                      |
| > Taste notes                                                     (full width)   |
|----------------------------------------------------- border-filter-separator ----|
|                                              Reset filters   [ (Q) Search ]      |
+----------------------------------------------------------------------------------+
                                  2rem
[ offering grid ... ]

below lg (375px)
[ (=) Filters (3) ]          -> full-screen Sheet: title + (X), stacked fields, footer [ Search ] / Reset
```

MVC captures to take for the folder (not taken in this session, Unverified):
- offerings page at 1280px (inline bar) and 375px (Filters button and modal): route `offerings`, `resources/views/layouts/offerings/index.blade.php` with `livewire/coffees/offering-filterbar.blade.php` and `livewire/coffees/partials/filter-fields.blade.php`;
- evaluations list at 1280px and 375px: `resources/views/layouts/evaluations/partials/evaluation-list.blade.php` with `livewire/evaluations/partials/evaluation-filterbar.blade.php` and `livewire/evaluations/partials/filter-fields.blade.php`.

## 5. Behaviour

### 5.1 URL state and apply

- The URL is the single source of filter state. Query keys use the contract names exactly (`coffeeName`, `cuppingAvgMin`, `status`, …), so the host passes them to the API without renaming. `cataRef` is a repeated key in the URL; the request sends it in the array form the API validates (`cataRef[]`) (serialisation of arrays by the shared fetch helpers: Unverified).
- On load, every control shows the value of its key in the URL; a key that is absent shows the "Any" option or an empty input.
- Apply navigates to the same path with only the non-empty fields, and without `page`, so the list returns to page 1. The browser history keeps one entry per apply, so Back restores the previous filter state.
- Sort is a field of the form, applied with Apply like every other field. Applying on change would move the user to a new result set on a select change (WCAG 2.2 SC 3.2.2 On Input).
- Before the request, the host drops unknown keys and any value that fails §5.3 (a hand-edited URL), and the matching control shows empty.
- The host's pagination keeps every filter key when it changes page (interface in §9; today's `OfferingPagination` builds `/{locale}?page=n` and would drop them).
- Mobile: Apply closes the panel and navigates; Close and Escape discard unapplied edits (the next open shows the URL state again).

### 5.2 States

| State | What shows |
|---|---|
| Loading results | Apply is busy (`loading`) until the navigation settles; the host shows its own loading state (skeleton cards for offerings) |
| Results | the host list |
| Empty with filters applied | the host shows the filters' "No results match these filters." message (catalog area `filters`) with the Reset link, instead of its unfiltered empty message |
| Error | the host's error state with its retry action; the filter keeps its values |
| Option data unavailable | Open 7 |

### 5.3 Validation (client side, from the contract limits)

| Rule | Message (catalog) | Where |
|---|---|---|
| Score value outside 0–100 | "Enter a value from 0 to 100." | below the range group, error border on that input |
| Max lower than min | "The maximum must be at least the minimum." | below the range group, error border on the max input |
| Text over 90 / 150 characters | prevented by `maxLength` (no message) | — |

On an invalid Apply, nothing navigates and focus moves to the first invalid input. The messages are cleared when the value becomes valid.

## 6. Accessibility

- The form is a `search` landmark with an accessible name from the catalog ("Offering filters", "Evaluation filters").
- Every control has a visible label (`Field`) except the two range inputs and the Close button, which carry `aria-label` from the catalog.
- `focus-visible:focus-ring` on every control, as the shared components ship it; the ring passes on `surface-filter` (registered pair, §7).
- Errors: text plus border plus `aria-invalid`; never colour alone.
- The applied-filter count in the trigger is text.
- The mobile panel is a modal dialog with a title (Radix Dialog requires one), focus trap and focus return.
- Disabled controls: 50% opacity (shared components).
- Announcing the result count after apply: Open 13.

## 7. Tokens and contrast

Semantic tokens only; no new token is proposed by this draft. Ratios measured by the design lead with an executed script (`contrast-filter.mjs`, `contrast-extra.mjs`, `contrast-navbutton.mjs` in the design lead's scratch directory; WCAG 2.2 relative luminance, translucent tokens composited over the surface behind them). All numbers in this section are the design lead's.

| Part | Token | Background | Traditional | Dark | Gate |
|---|---|---|---|---|---|
| Field label, range legend | `text-label` | `surface-filter` | 4.72 | 8.09 | 4.5 ok |
| Help text (range "0 to 100") | `text-secondary` | `surface-filter` | 4.78 | 6.75 | 4.5 ok |
| Error text | `feedback-error` | `surface-filter` | 5.33 | 4.82 | 4.5 ok |
| Control border | `border-strong` | `surface-filter` | 9.12 | 3.84 | 3 ok |
| Control text | `text-strong` | `surface-input` | 12.24 | 15.93 | already registered (form-fields) |
| Focus ring | `focus-ring` | `surface-filter` | 9.12 | 11.25 | already registered |
| Reset link, rest | `text-link` | `surface-filter` | 5.07 | 11.25 | 4.5 ok |
| Reset link, hover | `text-link-hover` | `surface-filter` | 9.12 | 12.54 | 4.5 ok |
| Apply / trigger label | `action-primary-text` | `action-primary` / `-hover` | 6.85 / 11.67 | 5.38 / 6.64 | already registered |
| Apply boundary (fill) | `action-primary` / `-hover` | `surface-filter` | 5.42 / 9.22 | **2.33 / 1.89** | 3: fails in dark (Open 5) |
| Trigger boundary (fill) | `action-primary` / `-hover` | `surface-section` | 6.11 / 10.40 | **2.48 / 2.01** | 3: fails in dark (Open 5) |
| Taste-note chips | descriptor chip group tokens | `surface-filter` | not measured | not measured | owned by `add-evaluation-scales`; it must also register its pairs on `surface-filter` if Open 2 keeps `cataRef` |

Measured and not used:
- `surface-filter-field-hover` (the MVC field hover): `text-label` 4.22 and `text-secondary` 4.27 in the traditional theme, `feedback-error` 4.07 in the dark theme. Hence no field hover (§4.1).
- `action-3` (a secondary Reset button): fill against `surface-filter` 1.06 traditional / 1.10 dark; hover fill 2.08 in the dark theme. Hence Reset is a link.
- `nav-button` variant as Apply: hover label on its translucent fill is 3.36 on `surface-filter` in the traditional theme. Not usable.

Guard pairs the build registers in `src/app/styles/theme-tokens.test.ts` (both themes): `text-label`/`surface-filter`, `text-secondary`/`surface-filter`, `feedback-error`/`surface-filter` (text); `border-strong`/`surface-filter` (bound); `text-link`/`surface-filter`, `text-link-hover`/`surface-filter` (text). Nothing else: the separator is decorative and the other pairs are already registered.

Unused filter tokens: `surface-filter-control`, `surface-filter-option`, `surface-filter-panel` and `surface-filter-field-hover` exist in `globals.css` from the MVC translation but this design does not use them: `Select` and `Input` keep `surface-input`, and the form-fields spec keeps the open option list native and unstyled (Open 12).

## 8. Texts (catalog area `filters`, es / en / ca, passed as props)

| Key | es | en | ca |
|---|---|---|---|
| `offeringsTitle` | Filtros de ofertas | Offering filters | Filtres d'ofertes |
| `evaluationsTitle` | Filtros de evaluaciones | Evaluation filters | Filtres d'avaluacions |
| `open` | Filtros | Filters | Filtres |
| `openWithCount` | Filtros ({count}) | Filters ({count}) | Filtres ({count}) |
| `close` | Cerrar filtros | Close filters | Tanca els filtres |
| `apply` | Buscar | Search | Cerca |
| `reset` | Limpiar filtros | Clear filters | Esborra els filtres |
| `any` | Cualquiera | Any | Qualsevol |
| `coffeeName` | Café | Coffee | Cafè |
| `roastery` | Tostador | Roastery | Torrador |
| `originCountry` | País de origen | Origin country | País d'origen |
| `originRegion` | Región de origen | Origin region | Regió d'origen |
| `process` | Proceso | Process | Procés |
| `variety` | Variedad | Variety | Varietat |
| `producer` | Productor | Producer | Productor |
| `city` | Ciudad | City | Ciutat |
| `verification` | Verificación | Verification | Verificació |
| `verified` | Verificada | Verified | Verificada |
| `provisional` | Provisional | Provisional | Provisional |
| `status` | Estado | Status | Estat |
| `statusOpen` | Abierta | Open | Oberta |
| `statusClosed` | Cerrada | Closed | Tancada |
| `score` | Puntuación | Score | Puntuació |
| `averageScore` | Puntuación media | Average score | Puntuació mitjana |
| `scoreMin` | Puntuación mínima | Minimum score | Puntuació mínima |
| `scoreMax` | Puntuación máxima | Maximum score | Puntuació màxima |
| `scoreHelp` | De 0 a 100 | 0 to 100 | De 0 a 100 |
| `tasteNotes` | Notas de sabor | Taste notes | Notes de sabor |
| `sortBy` | Ordenar por | Sort by | Ordena per |
| `sortDefault` | Orden predeterminado | Default order | Ordre predeterminat |
| `sortScoreDesc` | Mayor puntuación | Highest score | Puntuació més alta |
| `sortScoreAsc` | Menor puntuación | Lowest score | Puntuació més baixa |
| `sortMostEvaluated` | Más evaluadas | Most evaluated | Més avaluades |
| `sortNewest` | Más recientes | Newest | Més recents |
| `sortOldest` | Más antiguas | Oldest | Més antigues |
| `errorRange` | Introduce un valor de 0 a 100. | Enter a value from 0 to 100. | Introdueix un valor de 0 a 100. |
| `errorOrder` | El máximo debe ser igual o mayor que el mínimo. | The maximum must be at least the minimum. | El màxim ha de ser igual o més gran que el mínim. |
| `noMatches` | Ningún resultado coincide con estos filtros. | No results match these filters. | Cap resultat no coincideix amb aquests filtres. |

Spanish labels follow the MVC (`filter-fields.blade.php`: Ciudad, Origen, Proceso, Puntaje, Estado, Abierta, Cerrada, Buscar, Filtros), adjusted to the project's wording ("Puntuación", as in the landing catalog: Unverified). The ca and en strings are the design lead's drafts. Key names are a proposal; the architect may rename them.

## 9. Interfaces with other changes

- **Hosts.** Each filter is a client component (`features` layer) that receives: the current search params, its option data (from the host page's server fetches), its texts, and the list path. It owns the form, validation and navigation. The host owns the fetch of the list, its states, the empty-with-filters message placement and its pagination. How and when hosts mount it: Open 1.
- **Pagination.** A host with filters needs pagination that keeps the query. The shared pagination of `content-structure` does not exist yet; `src/widgets/offering-list/ui/OfferingPagination.tsx` hard-codes `/{locale}?page=n`. Backlog candidate (see report).
- **`add-evaluation-scales`.** Owns the descriptor chip group the taste-note facet reuses (only if Open 2 keeps `cataRef`).
- **`add-specialist-evaluations`.** Hosts the evaluation filter on `/{locale}/manage/evaluations` and always adds `evaluatorId`. Its list is fetched on the client through the add-auth client.
- **`add-offering-catalog`.** Hosts the offering filter on the public offerings list (server fetch).
- **`add-offering-management`.** Also consumes `GET /coffees` and `GET /roasteries` (settled b); if both changes build a fetch helper for them, it lives once in `src/shared/api/` (first change to land creates it, the second reuses it).
- **Collapsible.** The taste-note disclosure and the evaluation form's collapsible groups (evaluations summary §5) both need a disclosure; `content-structure` lists "collapsible" and none is built (Open 9).

## 10. Tests (expected outcomes; the architect writes the tasks)

- URL to controls: each control shows the URL value; absent keys show "Any" or empty.
- Apply: navigates with only non-empty keys, no `page`; sort writes both `orderBy` and `orderDirection`, "Default order" writes neither.
- Validation: min > max, a value below 0 or above 100: no navigation, message text present, `aria-invalid` on the offending input, focus moved to it; valid again: message gone.
- Parsing: unknown keys and invalid values are dropped from the request parameters.
- Options: derived lists are distinct, sorted, without `null`; "Any" first.
- Reset: rendered only with an applied filter; its `href` has no filter or page keys.
- Trigger: label shows the applied count as text.
- Mobile panel: opens as a dialog with its title; Close has its accessible name; Apply closes it and navigates.
- Accessibility attributes: `role="search"` with its name; range inputs have their names; every control keeps `focus-visible:focus-ring` (existing focus guard).
- Guard pairs of §7 registered; icons only through `icons.ts` (existing guard).
- Visual check at 375px and 1280px on both themes (verification task).

## Open

1. **How the lists host the filters, and the order of the three changes.**
   - Options: (a) this change ships the two filter components with their URL contract, options loading and tests, and `add-offering-catalog` and `add-specialist-evaluations` mount them (this change goes first); (b) this change goes last and also wires the filters into the two list screens; (c) fold each filter into its list's change.
   - Recommendation: (a). In the layering rule, `filtering` sits below the feature capabilities, and both list capabilities already say "with its filter" in `openspec/config.yaml`. Shipping the filters first lets both lists mount a finished component and keeps each change to one session. The spec can be observed on the components themselves, as it was for `form-fields`.
   - Blocks propose: yes.
2. **Which offering query fields the offering filter offers.**
   - Options: (a) the recommended set of §3.1 (12 controls, including `cataRef`); (b) the same without `cataRef` (removes the dependency on `add-evaluation-scales`); (c) every non-ID field of the contract, with the advanced ones (counts, axis ranges, per-axis taste notes) behind a "More filters" disclosure.
   - Recommendation: (a), matching the MVC set (`livewire/coffees/partials/filter-fields.blade.php`: name, city, origin, process, score, tastes, olfactory notes) extended with the contract fields that `GET /coffees` and `GET /roasteries` can feed (settled b). (b) if `add-evaluation-scales` will not land before this change.
   - Blocks propose: yes.
3. **Surface of the mobile panel.**
   - Options: (a) the filter surface (`surface-filter`) with `default` controls, the same contrast as the inline panel; needs a surface option on the shared `SheetContent`, whose panel is fixed to `bg-nav-surface-dark` and whose `cn` does not merge classes (`src/shared/lib/utils.ts`); (b) the Sheet as it is (`nav-surface-dark`) with the `inverse` control variant, as the form-fields proposal anticipated ("full-screen mobile filter panel"); then the Apply button has no passing variant: `primary` fill 1.07 traditional / 2.55 dark against `nav-surface-dark`, and `nav-button` hover fill 1.35 and hover border 1.80 in the traditional theme (design lead's measurements), so a new token would be needed.
   - Recommendation: (a). Source: MVC `.tz-filter-stack` uses `--color-surface-muted`, which the theming change translated to `moss-200` = `surface-filter` (`add-theme-tokens` design.md, decision 5). The Sheet change is small and keeps one look for the filter at every width.
   - Blocks propose: yes.
4. **City control.** The API matches `city` exactly and no public operation lists cities.
   - Options: (a) free-text `Input` with help text "Exact city name"; (b) leave `city` out of both filters (but settled a includes it for evaluations); (c) ask for a cities endpoint (contract change).
   - Recommendation: (a), with the help text; matching case is decided by the database collation (Unverified).
   - Blocks propose: no.
5. **Primary button boundary in the dark theme (pre-existing).** `action-primary` fill measures 2.33 (rest) / 1.89 (hover) against `surface-filter`, 2.48 / 2.01 against `surface-section` and 2.96 / 2.40 against `surface-page` in the dark theme. It affects every primary button already merged (landing explore button, offering pagination). No fill can pass both gates with the cream label: the label needs fill luminance ≤ 0.143 for 4.5:1, the dark filter surface needs ≥ 0.16 for 3:1 (design lead's computation). An existing token passes as a border: `border-strong` against `surface-filter` 3.84, `surface-section` 4.09, `surface-page` 4.88.
   - Options: (a) this change uses `primary` like the rest of the app, and the boundary goes to a new `base-controls` change (a dark-theme border with `border-strong` on the primary button); (b) that `base-controls` change first, then this one; (c) accept the label as the button's identification.
   - Recommendation: (a). The defect is in merged code (workflow §4: new change) and touches a shared component; this change adds no new kind of failure.
   - Blocks propose: no.
6. **`verified` facet.** Whether the public catalog shows provisional offerings is `add-offering-catalog`'s decision.
   - Options: (a) include "Any / Verified / Provisional"; (b) leave it out and let the catalog fix it.
   - Recommendation: (a) if the catalog lists both; otherwise (b).
   - Blocks propose: no.
7. **Option data unavailable.** `GET /coffees`, `GET /roasteries` or `GET /taxonomies` fails.
   - Options: (a) the dependent controls render disabled with only "Any" and a help text ("Options unavailable"), the rest of the filter and the list keep working; (b) the whole filter shows an error with retry; (c) hide the dependent controls.
   - Recommendation: (a): the list and the text filters remain usable, and the state is stated in text.
   - Blocks propose: no.
8. **Evaluation sort by `status`.** The contract allows `orderBy=status`; whether `asc` puts open or closed first depends on the column type (Unverified).
   - Options: (a) offer "Open first" / "Closed first" after the architect verifies the order in `tazavera-api`; (b) leave the status order out.
   - Recommendation: (a) once verified; (b) if it cannot be verified.
   - Blocks propose: no.
9. **Taste-note disclosure component.** Needed only if Open 2 keeps `cataRef`.
   - Options: (a) a shared collapsible in `content-structure`, built on Radix Collapsible (part of the installed `radix-ui` package, no new dependency), by whichever of this change and `add-specialist-evaluations` lands first; (b) a native `details`/`summary` in this change.
   - Recommendation: (a), recorded as a backlog candidate so the second change reuses it instead of adding a copy.
   - Blocks propose: no.
10. **Applied-filter chips.** Listed in the capability description; not in the MVC.
    - Options: (a) out of scope (the controls and the trigger count show the active filters); (b) a chip row with one removal link per filter.
    - Recommendation: (a), for the delivery date.
    - Blocks propose: no.
11. **Region options by country.**
    - Options: (a) independent lists; (b) region options narrowed to the selected country.
    - Recommendation: (a), fewest mechanisms.
    - Blocks propose: no.
12. **Unused filter tokens.** `surface-filter-control`, `surface-filter-option`, `surface-filter-panel`, `surface-filter-field-hover` stay unused.
    - Options: (a) leave them; (b) a later theming cleanup removes them.
    - Recommendation: (a) now; (b) as a backlog candidate.
    - Blocks propose: no.
13. **Result announcement.**
    - Options: (a) the host announces the result count (`meta.total`) in a polite live region after each apply; (b) no announcement.
    - Recommendation: (a), owned by the hosts; the text would be a host catalog key.
    - Blocks propose: no.

## Review log

- 2026-10-06 — First draft (generation mode), design lead.
  - Settled from sources (criterion B): selects instead of free text for the exact-match fields (verified in `tazavera-api` `Offering.php` and `Evaluation.php`); sort applied with the form (WCAG 2.2 SC 3.2.2); breakpoint `lg` (MVC filter bars); no field hover (contrast measurement and form-fields "Hover on light surfaces"); Reset as a link (measured); panel padding 1.5rem (MVC `.tz-filter-stack`); D14 container from the decisions log.
  - Contract findings reported to the orchestrator, not adapted: the list operations document no 422; `cataRef` and the per-axis taste parameters lost their Scribe descriptions ("Must match an existing stored value." only, while `FilterOfferingRequest` describes them); the exact-match semantics of `city`, `process`, `originCountry`, `originRegion`, `producer` and `variety` are not stated in the contract.
