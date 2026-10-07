# Proposal

## Why

The MVC evaluation form groups its content in collapsible sections: a full-width header button with the title on the left and a chevron on the right that shows and hides a body. Two planned changes need the same mechanism — the CVA groups and the 1–9 legend of `add-specialist-evaluations` (round 1) and the note list control of `refine-flavor-wheel` (Q5). The decisions log (2026-10-06, "secciones plegables, rueda y facetas") settles it as one shared mechanism in `shared/ui` (`content-structure`, "collapsible"), built in its own change before its consumers, so neither consumer builds its own copy.

## What Changes

- A new shared collapsible section in `src/shared/ui/Collapsible.tsx`, made of three compound parts — `Collapsible` (state and body id, no element of its own), `CollapsibleHeader` (the full-width header button) and `CollapsibleBody` (the region it shows and hides) — following the `Card` / `CardAside` / `CardContent` pattern, so a consumer can put the header and the body in different card regions.
- The header carries `aria-expanded` and `aria-controls` (in both states), a title-only accessible name with an optional aside as its description, an optional heading wrapper, the shared focus indicator and a chevron that turns from down to up.
- The body stays mounted while collapsed (inert, zero height) and opens with a 0.25s height animation, instant under reduced motion.
- Controlled (`open` + `onOpenChange`) and uncontrolled (`defaultOpen`, default collapsed) use.
- Two contrast guard pairs per theme: `text-accent` over `surface-section` and over `surface-section-hover`.
- Built in-house, not on Radix Collapsible (design-summary Open 1, approved as option a).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-structure`: gains the "Collapsible section" requirement with its scenarios. The card, pagination and page-section requirements do not change.

## Out of scope (non-goals)

- No consumer adopts the section in this change: `add-specialist-evaluations` (CVA groups, 1–9 legend, the open-when-closed rule) and `refine-flavor-wheel` (note list control) adopt it in their own changes.
- The header spacing inside `CardAside` (design-summary Open 2) is settled by the `add-specialist-evaluations` round, not here.
- No disabled state, no `role="region"`, no new token, no new icon export, no new text or message key.
- No new dependency; Radix Collapsible is not used.

## Impact

- Files: `src/shared/ui/Collapsible.tsx` and `src/shared/ui/Collapsible.test.tsx` (new); `src/shared/ui/index.ts` and `src/shared/ui/index.test.tsx` (edited: exports and one smoke case); `src/app/styles/theme-tokens.test.ts` (edited: two pairs per theme).
- No API contract, route, page, catalog file or dependency change.
- Order: it merges before `add-specialist-evaluations` round 1 and `refine-flavor-wheel`, which consume it.
- Shared files also edited by other open changes (`src/shared/ui/index.ts`, `index.test.tsx`, `theme-tokens.test.ts`): conflicts are additive and the resolution keeps both sides.
