# Design

Sources: technical review 2026-10-09 (`docs/review/technical-review-2026-10-09.md`), top risk 6 and Appendix B.1/B.2; the AGENTS.md size limits; the `filtering` requirements "Combobox", "Score range facet", "Offering facets in the sidebar", "Evaluation facets in the sidebar", "Evaluation filter state in the URL" and "Facet comboboxes loaded on first opening". Fast lane: no design folder.

## Context

`npm run lint` on `develop` (`e0644a2`) reports five size or complexity warnings in the facet and filter files: `Combobox` (183 lines, complexity 27) and `ScoreRangeFacet` (95 lines) in `src/shared/ui`; `EvaluationFacets` (100 lines) and `parseEvaluationFilters` (complexity 16) in `src/features/evaluation-facets`; `OfferingFacets` (137 lines) in `src/features/offering-facets`. No file of the scope is over 300 lines, and the other files of the scope (`FacetCascade`, `FiltersTrigger`, `SidebarMenuSub`, `ComboboxLoader`, the sidebar screens and `app-sidebar`) have no warning.

`ComboboxLoader` imports only types from `Combobox.tsx` and loads that module with `next/dynamic` on the sub-section's first opening, so everything the combobox renders sits in the lazily loaded chunk.

## Goals / Non-Goals

**Goals:** every unit of the scope at most 80 lines and complexity at most 15, every file at most 300 lines, with no lint warning left in the scope; identical props, exports, DOM, classes, texts, accessible names, query keys and lazy-load boundary.

**Non-Goals:** no change to a public index, a consumer, a message key or a test.

## API

None. The units call no endpoint other than through the existing `searchCoffees` and `searchRoasteries`, which do not change.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/Combobox.tsx` | shared (ui) | Modified | D2 |
| `src/shared/ui/use-combobox-input.ts` | shared (ui) | New | The input state, rows, status and handlers; the label and `aria-expanded` effect (D2) |
| `src/shared/ui/ComboboxPopup.tsx` | shared (ui) | New | The popover content with its rows and the term highlight (D2) |
| `src/shared/ui/ScoreRangeFacet.tsx` | shared (ui) | Modified | D3 |
| `src/shared/ui/ScoreRangeParts.tsx` | shared (ui) | New | The two-thumb slider and one bound input (D3) |
| `src/features/evaluation-facets/ui/EvaluationFacets.tsx` | features (ui) | Modified | D4 |
| `src/features/evaluation-facets/ui/EvaluationFacetParts.tsx` | features (ui) | New | The Offering facet, the Status facet and the Score facet (D4) |
| `src/features/evaluation-facets/model/query.ts` | features (model) | Modified | D5 |
| `src/features/offering-facets/ui/OfferingFacets.tsx` | features (ui) | Modified | D6 |
| `src/features/offering-facets/ui/OfferingFacetParts.tsx` | features (ui) | New | The padded combobox, the list radio facet, the Verification and Score facets, the combobox texts (D6) |

No test file and no route file changes.

## Decisions

### D1 — Placement and imports

Every new unit is a sibling file in the segment of the unit it comes from, imported by relative path, never through the slice's public index, which does not change. A new file with hooks, handlers or browser APIs starts with `"use client"`. The new combobox files are imported only by `Combobox.tsx`, so they stay in the lazily loaded chunk and the list routes' First Load JS does not grow.

### D2 — Combobox

`useComboboxInput` takes the value, the change handler, the options or search, and the texts, and holds the term, typed flag, open state and previous value, the shown rows or state text, the live status, and the change, choose, key-down and blur handlers, with today's logic. `useComboboxLabelFor` holds the layout effect that sets `aria-expanded` and the label's `for`. `ComboboxPopup` renders the Radix popover portal and content and the cmdk list with the state row or the option items. `Combobox` keeps its props, exports, the order of its `useId` calls and its markup.

### D3 — Score range facet

`ScoreRangeSlider` renders the slider wrappers and the Radix slider; `ScoreRangeInput` renders one bound's padded `Field` and number input. The clamping of a committed bound moves to a helper beside the component. `ScoreRangeFacet` keeps the draft state and its props.

### D4 — Evaluation facets

The public set's Offering facet, the mine set's Status facet and the Score facet become `EvaluationOfferingFacet`, `EvaluationStatusFacet` and `EvaluationScoreFacet`, one component per facet, rendered by `EvaluationFacets` in today's order and conditions.

### D5 — Evaluation filter parsing

The score bounds (dropped when inverted, then each kept only inside the range) and the sort id move to two helpers beside `parseEvaluationFilters`, which keeps its signature.

### D6 — Offering facets

The inner `radioFacet` becomes `OfferingListFacet`; the padded `ComboboxLoader` wrapper becomes `PaddedCombobox`; the Verification and Score facets become `OfferingVerificationFacet` and `OfferingScoreFacet`; the combobox texts and the listed taste-note refs move to helpers. `OfferingFacets` keeps its props, its facet order and the panel wiring.
