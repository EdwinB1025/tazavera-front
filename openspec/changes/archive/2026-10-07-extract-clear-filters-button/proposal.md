# Proposal

## Why

The catalog's filtered empty state owns a "Clear all" button in `src/features/offering-facets` (written by `add-offering-facets`). Every later filtered list needs the same button, and FSD forbids one feature slice importing another, so `add-evaluation-facets`, `add-public-evaluations` and `add-coffeeshop-directory` would each write a copy (backlog R9). This change moves the button to `src/shared/ui`, right after the first facet change merged (R9 Open 1, option (b)), so no second copy is ever written. Nothing the user sees changes.

## What Changes

- A generic `ClearFiltersButton` in `src/shared/ui`, exported from `@/shared/ui`: the host passes the visible text (`label`) and the query keys that survive (`keep`); activating it navigates, without a full reload and without scrolling, to the current path keeping only those keys and never the page (design.md D1–D3).
- The catalog host `src/pages/offerings/ui/OfferingsScreen.tsx` renders the shared button as its `emptyAction`, keeping the sort keys exactly as today (design.md D4).
- The feature-local copy is removed: `src/features/offering-facets/ui/ClearFiltersButton.tsx`, its test and its two export lines in `src/features/offering-facets/index.ts`. Its test case moves to `src/shared/ui/ClearFiltersButton.test.tsx` (design.md D5).
- **BREAKING** for the `offering-facets` slice's public API only: it stops exporting `ClearFiltersButton` and `ClearFiltersButtonProps`. The only importer today is `OfferingsScreen`, which this change switches.

## Out of scope (non-goals)

- The facet panel's own "Clear all" (the shared `FacetPanel` with the feature's callback): unchanged.
- `src/shared/lib/filter-query` (`clearFiltersHref`, `useFilterNavigation`): reused unchanged.
- The empty-state message, its layout and the `emptyAction` slot of `src/widgets/offering-list`: unchanged.
- Which keys "Clear all" keeps: the catalog keeps `orderBy` and `orderDirection`, as today.
- The artifacts of `add-evaluation-facets` and `add-public-evaluations` (they plan their own `ClearEvaluationFiltersButton`): they receive a separate artifact update on their own branches so they consume `ClearFiltersButton` from `@/shared/ui`. This change does not edit them.
- The filtered-offerings widget refactor (backlog R12, `extract-filtered-offerings`) and the coffee shop directory: not touched here (design.md, Risks).
- No new text, token, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `filtering`: one ADDED requirement, "Clear all action for an empty filtered list" — the observable behaviour of the shared action every filtered list reuses. The feature requirements "Filtered offerings results" and "Applied offering filters" stay as they are.

## Impact

- **Code** (FSD layers): new `src/shared/ui/ClearFiltersButton.tsx` (shared) and its test; `src/shared/ui/index.ts` exports it; `src/pages/offerings/ui/OfferingsScreen.tsx` (pages) imports it from `@/shared/ui`; `src/features/offering-facets` (features) loses `ui/ClearFiltersButton.tsx`, its test and two export lines.
- **Tests**: the one case of the feature's `ClearFiltersButton.test.tsx` moves to the shared test, adapted to the new props, plus one case with no kept key; the `OfferingsScreen` filtered-empty case gains assertions on the action's label and kept keys. No test is weakened.
- **Dependencies, contract, texts, tokens**: none added, none changed.
- **Resolves**: backlog R9. **Unblocks**: the apply of `add-evaluation-facets`, `add-public-evaluations` and `add-coffeeshop-directory` without a second copy.
