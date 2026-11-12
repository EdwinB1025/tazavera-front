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
