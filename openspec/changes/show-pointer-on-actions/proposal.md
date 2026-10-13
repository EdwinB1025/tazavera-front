Type: Refactor (fast lane)

## Why

Backlog entry R85 (production AUT, 2026-10-13), taken as a fast lane by Product owner's order (AUT correction, 2026-10-13, maximum priority): Tailwind 4 gives buttons no pointer cursor and only a few controls set one themselves, so most buttons, toggles and clickable elements show the arrow. Product owner's order: every object with a route or an action shows the link pointer. Settled end state: every enabled link, button, `role="button"`, toggle, tab, chip, select trigger and other clickable control shows the pointer cursor on hover, from one rule in the base layer; disabled controls keep the cursor they have today; text fields keep the text cursor.

## What Changes

- One rule in the base layer of the global stylesheet gives the pointer cursor to every enabled clickable control: links with a destination, buttons, disclosure summaries, labels bound to a control, selects, checkbox, radio, range and button-type inputs, and elements whose role is button, tab, menu item (plain, checkbox, radio), option, switch, checkbox or radio.
- Disabled controls (natively disabled, `aria-disabled="true"`, or marked disabled by a data attribute) do not get the pointer: they keep the cursor they have today, the not-allowed cursor where base-controls and form-fields require it.
- Text fields, including the combobox's text input, keep the text cursor.
- Menu items and combobox options drop the default cursor they set themselves, so the base rule reaches them.
- Nothing else changes: the controls that already set the pointer themselves keep it, and texts, layout, tokens, the requests sent to the API and every other requirement stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: ADDED "Pointer cursor on actions" (the new property, with its scenario "Pointer on enabled actions only").

## Non-goals

- No change to the controls that already set `cursor-pointer` (`BeanScale`, `DescriptorChipGroup`, `FlavorWheelChart`, `FlavorWheelNoteList`, `IntensitySlider`, `Tabs`, `facet-row`) or to the not-allowed cursor of disabled controls.
- No change to hover colours, focus rings, disabled styling (`data-disabled:pointer-events-none` stays) or any other visual treatment.
- No change to the requests sent to the API, texts, tokens or dependencies.
- No other backlog entry is folded in (R84 and R86 run as their own changes).

## Impact

- Modified: `src/app/styles/globals.css` (app layer), `src/shared/ui/DropdownMenu.tsx` and `src/shared/ui/ComboboxPopup.tsx` (shared layer), see design.md D1 and D2.
- Tests: one new validation test for the scenario "Pointer on enabled actions only" in `src/app/styles/pointer-cursor.test.ts`, reading the stylesheet and the two shared files as text (task 1.1). It is a scenario test, not a guard. Existing tests keep their assertions; no test asserts `cursor-default`.
- QA suite: expected to pass unchanged.

## Propose status

- Change-id: `show-pointer-on-actions`
- Date: 2026-10-13
- `openspec validate show-pointer-on-actions --strict` (`@fission-ai/openspec@1.14.1`): valid
- Resolves backlog entry: R85 (fast lane by Product owner's order, AUT correction of 2026-10-13, maximum priority).
- Resolved (backlog entry R85): the end state as stated in What Changes.
- Resolved (architect, design.md D1): the exact base-layer rule; its data-attribute exclusion skips only a `data-disabled` whose value is not `false`, because the combobox options' library writes `data-disabled="false"` on every enabled option and a bare `[data-disabled]` would leave them without the pointer, against the end state. Disabled options stay excluded through `aria-disabled="true"`.
- Resolved (architect, design.md D2): the three `cursor-default` tokens are removed; nothing else outside `globals.css` changes.
- Resolved (architect): the scenario test reads the source files as text, since jsdom computes no cursor; it is a scenario test, not a guard.
- Open: none.
