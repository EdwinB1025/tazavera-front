# Corrections — restyle-taxonomy-badge-toggles

## Round 1

Product owner, 2026-11-12, before the visual review: in the traditional theme the toggle's fill is the same colour as the card around the badge (`surface-card`), which is confusing; the toggle should be white there, and stay dark in the dark theme. This is the design summary's measured Open 1 option D (section 4.4), written here by the orchestrator (orchestrator rules §5: in line with the agreed design).

1. `src/shared/ui/TaxonomyTreeToggle.tsx`, `TOGGLE_CLASSES`: the fill changes from the card surface to the textarea surface. End state: `bg-surface-card` is replaced by `bg-surface-textarea`, in the same position of the class list; every other class stays (glyph and ring `text-text-strong` with `border-current`, `size-3.5 md:size-4`, `rounded-check`, `type-tree-badge`, `ml-1 -mr-1`, `before:-inset-1.25 md:before:-inset-1`, `focus-visible:focus-ring`). Rendered: `#ffffff` in the traditional theme, `#051215` in the dark theme (the dark theme stays dark). Contrast (summary §4.4, computed by the design lead's `toggle-contrast.mjs` over the 36 toggle-bearing seed colours): glyph on its fill 13.98 / 15.93; boundary (fill or ring) against the badge at least 3.80 traditional and 4.22 dark; no badge under 3:1.
   Existing tests affected: `src/entities/offering/ui/OfferingCard.test.tsx`, test "Toggle at the end of its badge" (design.md D4): its expected class `bg-surface-card` becomes `bg-surface-textarea`; no other assertion changes.
   New test: none (the existing scenario test covers the class; it fails on `bg-surface-card` and passes on `bg-surface-textarea`).
2. `src/app/styles/theme-tokens.test.ts`: register the glyph pair `text-strong` on `surface-textarea` as `icon` in both theme matrices (traditional and dark), next to the existing `border-muted` / `surface-textarea` entries. End state: one entry `{ fg: "text-strong", bg: "surface-textarea", kind: "icon" }` in each matrix; no token is added or changed, no guard test is added.
   Existing tests affected: none (the matrix gains one pair per theme; both pass, 13.98 and 15.93).
   New test: none.
3. Artifacts: the landing delta "Taxonomy badge trees on the offering card" and its scenario "Toggle at the end of its badge" say the chip is filled with "the card's surface colour"; they change to a white fill in the traditional theme and the dark textarea surface in the dark theme (the textarea surface token), with the glyph and ring unchanged and the 3:1 rule unchanged. design.md D1 changes its fill class and contrast figures, and records the reuse of `surface-textarea` outside the textarea (no white surface token exists; summary Open 1 D). The proposal's "What Changes" follows.

### Status

2026-11-12 — architect (cloud). `openspec validate restyle-taxonomy-badge-toggles --strict`: valid (OpenSpec CLI 1.16.0).

1. Fill on the textarea surface: landing delta (requirement "Taxonomy badge trees on the offering card" and scenario "Toggle at the end of its badge": fill is the textarea surface colour, white in the traditional theme, the dark textarea surface in the dark theme); design.md Context, Goals, D1 (fill class `bg-surface-textarea`, figures 3.80 / 4.22 boundary and 13.98 / 15.93 glyph, reuse of `surface-textarea` outside the textarea), D3's class list, D4's expected class. Tasks 3.1 (test-first: the existing scenario test's expected class) and 3.2 (`TOGGLE_CLASSES` and its comment).
2. Guard registration: design.md Non-Goals, Files table and D1; proposal "Out of scope" and "Impact". Task 3.2 (the pair `text-strong` / `surface-textarea` as `icon` in both matrices, in the same task as the class it covers, since it passes at once).
3. Artifacts: proposal "Why", "What Changes", "Out of scope" and "Impact"; the spec and design edits above. No task of its own; task 3.3 runs the final checks.

## Round 2

Design lead's visual review after Round 1 (2026-11-12, on `6db24e55`, production build at `https://localhost:8443`): every point passes except the toggle's hit area, measured at 22 × 22px on every toggle, both themes, es and ca, every width (Chrome's computed `::before` box; real clicks open the note only up to 4px below `md` / 3px from `md` outside the visible box). The `::before` inset is measured from inside the toggle's 1px border, so 12 + 2 × 5 = 22 below `md` and 14 + 2 × 4 = 22 from `md`; design.md D2/D6 counted from the outer edge. The landing delta ("a hit area of at least 24 by 24 pixels … at every width") stays as it is; design.md's class values contradict it. Written by the orchestrator under its rules §3 (two settled artifacts contradict; the fix keeps every decision's intent, changes nothing visible, adds no scope, token or test) and §5; recorded as closed for review in the handoff.

1. `src/shared/ui/TaxonomyTreeToggle.tsx`, `TOGGLE_CLASSES`: the hit-area insets grow by 2px each. End state: `before:-inset-1.25` becomes `before:-inset-1.5`, and `md:before:-inset-1` becomes `md:before:-inset-1.25`, in the same positions of the class list; every other class stays. Result: hit area 12 + 2 × 6 = 24px below `md` and 14 + 2 × 5 = 24px from `md` (design lead's computation), centred on the chip; below `md` it reaches 1px past the badge's end and 1px above and below it, covers 5px of the 8px gap and never the name (the same kind of overlap design.md Risks already accept).
   Existing tests affected: `src/entities/offering/ui/OfferingCard.test.tsx`, test "Toggle at the end of its badge" (design.md D4): its expected classes `before:-inset-1.25` and `md:before:-inset-1` become `before:-inset-1.5` and `md:before:-inset-1.25`; no other assertion changes.
   New test: none (the existing scenario test covers the classes; it fails on the old insets and passes on the new ones).
2. Artifacts: design.md D2, D3 (the class list), D4 (the asserted classes), D6 and Risks state the new insets, measure the hit area from the inside of the 1px border, and give 24px at both widths. The landing delta does not change.

### Status

2026-11-12 — architect (cloud). `openspec validate restyle-taxonomy-badge-toggles --strict`: valid (OpenSpec CLI 1.16.0).

1. Hit-area insets `before:-inset-1.5` and `md:before:-inset-1.25`: design.md D3's class list and D4's asserted classes. Tasks 4.1 (test-first: the existing scenario test's two expected classes) and 4.2 (`TOGGLE_CLASSES`).
2. Artifacts: design.md D2 and D6 (inset measured from inside the 1px border; 12 + 2 × 6 = 24px below `md`, 14 + 2 × 5 = 24px from `md`) and Risks (hit area 5px / 4px beyond the chip's outer edge; the same-property bullet with the new values). The landing delta and the proposal do not change. No task of its own; task 4.3 runs the final checks.
