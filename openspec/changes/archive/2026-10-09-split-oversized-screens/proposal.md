Type: Refactor (fast lane)

# Proposal

## Why

`npm run lint` reports 48 size and complexity warnings against the AGENTS.md limits (a function of at most 80 lines, a cyclomatic complexity of at most 15, a file of at most 300 lines). Technical review 2026-10-09, top risk 6 and Appendix B.1/B.2, lists them as the units that keep Analysability and Modifiability below A. Eighteen of them are in the sliced layers (`pages`, `widgets`, `features`, `entities`). This change splits the fifteen that belong to the `evaluations`, `offering-catalog`, `user-account` and `offering-management` capabilities. Nothing the user sees changes.

## What Changes

- Each of the fifteen units of design.md, Files, is split within its own slice and segment so that every function in it has at most 80 lines and a complexity of at most 15, and its file stays at most 300 lines (design.md D1–D4).
- Text mappings in screens move to module-level functions in the same file (D1); form state and submit handlers of client forms move to a hook in the slice's `model` segment (D2); render branches move to sibling components, in the same file or a new sibling file of the same segment (D3); pure computations move to module-level functions (D4).
- Props, public exports, requests, rendered markup, class names, texts and accessible names stay identical. No requirement changes.

## Out of scope (non-goals)

- The facets and filters (`src/features/evaluation-facets`, `src/features/offering-facets`, any `*Facet*` or `*sidebar*` unit, `src/pages/offerings-sidebar`, `src/pages/evaluations-sidebar`, `src/widgets/app-sidebar`): another change is editing them. The three warnings there (`parseEvaluationFilters`, `EvaluationFacets`, `OfferingFacets`) are left for later.
- `src/shared/`: another session splits it.
- No new test, no changed assertion, no new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: one ADDED requirement, "Evaluation screens kept within the size limits".
- `offering-catalog`: one ADDED requirement, "Catalog screens kept within the size limits".
- `user-account`: one ADDED requirement, "Account forms kept within the size limits".
- `offering-management`: one ADDED requirement, "Location form kept within the size limits".

Each states the structural property the refactor establishes and adds no behaviour.

## Impact

- **Code**: the files of design.md, Files (FSD layers `pages`, `widgets`, `features`, `entities`).
- **Tests**: none added; existing tests keep their assertions and imports (no imported symbol moves).
- **API, dependencies, contract, texts, tokens**: none.
- **Resolves**: technical review 2026-10-09, top risk 6, for the units in scope (no backlog entry).

## Propose status

- **Change-id:** `split-oversized-screens`
- **Date:** 2026-10-09
- **Validation:** `openspec validate split-oversized-screens --strict` → "Change 'split-oversized-screens' is valid".
- **Resolves:** technical review 2026-10-09, top risk 6 and Appendix B.1/B.2, for the fifteen units of the `evaluations`, `offering-catalog`, `user-account` and `offering-management` capabilities (no backlog entry).
- **Resolved:** the split kinds (design.md D1–D4) and the split of each unit (design.md, Files).
- **Left for later:** `parseEvaluationFilters` (`src/features/evaluation-facets/model/query.ts`, CC 16), `EvaluationFacets` (100 lines) and `OfferingFacets` (136 lines), excluded because another change edits the facets; the `src/shared/` warnings, split by another session.
- **Open:** nothing.
