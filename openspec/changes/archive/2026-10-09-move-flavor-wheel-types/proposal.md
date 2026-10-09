Type: Refactor (fast lane)

# Proposal

## Why

`FlavorWheelNode` and `FlavorWheelGroup` are declared in `src/shared/ui/FlavorWheel.tsx`, which imports the parts of the wheel (`FlavorWheelChart`, `FlavorWheelLabels`, `FlavorWheelNoteList`, `FlavorWheelPanel`, `flavor-wheel-keys`, `flavor-wheel-tree`, `use-flavor-wheel-state`), and every one of those parts imports the types back from `./FlavorWheel`. The result is a set of type-only import cycles inside `src/shared/ui` (technical review 2026-10-09, top risk 5: 11 cycles by dependency-cruiser; `madge --circular` reports 7). They are the only cycles in the codebase and keep Modularity at B. Nothing the user sees changes.

## What Changes

- `FlavorWheelNode` and `FlavorWheelGroup` move unchanged to a new sibling module `src/shared/ui/flavor-wheel-types.ts` (design.md D1).
- Every part of the wheel imports them from `./flavor-wheel-types` instead of `./FlavorWheel` (design.md D1).
- `FlavorWheel.tsx` imports both types from the new module for its props, and re-exports only `FlavorWheelNode`, which it already exports publicly through `src/shared/ui/index.ts`; `FlavorWheelGroup`, which no module outside the wheel imports, is no longer exported from it (design.md D2).
- No markup, class name, accessible name, text, request, public export of `src/shared/ui` or requirement changes; no import cycle remains in `src/shared/ui`.

## Out of scope (non-goals)

- The behaviour and code of the wheel's parts beyond their type imports.
- `src/shared/ui/index.ts`: unchanged.
- The consumers of the wheel (`entities/taxonomy`, `widgets/offering-detail`): unchanged.
- No new test, no changed test, no new token, text, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: one ADDED requirement, "Flavor wheel types shared without import cycles", stating the structural property the refactor establishes. It adds no behaviour.

## Impact

- **Code** (FSD layer `shared`, segment `ui`): new `src/shared/ui/flavor-wheel-types.ts`; modified `FlavorWheel.tsx`, `FlavorWheelChart.tsx`, `FlavorWheelLabels.tsx`, `FlavorWheelNoteList.tsx`, `FlavorWheelPanel.tsx`, `flavor-wheel-keys.ts`, `flavor-wheel-tree.ts`, `use-flavor-wheel-state.ts` (type imports only).
- **Tests**: none added or changed. Protecting tests: `FlavorWheel.test.tsx` and `flavor-wheel-geometry.test.ts` (in `src/shared/ui/` and `qa/src/shared/ui/`), and `flavor-wheel-nodes.test.ts` / `flavor-wheel-groups.test.ts` of `entities/taxonomy`, which import `FlavorWheelNode` through `@/shared/ui` and keep doing so.
- **API, dependencies, contract, texts, tokens**: none.
- **Resolves**: technical review 2026-10-09, top risk 5 (no backlog entry).

## Propose status

- **Change-id:** `move-flavor-wheel-types`
- **Date:** 2026-10-09
- **Validation:** `openspec validate move-flavor-wheel-types --strict` → "Change 'move-flavor-wheel-types' is valid".
- **Resolves:** technical review 2026-10-09, top risk 5 (no backlog entry).
- **Resolved:** `FlavorWheelNode` and `FlavorWheelGroup` move to `src/shared/ui/flavor-wheel-types.ts` and every part imports them from there (design.md D1); `FlavorWheel.tsx` re-exports only `FlavorWheelNode`, already public, so `index.ts` and every test stay unchanged (design.md D2).
- **Open:** nothing.
