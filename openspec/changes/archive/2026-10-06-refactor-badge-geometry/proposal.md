# Proposal

## Why

The badge's geometry (text treatment, inner padding, icon gap, one-line layout, field radius) is private to `src/shared/ui/Badge.tsx`, while `add-evaluation-scales` needs exactly that geometry for its unselected descriptor chip without rendering a badge. Backlog entry R6 (`docs/backlog.md`) names this change as the fix: expose the geometry from one source now, before the chip would have to copy the classes and catalog and filter chips would add more copies.

## What Changes

- **One exported geometry constant**: `src/shared/ui/Badge.tsx` exports `BADGE_GEOMETRY_CLASSES` holding the seven geometry class tokens it renders today, and composes `Badge` from it instead of its private copy. The rendered output of every badge is unchanged.
- **Segment export**: `src/shared/ui/index.ts` re-exports `BADGE_GEOMETRY_CLASSES` beside `Badge`, following the `OFFERING_GRID_CLASSES` precedent; later chips consume it through `@/shared/ui`.
- **Proof of one source**: new test cases pin the exported constant to the rendered badge base classes, and a source-scan verification fails naming the offending file when a second definition of the geometry tokens appears outside the badge file.
- **Specification**: `feedback` gains the requirement "Shared chip geometry" — the badge's geometry has one definition that other compact chips reuse — with a chip-match scenario and the "Second geometry definition detected" scenario.

No breaking changes: badge rendering is pixel- and class-identical to `develop`, and no existing requirement, variant or test changes meaning.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: adds the requirement "Shared chip geometry" (the badge's geometry is defined once and reused by other compact chips) with its two scenarios. Existing requirements (Badge presentation, Rating badge, Verification status badge, Taxonomy badge, Badge label contrast) are unchanged.

## Out of Scope (non-goals)

- `DescriptorChipGroup` or any consumer of the constant: they belong to `add-evaluation-scales` and later changes. This change only exposes the geometry.
- Any change to badge variants, colors, icons, inline styles or label rules; no new variant (the outline taxonomy state remains rejected).
- Tokens, catalog texts, contract operations, routes or screens.
- Updating `docs/backlog.md`: Product owner keeps that file. R6 is recorded in `## Propose status` and removed from the backlog when this change is archived.

## Impact

- **Code (all under `src/`)**: modified — `src/shared/ui/Badge.tsx`, `src/shared/ui/index.ts`, `src/shared/ui/Badge.test.tsx`, `src/shared/ui/index.test.tsx` (FSD layer `shared`). New — `src/shared/ui/badge-geometry-guard.test.ts` (FSD layer `shared`).
- **Dependencies**: none. No dependency is added, removed or upgraded.
- **API**: none. This change consumes no API endpoint and touches no generated type in `src/shared/api/schema.ts`.
- **Existing behavior**: unchanged. Every badge renders exactly as on `develop`; `add-evaluation-scales` gains the shared geometry it waits for.
