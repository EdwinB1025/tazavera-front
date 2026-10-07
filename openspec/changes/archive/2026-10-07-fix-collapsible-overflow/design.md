# Design

## Context

See proposal.md (Why) and `docs/design/fix-collapsible-overflow/design-summary.md` (approved 2026-10-07), which settle the defect, the end state and the mechanism.

`CollapsibleBody` in `src/shared/ui/Collapsible.tsx` (shared layer) renders an outer one-row grid whose row animates between `grid-rows-[0fr]` and `grid-rows-[1fr]`, and an inner wrapper `<div className="min-h-0">` around the consumer's content. While collapsed the outer element is `invisible` and clipped with `[clip-path:inset(0)]`, and `inert`. The inner wrapper shrinks to zero height but keeps visible overflow, so its content still overflows below the row. `visibility` and `clip-path` act on painting only, so that overflow still counts in the page's scrollable area.

No API endpoint is consumed, no API type is involved, and no API error applies. No route, page or card mapping changes.

## Goals / Non-Goals

**Goals:**
- A collapsed body adds nothing to the page's scrollable area.
- Animation, reduced motion, inertness and the expanded look stay as they are.

**Non-Goals:**
- No change to `Collapsible`, `CollapsibleHeader` or `CollapsibleBody` props, to the outer body's classes, to the header or chevron, or to any token.
- No change to consumers.

## Decisions

**D1 — `overflow-hidden` on the inner wrapper, while collapsed only.** The inner wrapper's class becomes `min-h-0` plus `overflow-hidden` when the section is collapsed, and stays `min-h-0` alone when expanded. Clipping the zero-height wrapper's overflow removes the hidden content from the page's scrollable area.
- Expanded, the wrapper keeps visible overflow, so the expanded `[clip-path:inset(-4px)]` still lets a control at the body's edge show its full 4px focus ring: no visual change while expanded.
- Closing applies `overflow-hidden` at once, as the clip-path already narrows to `inset(0)` at once; opening removes it at once while the clip-path keeps clipping the paint to the animating row until the animation ends. The painted animation is unchanged, and the 250ms timing and `motion-reduce:[transition:none]` are untouched.
- Alternatives: `overflow-hidden` always on the inner wrapper would clip the expanded focus ring (a visual change, rejected by the summary). `overflow-hidden` or `overflow-clip` on the outer body would need a new clip margin for the focus ring and change the outer element's settled classes; rejected as larger than needed.

**D2 — Test.** `src/shared/ui/Collapsible.test.tsx` gains one test: the inner wrapper (`body.firstElementChild`) has the class tokens `min-h-0` and `overflow-hidden` while collapsed; after activating the header it has `min-h-0` and not `overflow-hidden`; after activating it again it has `overflow-hidden` again. It fails on today's classes (no `overflow-hidden`). Existing tests keep their assertions unchanged (jsdom has no layout, so the page-height end state is checked in the browser, task 2.2).

Files: `src/shared/ui/Collapsible.tsx` and `src/shared/ui/Collapsible.test.tsx` (shared layer), modified. No file created.

## Risks / Trade-offs

- [A consumer relies on content overflowing a collapsed body] → None does: the content is invisible and inert while collapsed. Card, FlavorWheel and ConsensusPanel tests must stay green (task 2.1).
- [Unit tests cannot measure page height] → Browser check at 375px in task 2.2.
