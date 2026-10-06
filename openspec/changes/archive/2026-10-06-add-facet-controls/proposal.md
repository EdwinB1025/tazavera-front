## Why

The approved `add-filter-controls` design puts Amazon-style facets in the shell sidebar of the offerings list and of the evaluations list, and its combobox is also needed by the create form of `add-offering-management`. Product owner split that design into four changes on 2026-10-06; this is part 2 of 4: the generic controls every facet set is built from. The two facet sets (`add-offering-facets`, `add-evaluation-facets`) and the offering form cannot be applied until these controls exist.

## What Changes

- A facet panel: a search landmark named by its visible title, holding the applied-filter chips and "Clear all" (from a list it receives) above the facets it is given.
- Facet rows: a row presentation of the existing checkbox and radio with the selected-row look of the design (fill, left indicator, underline, shadow) for applied values, a hover with shadow and bold label and no fill change, and a control boundary that passes 3:1 on every row background.
- The generic facets: a text facet (search or plain text, applied on Enter or on leaving the field), a radio list with "Any" first and "See more" after five options, a taxonomy cascade of checkboxes with an expand/collapse control per parent row, and a score range (two-thumb slider kept in sync with "From" / "To" number inputs, values clamped, applied on release, keyboard step, Enter or leaving an input).
- A reusable combobox (ARIA combobox with a listbox popup) in two modes: options given up front and filtered locally, or options searched while typing through a search function the consumer passes (2 characters, 300 ms wait, a newer search cancels the older one), with the state rows "Searching…", "No matches" and "Results could not be loaded", two-line result rows with the typed part in bold, and the input's `default` and `inverse` variants.
- The sort control requirement (a labelled select in the page body that applies on change), composed from the existing field and select.
- Two shadow tokens (`shadow-nav-current`, `shadow-nav-hover`), two colour-free typographic roles for the combobox rows (`type-option`, `type-option-detail`), the icons `SlidersHorizontal` and `X`, and the generic texts of the `filters` message area in es, en and ca.
- New dependency `cmdk` 1.1.1, approved by Product owner (decisions log, 2026-10-06, "librería del combobox").
- Contrast guard pairs for the rows' backgrounds, the focus ring on the selected row and the select text.

## Capabilities

### New Capabilities

- `filtering`: the generic facet controls and their filtering behaviour (facet panel, applied chips and "Clear all", text facet, radio list with "See more", taxonomy cascade, score range, combobox, sort control). The offering and evaluation facet sets are added to the same capability by `add-offering-facets` and `add-evaluation-facets`.

### Modified Capabilities

- `form-fields`: adds the facet-row presentation of the checkbox and of the radio group options (row geometry, selected-row look, hover, boundary on row backgrounds, options hidden behind "See more").

## Impact

- **Code:** new components in `src/shared/ui` (facet panel, applied chip, text facet, radio list, cascade, score range, combobox and its search hook), the row presentation in `src/shared/ui/Checkbox.tsx` and `src/shared/ui/RadioGroup.tsx`, `src/shared/ui/icons.ts`, `src/shared/ui/index.ts`, `src/app/styles/globals.css`, `src/app/styles/theme-tokens.test.ts`, `messages/{es,en,ca}/filters.json`.
- **API:** none. The controls take options and search functions from their consumers; no endpoint is called by this change.
- **Dependencies:** `cmdk` 1.1.1 (MIT). Its Radix dependencies are already installed through `radix-ui`. Radix Popover and Slider come from the installed `radix-ui`.
- **Consumers waiting on this change:** `add-offering-facets`, `add-evaluation-facets`, `add-offering-management` (combobox in the `default` variant).

## Non-goals

- The offering and evaluation facet sets, their option data, their URL keys and parsing, the body "Filters" trigger and the sort options of each list (`add-offering-facets`, `add-evaluation-facets`).
- The `@sidebar` slot, the sidebar's collapse and overlay fixes and the shell control that reopens a collapsed sidebar (`add-sidebar-slot`).
- Navigation and URL writing: each control reports its committed value; the consumer decides the query.
- Any API call, including the roastery and inventory searches (their consumers pass the search function).
- Result counts per option (no contract operation returns them).
- The visual check of the controls inside a real sidebar at 375px and 1280px, which needs a host route: done by the first facet-set change applied.
