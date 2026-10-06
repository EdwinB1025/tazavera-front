## Context

See proposal.md for the motivation. The design source is `docs/design/refine-facet-controls/design-summary.md` (approved 2026-10-06, Open 1 included); this document records the decisions the build needs and does not re-decide the summary.

Current state on `develop` (from `add-facet-controls`):

- The facet-row class sets shared by `RadioGroup`, `Checkbox` and `FacetCascade` live in `src/shared/ui/facet-row.ts` (add-facet-controls design.md D3). The legend uses `FACET_LEGEND_CLASSES` = `type-label mb-1 px-3 py-1`.
- `RadioGroup.tsx` and `Checkbox.tsx` render the help as `type-meta mt-1` and the error as `type-error mt-1` in both presentations; `FacetCascade.tsx` renders its help as `type-meta mt-1`. None has side padding, so in a facet panel the help starts 0.75rem left of the legend.
- `Combobox.tsx` keeps `term` (the input text) in state and resets it to the value's label only when the `value` prop changes. On blur it closes the popup and reports `null` when the input is empty and a value is chosen; Escape only closes the popup (Radix Popover). It passes `term` to `useComboboxSearch` in search mode, so any term of 2 or more characters searches after 300 ms, including the label it sets itself on first render and after a choice (summary §8).

Constraints: no new dependency, token, colour or text; semantic tokens only; `focus-visible:focus-ring` is untouched; no Next.js API is added or changed (the `"use client"` directive of `Combobox.tsx` stays as is).

## Goals / Non-Goals

**Goals:**

- One shared class set gives the help and error paragraphs of the row facets their side padding.
- The combobox restores or clears abandoned text and searches only for typed text, without changing its props or its public types.

**Non-Goals:**

- Any change to `use-combobox-search.ts`: the hook keeps searching for whatever term it is given; the combobox decides which term to give it.
- Any change to the field presentation of `RadioGroup` and `Checkbox`, to `FacetTextField` (already wrapped in `px-3`) or to `ScoreRangeFacet` (no help).

## API endpoints consumed

None. The combobox consumers pass their own search function (`add-offering-facets`: `listRoasteries` with `?name=`; `add-offering-management`: `listCoffeeInventory` with `?coffeeName=`); neither changes. There is no API error to present.

## Types

No derived or UI-specific type is added. `ComboboxProps`, `ComboboxOption` and `ComboboxSearch` keep their shape; `src/shared/api/schema.ts` is not touched.

## Files

| Path | FSD layer | Capability | Change |
|---|---|---|---|
| `src/shared/ui/facet-row.ts` | shared | filtering | adds `FACET_MESSAGE_CLASSES` (D1) |
| `src/shared/ui/FacetCascade.tsx` (+ test) | shared | filtering | help paragraph takes `FACET_MESSAGE_CLASSES` |
| `src/shared/ui/RadioGroup.tsx` (+ test) | shared | form-fields | in the row presentation, help and error take `FACET_MESSAGE_CLASSES` |
| `src/shared/ui/Checkbox.tsx` (+ test) | shared | form-fields | same as `RadioGroup` |
| `src/shared/ui/Combobox.tsx` (+ test) | shared | filtering | abandoned text (D2) and search only for typed text (D3) |

No route, page, widget, feature or entity changes.

## Decisions

### D1 — One shared class set for facet messages

`facet-row.ts` exports `FACET_MESSAGE_CLASSES = "px-3"`, beside `FACET_LEGEND_CLASSES`, whose `px-3` it matches (0.75rem on both sides). In the row presentation the help paragraph's classes are exactly `type-meta mt-1 px-3` and the error paragraph's exactly `type-error mt-1 px-3`, built from their existing classes plus the constant. In the field presentation they stay exactly `type-meta mt-1` and `type-error mt-1`. `FacetCascade` only has the row presentation, so its help always takes the constant.

Why: `facet-row.ts` is already the home of the class sets the three components share (summary §4.1, criterion C). Alternative rejected: `px-3` written in each component, three copies of one decision.

### D2 — Abandoned text in the combobox

The end state is the table of summary §4.2. The combobox restores in two places, both setting the term to the chosen value's label, or to empty with no value, and closing the popup without reporting anything:

- **Escape** in the input's key handler, whether or not the popup is open. An emptied input with a value is restored too: Escape cancels the edit and keeps the value (summary §4.2, last row).
- **Blur**: when the input is empty and a value is chosen, it reports `null` as today (spec scenario "Clearing the value"); otherwise it restores.

Enter is unchanged. Clicking an option is a choice, not a blur: the popup's `onMouseDown` keeps focus in the input. Restoring never opens the popup and never moves focus.

### D3 — Only typed text searches

The combobox gives `useComboboxSearch` the term only while the input holds text the user typed; while it holds a label the combobox set itself (first render with a value, a choice, a restore, a new `value` prop) it gives an empty term, so the hook stays idle. The next typed change gives it the term again. Local mode is unaffected: its filtering still uses the input text.

Why: Open 1 (a) of the summary, approved. It removes one public request per choice and the request the restore of D2 would otherwise add. "Only typed text searches" also covers the label shown on first render, which today searches as well. Alternative rejected: a check inside the hook, which cannot tell typed text from a label it is given.

## Risks / Trade-offs

- [Escape reaches both the input's key handler and the Popover's dismiss listener while the popup is open] → both close the popup; only the input handler changes the term, so the result is the same in either order. The tests of task 4.1 cover Escape with the popup open and closed.
- [A search already running when the user abandons the text resolves after the restore] → the hook returns the idle state for an empty term, so its results are never shown.
- [`add-offering-management` uses the combobox in `InventoryField`] → its asserted behaviour ("choosing a row shows the coffee name", "clearing the input clears the choice") matches this end state; whichever change merges second takes `develop` first (summary §7).
