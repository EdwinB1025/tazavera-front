Type: Refactor (fast lane)

# Proposal

## Why

Five facet and filter units break the AGENTS.md size limits (a component or function of at most 80 lines, a cyclomatic complexity of at most 15), and `npm run lint` warns about each of them (technical review 2026-10-09, top risk 6 and Appendix B.1/B.2): `Combobox` (183 lines, complexity 27), `ScoreRangeFacet` (95 lines), `EvaluationFacets` (100 lines), `OfferingFacets` (137 lines) and `parseEvaluationFilters` (complexity 16). The earlier round `split-oversized-shared-ui` left them out while `lazy-load-facet-controls` edited them; that change is now on `develop`. Nothing the user sees changes.

## What Changes

- Each oversized unit is split into sibling components, hooks or helpers of its own slice and segment (design.md D2–D6), one component per variant where today one function switches between two facet trees.
- Props, exported names, the public indexes, the lazy-load boundary of the combobox, the requests and URL changes, rendered markup, class names, texts and accessible names stay identical.

## Out of scope (non-goals)

- Units of the scope that lint does not report: `FacetCascade*`, `FiltersTrigger*`, `SidebarMenuSub*`, `ComboboxLoader`, the other `*Facet*` files, `src/pages/offerings-sidebar`, `src/pages/evaluations-sidebar`, the coffee shop detail sidebar screen and `src/widgets/app-sidebar`.
- Every file outside the scope (other refactor sessions split the rest of `src/`).
- No new test, no changed assertion, no new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: one ADDED requirement, "Facet units kept within the size limits", stating the observable property the refactor establishes for the combobox, the score range facet, the evaluation and offering facet panels and the evaluation filter parsing. It adds no behaviour.

## Impact

- **Code**: FSD layer `shared` (segment `ui`): modified `Combobox.tsx`, `ScoreRangeFacet.tsx`; layer `features`, slices `evaluation-facets` (segments `ui`, `model`) and `offering-facets` (segment `ui`): modified `EvaluationFacets.tsx`, `query.ts`, `OfferingFacets.tsx`; new sibling files listed in design.md, Files. No public index changes.
- **Tests**: none added or changed. Protecting tests: `Combobox.test.tsx`, `ComboboxLoader.test.tsx`, `ScoreRangeFacet.test.tsx`, `EvaluationFacets.test.tsx`, `OfferingFacets.test.tsx`, `query.test.ts` of `evaluation-facets`, and their `qa/` counterparts and consumers.
- **API, dependencies, contract, texts, tokens**: none.

## Propose status

- **Change-id:** `split-oversized-facets`
- **Date:** 2026-10-09
- **Validation:** `openspec validate split-oversized-facets --strict` → "Change 'split-oversized-facets' is valid".
- **Source:** technical review 2026-10-09, top risk 6 and Appendix B.1/B.2 (no backlog entry; typed `Refactor (fast lane)` by the orchestrator).
- **Resolved:** one split per unit (design.md D2–D6); the combobox's new files stay behind the lazy-load boundary (D1); scope units without a lint warning are left as they are.
- **Artifact update 2026-10-09:** the list routes' First Load JS growth after the split (offerings 229113 → 229335 B gz, evaluations 225293 → 225487 B gz, coffee shop detail 244854 → 245310 B gz, directory unchanged) is accepted by the orchestrator under Product owner's no-behaviour-change autonomy rule; design.md D1 and task 6.1 now allow at most +1 KB gz per list route instead of no growth.
- **Open:** nothing.
