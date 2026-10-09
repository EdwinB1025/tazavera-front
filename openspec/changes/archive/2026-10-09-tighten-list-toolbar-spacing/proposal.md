Type: Refactor (fast lane)

# Proposal

## Why

The design lead's final AUT pass (backlog R64) found an empty band between the list toolbar and the first card on `/{locale}/offerings` and `/{locale}/coffeeshops`: 96px below 768px and 128px from 768px. The design lead's analysis (`docs/design/r64-list-spacing/analysis.md`) traces it to the two stacked `PageSection`s of each screen (heading block and toolbar; results), whose vertical paddings add up. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that the band shrinks. It changes the layout of the two list screens by Product owner's decision.

## What Changes

- `OfferingsScreen` and `CoffeeshopsScreen` each render one `PageSection surface="page"` holding the heading block, the toolbar and the results. Its container, through `containerClassName` (layout only), is a flex column whose children are the existing header column (heading block + toolbar, 2rem apart, unchanged) and the results, 1.5rem (`gap-6`) apart at every width. No margin or padding on the toolbar or the list block.
- The toolbar → first card distance becomes 1.5rem at every width (from 96px / 128px). It matches the directory's settled value (`add-coffeeshop-directory` design §8) and the coffee shop detail's Ofertas panel (`OFFERINGS_PANEL_CLASSES`, `gap-6`).
- The skeleton, empty, error and map states render in the same results slot and follow.

## Non-goals

- `PageSection` is unchanged (no new prop or variant).
- The section's 3rem / 4rem padding above the heading and below the pagination, heading block → toolbar 2rem, side padding, borders and radius stay as they are.
- Every other screen is unchanged; public evaluations (analysis finding 6) is out of scope.
- No new token, text or dependency; no change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: "Page sections" states that the offerings catalog and the coffee shop directory hold their heading block, toolbar and results in that one section, the toolbar 1.5rem above the results at every width; one scenario per screen.

## Impact

- Code: `src/pages/offerings/ui/OfferingsScreen.tsx`, `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx`.
- Tests: `src/pages/offerings/ui/OfferingsScreen.test.tsx`, `src/pages/coffeeshops/ui/CoffeeshopsScreen.test.tsx` (one gap assertion per screen; other assertions only where the structure change breaks them).
- APIs, dependencies, tokens, texts: none.

## Propose status

- **Change-id:** tighten-list-toolbar-spacing
- **Date:** 2026-10-09
- **`openspec validate tighten-list-toolbar-spacing --strict`:** valid
- **Backlog entries resolved:** R64
- **Resolved:**
  - The band shrinks (Product owner, 2026-10-09).
  - Structure → one `PageSection` per screen, its container a flex column of the header column and the results (analysis Open 1 a). Orchestrator's pick from the analysis, pending Product owner's review.
  - Toolbar → first card → 1.5rem at every width, as the gap between the container's two children (analysis Open 2 a). Orchestrator's pick from the analysis, pending Product owner's review.
  - Carrier → one change for both screens (analysis Open 3 a).
  - Spec placement → no `content-structure` requirement covers these screens, so "Page sections" is MODIFIED with one sentence and one scenario per screen.
- **Open:** analysis Open 4 (backlog entry for public evaluations' same band) is left to Product owner.
