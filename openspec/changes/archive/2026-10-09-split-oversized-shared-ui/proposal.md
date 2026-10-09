Type: Refactor (fast lane)

# Proposal

## Why

Six units of the `src/shared/ui` segment break the AGENTS.md size limits (a component or function of at most 80 lines, a cyclomatic complexity of at most 15), and `npm run lint` warns about each of them (technical review 2026-10-09, top risk 6 and Appendix B.1/B.2): `BeanScale` (135 lines), `Checkbox` (complexity 19), `DescriptorChipGroup` (124 lines), `IntensitySlider` (99 lines), `RadioGroup` (108 lines, complexity 18) and `LocationsMap` (147 lines). Five of them also repeat the same help-and-error block and its `aria-describedby` wiring (the review's clone table lists the BeanScale / DescriptorChipGroup pair). Nothing the user sees changes.

## What Changes

- The help and error messages of the own-field controls, and the ids and `aria-describedby` value they wire, move to one sibling unit of the segment that the checkbox, radio group, bean scale, intensity slider and descriptor chip group render (design.md D2).
- Each oversized unit is split into sibling components or helpers of the same `ui` segment, one component per variant where today one function switches between the read-only and the interactive tree (design.md D3–D8).
- Props, exported names, the segment's public index, rendered markup, class names, texts, accessible names, ids wiring and emitted values stay identical.

## Out of scope (non-goals)

- The facet and filter units another change is editing: `Combobox` (183 lines, complexity 27) and `ScoreRangeFacet` (95 lines), and any `*Facet*`, `FacetCascade*`, `FiltersTrigger*`, `SidebarMenuSub*` or `Combobox*` file. They are left for a later round.
- Units outside `src/shared/` that lint also reports.
- No new test, no changed assertion, no new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: one ADDED requirement, "Own-field controls kept within the size limits", stating the observable property the refactor establishes for the checkbox, radio group, bean scale, intensity slider and descriptor chip group. It adds no behaviour.
- `offering-catalog`: one ADDED requirement, "Locations map kept within the size limits", the same property for the shared locations map. It adds no behaviour.

## Impact

- **Code** (FSD layer `shared`, segment `ui`): modified `Checkbox.tsx`, `RadioGroup.tsx`, `BeanScale.tsx`, `IntensitySlider.tsx`, `DescriptorChipGroup.tsx`, `LocationsMap.tsx`; new sibling files listed in design.md, Files. `src/shared/ui/index.ts` does not change.
- **Tests**: none added or changed. Protecting tests: the `*.test.tsx` of each modified unit in `src/shared/ui/` and `qa/src/shared/ui/`, and the consumers' tests (evaluation form, evaluation sheet, offering detail, coffee shop directory and detail).
- **API, dependencies, contract, texts, tokens**: none.

## Propose status

- **Change-id:** `split-oversized-shared-ui`
- **Date:** 2026-10-09
- **Validation:** `openspec validate split-oversized-shared-ui --strict` → "Change 'split-oversized-shared-ui' is valid".
- **Source:** technical review 2026-10-09, top risk 6 and Appendix B.1/B.2 (no backlog entry; typed `Refactor (fast lane)` by the orchestrator).
- **Resolved:** the shared help-and-error unit (design.md D2); one split per unit (D3–D8); the facet and filter units are out of scope.
- **Left for later:** `Combobox` and `ScoreRangeFacet` (facet and filter files under edit by another change).
- **Open:** nothing.
