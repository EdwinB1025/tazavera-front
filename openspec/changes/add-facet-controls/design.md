# Design — add-facet-controls

## Context

- Source: `docs/design/add-filter-controls/design-summary.md` (status approved; §4, §4.1, §5.2, §5.3, §6.2, §7, §8, §10, §11 and the controls' Opens 1, 3, 4, 6, 9, 15, 16), and the decisions log of `docs/general-context.md` on `origin/develop`: "librería del combobox", "add-filter-controls: resto de puntos", "geometría de chip compartida", "catálogo: detalle y consenso; filtros: cascada y división", "add-offering-management: puntos del explore" and "filtros: preguntas de los explore en la nube". Product owner split the design into four changes on 2026-10-06; this is part 2. There is no `docs/design/add-facet-controls/` folder: the routine that launched this propose names the add-filter-controls summary as the source.
- Product owner delegated the explore questions to the orchestrator. Q1 (cascade) and Q2 (cmdk) are taken as the decisions log states them (D7, D9). Every other open point is **decided by the orchestrator under Product owner's delegation**, on the architect's recommendation; D14 lists them.
- `add-offering-facets` was proposed in parallel (`origin/claude/add-offering-facets-propose`, design D2) against interfaces it assumed from this change. This design keeps those interfaces (D2); where it differs, D14 says so.
- Existing pieces reused: `Checkbox`, `RadioGroup`, `Input`, `Field`, `Select`, `BADGE_GEOMETRY_CLASSES` (`@/shared/ui`), `cn` (`@/shared/lib/utils`, a plain joiner: no class merging), the `variant-inverse` scope and `focus-ring` utility (`globals.css`), the header-menu panel classes of `DropdownMenu.tsx` (`nav`). Radix Popover and Slider come from the installed `radix-ui` 1.6.7 (`@radix-ui/react-popover` 1.1.23, `@radix-ui/react-slider` 1.4.7 in `node_modules`).
- Next.js: the new components are client components (event handlers, state, effects) and use no `next/*` API; the directive rules are those of `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md`, already enforced by `src/shared/ui/client-boundary.test.ts`.
- Backlog (`docs/backlog.md`, R1, R3–R5, R8): no entry names this change or the files it touches. R4 (menu panel radius) is about `DropdownMenu`'s card panel; the combobox popup copies the nav panel, which already uses `radius-field`.
- API: this change consumes no endpoint. The controls receive options and search functions from their consumers; the API calls, auth and error presentation of each search belong to the consumer (`add-offering-facets` for `GET /roasteries?name=`, `add-offering-management` for `GET /coffeeInventory?coffeeName=`). A failing search function is shown as the "Results could not be loaded" row (D9).

## Goals / Non-Goals

**Goals:** the controls and behaviour in `specs/filtering/spec.md` and `specs/form-fields/spec.md`, exported from `@/shared/ui`, with their texts in the `filters` message area.

**Non-Goals:** see proposal.md, "Non-goals". No control reads the URL, navigates or reads a message catalog: each reports values through callbacks and receives its texts as props.

## Decisions

### D1. Files and FSD layers

| Path | Layer | New / modified | Content |
|---|---|---|---|
| `package.json`, `package-lock.json` | — | Modified | `cmdk` 1.1.1 (D13) |
| `src/shared/ui/Checkbox.tsx` | shared | Modified | Facet-row presentation (D3) |
| `src/shared/ui/RadioGroup.tsx` | shared | Modified | Facet-row presentation, `neutral` and `hidden` options, `id` (D3) |
| `src/shared/ui/facet-row.ts` | shared | New | The row class sets shared by both controls and the cascade (D3) |
| `src/shared/ui/FacetPanel.tsx` | shared | New | Panel, chips block, "Clear all", focus after removal (D4) |
| `src/shared/ui/FilterChip.tsx` | shared | New | Applied-filter chip (D4) |
| `src/shared/ui/FacetTextField.tsx` | shared | New | Text facet (D5) |
| `src/shared/ui/SeeMoreButton.tsx` | shared | New | "See more" / "See less" action (D6) |
| `src/shared/ui/FacetRadioList.tsx` | shared | New | Radio-list facet (D6) |
| `src/shared/ui/FacetCascade.tsx` | shared | New | Taxonomy cascade facet (D7) |
| `src/shared/ui/ScoreRangeFacet.tsx` | shared | New | Score range facet (D8) |
| `src/shared/ui/Combobox.tsx` | shared | New | Combobox (D9) |
| `src/shared/ui/use-combobox-search.ts` | shared | New | Search hook: wait, minimum length, cancel (D9) |
| `src/shared/ui/icons.ts` | shared | Modified | `SlidersHorizontal`, `X` (D10) |
| `src/shared/ui/index.ts` | shared | Modified | Exports of every new component and type |
| `src/app/styles/globals.css` | app (styles) | Modified | `--shadow-nav-current`, `--shadow-nav-hover` both themes; `type-option`, `type-option-detail` (D10) |
| `src/app/styles/theme-tokens.test.ts` | app (styles) | Modified | Guard pairs (D12) |
| `messages/{es,en,ca}/filters.json` | — | New | Generic control texts (D11) |

Every component lives in `src/shared/ui`: they are generic, used by two facet sets and by a management form, and know no entity. Each new file starts with `"use client"`.

### D2. Types (UI-specific, declared before the components)

No generated API type is used. In the files of D1, exported from `@/shared/ui`:

```ts
// facet-row.ts
export type ControlPresentation = "field" | "row";

// RadioGroup.tsx (extended)
export type RadioOption = { value: string; label: ReactNode; neutral?: boolean; hidden?: boolean };

// FacetPanel.tsx
export type AppliedFilter = { id: string; facet: string; value: string };
export type FacetPanelTexts = { clearAll: string; removeFilter: string }; // removeFilter: "…{facet}…{value}"

// FacetRadioList.tsx / FacetCascade.tsx
export type FacetOption = { value: string; label: string };
export type CascadeOption = FacetOption & { children?: FacetOption[] };
export type SeeMoreTexts = { seeMore: string; seeLess: string }; // seeMore: "…{count}…"

// ScoreRangeFacet.tsx
export type ScoreRange = readonly [number, number];
export type ScoreRangeTexts = { minThumb: string; maxThumb: string; from: string; to: string };

// Combobox.tsx
export type ComboboxOption = { value: string; label: string; detail?: string };
export type ComboboxSearch = (term: string, signal: AbortSignal) => Promise<ComboboxOption[]>;
export type ComboboxTexts = { searching: string; noMatches: string; loadError: string; optionCount: string }; // "…{count}…"
```

Props per component are stated in D3–D9. `{facet}`, `{value}` and `{count}` are replaced with `String.prototype.replace` by the component (the flat catalogs carry no ICU syntax).

### D3. Facet-row presentation (form-fields)

- `Checkbox` and `RadioGroup` gain `presentation?: ControlPresentation` (default `"field"`). With `"field"` nothing changes: every existing test keeps passing unchanged. `"row"` is used with `variant="inverse"` on the sidebar.
- The row look follows the controlled value, not CSS state: `Checkbox` row is selected when its `checked` prop is `true`; a `RadioGroup` row is selected when `value === option.value` and the option is not `neutral`. The row presentation is used controlled only (every facet is driven by its consumer's value).
- `src/shared/ui/facet-row.ts` holds the class sets (design summary §4.1, §6.2; Open 4 (a) + (d)):
  - `FACET_ROW_CLASSES`: `group flex w-full min-h-10 cursor-pointer items-center gap-2 rounded-field border-l-4 px-3 py-2`
  - `FACET_ROW_REST_CLASSES`: `border-transparent hover:shadow-nav-hover`
  - `FACET_ROW_SELECTED_CLASSES`: `border-nav-indicator bg-nav-current-dark shadow-nav-current`
  - `FACET_ROW_LABEL_REST_CLASSES`: `type-sidebar-item group-hover:font-bold`
  - `FACET_ROW_LABEL_SELECTED_CLASSES`: `type-sidebar-item underline decoration-nav-underline underline-offset-3`
  - `FACET_ROW_DISABLED_CLASSES`: `cursor-not-allowed opacity-50` (a disabled row takes the rest classes without `hover:shadow-nav-hover` and its label without `group-hover:font-bold`)
  - `FACET_LEGEND_CLASSES`: `type-label mb-1 px-3 py-1`; rows sit in a `flex flex-col gap-1` column.
- In the row presentation the `label` element carries the row classes, so the whole row is the click target; the box or circle keeps its existing classes except the boundary: `border-nav-button-border` instead of `border-border-strong` on every facet row (error keeps `border-feedback-error`). `nav-button-border` passes 3:1 against `nav-surface-dark` and `nav-current-dark` in both themes (summary §8, Open 4 (d)); it is used on every row, not only selected ones, so the boundary does not change colour on selection.
- `RadioGroup` in the row presentation: the legend takes `FACET_LEGEND_CLASSES` instead of `type-label mb-2`; an option with `hidden: true` renders its `label` with the `hidden` attribute (not visible, out of the arrow-key order, still in the group); `id?: string` sets the fieldset id (for "See more"'s `aria-controls`), else the generated one.
- Help and error render as today below the row or group.

### D4. Facet panel and chips (filtering)

- `FacetPanel` props: `title`, `applied: AppliedFilter[]`, `onRemove(id)`, `onClearAll()`, `texts: FacetPanelTexts`, `children` (the facets).
- Markup: `<form role="search" aria-labelledby={titleId} onSubmit={preventDefault}>` with classes `variant-inverse flex flex-col gap-5`; title `<h2 id={titleId} tabIndex={-1} className="type-label px-3">`. The chips block (only when `applied` is not empty): `<div className="flex flex-wrap items-center gap-2 px-3">` with one `FilterChip` per entry, then "Clear all": `<button type="button">` with `type-button min-h-6 text-nav-text-dark underline focus-visible:focus-ring`.
- `FilterChip`: `<button type="button" aria-label={removeFilter filled}>` with the value text and `<X className="size-4 shrink-0" aria-hidden="true" />`. Classes: `cn(BADGE_GEOMETRY_CLASSES, CHIP_CLASSES)` where `CHIP_CLASSES` is `rounded-pill! min-h-7 gap-1.5! py-1! pl-3! border border-border-inverse text-nav-text-dark hover:underline focus-visible:focus-ring` ("geometría de chip compartida": the shared geometry first, the differences as treatments on top). The differences use Tailwind's important modifier because `cn` does not merge classes and two utilities of the same property on one element would resolve by stylesheet order. `type-button` of summary §6.2 has the same weight, size and leading as `type-badge`, so the chip keeps `type-badge`; `pr-2` is already the badge's `px-2`.
- Focus after removal (summary §7): a chip activation stores its index and calls `onRemove`; "Clear all" stores "title" and calls `onClearAll`. When `applied` changes, an effect focuses the chip at the stored index, else the last chip, else the title, and clears the stored target. Nothing moves focus when `applied` changes without a stored target.

### D5. Text facet (filtering)

- `FacetTextField` props: `label`, `value: string` (empty = no value), `onCommit(value: string)` (trimmed; `""` = remove), `type?: "search" | "text"` (default `"text"`), `maxLength`, `placeholder?`, `help?`, `disabled?`.
- `Field` (`variant="inverse"`, label, help) wrapping `Input` inside a `div` with `px-3`. A local draft follows the `value` prop when it changes. Enter (`preventDefault`) or blur commits when the trimmed draft differs from `value`.

### D6. Radio-list facet and "See more" (filtering)

- `FacetRadioList` props: `legend`, `options: FacetOption[]`, `value?: string`, `onChange(value: string | undefined)`, `anyLabel`, `texts: SeeMoreTexts`, `help?`, `disabled?`.
- It renders `RadioGroup` (`presentation="row"`, `variant="inverse"`) with `{ value: "", label: anyLabel, neutral: true }` first, then the options; choosing `""` reports `undefined`.
- Threshold 5 (Open 6 (a)): while collapsed, options after the fifth are `hidden` unless applied. `SeeMoreButton` renders when more than five options follow "Any": `<button type="button" aria-expanded aria-controls={groupId}>` with `type-button mt-1 min-h-6 self-start px-3 text-nav-text-dark underline focus-visible:focus-ring`, text `seeMore` with `{count}` = hidden options, or `seeLess`.

### D7. Taxonomy cascade facet (filtering; Q1 option (a))

- `FacetCascade` props: `legend`, `options: CascadeOption[]` (two levels: summary Open 7 (a)), `value: string[]`, `onChange(values: string[])`, `texts: SeeMoreTexts & { toggleChildren: string }` (`"…{label}…"`), `help?`, `disabled?`.
- A `fieldset` with `FACET_LEGEND_CLASSES` legend; top-level rows in a `flex flex-col gap-1` column. Each row is a `Checkbox` (`presentation="row"`, `variant="inverse"`, controlled `checked`). A parent row is a `flex items-center gap-1` line with the checkbox row (`flex-1`) and its toggle, followed by the children group.
- Toggle: `<button type="button" aria-expanded aria-controls={childrenId} aria-label={toggleChildren with label}>` with `inline-flex size-10 shrink-0 items-center justify-center rounded-field text-nav-text-dark hover:shadow-nav-hover focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-50`; icon `ChevronRight` collapsed, `ChevronDown` expanded (`size-4`, `aria-hidden`).
- Children group: `<div role="group" id={childrenId} aria-label={parent label}>` with `ml-6 mt-1 flex flex-col gap-1`, `hidden` while collapsed (kept in the DOM so `aria-controls` always resolves).
- Selection (decisions log, "filtros: preguntas de los explore en la nube", Q1): checkboxes are independent; a change reports `value` with the toggled id added or removed, re-ordered by option order (parent before its children). Expansion is local state, initialised once: a parent is expanded when one of its children is in `value`; afterwards it changes only through its toggle.
- "See more" applies to top-level rows as in D6 (threshold 5; a parent that is checked or has a checked child stays visible); hidden top-level rows carry the `hidden` attribute.

### D8. Score range facet (filtering; Open 15)

- `ScoreRangeFacet` props: `legend`, `min`, `max`, `value: ScoreRange`, `onCommit(range: ScoreRange)`, `texts: ScoreRangeTexts`, `disabled?`.
- Markup: `fieldset` with `FACET_LEGEND_CLASSES` legend; then a `div` with `mt-3 px-3` holding the slider inside `px-2.5` (half a thumb); then the inputs row `mt-2 flex gap-3 px-3`, each a `Field` (`variant="inverse"`, labels `from` / `to`) with `Input type="number" inputMode="numeric" min max step={1}` in a `flex-1` wrapper. The inputs replace the summary's value text "{min}–{max}".
- Radix Slider (`radix-ui`): Root `relative flex h-5 w-full touch-none select-none items-center data-disabled:opacity-50`, `min`, `max`, `step={1}`, `minStepsBetweenThumbs={0}`; Track `relative h-1.5 grow overflow-hidden rounded-pill bg-border-inverse`; Range `absolute h-full bg-surface-checked`; two Thumbs `block size-5 rounded-full bg-nav-text-dark focus-visible:focus-ring` with `aria-label` `minThumb` / `maxThumb`.
- A local draft `[lo, hi]` follows `value` when it changes. `onValueChange` updates the draft (inputs follow); `onValueCommit` (pointer release and each keyboard step) calls `onCommit`. An input keeps its own text; Enter (`preventDefault`) or blur parses it, takes the bound when empty or not a number, rounds to an integer, clamps to `[min, hi]` for "From" or `[lo, max]` for "To", rewrites the input and commits when the range changed.
- The facet reports the range only; which keys a range writes (and that the full range writes none) is the consumer's.

### D9. Combobox (filtering; Q2, Open 16, management's `variant`)

- Props: `label: string`, `value: ComboboxOption | null`, `onChange(option: ComboboxOption | null)`, `variant?: InputVariant` (default `"default"`), `texts: ComboboxTexts`, `help?`, `disabled?`, `placeholder?`, `maxLength?`, and exactly one of `options: ComboboxOption[]` (local mode) or `search: ComboboxSearch` (search mode).
- Structure: a wrapper (`variant-inverse` when inverse, as `Checkbox`) with a visible `<label className="type-label">` (ref), then cmdk `Command` (`label={label}`, `shouldFilter={false}`, `vimBindings={false}`) holding a Radix `Popover.Root` (`modal={false}`, controlled `open`): `Popover.Anchor` around `Command.Input asChild` whose child is the project's `Input` (variant, placeholder, maxLength, disabled, `aria-describedby` = help id), and `Popover.Content` (`align="start"`, `sideOffset={4}`, `onOpenAutoFocus` prevented so focus stays in the input) holding `Command.List` (`label={label}`). The help text renders below the input as `type-meta mt-1`.
- Popup classes (the `nav` content of `DropdownMenu.tsx` plus width and height): `z-50 w-(--radix-popover-trigger-width) max-h-60 overflow-y-auto rounded-field border border-border-strong bg-nav-surface p-1 text-nav-text shadow-md`.
- Option (`Command.Item`, `value` = option value, `onSelect` chooses): `relative flex min-h-11 cursor-default select-none items-center gap-2 rounded-field px-3 py-2 text-nav-text data-[selected=true]:bg-nav-hover data-[selected=true]:text-nav-text-hover`; inside, a `flex min-w-0 flex-1 flex-col gap-0.5` column with the label (`type-option truncate`; the first case-insensitive occurrence of the typed text wrapped in `<strong className="font-bold">`) and, when present, the detail (`type-option-detail truncate`); the chosen option ends with `Check` (`size-4 shrink-0`, `aria-hidden`). cmdk's `data-selected`/`aria-selected` mark the active option.
- State rows: `<div role="presentation" className="type-option-detail px-3 py-2">` with `searching`, `noMatches` or `loadError`, rendered inside the list in place of options. A visually hidden `role="status"` element (`sr-only`) outside the popup holds the current state text, or `optionCount` with the number of options while options show, or nothing while the popup is closed.
- Input text: a local `term`, set to `value?.label ?? ""` when `value` changes. Typing sets `term` and opens the popup (local mode: when `term` is not empty; search mode: when `term.trim()` has at least 2 characters); Down Arrow on a closed popup opens it in local mode. Choosing calls `onChange(option)`, sets `term` to its label and closes. Escape closes (Radix dismiss). Blur closes; Enter with an empty `term`, or blur with an empty `term`, while `value` is not null calls `onChange(null)`.
- Local mode: the shown options are those whose `label` contains `term`, ignoring case, in the given order; none → `noMatches`.
- Search mode: `useComboboxSearch(search, term)` in `use-combobox-search.ts` returns `{ status: "idle" | "loading" | "success" | "error", results }`. Under 2 trimmed characters it stays `idle` and runs nothing; otherwise it waits 300 ms after the last change, aborts the previous `AbortController`, calls `search(term.trim(), signal)` and sets `loading`; a resolution of an aborted call is ignored, a rejection that is not an abort sets `error`. Rows: `loading` → `searching`; `success` with no results → `noMatches`; `error` → `loadError`.
- **cmdk workaround (Q2, decisions log).** Facts of cmdk 1.1.1, read in the published `dist/index.mjs` (npm tarball `cmdk-1.1.1.tgz`): `Command.Input` spreads the consumer's props first and then sets `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded={true}` (a constant), `aria-controls` (list id), `aria-labelledby` (label id), `aria-activedescendant`, `id` (its own input id) and `type="text"`, so none of those can be overridden by props; the `Command` root renders a visually hidden `<label cmdk-label for={inputId} id={labelId}>` holding its `label` prop; `Command.List` renders `role="listbox"` with `aria-label` from its own `label` prop (default "Suggestions"); `Command.Item` renders `role="option"` with `aria-selected` and `aria-disabled`; the input element is Radix `Primitive.input`, which accepts `asChild`. Inside `Combobox` only: `Command` and `Command.List` receive the label text (so `aria-labelledby` names the input), and a layout effect that runs after every render sets the input's `aria-expanded` to the popup state and the visible label's `for` to the input's `id`. React does not rewrite `aria-expanded` afterwards because cmdk's prop never changes.

### D10. Tokens, typography roles and icons

- `globals.css`, traditional `@theme`: `--shadow-nav-current: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (Tailwind's default `shadow-md`) and `--shadow-nav-hover: inset 0 2px 4px rgb(0 0 0 / 0.05)` (Tailwind's default `inset-shadow-sm`); dark theme block: both `none` (summary §4.1, the brief §5). Utilities `shadow-nav-current`, `shadow-nav-hover`. No guard lists allowed shadow families today (the guards cover colours, radii and focus), so none changes; the theme-completeness test of `theme-tokens.test.ts` then requires both in the dark block.
- Typography roles, next to the component roles, without colour: `@utility type-option` (sans, 600, `--text-sm`, `--leading-tight`) and `@utility type-option-detail` (sans, 400, `--text-xs`, `--leading-normal`) (summary Open 16: `type-label` and `type-meta` would carry the inverse colours onto the popup).
- `icons.ts` adds `SlidersHorizontal` (used by the consumers' "Filters" trigger) and `X` (chips).

### D11. Texts (`messages/{es,en,ca}/filters.json`)

The generic keys of summary §10 and the controls' new texts. Consumers read the area on the server and pass the strings as props.

| Key | es | en | ca |
|---|---|---|---|
| `title` | Filtros | Filters | Filtres |
| `clearAll` | Borrar todo | Clear all | Esborra-ho tot |
| `removeFilter` | Quitar filtro: {facet}: {value} | Remove filter: {facet}: {value} | Treu el filtre: {facet}: {value} |
| `seeMore` | Ver más ({count}) | See more ({count}) | Mostra'n més ({count}) |
| `seeLess` | Ver menos | See less | Mostra'n menys |
| `any` | Cualquiera | Any | Qualsevol |
| `noOptionMatches` | Sin coincidencias | No matches | Cap coincidència |
| `searching` | Buscando… | Searching… | Cercant… |
| `searchFailed` | No se han podido cargar los resultados | Results could not be loaded | No s'han pogut carregar els resultats |
| `optionCount` | Opciones: {count} | Options: {count} | Opcions: {count} |
| `toggleChildren` | Subopciones de {label} | Options under {label} | Subopcions de {label} |
| `rangeFrom` | Desde | From | Des de |
| `rangeTo` | Hasta | To | Fins a |
| `optionsUnavailable` | Opciones no disponibles | Options unavailable | Opcions no disponibles |

Keys from summary §10 owned by the facet sets (facet names, sort options, `trigger`, `triggerWithCount`, `noMatches`, `scoreMin`, `scoreMax`, …) are added by `add-offering-facets` and `add-evaluation-facets`; a key both sets need is added by whichever applies first, unchanged. The texts not in summary §10 are the architect's drafts; Product owner confirms them at artifact review.

### D12. Contrast guard pairs (`theme-tokens.test.ts`, both themes)

`nav-button-border` / `nav-surface-dark` (bound), `nav-button-border` / `nav-current-dark` (bound), `focus-ring-inverse` / `nav-current-dark` (bound), `focus-ring-inverse` / `focus-offset-inverse` (bound), `text-strong` / `surface-input` (text; summary Finding F4). Measured by the design lead (summary §8): 6.41 / 4.90 / 4.90 / 6.41 / 12.24 traditional, 13.69 / 11.71 / 10.50 / 14.28 / 15.93 dark. The row hover keeps the `nav-surface-dark` fill, so it adds no pair; the popup pairs are registered already.

### D13. Dependency `cmdk` 1.1.1

- Approved by Product owner (decisions log, 2026-10-06, "librería del combobox": shadcn/ui Combobox, Radix Popover + `cmdk`, new dependency approved). Installed as `"cmdk": "1.1.1"` in `dependencies`.
- Verified on 2026-10-06 (`npm view cmdk@1.1.1`): MIT; peer `react` and `react-dom` `^18 || ^19`; dependencies `@radix-ui/react-compose-refs` ^1.1.1, `@radix-ui/react-dialog` ^1.1.6, `@radix-ui/react-id` ^1.1.0, `@radix-ui/react-primitive` ^2.0.2, all satisfied by the versions `radix-ui` 1.6.7 already installs (1.1.5, 1.1.23, 1.1.4, 2.1.10), so npm can deduplicate them; unpacked size 81.9 kB; `dist/index.mjs` 4.4 kB gzip. Latest release 1.1.1 on 2025-03-14 (the registry's `time` field): no release for about 19 months, reported as a maintenance risk (Risks 2).

### D14. Points decided by the orchestrator under Product owner's delegation

On the architect's recommendation, recorded here as **decided by the orchestrator under Product owner's delegation**:

1. Generic controls only report values; the cascade reports exactly the checked ids. Whether a checked parent also sends its descendants in the query (decisions log F1, "marcar un padre añade el padre y sus descendientes") is the consumer's mapping from checked ids to `cataRef`, not a change to the checkboxes (Q1: checkboxes are independent).
2. The facet-row control boundary is `nav-button-border` on every facet row, not only on selected rows (D3).
3. The row look follows the controlled value, and the row presentation is controlled only (D3).
4. The chip's differences from the badge geometry use Tailwind's important modifier on top of `BADGE_GEOMETRY_CLASSES`, and the chip keeps `type-badge` (D4).
5. "Clear all" moves focus to the panel title (D4); the summary only set the target after a chip.
6. The combobox is its own field (visible label and help rendered by it, as `Checkbox`), because its input id is cmdk's (D9).
7. The combobox clears its value on Enter or blur with an empty input; Down Arrow opens the popup in local mode; local filtering is a case-insensitive "contains" on the label (D9).
8. The combobox announces its state rows and an option count through one polite status element (D9).
9. The score range inputs sit in one row below the slider, labelled "From" / "To"; an empty or non-numeric value takes its bound (D8).
10. No sort component: the sort control is the existing `Field` + `Select` composed by each consumer; this change adds its contrast pair (D12).
11. Texts not in summary §10 (D11) are drafts.
12. The "Filters" trigger stays with the facet sets (`add-offering-facets` D8); this change only adds its icon.

## Risks / Trade-offs

1. **cmdk accessibility (Q2).** cmdk forces `aria-expanded="true"` and its own input id. → The layout effect of D9 corrects both after each render; tests assert `aria-expanded` follows the popup and the visible label's `for` equals the input id. A future cmdk version that changes these internals breaks the workaround: the version is pinned exactly (D13) and the tests fail first.
2. **cmdk maintenance.** No release since 2025-03-14. → Pinned 1.1.1; the component confines cmdk to `Combobox.tsx`, so replacing it touches one file.
3. **`Command.Input asChild` with the project `Input`.** Radix `Primitive.input` supports `asChild` (cmdk imports it as the input element), but the merge of cmdk's fixed attributes with `Input`'s own `id` and `aria-*` logic is not run yet. → Task 8.3 tests the rendered attributes; if the merge fails, task 8.4 stops and reports it.
4. **Important modifier on the chip.** The chip's overrides rely on Tailwind 4's trailing `!`. → Task 4.2 checks the built CSS for the four important rules.
5. **Consumers' parallel assumptions.** `add-offering-facets` was written against assumed names; D2 keeps them except where D14 changes a detail (the range inputs, "Clear all" focus). → Its task 0.1 compares interfaces before its apply.
6. **No host route in this change.** The visual check in a real sidebar happens in the first facet-set change applied (proposal, "Non-goals").
7. **`## Propose status`.** Not written in `docs/design/add-filter-controls/design-summary.md`: the routine allows commits only under `openspec/changes/add-facet-controls/`, and that summary is shared by four changes.
