Type: Refactor (fast lane)

# Proposal

## Why

`src/shared/ui/FlavorWheel.tsx` is a 571-line file, the largest in the codebase, and its `FlavorWheel` component runs 319 lines with a complexity of 16, while its keyboard handler alone has a complexity of 18: the wheel, the description panel, the note list and the tree keyboard model all live in one function. They exceed the size limits of AGENTS.md (a component or function of at most 80 lines, a file of at most 300 lines, a complexity of at most 15), and every edit to one part means reading all of them (backlog R37; technical review §3.1, row R37). Nothing the user sees changes.

## What Changes

- Each concern of the wheel moves to its own sibling file of `src/shared/ui`, imported directly by sibling path (design.md D1–D2): the note-tree helpers, the segment labels, the SVG wheel, the description panel, the note list, the tree keyboard model and the wheel state.
- `FlavorWheel` keeps its props and its exported types, stays in `FlavorWheel.tsx` and only composes the parts in today's order (design.md D3).
- The keyboard handler becomes one handler per key, so no function exceeds the complexity limit; the keys and their effects stay exactly as today (design.md D2).
- No markup, SVG geometry, class name, `aria-*` attribute, accessible name, text, focus behaviour or requirement changes.

## Out of scope (non-goals)

- `src/shared/ui/flavor-wheel-geometry.ts`, `src/shared/ui/taxonomy-color.ts`, `src/shared/ui/Collapsible.tsx` and `src/shared/ui/icons.ts`: unchanged.
- `src/shared/ui/index.ts`: unchanged; it keeps exporting exactly `FlavorWheel`, `FlavorWheelGroup`, `FlavorWheelNode`, `FlavorWheelTexts` and `FlavorWheelProps`, and no new part is exported from it.
- The hosts of the wheel (the offering detail CATA card) and `src/entities/taxonomy/model/flavor-wheel-*.ts`.
- The existing lint warning `jsx-a11y/role-has-required-aria-props` on the tree rows (no `aria-selected`): kept as is, since adding the attribute would change the accessibility tree.
- No new test, no changed assertion, no new token, contract operation, text key or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: one ADDED requirement, "Flavor wheel kept as one view", stating the observable property the refactor keeps. It adds no behaviour.

## Impact

- **Code** (FSD layer `shared`, segment `ui`): modified `src/shared/ui/FlavorWheel.tsx`; new `src/shared/ui/flavor-wheel-tree.ts`, `FlavorWheelLabels.tsx`, `FlavorWheelChart.tsx`, `FlavorWheelPanel.tsx`, `FlavorWheelNoteList.tsx`, `flavor-wheel-keys.ts` and `use-flavor-wheel-state.ts`.
- **Tests**: none added or changed. Protecting tests: `FlavorWheel.test.tsx` (42 tests in `src/shared/ui/`, 14 in `qa/src/shared/ui/`) and `flavor-wheel-geometry.test.ts` (7 in `src/shared/ui/`, 22 in `qa/src/shared/ui/`), plus the guard tests of `src/shared/ui` (`client-boundary.test.ts`, `color-guard.test.ts`, `focus-guard.test.ts`, `radius-guard.test.ts`, `xss-guard.test.ts`).
- **API**: none. The wheel consumes no endpoint.
- **Dependencies, contract, texts, tokens**: none.
- **Resolves**: backlog R37.

## Propose status

- **Change-id:** `split-flavor-wheel`
- **Date:** 2026-10-08
- **Validation:** `openspec validate split-flavor-wheel --strict` → "Change 'split-flavor-wheel' is valid".
- **Resolves:** backlog R37.
- **Resolved:** the wheel splits into seven sibling parts of `src/shared/ui` (note-tree helpers, segment labels, SVG wheel, description panel, note list, keyboard model, state hook) imported by relative path (design.md D1–D2); the exported types stay in `FlavorWheel.tsx`, so `index.ts` and every importer and test keep their imports (design.md D1); the keyboard handler becomes one handler per key with the same keys and effects (design.md D2); `FlavorWheel` composes the parts in today's order, with the group legend kept inline (design.md D3).
- **Open:** nothing.
