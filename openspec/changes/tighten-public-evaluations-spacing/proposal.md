Type: Refactor (fast lane)

# Proposal

## Why

The design lead's R64 spacing analysis (`docs/design/r64-list-spacing/analysis.md`, finding 6) found the same band on the public evaluations list (`/{locale}/evaluations`) that `tighten-list-toolbar-spacing` (R64) removed from the offerings catalog and the coffee shop directory: `ListScreen` stacks the heading block and toolbar in a `surface="page"` section and the list in a `surface="section"` section, so their vertical paddings add up to 96px below 768px and 128px from 768px between the toolbar and the first card, here across a band edge. The list also sits on the section background, which `content-structure` "Page sections" reserves for the landing and About pages. Product owner decided (2026-10-09) that the band shrinks, as in R64.

## What Changes

- `ListScreen` renders one `PageSection surface="page"` holding the heading block, the toolbar and the list. Its container, through `containerClassName` (layout only), is a flex column whose children are the existing header column (heading block + toolbar, 2rem apart, unchanged) and the list's `Suspense` boundary, 1.5rem (`gap-6`) apart at every width. No margin or padding on the toolbar or the list block.
- The toolbar → first card distance becomes 1.5rem at every width (from 96px / 128px), matching the catalog and the directory.
- The list moves from the section background to the page background, as "Page sections" requires for feature views.
- The skeleton, empty and error states render in the same slot and follow.

## Non-goals

- `PageSection` is unchanged (no new prop or variant).
- The section's 3rem / 4rem padding above the heading and below the pagination, heading block → toolbar 2rem, side padding, cards and states stay as they are.
- Every other screen is unchanged.
- No new token, text or dependency; no change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: "Page sections" adds the public evaluations list to the list screens that hold their heading block, toolbar and results in one section, the toolbar 1.5rem above the results at every width; one scenario.

## Impact

- Code: `src/pages/public-evaluations/ui/ListScreen.tsx`.
- Tests: `src/pages/public-evaluations/ui/ListScreen.test.tsx` (one gap assertion; other assertions only where the structure change breaks them).
- APIs, dependencies, tokens, texts: none.

## Propose status

- **Change-id:** tighten-public-evaluations-spacing
- **Date:** 2026-10-09
- **`openspec validate tighten-public-evaluations-spacing --strict`:** valid
- **Backlog entries resolved:** none (R64 analysis finding 6; no backlog entry was recorded for it)
- **Resolved:**
  - The band shrinks, as in R64 (Product owner, 2026-10-09).
  - Structure → one `PageSection surface="page"`, its container a flex column (`gap-6`) of the header column and the list, as R64 did for the catalog and the directory.
  - Spec placement → "Page sections" is MODIFIED: the R64 sentence names the public evaluations list too, plus one scenario.
- **Open:** none.
