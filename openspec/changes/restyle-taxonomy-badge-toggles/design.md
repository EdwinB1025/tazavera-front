# Design

## Context

See proposal.md (Why). The source of truth is `docs/design/restyle-taxonomy-badge-toggles/design-summary.md` (approved; Open 1 = C, Open 2 = A, Open 3–6 at their recommendations) and Product owner's artifact review of 2026-11-12 (`docs/design/restyle-taxonomy-badge-toggles/handoff.md`, "Session 2026-11-12 — Artifact review (step 7)", Q1 answered with both recommendations, and the orchestrator's D1 on the glyph): (a) the tree badges' text at 12px below `md` and 14px from `md`; (b) the toggle's box about 14px below `md`, its hit area still at least 24 × 24px. Review round 1 (`docs/design/restyle-taxonomy-badge-toggles/corrections.md`, 2026-11-12) moves the fill to summary Open 1 option D (D1). Current state, checked in the code on the base:

- `src/shared/ui/TaxonomyTreeToggle.tsx` (`"use client"`) renders the toggle with `TOGGLE_CLASSES` = `inline-flex size-6 shrink-0 items-center justify-center rounded-field border border-current type-button focus-visible:focus-ring` (collapse-taxonomy-trees D4, unify-taste-trees D2). Its glyph is a text `+` or `−` (U+2212) in an `aria-hidden` span.
- `src/shared/ui/TaxonomyTree.tsx` `NoteRow` renders `<Badge variant="taxonomy">` with the name in a `span`, then the toggle as the badge's last child (unify-taste-trees D1). The badge's geometry is `BADGE_GEOMETRY_CLASSES` (`type-badge rounded-field inline-flex items-center gap-1 px-2 py-0.5`), its label colour comes from `[data-taxonomy] { color: var(--taxonomy-label) }` in `globals.css`.
- `cn` (`src/shared/lib/utils.ts`) only joins classes; it does not merge conflicting utilities.
- Every `TaxonomyTree` sits on `surface-card` (summary section 4.1), never inside `variant-inverse`.
- The base layer of `globals.css` already gives every `button` the pointer cursor.
- Text sizes come only from the typographic roles `@utility type-*` of `globals.css`; no non-test file under `src/` uses a Tailwind font-size utility. `type-badge` and `type-button` are both sans, weight 600, `--text-sm` (14px), line height `--leading-normal` (1.5), with no colour and one size at every width. `src/shared/ui/color-guard.test.ts` reads every `text-<name>` class in `src/shared/ui/**` as a colour, so a `text-xs` or `max-md:text-xs` class there fails it.
- `src/shared/ui/badge-geometry-guard.test.ts` allows the seven geometry tokens together only in `Badge.tsx`; `Badge.test.tsx`, `FilterChip.test.tsx` and `DescriptorChipGroup.test.tsx` pin `BADGE_GEOMETRY_CLASSES` as it is.
- `theme-tokens.test.ts` checks the roles listed in its `ROLES` table; a role not listed there is not read by it.
- The breakpoints are Tailwind's defaults (no `--breakpoint-*` in `globals.css`): `md` is 48rem (768px).

API: no endpoint is consumed and no API error is presented; no generated or derived type is needed.

## Goals / Non-Goals

**Goals:** the end state of summary section 6 for the toggle and the toggle-bearing badge, with the colour treatment of Open 1 C, its fill moved to option D by review round 1 (D1); from the 2026-11-12 review, the tree badges' smaller text below `md` (D5) and the smaller toggle below `md` (D6).

**Non-Goals:** no change to `Badge.tsx`, `BADGE_GEOMETRY_CLASSES`, the `type-badge` and `type-button` roles, any colour token, catalogs, consumers or guard tests; the `theme-tokens.test.ts` role table is not changed, and its matrix gains only the glyph pair of D1 (review round 1). Other badges (the other `Badge` variants, taxonomy badges outside the trees — facet chips, descriptor chips, the evaluation form's cascade —, `FilterChip`, `DescriptorChipGroup`) keep their text size. `globals.css` changes only by one new typographic role (D5), and `TaxonomyTree.tsx` only by that role on the name's `span` in `NoteRow` (D5): the review's item (a) needs a size that changes with the width, which only a role in `globals.css` can carry under the colour guard, and it applies to the tree's badges only, which `NoteRow` alone renders.

## Files

| File | FSD layer | Change |
|---|---|---|
| `src/app/styles/globals.css` | app | New role `@utility type-tree-badge` after `type-badge` (D5) |
| `src/shared/ui/TaxonomyTree.tsx` | shared | `NoteRow`: the name's `span` carries `type-tree-badge` (D5) |
| `src/shared/ui/TaxonomyTreeToggle.tsx` | shared | New `TOGGLE_CLASSES` (D1–D3, D6) and their comment |
| `src/entities/offering/ui/OfferingCard.test.tsx` | entities (test) | One test for the scenario "Toggle at the end of its badge" (D4, extended by D5 and D6; fill class by D1) |
| `src/app/styles/theme-tokens.test.ts` | app (test) | The pair `text-strong` on `surface-textarea` as `icon` in both theme matrices (D1) |

## Decisions

### D1 — One chip treatment (summary Open 1 C with option D's fill, Open 2 A; review round 1)

The toggle carries its own fill: `bg-surface-textarea` (`#ffffff` in the traditional theme, `#051215` in the dark theme), with `text-text-strong` for the glyph and `border border-current` for a 1px ring in the same colour. Because the toggle sets its own text colour, `border-current` now resolves to `text-strong` and no longer to the badge's label colour, so the treatment is the same on every badge. The boundary counts as met when the fill or the ring reaches 3:1 against the badge (Open 2 A); summary section 4.4 measures a minimum of 3.80:1 (traditional) and 4.22:1 (dark) over the 36 toggle-bearing seed colours, none under 3:1, and the glyph 13.98:1 / 15.93:1 on its own fill. Review round 1 replaced the first fill, `bg-surface-card`, because in the traditional theme it matched the card around the badge. No white surface token exists, so the textarea surface token is reused outside the textarea (summary Open 1 D); no token is added or changed. The glyph pair `text-strong` on `surface-textarea` is registered as `icon` (3:1) once in each theme matrix of `theme-tokens.test.ts`, next to the existing `border-muted` / `surface-textarea` boundary pair (summary section 4.4, "Guard registration"); the boundary pairs involve data colours, which the matrix cannot hold. No guard test is added.

### D2 — Size, radius and hit area (summary section 6, Open 3 A, Open 6 A)

From `md` up the visible box is `size-4` (16 × 16px) with `rounded-check` (4px; 0 in the dark theme), as `Checkbox`'s box. The glyph stays the text `+`/`−`, centred (`inline-flex items-center justify-center`), and `shrink-0` stays. From `md` up the hit area stays 24 × 24px, centred on the box, through an invisible pseudo-element: `relative` on the button and `before:absolute` with a 4px inset (`md:before:-inset-1`; Tailwind 4 gives `before:` its empty `content`). Below `md` the box and the inset change by D6; the glyph's role is `type-tree-badge` (D5, D6) instead of `type-button`. Focus stays `focus-visible:focus-ring`; there is no hover.

### D3 — Gap and end padding by margins on the toggle (summary section 6, Open 4 A)

The badge's geometry is not touched. The toggle carries `ml-1` and `-mr-1`: with the badge's `gap-1` the name-to-toggle distance becomes 0.5rem, and with the badge's `px-2` the toggle ends 0.25rem from the badge's end. Overrides on the badge through `className` were rejected because `cn` does not merge, so `gap-1`/`px-2` and the override would both stay in the class list; a second badge geometry was rejected because the badge-geometry guard allows one definition. The badge's height then follows the name line plus its `py-0.5`: 21 + 4 = 25px from `md` up and, with D5, 18 + 4 = 22px below `md`, as a leaf badge at each width. The margins are the same at every width.

The resulting class list (D1–D3 with D5 and D6), in this order, is the one the test of D4 reads:

`relative inline-flex size-3.5 md:size-4 shrink-0 items-center justify-center rounded-check border border-current bg-surface-textarea text-text-strong type-tree-badge ml-1 -mr-1 before:absolute before:-inset-1.25 md:before:-inset-1 focus-visible:focus-ring`

The comment above `TOGGLE_CLASSES` cites this change's D1–D3, D5 and D6 instead of collapse-taxonomy-trees D4 and unify-taste-trees D2, which are superseded for the classes. unify-taste-trees D1 (the toggle inside the badge, after the name) stands.

### D4 — The scenario test (summary Open 5 A)

One test in `src/entities/offering/ui/OfferingCard.test.tsx`, next to the other tree tests, named after the scenario "Toggle at the end of its badge". It renders the card with its `taxonomies` option holding two top-level notes with one child each: one whose data colour gives a white label (`#336699`, as the fixture's Floral) and one whose data colour gives a black label (a light colour such as `#F2D16B`). It asserts, with the fewest assertions: each note's toggle is its badge's last element child; the two toggles have the same `className`; that `className` contains `bg-surface-textarea` (D1, review round 1), `text-text-strong`, `border-current`, `size-3.5`, `md:size-4`, `rounded-check`, `ml-1`, `-mr-1`, `before:-inset-1.25`, `md:before:-inset-1` and `type-tree-badge`; and each note's name `span` (the badge's first element child) has the class `type-tree-badge`. Contrast, font sizes and pixel heights are not asserted: jsdom has no CSS engine; they belong to the visual review at 375px and 1280px.

### D5 — Tree badge text by width (review 2026-11-12, item a)

A new typographic role in `globals.css`, `@utility type-tree-badge`, placed right after `type-badge`: sans (`var(--font-sans)`), weight 600, `font-size: var(--text-xs)` (12px), `line-height: var(--leading-normal)`, no colour, and `font-size: var(--text-sm)` (14px) inside `@media (min-width: 48rem)`, the pattern of `type-control`. From `md` up it is therefore metrically `type-badge`. Its metrics are the same in both themes. It adds no colour or other token.

In `TaxonomyTree.tsx` `NoteRow` the name's `span` inside the badge gets `className="type-tree-badge"`; the toggle takes it instead of `type-button` (D6). The badge keeps `BADGE_GEOMETRY_CLASSES`, so its own `type-badge` stays: the badge's flex items (the name, the toggle) set its height, and nothing inside it reads the badge's own font size (its gap and padding are in rem). So every badge `NoteRow` renders — top-level, level 1 and level 2, with or without a toggle — shows its name at 12px below `md` and 14px from `md`, and no other badge changes.

Alternatives rejected: a `text-xs`/`max-md:text-xs` class on the badge or the span fails `color-guard.test.ts`, and next to `type-badge` it would set the same property twice, which `cn` does not resolve; a size change inside `type-badge` or `BADGE_GEOMETRY_CLASSES` would reach every badge and chip and the tests that pin the geometry; a second badge geometry fails the badge-geometry guard; a `[data-*]` rule in `globals.css` overriding the badge's font size would also need a second rule for the toggle's glyph and hides the size outside the role system.

The role is not added to the `ROLES` table of `theme-tokens.test.ts`: that table is guard data, outside this review's scope; the guard does not read an unlisted role (see the final report's open question).

### D6 — The toggle below `md` (review 2026-11-12, item b; orchestrator's D1)

Below `md` the visible box is `size-3.5` (14 × 14px), from `md` up `md:size-4` (16 × 16px, D2). In a 22px badge the 14px box leaves 4px above and below, matching the 0.25rem end padding of D3. The hit area stays at least 24 × 24px, centred: the pseudo-element's inset is 5px below `md` (`before:-inset-1.25`, 14 + 10 = 24px) and 4px from `md` (`md:before:-inset-1`, 16 + 8 = 24px). The glyph takes the role `type-tree-badge` instead of `type-button`, so it follows the badge's name: 12px below `md`, 14px from `md`, same weight and line height as before. Radius, colours, margins and focus are the same at every width.

## Risks / Trade-offs

- [The glyph's line (21px from `md`, 18px below) is taller than the box's inner area (14px, 12px below)] → the box keeps its fixed size and the glyph stays centred; whether it reads well is checked in the visual review at 375px and 1280px (summary "Unverified").
- [Below `md` the 24px hit area is 2px taller than the 22px badge, 1px above and below] → it stays invisible; the vertical gaps between badges (at least 6px) keep two hit areas from overlapping.
- [Below `md` the 5px inset covers 5px of the 8px gap toward the name and reaches 1px past the badge's end] → it never reaches the name text.
- [`before:-inset-1.25` and `md:before:-inset-1` set the same property] → they are in different media conditions, and Tailwind emits the `md:` utility after the base one, so the `md:` value wins from `md` up; checked by compiling both classes with the installed Tailwind 4.
- [A new typographic role outside `theme-tokens.test.ts`'s role table] → no guard checks its metrics; the task's test reads the class, the visual review the size.
- [From `md` the hit area overlaps 4px of the 8px gap toward the name and the 4px end padding] → it never reaches the name text; accepted in summary section 7.
- [Contrast is measured on the API seed colours, not a live `GET /taxonomies`] → a future colour outside the seed could fall under 3:1; the token matrix cannot hold data colours (summary section 4.4).
- [No tailwind-merge] → D3 avoids conflicting utilities on one element, so no utility order decides the result.
