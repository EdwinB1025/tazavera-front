Status: approved

# Design summary — add-filter-controls

Input for `/opsx:explore` and `/opsx:propose` once approved. Redrafted by the design lead on 2026-10-06. Sources:
- Product owner's settled design brief, `C:/Porjects/Full Stack/Sprint5/bycoding/contexto_diseño_claude_1003.md` (from here on "the brief"): §5 "Facetas (`filtering`)", §5 "Layouts" ("Sidebar colapsado oculta filtros"), §6 "Filterbars del app: no sirven de referencia", §6 "Estilos de navegación del app (base de `inverse`)".
- Product owner's answer of 2026-10-06 (relayed by the orchestrator): Amazon-style facets in the sidebar; the sidebar appears only where required, so far the offerings list (every visitor) and the evaluations list (management route, signed-in specialists); an `app-shell` delta in this change; a collapsed sidebar hides the filters; below `md` the facets open full screen with the sidebar's styles; sorting stays in the page body as a select.
- `contracts/openapi.yaml` on `develop`; `openspec/specs/app-shell/spec.md` ("Management sidebar", "Shell layout and main area"); `openspec/specs/form-fields/spec.md` ("Inverse variant on dark surfaces", "Checkbox", "Radio group"); the components in `src/shared/ui/` (`Sidebar`, `Sheet`, `Checkbox`, `RadioGroup`, `Input`, `Field`, `Select`, `Button`); the decisions log in `docs/general-context.md`; the `add-offering-catalog` draft on `develop`.
- The MVC filter bars (`offering-filterbar.blade.php`, `evaluation-filterbar.blade.php`) are **not** a source (the brief, §6). The MVC sidebar styles (`resources/css/app.css` lines 153–156, 196–249) are the base of the row look, translated to the project's tokens.

- Change-id: `add-filter-controls`
- Capabilities: `filtering` (facet controls and filtering behaviour, `openspec/config.yaml`), plus an `app-shell` delta (the sidebar on the offerings list route) and, if Open 3 takes option (a), a `form-fields` delta.
- Settled by Product owner before this redraft (brief of 2026-10-06, still valid):
  - (a) the evaluations facets take every `GET /evaluations` query field except the ID-based ones (`evaluatorId`, `coffeeId`, `locationId`): `city`, `process`, `status`, `scoreMin`/`scoreMax`, and the sort `orderBy`/`orderDirection`;
  - (b) `GET /coffees` and `GET /roasteries` feed the offering facets (decisions log, 2026-10-06, "cobertura del contrato");
  - (c) the D14 page layout of the decisions log applies to the page body.

## 1. Scope

Two facet sets, each living in the shell sidebar of the list it filters, and a sort select in each list's body. The URL query is the only state.

| Facet set | List it filters | Where the sidebar appears | Query fields (contract names) |
|---|---|---|---|
| Offering facets | Public offerings list, `/{locale}/offerings` (route from `add-offering-catalog`) | For every visitor, anonymous or signed in (app-shell delta, §9.1) | §3.1; the exact set is Open 2 |
| Evaluation facets | My evaluations list, `/{locale}/manage/evaluations` (route from `add-specialist-evaluations`) | Signed-in specialists, as the existing management sidebar; the facets sit below the management navigation entries | `city`, `process`, `status`, `scoreMin`, `scoreMax` (settled a) |

The change delivers: the facet subcomponents of the brief §5 (search, ARIA combobox, score range, checkboxes, radio, flavour cascade, chips + "clear all", "see more"), the facet rows with the selected look, the two facet sets with their option data, the sort select and the "Filters" trigger of the body toolbar, the URL behaviour, the two shadow tokens of the brief §5, and the `app-shell` delta. It does not deliver the list screens, their fetch or their states.

Out of scope: the offering detail route (`/{locale}/offerings/{ulid}`) has no sidebar; every other public route keeps a single column.

## 2. Contract operations

| `operationId` | Use in this change | Response states shown |
|---|---|---|
| `listCoffees` (`GET /coffees`) | Offering facets: the distinct non-null `country`, `region`, `process`, `variety` and `producer` values, sorted alphabetically. Evaluation facets: the distinct `process` values | 200: options. Failure: Open 9 |
| `listRoasteries` (`GET /roasteries`) | Offering facets: the roastery combobox options (`name`), sorted | 200: options. Failure: Open 9 |
| `listOlfactoryTaxonomies` (`GET /taxonomies`) | Offering facets: the flavour cascade (`cataRef[]`) | 200: options. Failure: Open 9 |
| `listOfferings` (`GET /offerings`) | Receives the query the facets write; fetched by the host (`add-offering-catalog`, server) | Owned by the host: loading, results, empty, error |
| `listEvaluations` (`GET /evaluations`) | Receives the query the facets write plus the fixed `evaluatorId`; fetched by the host on the client (`add-specialist-evaluations`) | Owned by the host |

- All option operations are public (`security: []`). By the settled data-loading rule (`.claude/CLAUDE.md` §2) they are fetched on the server with plain `fetch` and reach the facets as props. The `name` query parameter of `GET /coffees` and `GET /roasteries` is not used: neither operation is paginated in the contract (`data` only), so one request returns the whole list.
- Values are shown as the API returns them (general context, "Forma de trabajar"), e.g. `washed`.
- Matching semantics, verified read-only in `tazavera-api` for the first draft (`Offering.php`, `Evaluation.php`): `coffeeName` and `roasteryName` match partially (`like %v%`); `originCountry`, `originRegion`, `process`, `producer`, `variety` and `city` match exactly. Every field except the `*Cata` arrays is single-valued in the contract (`type: string|number|boolean`); `cataRef` is `type: array`. This decides the subcomponent of each facet (§3.1).
- The contract documents no 422 for either list operation. The facets cannot produce an out-of-range value (§5.3); any non-2xx is the host's error state.

## 3. Facet sets

### 3.1 Offering facets (recommended set and order; Open 2 decides)

| # | Facet | Subcomponent (§4) | Query field | Options / limits | Why this subcomponent |
|---|---|---|---|---|---|
| 1 | Coffee | Search | `coffeeName` | free text, max 150 | partial match |
| 2 | Verification | Radio list | `verified` | Any / Verified (`1`) / Provisional (`0`) | single value; the catalog lists both by default (`add-offering-catalog` §3.1, "No default filter or sort") |
| 3 | Average score | Score range | `cuppingAvgMin`, `cuppingAvgMax` | 0–100 | range |
| 4 | Taste notes | Flavour cascade (checkboxes) | `cataRef[]` | `GET /taxonomies`; depth Open 7 | the only array field |
| 5 | Origin country | Radio list + "see more" | `originCountry` | Any + distinct `country` | single value, exact match |
| 6 | Origin region | Radio list + "see more" | `originRegion` | Any + distinct `region` (independent of 5; Open 11) | single value, exact match |
| 7 | Process | Radio list + "see more" | `process` | Any + distinct `process` | single value, exact match |
| 8 | Variety | Radio list + "see more" | `variety` | Any + distinct `variety` | single value, exact match |
| 9 | Producer | Combobox | `producer` | distinct non-null `producer` | single value, exact match, long list |
| 10 | Roastery | Combobox | `roasteryName` | `GET /roasteries` names | long list |
| 11 | City | Text input | `city` | free text, max 90, exact match (Open 10) | no public source lists cities |

Not offered (recommendation, Open 2): `coffeeshopUlid`, `locationUlid` (ID-based, the rule Product owner applied to evaluations), `evaluationCountMin/Max`, `defectiveCountMin/Max`, the sixteen affective-axis bounds (`fragranceMin` … `overallMax`) and the five per-axis taste arrays (`fragranceCata` … `mouthfeelCata`).

### 3.2 Evaluation facets (settled a; order is the design lead's proposal)

| # | Facet | Subcomponent | Query field | Options / limits |
|---|---|---|---|---|
| 1 | Status | Radio list | `status` | Any / Open (`open`) / Closed (`closed`) |
| 2 | Score | Score range | `scoreMin`, `scoreMax` | 0–100 |
| 3 | Process | Radio list + "see more" | `process` | Any + distinct `process` of `GET /coffees` |
| 4 | City | Text input | `city` | free text, max 90, exact match (Open 10) |

`evaluatorId` is never a facet: the host always sends the signed-in user's `ulid` (evaluations summary §6).

### 3.3 Sort (page body)

A `Select` (default variant) inside a `Field` with the visible label "Sort by", in the body toolbar (§6.4). The option value writes both keys.

| List | Options (label → `orderBy`, `orderDirection`) |
|---|---|
| Offerings | Default order (both omitted); Highest score (`cupping_avg`, `desc`); Lowest score (`cupping_avg`, `asc`); Most evaluated (`evaluation_count`, `desc`); Newest (`created_at`, `desc`); Oldest (`created_at`, `asc`) |
| Evaluations | Default order; Highest score (`cupping_score`, `desc`); Lowest score (`cupping_score`, `asc`); Newest (`created_at`, `desc`); Oldest (`created_at`, `asc`); the `status` order is Open 12 |

The "Top rated" header entry (`/{locale}/offerings?verified=1&orderBy=cupping_avg&orderDirection=desc`) lands with "Verified" selected in facet 2 and "Highest score" in the sort select.

## 4. Components

Every facet control renders in the `inverse` variant on the sidebar surface (form-fields spec, "Inverse variant on dark surfaces": "controls on the sidebar and the full-screen mobile filter panel"). The facet panel's root carries the existing `variant-inverse` scope, so legends, help and meta text resolve to the inverse tokens.

| Part | Component (variant) | States | Accessible name / semantics |
|---|---|---|---|
| Facet panel | `form` with `role="search"` | — | the visible panel title ("Filters") names it (`aria-labelledby`) |
| Search | `Field` + `Input` `inverse`, `type="search"`, `maxLength` 150 | rest, hover (border `nav-text-dark`, as shipped), focus, disabled | visible label "Coffee" |
| Text input (city) | `Field` + `Input` `inverse`, `maxLength` 90, help text | as above | visible label "City" |
| Radio list | facet rows (§4.1) with a radio each, inside a `fieldset` whose `legend` is the facet name; first option "Any" | rest, hover, focus, selected, disabled | legend; each row's label |
| Flavour cascade | facet rows with a checkbox each; checking a parent reveals its children below it, unchecking it unchecks and hides its descendants (MVC `descriptor-cascade`, the brief §6) | as rows; children hidden / shown | legend "Taste notes"; each row's label; a parent row carries `aria-expanded` for its children group |
| "See more" | a text `button` after the first visible options | collapsed, expanded | visible text "See more (n)" / "See less"; `aria-expanded`, `aria-controls` the hidden rows |
| Combobox | ARIA combobox (WAI-ARIA APG "combobox with listbox popup"): an `Input` `inverse` with `role="combobox"` and a listbox popup; library is Open 1 | closed, open, option active, option selected, no matches, disabled | visible label (Field); `aria-expanded`, `aria-controls`, `aria-activedescendant`; options `role="option"` with `aria-selected` |
| Score range | two-thumb slider on Radix Slider (`radix-ui` is installed; `@radix-ui/react-slider` present in `node_modules`, no new dependency), 0–100, step 1, inside a `fieldset` with its `legend` | rest, hover, focus per thumb, disabled | legend; thumbs named "Minimum score" / "Maximum score"; `aria-valuetext` per thumb; the range also shown as text "{min}–{max}" |
| Applied chips | one chip per applied facet value: a `button` with the value label and an `X` icon | rest, hover, focus | `aria-label` "Remove filter: {facet}: {value}" |
| "Clear all" | text `button` after the chips | rest, hover, focus | visible text "Clear all" |
| Sort | `Field` + `Select` default | as shipped | visible label "Sort by" |
| Filters trigger (body toolbar) | `Button` `primary`, icon `SlidersHorizontal` | rest, hover, focus | visible text "Filters" / "Filters (n)"; `aria-expanded` mirrors the sidebar; `aria-controls` the sidebar |
| Collapse control (in the sidebar) | existing `SidebarTrigger` in `SidebarHeader`, as shipped (`nav-button`, `PanelLeft`) | as shipped | existing catalog key `shell.toggleSidebar` |

- Icons `SlidersHorizontal` and `X` are added to `src/shared/ui/icons.ts` (the only `lucide-react` entry point; `ChevronDown` and `Check` exist).
- No option shows a result count: no contract operation returns counts per facet value.
- The "Any" row of a radio list is checked while the key is absent from the URL, but it never takes the selected look: the selected look marks applied filters only.
- Facet rows are a new presentation of checkbox and radio; how they are built is Open 3.

### 4.1 Facet row (the selected-row look of the brief §5)

| State | Treatment |
|---|---|
| Rest | no fill; label `type-sidebar-item` (`nav-text-dark`); control boundary per Open 4 |
| Hover (not selected) | Open 4 (the MVC fill `nav-hover` fails in the traditional theme); in every option the row adds `shadow-nav-hover` and the label turns bold (MVC `app.css` 237–249) |
| Selected (an applied value) | fill `nav-current-dark`; a 4px left border in `nav-indicator`; label underlined in `nav-underline` with a 3px offset (MVC `app.css` 230–235: `border-l-4`, `underline-offset-3`); `shadow-nav-current`; the checkbox or radio checked. A selected row takes no hover change (as the header's current entry, app-shell spec "Current page entry") |
| Focus | the control inside the row shows `focus-visible:focus-ring` (inverse tokens) |
| Disabled | 50% opacity, not-allowed cursor, no hover (form-fields spec) |

The indicator and the underline are decorative: the checked control and `aria-checked` carry the state (the brief §6: the current indicator does not reach 3:1 in the traditional theme, hence the checked control).

New tokens, settled by the brief §5: `shadow-nav-current` (traditional: the value of Tailwind's default `shadow-md`) and `shadow-nav-hover` (traditional: the value of Tailwind's default `inset-shadow-sm`), both `none` in the dark theme. They open a new token family (shadow); the guard that lists allowed families must accept it (Unverified: which guard enforces this).

## 5. Behaviour

### 5.1 URL state

- The URL query is the single source of facet and sort state. Keys use the contract names exactly; `cataRef` is a repeated key. The hosts already forward only contract names (`add-offering-catalog` §3.1).
- On load, every facet shows the value of its key; an absent key shows "Any", an empty input or the full slider range.
- A change navigates to the same path with the new query and without `page`, so the list returns to page 1. Focus stays on the control that changed and the scroll position is kept, so the update is a content change, not a change of context (WCAG 2.2 SC 3.2.2).
- Each committed change adds one history entry, so Back restores the previous state.
- Unknown keys and values outside the contract limits (a hand-edited URL) are dropped before the request, and the matching facet shows its empty state.
- Pagination keeps every other key (`add-offering-catalog` §3.1, "Pagination keeps the rest of the query").

### 5.2 When each facet applies (Amazon-style: no Apply button)

| Facet | Applies on |
|---|---|
| Radio list, checkbox row, chip removal, "Clear all", sort select | the change itself |
| Search, city | Enter, or leaving the field with a changed value; an empty value removes the key |
| Combobox | choosing an option; clearing the input removes the key |
| Score range | releasing a thumb, or each keyboard step (Radix `onValueCommit`); the full range 0–100 removes both keys |

### 5.3 Validation

- The slider cannot produce a value outside 0–100 or a minimum above the maximum, so no error message is needed. Text fields are limited by `maxLength` (90 or 150, contract limits).
- Exact-match values come from option lists, so they always exist in the data.

### 5.4 Collapse and mobile

- From `md`, the sidebar is a column beside the content. Collapsing it hides the facets with the rest of the sidebar and returns the main area to one column (app-shell spec, "Collapsible on a medium or larger viewport"; the brief §5 "Sidebar colapsado oculta filtros").
- While collapsed, the body toolbar shows the Filters trigger, which expands the sidebar. While expanded, the trigger is not rendered from `md`; the sidebar's own `SidebarTrigger` collapses it.
- Below `md`, the sidebar is the existing full-screen `Sheet` overlay (`nav-surface-dark`, focus trapped, Escape closes, focus returns to the trigger). It is closed on load and opens from the Filters trigger. Facet changes apply while it is open; the list behind it updates.
- Today's `Sidebar` opens on load below `md` and cannot be expanded once collapsed from `md` on a route without a trigger outside it: Open 5.

### 5.5 States

| State | What shows |
|---|---|
| Results loading | the host's loading state; the facets keep their values |
| Results | the host list |
| Empty with facets applied | the host shows "No results match these filters." (catalog area `filters`) and a "Clear all" button, instead of its unfiltered empty message |
| Error | the host's error state with Retry; the facets keep their values |
| Option data unavailable | Open 9 |
| Combobox with no match | the listbox shows "No matches" as a non-selectable row |

## 6. Layout and spacing (criterion A)

Breakpoints: Tailwind defaults as used in the project (`md` 768px, `lg` 1024px, `xl` 1280px). The sidebar's own breakpoint is `md` (`useIsMobile`, app-shell design D11).

### 6.1 Sidebar (existing, reused as shipped)

| Element | Value | Source |
|---|---|---|
| Column | 16rem wide from `md`; the full height of the main area; fill `nav-surface-dark`; no border; no radius | `Sidebar.tsx` `SIDEBAR_CLASSES` |
| `SidebarHeader` | padding 0.5rem; children 0.5rem apart, vertically centred | `Sidebar.tsx` |
| `SidebarContent` | padding 0.5rem; children 0.5rem apart; scrolls vertically | `Sidebar.tsx` |
| Separator between the management entries and the facet panel (evaluations only) | existing `SidebarSeparator`: 1px `border-inverse` line, 0.5rem side margins; decorative | `Sidebar.tsx` |
| Below `md` | `SheetContent side="left"`, full width and height, padding 0; the same header and content inside | `Sidebar.tsx`, `Sheet.tsx` |

### 6.2 Facet panel

| Element | Value |
|---|---|
| Panel (`form`) | inside `SidebarContent`; a flex column with 1.25rem between its blocks (title, chips, then one block per facet); no padding of its own (the sidebar content's 0.5rem frames it); no border; no radius |
| Panel title | `type-label`; padding 0 0.75rem, aligned with the row content |
| Chips block | rendered only with at least one applied value; padding 0 0.75rem; chips wrap in a row, 0.5rem apart both ways; "Clear all" is the last item of the same row |
| Chip | min height 1.75rem; padding 0.25rem 0.5rem 0.25rem 0.75rem; label and `X` icon (1rem) 0.375rem apart; 1px border `border-inverse`; radius `radius-pill`; no fill; label `type-button`, `nav-text-dark`; hover: label underlined; focus ring |
| "Clear all" | text button, `type-button`, `nav-text-dark`, underlined; min height 1.5rem; no padding, border or fill |
| Search, city, combobox fields | padding 0 0.75rem around the `Field`; `Field` internals as shipped (label, 0.5rem, 2.5rem control, help and error 0.25rem below) |
| Facet group (`fieldset`) | native border, margin and padding reset to 0; the legend, then the rows 0.25rem below it |
| Legend | `type-label`; padding 0.25rem 0.75rem (the `SidebarGroupLabel` geometry) |
| Rows | a column, 0.25rem between rows (the `SidebarMenu` gap) |
| Row | full width; min height 2.5rem; padding 0.5rem 0.75rem; the control and its label 0.5rem apart, vertically centred; radius `radius-field` (the `SidebarMenuButton` geometry); a 4px left border at every state, so the label never shifts when the indicator appears; the whole row is the click target |
| Cascade children | indented 1.5rem from the parent row's start, so a child's control sits under the parent's label; the same row geometry and 0.25rem gap; 0.25rem between the parent row and its first child |
| "See more" | text button below the visible rows, 0.25rem above it; padding 0 0.75rem; min height 1.5rem; `type-button`, `nav-text-dark`, underlined. Number of options visible before it: Open 6 |
| Score range block | the legend, then the slider 0.75rem below it, then the value text 0.5rem below the slider; padding 0 0.75rem plus half a thumb (0.625rem) on each side, so the thumbs never overflow the panel |
| Slider | height 1.25rem; track 0.375rem high, `radius-pill`, fill `border-inverse`; range between the thumbs `surface-checked`; thumbs 1.25rem circles (`rounded-full`), fill `nav-text-dark`, focus ring per thumb (evaluation slider geometry, the brief §5 "Slider: pista 6px radius-pill, thumb 20px") |
| Value text | `type-meta` (resolves to `nav-text-dark` under `variant-inverse`), "60–100" |
| Combobox popup | opens 0.25rem below the input, as wide as the input, at most 15rem tall and scrolling; the header-menu treatment (app-shell spec "Header menu presentation"): fill `nav-surface`, text `nav-text`, radius `radius-field`, padding 0.25rem; options padding 0.5rem 0.75rem, no gap; active option `nav-hover` with `nav-text-hover`; the selected option carries a `Check` icon (1rem) at the end, in the option's text colour |

### 6.3 Mobile (below `md`)

- The facet panel is identical inside the full-screen sheet: same blocks, gaps and rows.
- No horizontal scroll at 375px: every row wraps its label; chips wrap.

### 6.4 Body toolbar (page body, on `surface-page`)

| Element | Value |
|---|---|
| Position | offerings: the catalog's filter slot, 2rem below the heading block (`add-offering-catalog` §6.2); evaluations: at the top of the list section, 2rem above the list |
| Toolbar | a flex row that wraps; items aligned to the bottom; 1rem between items in a row, 0.75rem between rows; the trigger at the start, the sort field at the end; no padding, border or radius |
| Filters trigger | `Button` `primary`, size and geometry as shipped; below `md` always rendered; from `md` only while the sidebar is collapsed |
| Sort field | grows between 12rem and 16rem; `Field` internals as shipped. At 375px (343px of content) the trigger and the field fit in one row |

### 6.5 Visual reference (mock-up; no MVC capture: the MVC filter bars are not a reference)

```
md and up, offerings, sidebar expanded
+-- header (app-shell) ---------------------------------------------------------+
+-- sidebar 16rem, nav-surface-dark ---+-- content (surface-page) --------------+
| [<|] (collapse)                      |  COFFEES                               |
| Filters                              |  Discover offerings                    |
| (Huila x) (Washed x)  Clear all      |                       Sort by          |
| Coffee                               |                       [Default    v]   |
| [ search coffee          ]           |----------------------------------------|
| Verification                         |  surface-section: card grid            |
|  ( ) Any                             |                                        |
|  (o) Verified        <- selected row |                                        |
|  ( ) Provisional                     |                                        |
| Average score                        |                                        |
|  o==========o   60-100               |                                        |
| Taste notes                          |                                        |
|  [x] Fruity        <- selected row   |                                        |
|      [ ] Berry                       |                                        |
|      [ ] Dried fruit                 |                                        |
|  [ ] Floral                          |                                        |
|  See more (6)                        |                                        |
| Origin country ...                   |                                        |
+--------------------------------------+----------------------------------------+

md and up, sidebar collapsed: one column; toolbar = [ (=) Filters (2) ] ...... Sort by [v]
below md (375px): toolbar = [ (=) Filters (2) ] [ Sort by v ]; Filters opens the full-screen sheet
```

Selected row: `nav-current-dark` fill, 4px `nav-indicator` left border, label underlined in `nav-underline`, `shadow-nav-current`, control checked.

Captures still to take (Unverified): the MVC sidebar at 1280px and 375px (`[data-flux-sidebar]` styles in `resources/css/app.css` 153–156 and 196–249), for the row look only.

## 7. Accessibility

- The facet panel is a `search` landmark named by its visible title; with two forms on the evaluations page (none today), each keeps its own name.
- Radio lists are native radio groups (arrow keys move the selection; each move applies, as Amazon). Checkbox rows toggle with Space.
- Combobox: the APG keyboard model (Down/Up, Enter, Escape, typing filters the options); the popup never traps focus.
- Slider thumbs: arrows, Page Up/Down, Home/End (Radix Slider), each with its own name and `aria-valuetext`.
- Chips: each a button with a full accessible name; after a chip removes itself, focus moves to the next chip, else to the previous one, else to the panel title (the design lead's proposal; the architect may fix another target).
- `focus-visible:focus-ring` on every control (inverse tokens on the sidebar).
- The applied count in the trigger is text. No state is shown by colour alone: rows carry the checked control.
- Disabled: 50% opacity.
- Announcing the result count after a change: Open 13.

## 8. Tokens and contrast

Semantic tokens only. New tokens: `shadow-nav-current` and `shadow-nav-hover` (settled, the brief §5); any token Open 4 adds. Ratios measured by the design lead with executed scripts (`contrast-facets.mjs`, `derive.mjs` in the design lead's scratch directory; WCAG 2.2 relative luminance; translucent tokens composited over the surface behind them). **All numbers in this section are the design lead's.** Only gated pairs are listed: text, information-carrying icons and controls (boundary and label).

Backgrounds: S = `nav-surface-dark` (rest row, sidebar), H = `nav-hover` (MVC hover fill), C = `nav-current-dark` (selected row).

| Part | Pair | Traditional | Dark | Gate | Registered today |
|---|---|---|---|---|---|
| Row label, rest | `nav-text-dark` / S | 6.41 | 13.69 | 4.5 ok | yes |
| Row label, selected | `nav-text-dark` / C | 4.90 | 11.71 | 4.5 ok | yes |
| Row label, hover, kept colour | `nav-text-dark` / H | **2.49** | 10.11 | 4.5 fails trad | no |
| Row label, hover, switched | `nav-text-hover` / H | 4.63 | 4.68 | 4.5 ok | yes |
| Control boundary, rest | `border-inverse` / S | 3.41 | 4.19 | 3 ok | yes |
| Control boundary, hover | `border-inverse` / H | **1.33** | 3.10 | 3 fails trad | no |
| Control boundary, selected | `border-inverse` / C | **2.61** | 3.59 | 3 fails trad | no |
| Checked mark | `checked-mark` / `surface-checked` | 6.82 | 4.91 | 3 ok | yes |
| Focus ring | `focus-ring-inverse` / S | 6.41 | 12.27 | 3 ok | yes |
| Focus ring | `focus-ring-inverse` / H | **2.49** | 9.07 | 3 fails trad | no |
| Focus ring | `focus-ring-inverse` / C | 4.90 | 10.50 | 3 ok | no |
| Focus ring against its offset | `focus-ring-inverse` / `focus-offset-inverse` | 6.41 | 14.28 | 3 ok | no |
| Slider thumb | `nav-text-dark` / S | 6.41 | 13.69 | 3 ok | yes (as text) |
| Chip boundary | `border-inverse` / S | 3.41 | 4.19 | 3 ok | yes |
| Chip, "Clear all", "See more" labels | `nav-text-dark` / S | 6.41 | 13.69 | 4.5 ok | yes |
| Placeholder | `text-placeholder-inverse` / S | registered | registered | 4.5 | yes |
| Error (if any) | `feedback-error-inverse` / S | 4.50 | 5.26 | 4.5 ok | yes |
| Combobox popup text | `nav-text` / `nav-surface`, `nav-text-hover` / `nav-hover` | registered | registered | 4.5 | yes |
| Sort select text | `text-strong` / `surface-input` | 12.24 | 15.93 | 4.5 ok | **no** (form-fields gap, Finding F4) |
| Sort select boundary | `border-strong` / `surface-page` | registered | registered | 3 | yes |
| Filters trigger label | `action-primary-text` / `action-primary`, `-hover` | registered | registered | 4.5 | yes |
| Filters trigger boundary | `action-primary` / `surface-page` (rest / hover) | 6.85 / 11.67 | **2.96 / 2.40** | 3 fails dark | no (Open 8, pre-existing) |

Measured and rejected for the trigger: `nav-button` on `surface-page` (hover fill 2.85 traditional and 2.40 dark, hover label 2.85 traditional).

Not gated (decorative or redundant), not measured further: the selected row's `nav-indicator` border (1.40 traditional against C, information only) and `nav-underline`, both redundant with the checked control; the slider track and range fill (the thumbs and the value text carry the values); the separator; the shadows.

The failures in the traditional theme come from two backgrounds: H (the MVC hover fill, sage-500) and C (the settled selected fill) for the inverse control boundary. Open 4 holds the measured options.

Guard pairs this change registers in `src/app/styles/theme-tokens.test.ts`, both themes: `focus-ring-inverse`/`nav-current-dark` (bound), `focus-ring-inverse`/`focus-offset-inverse` (bound), `text-strong`/`surface-input` (text), plus the pairs of the option Product owner picks in Open 4. Nothing else: the other pairs are registered or not gated.

Unused filter tokens: `surface-filter`, `surface-filter-control`, `surface-filter-option`, `surface-filter-panel`, `surface-filter-field-hover` and `border-filter-separator` stay unused by this design (Finding F5).

## 9. Interfaces with other changes

### 9.1 `app-shell` delta (in this change)

End state, for the architect to word as a delta of "Management sidebar" and "Shell layout and main area":
- The sidebar also appears on the offerings list route (`/{locale}/offerings`, any query) for every session state, holding the offering facets and no navigation entries. On every other public route there is no sidebar and the main area is one column.
- On a management route it keeps its navigation entries; on the evaluations list it also holds the evaluation facets, below the entries.
- The same collapse (from `md`) and full-screen overlay (below `md`) rules apply on the offerings route.
- How the route's facets reach the shell's sidebar region is Open 4b.
- The fixes of Open 5, if Product owner folds them in.

### 9.2 Other changes

- **`add-offering-catalog` (Summary).** Owns `/{locale}/offerings`, its fetch, states and pagination. Its "filter slot" (§3.1, §4, §6.2) now holds only the body toolbar of §6.4, not the facets. Its layout must account for a 16rem sidebar column from `md` (catalog findings in the design lead's report; Open 14).
- **`add-specialist-evaluations` (Summary).** Owns `/{locale}/manage/evaluations` and its client fetch with `evaluatorId`; its body hosts the toolbar.
- **`add-auth` (Apply).** On its branch the sidebar region moves from `AppShell.tsx` to `SessionShell.tsx`, which mounts `AppSidebar` only for an authenticated session. The app-shell delta edits that file: this change goes after `add-auth` merges (shared files `src/app/shell/*`).
- **`add-offering-management`.** Also consumes `GET /coffees` and `GET /roasteries` (settled b): one fetch helper in `src/shared/api/`, created by whichever change lands first.
- **Taxonomy entity.** The flavour cascade needs the taxonomy read and lookup. `extract-offering-list-parts` (Apply, tasks 1.1–4.1 done on `feature/extract-offering-list-parts`, `7e6b777`) moves them to `src/entities/taxonomy` (`fetchTaxonomies`, `buildTaxonomyLookup`); this change depends on that change being merged.
- **Badge geometry (applied chips).** `refactor-badge-geometry` (Verify, `0f9cea3`) exports `BADGE_GEOMETRY_CLASSES` from `@/shared/ui` (`Badge.tsx`): `type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`, the single definition of the compact-chip geometry (feedback spec "Shared chip geometry"). The applied chips of §6.2 start from it and add only their own treatments; where §6.2 differs (pill radius, 1.75rem min height, padding, 0.375rem icon gap, `type-button`) the propose states each override on top of the shared classes instead of a second geometry. The spec scenario "Chip matches the badge geometry" has no test yet: the first chip consumer adds it (Product owner, 2026-10-06).
- **Backlog.** R1–R4 do not name this change. Candidates in Findings F3 and F5.

## 10. Texts (catalog area `filters`, es / en / ca, passed as props)

| Key | es | en | ca |
|---|---|---|---|
| `title` | Filtros | Filters | Filtres |
| `trigger` | Filtros | Filters | Filtres |
| `triggerWithCount` | Filtros ({count}) | Filters ({count}) | Filtres ({count}) |
| `clearAll` | Borrar todo | Clear all | Esborra-ho tot |
| `removeFilter` | Quitar filtro: {facet}: {value} | Remove filter: {facet}: {value} | Treu el filtre: {facet}: {value} |
| `seeMore` | Ver más ({count}) | See more ({count}) | Mostra'n més ({count}) |
| `seeLess` | Ver menos | See less | Mostra'n menys |
| `any` | Cualquiera | Any | Qualsevol |
| `noOptionMatches` | Sin coincidencias | No matches | Cap coincidència |
| `coffeeName` | Café | Coffee | Cafè |
| `coffeeNamePlaceholder` | Buscar café | Search coffee | Cerca un cafè |
| `roastery` | Tostador | Roastery | Torrador |
| `originCountry` | País de origen | Origin country | País d'origen |
| `originRegion` | Región de origen | Origin region | Regió d'origen |
| `process` | Proceso | Process | Procés |
| `variety` | Variedad | Variety | Varietat |
| `producer` | Productor | Producer | Productor |
| `city` | Ciudad | City | Ciutat |
| `cityHelp` | Nombre exacto de la ciudad | Exact city name | Nom exacte de la ciutat |
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
| `scoreRange` | {min}–{max} | {min}–{max} | {min}–{max} |
| `tasteNotes` | Notas de sabor | Taste notes | Notes de sabor |
| `sortBy` | Ordenar por | Sort by | Ordena per |
| `sortDefault` | Orden predeterminado | Default order | Ordre predeterminat |
| `sortScoreDesc` | Mayor puntuación | Highest score | Puntuació més alta |
| `sortScoreAsc` | Menor puntuación | Lowest score | Puntuació més baixa |
| `sortMostEvaluated` | Más evaluadas | Most evaluated | Més avaluades |
| `sortNewest` | Más recientes | Newest | Més recents |
| `sortOldest` | Más antiguas | Oldest | Més antigues |
| `noMatches` | Ningún resultado coincide con estos filtros. | No results match these filters. | Cap resultat no coincideix amb aquests filtres. |

"Borrar todo" and "ver más" are the brief's wording (§5). The other es strings follow the first draft; the en and ca strings are the design lead's drafts. Key names are a proposal; the architect may rename them. Taxonomy node names come from `GET /taxonomies` by locale (the landing mechanism). The collapse control keeps `shell.toggleSidebar`.

## 11. Tests (expected outcomes; the architect writes the tasks)

- URL to facets: each facet shows its key's value; absent keys show "Any", empty or the full range.
- Each change navigates with the new key, without `page`; sort writes both keys and "Default order" neither; the full slider range writes neither bound.
- Cascade: checking a parent reveals its children; unchecking removes the descendants from the query.
- "See more": hidden rows not rendered (or hidden) until expanded; `aria-expanded` toggles.
- Combobox: role, `aria-expanded`, `aria-activedescendant`; choosing an option writes the key; "No matches" row.
- Chips: one per applied value; removing one drops only that value; "Clear all" keeps only the path (and the sort, per the architect's choice: Unverified).
- Selected rows: exact classes for fill, left border, underline and shadow on applied values only; the "Any" row never takes them.
- Parsing: unknown keys and out-of-range values dropped.
- Options: distinct, sorted, no `null`; "Any" first.
- Sidebar: rendered on `/{locale}/offerings` for an anonymous session; absent on the detail route and other public routes; facets below the entries on the evaluations route; collapsed hides the facets; the trigger's visibility rules of §5.4.
- Guard pairs of §8 registered; icons only through `icons.ts`; focus guard.
- Visual check at 375px and 1280px, both themes, sidebar expanded, collapsed and as overlay (verification task).

## 12. Findings on existing code

- **F1 — Sidebar opens on load below `md`.** `Sidebar.tsx:44` starts `open` as `true` and, below `md`, renders the `Sheet` with `open={open}`, so the overlay would cover the screen on arrival (read in code, not run: Unverified). Workflow §4: defect in merged code → new change, unless Product owner folds it into this change's app-shell delta (Open 5).
- **F2 — A collapsed sidebar cannot be expanded.** The only `SidebarTrigger` sits in `SidebarHeader`, inside `Sidebar`, which returns `null` when collapsed from `md` (`Sidebar.tsx:98`, `AppSidebar.tsx:52`). Same path as F1 (Open 5). The body trigger of §5.4 covers the two facet routes only.
- **F3 — Management entry hover fails contrast.** `SidebarMenuButton` hovers to `nav-hover` with the `nav-text-dark` label: 2.49 in the traditional theme (design lead's measurement), not registered in the guard. Defect in merged code → new change in `app-shell`. Also, its current state shows only `nav-current-dark`, without the indicator border, underline and shadow the brief §6 describes for the sidebar's current look; aligning it is a visible change → new change or backlog, Product owner's call.
- **F4 — `text-strong`/`surface-input` not registered** although `Input` and `Select` render that pair (form-fields, archived). Coverage only: added to this change's guard task (§8).
- **F5 — Unused filter tokens.** The `surface-filter*` family and `border-filter-separator` (translated from the MVC filter bar) have no consumer in this design. Backlog candidate for a theming cleanup.
- **F6 — Primary button boundary in the dark theme** (2.96 rest / 2.40 hover against `surface-page`), shared by every primary button already merged. Open 8.

## Open

**Answered 2026-10-06 (Product owner): every recommendation in this list is accepted** — 1 (a), 2 (a), 3 (a), 4 (a) + (d), 4b (a), 5 (a), 6 (a), 7 (a), 8 (a), 9 (a), 10 (a), 11 (a), 12 (a) if verified else (b), 13 (a), 14 (a) decided in `add-offering-catalog`. Points 15 (typed values in the score range) and 16 (search-as-you-type) were added afterwards and are answered below. No point blocks propose.

1. **Combobox library.** No installed package provides an ARIA combobox (`radix-ui` has none).
   - Options:
     - (a) shadcn/ui Combobox: Radix Popover (installed) + `cmdk` 1.1.1 (MIT; peer React ^18 || ^19; depends on Radix packages already installed) — new dependency;
     - (b) Downshift 9.4.0 `useCombobox` (MIT; peer React ≥16.12; headless, WAI-ARIA combobox pattern; deps `tslib`, `react-is`, `prop-types`, `@babel/runtime`, `compute-scroll-into-view`) — new dependency;
     - (c) React Aria Components 1.21.1 `ComboBox` (Apache-2.0; peer React up to 19) — new dependency, larger;
     - (d) in-house, following the WAI-ARIA APG "editable combobox with list autocomplete".
   - Recommendation: (a), the project's library-first rule (shadcn/ui on Radix first; Combobox is not on the excluded list), unstyled and rewired to tokens as `Sidebar` and `Sheet` were. Source: `AGENTS.md` Research; registry data from `registry.npmjs.org/<pkg>/latest` (fetched 2026-10-06). Maintenance activity and bundle sizes: Unverified.
   - **Answered 2026-10-06 (Product owner): (a).** shadcn/ui Combobox (Radix Popover + `cmdk`), new dependency approved; unstyled and rewired to tokens. The architect verifies `cmdk` maintenance and size at propose and reports if it fails.
   - Blocks propose: no.
2. **Offering facet set and order.**
   - Options: (a) the 11 facets of §3.1 in that order; (b) the same without the two combobox facets (no dependency, Open 1 not needed for offerings); (c) every non-ID field, with the counts, axis bounds and per-axis taste arrays in a "More filters" group.
   - Recommendation: (a): every field `GET /coffees`, `GET /roasteries` and `GET /taxonomies` can feed (settled b), plus the score, verification and free-text fields.
   - Blocks propose: no (answered (a), 2026-10-06).
3. **How facet rows are built.** `Checkbox` and `RadioGroup` render their own label rows (`min-h-6`, `gap-2`, `type-label`) and offer no per-option row; `RadioGroup` renders all options at once.
   - Options: (a) a `form-fields` delta in this change: a row presentation for `Checkbox` and for `RadioGroup` options (whole row is the label, the row geometry and states of §4.1); (b) a separate refactor change in `form-fields` first; (c) facet rows build their own native inputs with copied box classes (duplication, against criterion C).
   - Recommendation: (a): one owner for the box, no copy; the change commits it under `form-fields`. If Product owner wants the backlog rule applied strictly, (b).
   - Blocks propose: no (answered (a), 2026-10-06).
4. **Row hover and selected-row control boundary (contrast gate, traditional theme).** Measured in §8: on the MVC hover fill `nav-hover`, the label (2.49), the control boundary (1.33) and the focus ring (2.49) fail; on the settled selected fill `nav-current-dark`, the control boundary `border-inverse` fails (2.61). No single colour passes against both `nav-surface-dark` and `nav-hover` in the traditional theme.
   - Hover options: (a) no fill change on hover: `shadow-nav-hover` plus a bold label, label colour kept (all pairs then sit on S: pass); (b) the MVC fill `nav-hover` with the label switched to `nav-text-hover` (4.63 / 4.68), which still leaves the control boundary and the focus ring failing → new tokens for both; (c) a new per-theme row-hover token (traditional: no visible fill; dark: `nav-hover`, which passes there).
   - Selected-row boundary options: (d) reuse the existing `nav-button-border` (a boundary token, cream-100 / night-cream-100) for checkbox and radio boundaries on facet rows: 6.41 / 4.90 traditional (S / C), 13.69 / 11.71 dark; (e) a new primitive `sage-450` `#9cc3bd` (sage-400 lightened by 19%: 3.10 against C, 4.06 against S) behind a new semantic token for the inverse boundary on selected rows, dark theme reusing `night-petrol-600` (3.59 / 4.19).
   - Recommendation: (a) + (d): no new token, and (d) is the first existing boundary token that passes everywhere (orchestrator's "Contrast gate failures", step 2). Pairs to register with (d): `nav-button-border`/`nav-surface-dark` and `nav-button-border`/`nav-current-dark`.
   - Blocks propose: no (answered (a) + (d), 2026-10-06).
4b. **How a route's facets reach the shell's sidebar region.** The shell (`AppShell`/`SessionShell`, layout level) renders the region; the facets and their server-fetched options belong to the route.
   - Options: (a) a Next.js parallel route slot (`@sidebar`) under `app/[locale]/`, with a `default` that renders nothing and a catch-all that renders nothing, so soft navigation does not keep the facets on other routes (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md`, "default.js", "Hard Navigation"); (b) the shell matches the route itself (as `AppSidebar` matches `/manage`) and mounts the facets, fetching their options at layout level for every route; (c) the list page draws its own sidebar column from the shared `Sidebar` parts, outside the shell region (contradicts the requested app-shell delta).
   - Recommendation: (a): it keeps fetches per route and the shell generic. It is a shared shell mechanism, hence Product owner's.
   - Blocks propose: no (answered (a), 2026-10-06).
5. **Sidebar defects F1 and F2.**
   - Options: (a) fold both into this change's app-shell delta (closed on load below `md`; a collapsed sidebar can always be expanded again, on every route that has one); (b) a separate `app-shell` fix change before this one; (c) fix only the two facet routes (the body trigger) and leave management routes as they are.
   - Recommendation: (a): the delta rewrites the same requirement, and F1 would cover the public catalog on every mobile visit.
   - Blocks propose: no (answered (a), 2026-10-06).
6. **"See more" threshold.**
   - Options: (a) 5 options visible, applied values always visible even beyond the threshold; (b) 8; (c) no threshold.
   - Recommendation: (a) (Amazon pattern; no project source).
   - Blocks propose: no.
7. **Flavour cascade depth.**
   - Options: (a) levels 0 and 1, as the evaluations rule for descriptors (general context, add-specialist-evaluations); (b) levels 0–2, as the MVC `descriptor-cascade`.
   - Recommendation: (a). Whether `cataRef` on a parent matches offerings tagged with its children is Unverified in the API.
   - Blocks propose: no.
8. **Primary button boundary in the dark theme (F6, pre-existing).**
   - Options: (a) the trigger uses `primary` like the rest of the app, and the boundary goes to a new `base-controls` change (for example a `border-strong` border in the dark theme: 4.88 against `surface-page`, first-draft measurement); (b) that change first; (c) accept the label as identification.
   - Recommendation: (a).
   - Blocks propose: no.
9. **Option data unavailable** (`GET /coffees`, `GET /roasteries` or `GET /taxonomies` fails).
   - Options: (a) the dependent facets render disabled with a help text "Options unavailable", the rest keeps working; (b) the dependent facets are hidden; (c) the whole panel shows an error with Retry.
   - Recommendation: (a): the state is stated in text and the list stays usable.
   - Blocks propose: no.
10. **City facet.** Exact match, no public source of cities.
    - Options: (a) free-text input with the help text "Exact city name"; (b) leave it out of the offering facets (settled a keeps it for evaluations); (c) ask for a cities endpoint (contract change).
    - Recommendation: (a). Case sensitivity depends on the database collation (Unverified).
    - Blocks propose: no.
11. **Region options by country.**
    - Options: (a) independent lists; (b) regions narrowed to the selected country.
    - Recommendation: (a), fewest mechanisms.
    - Blocks propose: no.
12. **Evaluation sort by `status`.**
    - Options: (a) "Open first" / "Closed first" once the architect verifies the column order in `tazavera-api`; (b) leave it out.
    - Recommendation: (a) if verified, else (b).
    - Blocks propose: no.
13. **Result announcement.**
    - Options: (a) the host announces `meta.total` in a polite live region after each change; (b) none.
    - Recommendation: (a), owned by the hosts (their catalog key).
    - Blocks propose: no.
14. **Catalog grid with the sidebar open.** From `md` the content loses 16rem: at 768px about 512px remain, and the catalog's "2 columns from `md`, 3 from `xl`" (`add-offering-catalog` §6.2) gives cards about 13rem wide (design lead's estimate).
    - Options: (a) the catalog grid follows the content width (columns by available width, not viewport); (b) shift the catalog's column breakpoints up by one step while the sidebar is open; (c) accept.
    - Recommendation: (a), decided in `add-offering-catalog`'s summary, since it owns the grid.
    - Blocks propose: no (for this change).
15. **Typed values in the score range (Product owner, 2026-10-06).** Besides the two thumbs, the user can type the minimum and the maximum: two number inputs ("From" / "To", 0–100, step 1) kept in sync with the slider both ways, replacing the read-only value text "{min}–{max}".
    - To settle in the design: the inputs' layout, padding, gap, border and radius (criterion A); when a typed value is applied (proposed: on Enter or on leaving the input, as the slider's `onValueCommit`); how an out-of-range value or a minimum above the maximum is handled (proposed: clamped to 0–100 and to the other bound, no error message, so §5.3 still holds); the inputs' accessible names and the contrast of their text and boundary on the sidebar surface.
    - **Answered 2026-10-06 (Product owner):** a typed value is applied on Enter or when the input loses focus, not on every key; an out-of-range value is clamped to 0–100 and to the other bound, with no error message (§5.3 holds). The inputs' layout, padding, gap, border, radius, accessible names and contrast are details for the design lead and the architect, using the existing sidebar input treatment; they add no token.
    - Blocks propose: no.
16. **Search-as-you-type for the API-backed comboboxes (Product owner, 2026-10-06).** The combobox options are not loaded once: while the user types, the combobox queries the API with `?name=` and shows the results. This is an accepted exception to the data-loading rule (public endpoints fetched on the server): these two public endpoints are also queried from the browser while typing.
    - Applies to: the Roastery facet (`GET /roasteries?name=`), and to the inventory item of `add-offering-management`'s create form (`GET /coffeeInventory?coffeeName=`, client with the session token; Product owner, 2026-10-06). The combobox is generic and reusable: it lives in `src/shared/ui` with its search hook, built by this change; each consumer passes the search function and the row content, so it knows nothing about the endpoint or the token. Inventory row: line 1 the coffee name, line 2 `roastery · country · process`, empty fields skipped. It cannot apply to the Producer facet: `?name=` on `GET /coffees` filters by coffee name, not by producer, so Producer keeps the options loaded once (§3.1 row 9).
    - Behaviour (proposed): a request after 2 characters and 300 ms without typing; a newer request cancels the older one; results replace the list. The combobox's own filtering is off (the API filters). Popup rows for the states: "Searching…" while loading, "No matches" (existing), "Results could not be loaded" on failure, all non-selectable, announced through the listbox's polite status.
    - Result row ("mini card"), proposed by Claude on Product owner's request. Inside the existing popup (§6, header-menu treatment: `nav-surface`, `radius-field`, padding 0.25rem):
      - Layout: padding 0.5rem 0.75rem (existing option padding); two lines, 0.125rem apart; min height 2.75rem (touch target); the `Check` icon of the selected option at the end, centred on the row; the popup's 15rem maximum shows about five rows.
      - Line 1, the name: 600 weight, `text-sm`, leading tight; one line, truncated with an ellipsis. The part matching the typed text is shown in 700 weight (weight only, no colour or background).
      - Line 2, the detail: 400 weight, `text-xs`, leading normal; one line, truncated. Roastery: `description`. Coffee: `country · region · process · variety`, empty fields skipped; the line is omitted when every field is empty.
      - Colour: both lines and the icon use the row's text colour, `nav-text` at rest and `nav-text-hover` on the active row (fill `nav-hover`). Hierarchy comes from weight and size, not from a lighter colour, so no new colour pair or token is needed: both pairs are already registered at 4.5 (§8, "Combobox popup text"), in both themes.
      - Typography roles: two colour-free utilities in `globals.css` next to the component roles, `type-option` (600, `text-sm`, leading tight) and `type-option-detail` (400, `text-xs`, leading normal), because the existing `type-label` and `type-meta` carry the inverse colours of the sidebar scope and would land cream on the popup's sage fill.
    - Fetching (Product owner, 2026-10-06): a small in-house hook (`fetch`, `AbortController`, 300 ms wait); no data library.
    - Texts (Product owner, 2026-10-06): every interface text of the combobox — the state rows "Searching…", "No matches", "Results could not be loaded", the inputs' labels and accessible names, and the status announcements — comes from the message catalog in es, en and ca and reaches the component as props, following the active locale. API values (names, `description`, country, region, process, variety) are shown as returned, untranslated (general context rule).
    - Blocks propose: no.

## Review log

- 2026-10-06 — First draft (generation mode), design lead: inline filter panel from `lg` on `surface-filter`, `Sheet` below `lg`, Apply and Reset buttons. Sources included the MVC filter bars.
- 2026-10-06 — Redraft, design lead, on Product owner's settled decisions (the brief §5–§6, answer of 2026-10-06), which the first draft did not have.
  - **Changed:** facets moved to the shell sidebar with `inverse` controls; the inline panel, `surface-filter`, Apply, Reset link, the `Sheet`-specific mobile panel and the client-side range validation removed; the MVC filter bars dropped as a source; sort moved to a body select; the subcomponents of the brief §5 added (search, combobox, score range as a two-thumb slider, checkboxes, radio, cascade, chips + "clear all", "see more"); the selected-row look and the shadow tokens added; the app-shell delta written (§9.1); contrast re-measured for the sidebar backgrounds.
  - **Settled from sources (criterion B):**
    - the subcomponent of each facet from the contract types and the API matching (array → checkboxes; single exact value → radio list or combobox; partial → search or combobox);
    - instant apply without an Apply button (Amazon-style, Product owner's answer; WCAG 2.2 SC 3.2.2 kept by holding focus and scroll);
    - the verification facet (old Open 6): the catalog lists both statuses by default (`add-offering-catalog` §3.1);
    - the mobile surface (old Open 3): the sidebar's own `Sheet` (`nav-surface-dark`), per Product owner;
    - applied chips (old Open 10): in scope, the brief §5; placed in the facet panel, since the brief lists them among the sidebar's subcomponents;
    - the taste-note disclosure (old Open 9): no longer needed; the cascade and "see more" replace it;
    - the score range on Radix Slider (installed `radix-ui`, no new dependency), slider geometry from the brief §5;
    - row, legend, gap and sidebar geometry reused from `SidebarMenuButton`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarContent` (criterion C); the row's 4px left border and underline offset from MVC `app.css` 230–235;
    - the combobox popup reuses the header-menu treatment (app-shell spec "Header menu presentation");
    - corrected: the first draft called `text-strong`/`surface-input` "already registered"; it is not (F4).
  - **Kept from the first draft:** the contract facets and their limits, the sort options, the catalog texts still used, the option-data and city points, the primary-button dark boundary point, the region and status-sort points, the result announcement.
  - **Old Open 12** (unused filter tokens) moved to Finding F5.

## Propose status

- 2026-10-06 — change-id `add-evaluation-facets` (part 4 of 4): `openspec validate add-evaluation-facets --strict` passes. Resolved, with each decision recorded in its design.md: "Clear all" keeps the sort keys (§11 leaves it to the architect; the choice `add-offering-facets` made); Open 12 falls to its accepted fallback (b), no status sort, because the verification of the status column order in `tazavera-api` cannot be performed from the orchestrator's session (read-only access denied), so no `sortOpenFirst`/`sortClosedFirst` texts are needed; the result announcement is the host's own catalog key `evaluations.resultCount` (Open 13), with the same strings as `add-offering-facets`' `catalog.resultCount`; when the URL carries no sort keys the request sends the settled default order `created_at` descending and `listMyEvaluations` takes the serialized request query. The last four are decided by the orchestrator under Product owner's delegation. Open: the D10 draft strings (`optionsUnavailable`, `resultCount`) await Product owner's confirmation at artifact review. This section is scoped to `add-evaluation-facets`; the parallel parts may add their own sections and Product owner reconciles them at merge.
