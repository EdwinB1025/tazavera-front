# Design

Sources: `docs/review/technical-review-2026-10-09.md`, top risk 5; the AGENTS.md rules on segments and public indexes; the `split-flavor-wheel` change, which split the wheel into its parts. Fast lane: no design folder.

## Context

Current state on `develop`: `src/shared/ui/FlavorWheel.tsx` declares `FlavorWheelNode`, `FlavorWheelGroup`, `FlavorWheelTexts` and `FlavorWheelProps` and the `FlavorWheel` component, and imports seven sibling parts. Each part imports `FlavorWheelNode` (and `flavor-wheel-tree.ts` also `FlavorWheelGroup`) with `import type … from "./FlavorWheel"`. `src/shared/ui/index.ts` exports `FlavorWheel`, `FlavorWheelNode` and `FlavorWheelProps` from `./FlavorWheel`. `npx -y madge@8 --circular --extensions ts,tsx src/shared/ui` reports 7 circular dependencies, all through `FlavorWheel.tsx`.

## Goals / Non-Goals

**Goals:** no import cycle in `src/shared/ui`; the node and group types declared once, in a module that imports nothing from the wheel; identical DOM, classes, texts, accessible names and public exports.

**Non-Goals:** no change to the parts' code beyond their type imports, to `index.ts`, to any consumer or to any test.

## API

None.

## Files

| Path | FSD layer | Status | Content |
|---|---|---|---|
| `src/shared/ui/flavor-wheel-types.ts` | shared (ui) | New | `FlavorWheelNode` and `FlavorWheelGroup`, moved unchanged with their comments (D1) |
| `src/shared/ui/FlavorWheel.tsx` | shared (ui) | Modified | Imports both types from `./flavor-wheel-types`; re-exports `FlavorWheelNode` only (D2) |
| `src/shared/ui/FlavorWheelChart.tsx`, `FlavorWheelLabels.tsx`, `FlavorWheelNoteList.tsx`, `FlavorWheelPanel.tsx`, `flavor-wheel-keys.ts`, `flavor-wheel-tree.ts`, `use-flavor-wheel-state.ts` | shared (ui) | Modified | Type import path `./FlavorWheel` → `./flavor-wheel-types` (D1) |

`index.ts`, every test file and every consumer outside `src/shared/ui` do not change.

## Decisions

### D1 — One types module

`FlavorWheelNode` and `FlavorWheelGroup` move to `src/shared/ui/flavor-wheel-types.ts`, a sibling of the wheel in the same segment, declaring types only and importing nothing. Every part imports them from it by relative path, as AGENTS.md requires for siblings. `FlavorWheelTexts` and `FlavorWheelProps` stay in `FlavorWheel.tsx`: no part imports them, so they create no cycle.

### D2 — Public exports unchanged

`FlavorWheel.tsx` keeps exporting `FlavorWheelNode` (`export type { FlavorWheelNode } from "./flavor-wheel-types"`), because `index.ts` and the wheel's tests import it from `./FlavorWheel`; this keeps `index.ts` and every test untouched. It re-exports nothing it does not already export publicly: `FlavorWheelGroup`, imported today only by `flavor-wheel-tree.ts`, is no longer exported from `FlavorWheel.tsx`. The cycle disappears because the re-export points from the wheel to the types module, never back.

## Risks / Trade-offs

- A future part that imports a type from `./FlavorWheel` would recreate a cycle. Mitigation: the cycle check of the full checks (`madge --circular`) in this change; no guard test is added (AGENTS.md: no new guard tests).
