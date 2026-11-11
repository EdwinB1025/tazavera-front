# Proposal

## Why

The `+`/`−` toggle on a taxonomy badge takes the badge's label colour, so in the traditional theme 24 of the 36 toggle-bearing notes show a black toggle and 12 a white one. Product owner asked for one colour format on every badge, a smaller toggle, and the toggle at the end of the badge, separated from the name (design summary `docs/design/restyle-taxonomy-badge-toggles/design-summary.md`, approved; Open 1 answered C). A plain white toggle fails 3:1 on 12 of 36 badges (traditional) and 10 of 36 (dark), so the format is a small chip with its own fill.

## What Changes

- The toggle of a note with children renders as one chip on every badge: filled with the card's surface colour (`surface-card`), its `+`/`−` glyph and a 1px ring in the strong text colour (`text-strong`), whatever the badge's label colour. Its glyph and its boundary (the fill on dark badges, the ring on light ones) reach at least 3:1 against every badge in both themes (summary section 4.4: minimum 3.46:1 traditional, 3.90:1 dark).
- The toggle's visible box shrinks from 24 × 24px to 16 × 16px with the check radius (`radius-check`); its hit area stays 24 × 24px.
- The toggle sits at the end of its badge: 0.5rem from the name and 0.25rem from the badge's end, so a toggle-bearing badge is 25px high, as a leaf badge.
- Behaviour, accessible names, the `+`/`−` text glyph, focus treatment, tree layout and texts are unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing`: "Taxonomy badge trees on the offering card" — the toggle sits at the end of its badge, separated from the name, in one colour treatment on every badge, with its glyph and boundary at least 3:1 against the badge in both themes.

## Out of scope (non-goals)

- `Badge` and its other variants, leaf badges, the badge geometry, the label colour rule and the `feedback` badge requirements.
- Tree layout, open/close behaviour, accessible names and catalogs; the flavor wheel; the evaluation form's descriptor cascade.
- Tokens: none added or changed. The glyph pair `text-strong` on `surface-card` is already registered in both themes.
- Icons for the glyph (summary Open 6 B), a divider before the toggle (Open 4 C).
- `offering-catalog` and `evaluations`: their wording "inside its badge right after its name" stays true and is not changed.
- API requests: none.

## Impact

- Code: `src/shared/ui/TaxonomyTreeToggle.tsx` (shared). Every `TaxonomyTree` consumer (offering card, offering detail's Consensus tab, evaluation sheet) changes look without code changes.
- Tests: one new scenario test in `src/entities/offering/ui/OfferingCard.test.tsx`; existing tests keep their assertions.
- Design decisions superseded: collapse-taxonomy-trees D4 (the toggle's classes and its 24px visible box) and unify-taste-trees D2 (`border-current` taking the label colour). unify-taste-trees D1 stands.
- No dependency, API, token or text change.
