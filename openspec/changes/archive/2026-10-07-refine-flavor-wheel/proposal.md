# Proposal

## Why

The archived `add-flavor-wheel` sizes the rings by the deepest level of the whole tree, so at rest ring 0 is only 40 units thick and most of its labels show only on activation (the round-1 visual review counted 3 of 13 inner segments labelled, with an empty ring 2 showing). Its note list sits behind its own start-aligned disclosure button, while the project now has one shared collapsible section header for every foldable section. Product owner answered both points (decisions log, "2026-10-06 — secciones plegables, rueda y facetas"; `add-flavor-wheel` handoff Q4 (b) and Q5): the rings follow the deepest level currently expanded, and the note list's control becomes the shared collapsible header (`docs/design/refine-flavor-wheel/design-summary.md`, approved).

## What Changes

- **Rings sized by the deepest expanded level.** The wheel's ring bounds are keyed by the visible depth `V` (0 with nothing expanded, 1 with a root expanded, 2 with a level-1 note expanded) instead of the tree depth. At rest ring 0 fills 80–200; expanding and collapsing notes, and Escape, rescale the wheel instantly. The ring values of archived design.md D5 stay.
- **The note list's control becomes the shared collapsible section header.** The archived start-aligned disclosure button is replaced by the shared section's full-width header (title `texts.notesToggle`, chevron at the end) with the tree inside the section's body, collapsed at first. The hidden list leaves the tab order through the shared body. This reverses the round-1 F2 fix (`@2xl:justify-self-start`) by Product owner's Q5 answer.
- **Layout:** the separate control and list become one section, so from 42rem the grid has one row fewer (`auto 1fr`, the wheel spanning 2 rows).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: "Flavor wheel" — the rings are sized by the deepest level currently expanded and the wheel rescales as notes expand and collapse; "Flavor wheel note list disclosure" — the expand control is a full-width header with the title at the start and a chevron at the end, and the collapsed list is out of the tab order. "Flavor wheel note list" and every other requirement keep their meaning.

## Out of Scope (non-goals)

- The colour rule, the keyboard model, the description panel, the empty state and the props (`nodes`, `total`, `texts` with `notesToggle`) of the archived change.
- The label rules of round 1 (arched labels, fit rule, name shown on activation, 4-unit gap, hole 80, font sizes 13/12/12) and the contrast gates.
- A rescale animation: the rescale is instant, like the expansion.
- The note list title text and its catalog key (`wheelNotes`), which belong to the host, `add-offering-catalog`.
- Building or changing the shared collapsible section (`add-collapsible-section`, `content-structure`).
- Any new token, dependency, contract operation or change to `contracts/openapi.yaml`.

## Impact

- **Code (FSD layer `shared`)**: modified — `src/shared/ui/flavor-wheel-geometry.ts`, `src/shared/ui/flavor-wheel-geometry.test.ts`, `src/shared/ui/FlavorWheel.tsx`, `src/shared/ui/FlavorWheel.test.tsx`. No file is created.
- **Dependencies**: none added. The wheel imports `Collapsible`, `CollapsibleHeader` and `CollapsibleBody` from `src/shared/ui`, delivered by `add-collapsible-section`, which must be merged into this branch's base before the note-list tasks are built.
- **API**: none. The component calls no operation; the host's props are unchanged.
- **Consumers**: `add-offering-catalog` and `add-public-evaluations` pass the same props and need no edit.
