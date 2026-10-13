Type: Refactor (fast lane)

## Why

Backlog entry R84 (production AUT, 2026-10-13), taken as a fast lane by Product owner's order (AUT correction, 2026-10-13, maximum priority): the coffee inventory detail shrinks its back link, header, panels, error and loading states to their content width instead of filling the page container, unlike the offering detail. Settled end state: the detail body (header, panels, error and loading states) fills the page container at every width, like the offering detail; the back link keeps its own width at the start of its line.

## What Changes

- On `/{locale}/manage/inventory/{ulid}`, the content below the back link — the item's header and section card, the loading status, and the error message with its retry action — fills the page container's width at every width.
- The back link keeps its own width at the start of its line, and the 1.5rem gap between the back link and the content stays.
- Nothing else changes: the retry action keeps its own width, the not-found notice, the texts, the requests sent to the API, the order of the header and every other requirement stay as they are.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Coffee inventory detail" (one sentence stating that the content below the back link fills the page container while the back link keeps its own width, and one new scenario "Detail fills the page width"; nothing else in it changes).

## Non-goals

- No change to the not-found notice ("Unknown item"), which is out of scope.
- No change to the shared back link or link components, to the error block's own layout (the retry keeps its own width) or to the offering detail.
- No change to the requests sent to the API, texts, tokens or dependencies.
- No other backlog entry is folded in (R85 and R86 run as their own changes).

## Impact

- Modified: `src/pages/inventory-detail/ui/InventoryDetailClient.tsx` (pages layer), see design.md D1.
- Tests: one new validation test for the scenario "Detail fills the page width" in `src/pages/inventory-detail/ui/InventoryDetailClient.test.tsx` (task 1.1). Existing tests keep their assertions.
- QA suite: no QA test asserts the detail's column classes; it is expected to pass unchanged.

## Propose status

- Change-id: `fill-inventory-detail-width`
- Date: 2026-10-13
- `openspec validate fill-inventory-detail-width --strict` (`@fission-ai/openspec@1.14.1`): valid
- Resolves backlog entry: R84 (fast lane by Product owner's order, AUT correction of 2026-10-13, maximum priority).
- Resolved (backlog entry R84): the end state as stated in What Changes.
- Resolved (architect, design.md D1): the column keeps `items-start` and the content after the back link sits in one `self-stretch` wrapper, the smallest form that keeps the back link at its own width without touching `src/shared/ui/`.
- Resolved (architect): the delta adds one sentence and the scenario "Detail fills the page width" to "Coffee inventory detail"; no other word of the requirement or of its other scenarios changes.
- Open: none.
