# Proposal

## Why

A collapsed collapsible section hides its body visually, but the hidden content still extends the page: on the evaluation form at 375px the page scrolls to 2512px while the visible content ends at 1324px, leaving a blank area below (design lead's browser review, 2026-10-07). The content-structure spec says a collapsed body shows nothing; a blank scroll area left by it breaks that. See `docs/design/fix-collapsible-overflow/design-summary.md`.

## What Changes

- A collapsed collapsible body takes up no space in the page: the page no longer scrolls past its visible content because of a collapsed section.
- Unchanged: the 0.25s open/close animation, instant toggling under reduced motion, collapsed content out of the tab order and the accessibility tree, the expanded look (including a control's focus ring at the body's edge), and the section's API.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: "Collapsible section" states that a collapsed body takes up no space, and its "Collapsed by default" scenario checks it.

## Non-goals

- No change to the section's API, the header, the chevron, the animation timing or any token.
- No change to consumers (offering detail per-axis sections, flavor wheel notes, section cards); they inherit the fix.
- No visual change while expanded.

## Impact

- Code: `src/shared/ui/Collapsible.tsx` and its test `src/shared/ui/Collapsible.test.tsx` (shared layer).
- No API, dependency or token change.
