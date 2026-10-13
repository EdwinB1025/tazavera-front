## Context

See proposal.md (Why) and backlog entry R84, whose settled end state this design implements. Current state:

- `src/pages/inventory-detail/ui/InventoryDetailClient.tsx` (pages layer, client component) wraps every state of the detail — the item, the loading status (session and read), the signed-out prompt and the read error with its retry — in `WithBackLink`, a flex column (`COLUMN_CLASSES`: `flex flex-col items-start gap-6`) holding the shared `BackLink` and the state's content. `items-start` shrinks every child of the column to its content width.
- Removing `items-start` alone would stretch the back link too: its `inline-flex` anchor is blockified as a flex item, and `BackLink` (`src/shared/ui/BackLink.tsx`) takes no `className`.
- `ERROR_CLASSES` (`flex flex-col items-start gap-4`) lays out the error message and its retry; the retry keeps its own width.
- The not-found notice (`InventoryNotFound`) renders outside `WithBackLink` and is out of scope.

API endpoints: none added or changed. `GET /coffeeInventory` is consumed as today; errors are presented as today. No derived API type is needed.

## Goals / Non-Goals

**Goals:** R84's end state: the content below the back link fills the page container at every width; the back link keeps its own width at the start of its line; the 1.5rem gap stays.

**Non-Goals:** no change to `BackLink` or `Link` in `src/shared/ui/`, to `ERROR_CLASSES`, to `InventoryNotFound`, to `InventoryDetailView`, texts, tokens or dependencies.

## Decisions

### D1 — The content after the back link stretches; the column keeps `items-start`

`COLUMN_CLASSES` stays `flex flex-col items-start gap-6`, so the back link keeps its own width at the start of its line and the gap between it and the content stays 1.5rem. In `WithBackLink`, the `children` are rendered inside one wrapper `div` with the single class `self-stretch`, placed right after the back link; that wrapper fills the column's width, and every state rendered through `WithBackLink` (the item's header and section card, the loading status, the signed-out prompt, and the error block with its retry) fills it as block content. The error block keeps `ERROR_CLASSES`, so the retry keeps its own width.

Alternatives considered: dropping `items-start` and wrapping the back link instead (the same one extra element, but it moves the width rule onto the back link, the part that is not supposed to change); `w-full` on the wrapper (same effect, but `self-stretch` states the intent, filling the column's cross axis, without a percentage width).

## Risks / Trade-offs

- [The signed-out prompt also fills the width] → it renders through the same `WithBackLink`; the end state does not exclude it, and its own content keeps its layout.
- [Existing tests] → no validation or QA test asserts the column's classes or the DOM depth of the states; they are expected to pass unchanged.
