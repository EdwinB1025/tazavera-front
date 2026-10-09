Type: Refactor (fast lane)

## Why

Product owner's AUT finding (2026-10-09, maximum priority): on Manage locations the card still sits at half the page with a fixed width, as the account views did before `widen-account-cards` (R51). The card itself is capped at 40rem from the medium breakpoint (`LocationForm` and the empty card), so it ends at 40rem and leaves the rest of the page container empty. New offering's form panel carries the same cap and the same defect. Like R51, this change modifies settled layout by Product owner's decision; Product owner typed it as fast lane.

## What Changes

- Manage locations: the location form's card and the empty card fill the page container's width at every breakpoint; from the medium breakpoint their content (texts, fields, actions) is at most 40rem wide, aligned to the card's start, as in the account cards (`AccountSection`). Below the medium breakpoint nothing changes.
- New offering: the form panel fills the page container's width at every breakpoint; from the medium breakpoint the form inside it is at most 40rem wide, aligned to the card's start.
- The cards keep their padding, border, radius and header band; the list of locations and its cards are unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: "Creating offerings" (the panel fills the container, its content at most 40rem from 768px; scenario "The form panel is a section card" updated) and "Location form" (the form card and the empty card fill the container, their content at most 40rem from 768px; new scenario "Location cards fill the container").

## Non-goals

- No change to texts, fields, states, requests, tokens or dependencies.
- No change to `PageSection`, `Card`, the location list or other pages.
- No other backlog entry is folded in.

## Impact

- Modified: `src/features/location-management/ui/LocationForm.tsx`, `src/features/location-management/ui/LocationsPanelStates.tsx`, `src/pages/new-offering/ui/NewOfferingForm.tsx`.
- Test updated (it asserts the old card class): `src/pages/new-offering/ui/NewOfferingForm.test.tsx` ("section card panel"). No test asserts the location cards' classes; no test is added.

## Propose status

- Change-id: `widen-location-and-offering-forms`
- Date: 2026-10-09
- `openspec validate widen-location-and-offering-forms --strict`: valid
- Resolves backlog entry: none (Product owner's AUT finding passed directly).
- Resolved (Product owner, 2026-10-09): the cards fill the page container; their content is capped at 40rem from `md`, start-aligned, following the `widen-account-cards` pattern (design.md D1). New offering was included by the orchestrator because its panel carries the same cap.
- Open: nothing.
