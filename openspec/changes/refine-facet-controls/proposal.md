## Why

The visual review of the archived `add-facet-controls` (handoff F3 and F4) found two details that Product owner settled on 2026-10-06 (decisions log, "secciones plegables, rueda y facetas"): the help and error text under the row facets starts at the sidebar edge instead of aligning with the legend, and typed text abandoned in the combobox stays in the input while the chosen value is another one. The orchestrator also approved Open 1 of the design summary: the combobox stops searching for a label it puts in the input itself. This must land before the apply of `add-offering-facets`, the first consumer of these controls on a real sidebar.

## What Changes

- Help and error under a row facet (radio list, cascade, row checkbox) take 0.75rem of side padding, aligned with the legend, from one shared class set. The field presentation used in forms is unchanged.
- The combobox replaces abandoned typed text: on Escape, or on leaving the input without choosing, the input shows the chosen value's label again, or clears when nothing is chosen, and reports nothing. Emptying the input and pressing Enter or leaving it still reports the removal; Escape on an emptied input cancels the edit.
- In search mode, only typed text searches: a label the combobox shows for its value (on mount, after a choice, a restore or a new value) runs no search.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: "Combobox" (abandoned text, no search for its own label) and "Facet rows" (help and error alignment under the radio-list and cascade facets).
- `form-fields`: "Facet row presentation" (help and error alignment under a facet-row checkbox or radio group).

## Impact

- **Code:** `src/shared/ui/facet-row.ts`, `src/shared/ui/RadioGroup.tsx`, `src/shared/ui/Checkbox.tsx`, `src/shared/ui/FacetCascade.tsx`, `src/shared/ui/Combobox.tsx`, and their tests.
- **API:** none. No contract operation is consumed or changed.
- **Dependencies:** none. No token, colour or text changes.
- **Consumers:** `add-offering-facets` and `add-evaluation-facets` get the alignment and the combobox behaviour; `add-offering-management` (combobox in its inventory field) gets the restore on abandoned text, with no change to its asserted behaviour.

## Non-goals

- The side padding of the combobox inside a facet panel: the consumer wraps it in 0.75rem (handoff F5).
- The text facet and the score range: the text facet already has side padding and the score range has no help.
- Any change to the field presentation of checkbox and radio group in forms.
- Opening the popup when the label is restored.
- The single "Clear all" button (backlog R9) and per-field 422 errors (backlog R8).
- The visual check in a real browser at 375px and 1280px, which needs the host route of `add-offering-facets`.
