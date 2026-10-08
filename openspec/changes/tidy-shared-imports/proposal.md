Type: Refactor (fast lane)

# Proposal

## Why

Three modules close an import cycle through their own segment's public index or through a file that only re-exports another (backlog R21, technical review §3.1). The planned barrel work (R28) needs a `shared/ui` barrel without cycles, so the cycles are removed first, without changing behaviour.

## What Changes

- `src/shared/ui/Sidebar.tsx` imports the button from its sibling file instead of the `@/shared/ui` index.
- `src/shared/api/coffees.ts` stops importing `./index`: the coffee summary type is defined in `coffees.ts` from the generated schema, and `src/shared/api/index.ts` re-exports it under the same name.
- `src/widgets/offering-list/ui/RetryButton.tsx`, a file that only re-exports the shared retry button, is deleted; `OfferingList.tsx` imports the retry button from `@/shared/ui`, and the widget's public index drops its two retry-button lines (no other slice imports them from the widget).
- The public exports of `@/shared/ui` and `@/shared/api` stay the same. What users see and the requests sent to the API do not change.

## Non-goals

- No change to the `fetch` call of `coffees.ts` or its other lines: the change `route-public-reads-through-client` owns them; this change touches only the import and type lines of that file.
- No change to tests that import through a segment's public index: tests consume the public API and are not modules of the segment.
- No other barrel reorganisation (R28).
- No new tests and no changed assertions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: adds the structural property that shared segment modules import their siblings directly and that no module only re-exports another.

## Impact

- Code: `src/shared/ui/Sidebar.tsx`, `src/shared/api/coffees.ts`, `src/shared/api/index.ts`, `src/widgets/offering-list/ui/RetryButton.tsx` (deleted), `src/widgets/offering-list/ui/OfferingList.tsx`, `src/widgets/offering-list/index.ts`.
- Protecting tests: `src/shared/ui/Sidebar.test.tsx`, `qa/src/shared/ui/index.test.tsx`, `src/widgets/offering-list/ui/OfferingList.test.tsx`, `qa/src/widgets/offering-list/ui/OfferingList.test.tsx`, `src/shared/api/coffees.test.ts`, `qa/src/shared/api/coffees.test.ts`. None imports a moved or deleted file.
- APIs, dependencies: none.

## Propose status

- **Change-id:** tidy-shared-imports
- **Date:** 2026-10-08
- **`openspec validate tidy-shared-imports --strict`:** valid
- **Backlog entry resolved:** R21 — Remove the intra-segment import cycles
- **Resolved:** where `CoffeeSummary` is defined → in `src/shared/api/coffees.ts` from `./schema`, re-exported by `src/shared/api/index.ts` (design.md D1).
- **Open:** nothing.
