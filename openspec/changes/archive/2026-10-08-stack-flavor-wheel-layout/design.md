# Design

Sources: backlog R61 with Product owner's answer of 2026-10-08 (finding 29: stacked on every width), findings 31 and 32 as closed by the design lead and the orchestrator (every level from the start, static wheel; centre at 18), relayed in the session brief. Fast lane: no design folder.

## Context

`src/shared/ui/FlavorWheel.tsx` lays out the wheel in a `@container` figure that becomes a two-column grid from `@2xl` (`LAYOUT_CLASSES`, `GROUPED_LAYOUT_CLASSES`, `WHEEL_CLASSES`, `GROUPED_WHEEL_CLASSES`). `layoutWheel(nodes, expanded, groupOrder?)` in `flavor-wheel-geometry.ts` sizes the rings by the deepest *expanded* level (`visibleDepth`, `RINGS_BY_DEPTH`) and places a node's children only while it is expanded. `FlavorWheelChart.tsx` draws the centre total with `fontSize={28}`. The only consumer is `widgets/offering-detail/ui/CataCard.tsx`.

## Goals / Non-Goals

**Goals:** findings 29, 31, 32 as settled. **Non-Goals:** zoom, branch focus, any change to keys, ARIA, the panel, labels, colours or the consensus panel.

## API

No endpoint is added or changed; the wheel takes resolved props (`FlavorWheelNode[]`, `total`, texts, groups) built by the host from `GET /offerings/{ulid}` and `GET /taxonomies` as today. Errors and loading stay the host's (unchanged).

## Decisions

### D1. Stacked on every width

`FlavorWheel` renders `<figure>` with no `@container` class; inside it one `div` with `flex flex-col gap-6`, grouped or not, holding in order: the wheel wrapper `mx-auto aspect-square w-full max-w-128`; when groups are set apart, the group legend `ul` (`flex flex-wrap gap-x-4 gap-y-1`, unchanged); the description panel; the note list's `div` (`flex flex-col`). The four `@2xl` constants go. The panel and the note list keep the figure's full width.

### D2. Every level from the start, static wheel

`layoutWheel(nodes, groupOrder?)`: the rings come from `ringRadii` of the deepest depth of the notes (a root alone is depth 0, capped at 2), with the existing `RINGS_BY_DEPTH` values (depth 2: `[80, 120, 160, 200]`), and every node's children are placed in the next ring inside its span, whatever the note list shows. The `expanded` argument and `visibleDepth` go; the depth helper counts children regardless of expansion. `FlavorWheel` stops passing `expanded`, so expanding, collapsing and Escape change only the note list (`visibleRows`) and the active note. Hover, focus and click still make a note active: the existing outline, the active name and the panel follow. Keys and `aria-*` are unchanged.

### D3. Centre number and contrast

`FlavorWheelChart` draws the centre total with `fontSize={18}`, keeping `fill-text-primary font-serif font-bold`. Segment labels at rest on rings 1–2 already use the white/black rule of the taxonomy colour (worst measured 4.59:1, design lead): no token or pair changes.

### D4. Tests and stale QA copies

Validation: `FlavorWheel.test.tsx` and `flavor-wheel-geometry.test.ts` change only where the modified scenarios say (every level from the start, constant segments across expansion and Escape, centre 18, stacked layout), plus the call sites of `layoutWheel` that drop the `expanded` argument. QA copies of these tests that assert the old rings, the centre 28 or the grid go stale; the build reports every failing QA test and never edits it.

## Files

| File | Layer | Change |
|---|---|---|
| `src/shared/ui/FlavorWheel.tsx` | shared | D1, D2 |
| `src/shared/ui/flavor-wheel-geometry.ts` | shared | D2 |
| `src/shared/ui/FlavorWheelChart.tsx` | shared | D3 |

No route file changes.

## Risks / Trade-offs

- With every level drawn, ring 0 is 40 units deep instead of 120 when the notes reach level 2, so fewer root labels fit at rest; a note whose label does not fit keeps the existing rule (its name shows while active, and the note list carries it).
