# Design

## Context

See proposal.md (Why). The source of truth is `docs/design/restyle-taxonomy-badge-toggles/design-summary.md` (approved; Open 1 = C, Open 2 = A, Open 3–6 at their recommendations). Current state, checked in the code on the base:

- `src/shared/ui/TaxonomyTreeToggle.tsx` (`"use client"`) renders the toggle with `TOGGLE_CLASSES` = `inline-flex size-6 shrink-0 items-center justify-center rounded-field border border-current type-button focus-visible:focus-ring` (collapse-taxonomy-trees D4, unify-taste-trees D2). Its glyph is a text `+` or `−` (U+2212) in an `aria-hidden` span.
- `src/shared/ui/TaxonomyTree.tsx` `NoteRow` renders `<Badge variant="taxonomy">` with the name in a `span`, then the toggle as the badge's last child (unify-taste-trees D1). The badge's geometry is `BADGE_GEOMETRY_CLASSES` (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`), its label colour comes from `[data-taxonomy] { color: var(--taxonomy-label) }` in `globals.css`.
- `cn` (`src/shared/lib/utils.ts`) only joins classes; it does not merge conflicting utilities.
- Every `TaxonomyTree` sits on `surface-card` (summary section 4.1), never inside `variant-inverse`.
- The base layer of `globals.css` already gives every `button` the pointer cursor.

API: no endpoint is consumed and no API error is presented; no generated or derived type is needed.

## Goals / Non-Goals

**Goals:** the end state of summary section 6 for the toggle and the toggle-bearing badge, with the colour treatment of Open 1 C.

**Non-Goals:** no change to `Badge.tsx`, `BADGE_GEOMETRY_CLASSES`, `TaxonomyTree.tsx`, `globals.css`, tokens, catalogs, consumers or the `theme-tokens.test.ts` matrix.

## Files

| File | FSD layer | Change |
|---|---|---|
| `src/shared/ui/TaxonomyTreeToggle.tsx` | shared | New `TOGGLE_CLASSES` (D1–D3) and their comment |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities (test) | One test for the scenario "Toggle at the end of its badge" (D4) |

## Decisions

### D1 — One chip treatment (summary Open 1 C, Open 2 A)

The toggle carries its own fill: `bg-surface-card`, with `text-text-strong` for the glyph and `border border-current` for a 1px ring in the same colour. Because the toggle sets its own text colour, `border-current` now resolves to `text-strong` and no longer to the badge's label colour, so the treatment is the same on every badge. The boundary counts as met when the fill or the ring reaches 3:1 against the badge (Open 2 A); summary section 4.4 measures a minimum of 3.46:1 (traditional) and 3.90:1 (dark) over the 36 toggle-bearing seed colours, and the glyph 11.53:1 / 14.75:1 on its own fill. The glyph pair `text-strong` on `surface-card` is already registered in both themes of `theme-tokens.test.ts` as `text`, so no pair is registered and no token is added.

### D2 — Size, radius and hit area (summary section 6, Open 3 A, Open 6 A)

The visible box is `size-4` (16 × 16px) with `rounded-check` (4px; 0 in the dark theme), as `Checkbox`'s box. The glyph stays the text `+`/`−` in `type-button`, centred (`inline-flex items-center justify-center`), and `shrink-0` stays. The hit area stays 24 × 24px, centred on the box, through an invisible pseudo-element: `relative` on the button and `before:absolute before:-inset-1` (Tailwind 4 gives `before:` its empty `content`). Focus stays `focus-visible:focus-ring`; there is no hover.

### D3 — Gap and end padding by margins on the toggle (summary section 6, Open 4 A)

The badge's geometry is not touched. The toggle carries `ml-1` and `-mr-1`: with the badge's `gap-1` the name-to-toggle distance becomes 0.5rem, and with the badge's `px-2` the toggle ends 0.25rem from the badge's end. Overrides on the badge through `className` were rejected because `cn` does not merge, so `gap-1`/`px-2` and the override would both stay in the class list; a second badge geometry was rejected because the badge-geometry guard allows one definition. The badge's height then follows the 21px name line plus its `py-0.5`, 25px, as a leaf badge.

The resulting class list, in this order, is the one the test of D4 reads:

`relative inline-flex size-4 shrink-0 items-center justify-center rounded-check border border-current bg-surface-card text-text-strong type-button ml-1 -mr-1 before:absolute before:-inset-1 focus-visible:focus-ring`

The comment above `TOGGLE_CLASSES` cites this change's D1–D3 instead of collapse-taxonomy-trees D4 and unify-taste-trees D2, which are superseded for the classes. unify-taste-trees D1 (the toggle inside the badge, after the name) stands.

### D4 — The scenario test (summary Open 5 A)

One test in `src/entities/offering/ui/OfferingCard.test.tsx`, next to the other tree tests, named after the scenario "Toggle at the end of its badge". It renders the card with its `taxonomies` option holding two top-level notes with one child each: one whose data colour gives a white label (`#336699`, as the fixture's Floral) and one whose data colour gives a black label (a light colour such as `#F2D16B`). It asserts, with the fewest assertions: each note's toggle is its badge's last element child; the two toggles have the same `className`; and that `className` contains `bg-surface-card`, `text-text-strong`, `border-current`, `size-4`, `rounded-check`, `ml-1`, `-mr-1` and `before:-inset-1`. Contrast and pixel heights are not asserted: jsdom has no CSS engine; they belong to the visual review.

## Risks / Trade-offs

- [The `type-button` glyph line (21px) is taller than the 14px inner box] → the box keeps its fixed size and the glyph stays centred; whether it reads well is checked in the visual review (summary "Unverified").
- [The hit area overlaps 4px of the 8px gap toward the name and the 4px end padding] → it never reaches the name text; accepted in summary section 7.
- [Contrast is measured on the API seed colours, not a live `GET /taxonomies`] → a future colour outside the seed could fall under 3:1; the token matrix cannot hold data colours (summary section 4.4).
- [No tailwind-merge] → D3 avoids conflicting utilities on one element, so no utility order decides the result.
