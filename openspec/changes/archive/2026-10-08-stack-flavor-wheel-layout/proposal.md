Type: Refactor (fast lane)

# Proposal

## Why

Production AUT findings 29, 31 and 32 (backlog R61). The fast-lane typing is Product owner's (standing rule for AUT corrections, maximum priority); unlike a behaviour-keeping refactor, this change **changes observable behaviour by Product owner's decision**: (29) from a 42rem container the CATA wheel switches to a two-column grid; it must keep the stacked order on every width. (31) Only ring 0 shows at first and children appear on expansion; the wheel must draw every level from the start, parents inside and children outward, and stay static while the note list expands. (32) The centre total (`font-size` 28) must be smaller, in proportion to the ring labels (13).

## What Changes

- `FlavorWheel` stacks on every width: wheel (centred, `max-w-128`), group legend when groups are set apart, description panel, "Notes" disclosure; the `@2xl` grid constants and the `@container` class go (design.md D1).
- The wheel draws every level of the notes from the first render, the rings chosen by the deepest level of the notes (capped at 2) with the existing ring radii; expanding, collapsing and Escape change only the note list (design.md D2).
- The centre total renders at `font-size` 18 (design.md D3).
- Spec: `feedback` replaces "Flavor wheel" with "Flavor wheel with every level" (OpenSpec refuses a MODIFIED block that drops the scenarios "Ring 0 only at first" and "Rings follow the deepest expanded level", so the old requirement is REMOVED and the new one ADDED, as R48 did) and modifies "Flavor wheel note list", "Flavor wheel note list disclosure" and "Flavor wheel kept as one view" (which cites the requirement by name); `offering-catalog` modifies "Mouthfeel group in the CATA wheel" (the general legend now sits below the wheel).

## Non-goals

- No zoom or branch focus; no change to keys, ARIA, tab stop, hover, focus, activation, the panel, the labels' fitting rule or the empty state.
- No API or contract change; no new token, contrast pair, text or dependency; no change to the consensus panel around the wheel.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `feedback`: the wheel draws every level from the start and stays static on expansion; it is stacked on every width; the note list wording follows.
- `offering-catalog`: the general group legend sits below the wheel.

## Impact

- Code: `src/shared/ui/FlavorWheel.tsx`, `src/shared/ui/flavor-wheel-geometry.ts`, `src/shared/ui/FlavorWheelChart.tsx`.
- Tests (validation suite): `src/shared/ui/FlavorWheel.test.tsx`, `src/shared/ui/flavor-wheel-geometry.test.ts`.
- QA suite: copies asserting ring 0 only, the expanded rings, the centre size or the grid go stale (design.md D4); reported, never edited.
- APIs, dependencies: none.

## Propose status

- **Change-id:** stack-flavor-wheel-layout
- **Date:** 2026-10-08
- **`openspec validate stack-flavor-wheel-layout --strict`:** valid
- **Backlog entry resolved:** R61 — CATA flavor wheel always stacked (production AUT findings 29, 31 and 32)
- **Resolved (Product owner; design lead; wheel model closed by the orchestrator):** stacked layout on every width with its order and classes (D1); every level from the start with the existing ring radii, static wheel, no zoom (D2); centre number at 18 (D3); contrast unchanged, worst measured 4.59:1 on rings 1–2 with the existing white/black rule (D3).
- **Resolved by the architect:** `layoutWheel` loses its `expanded` argument, so the geometry cannot depend on the note list (D2); the `offering-catalog` wording "a general legend beside it" becomes "below it" so the spec matches the stacked order; the requirement "Flavor wheel" becomes "Flavor wheel with every level" (REMOVED + ADDED), with the settled wording, scenarios and renames.
- **Open:** none.
