Type: Refactor (fast lane)

## Why

Backlog entry R69 (Product owner, 2026-10-11), taken as a fast lane by Product owner's order of 2026-10-11: on a phone, the footer of each My offerings card ("Ver · Seleccionar · Eliminar") overflows the card, "Eliminar" is cut at the card's right edge and the page scrolls sideways (431 px wide at 375 px). My offerings is the coffee shop's main screen, so it is unusable on a phone. Product owner also reports that the view button ("Ver" / "Ver evaluaciones") looks shorter than the other card buttons.

## What Changes

- The offering card gains a place at the end of the row that holds its verification state badge, filled by its consumer; with nothing supplied the row shows only the badge, as today.
- On My offerings, the "Seleccionar" checkbox leaves the footer and sits at the end (right-aligned) of the badge row. Its accessible name is unchanged (visible label, coffee and location).
- On My offerings, the footer keeps "Ver" and "Eliminar" only, each a button of the footer's action group, so at 375 px and 1280 px every card button lies inside the card and the page has no horizontal scroll.
- Every button of a card's footer, the view button included, renders at the same height on every card list (My offerings and the public lists).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Offering selection" (the Select control sits at the end of the card's badge row; new scenario "Select in the badge row") and MODIFIED "My offerings list" (the card footer holds View and Delete as buttons of its action group at one height; new scenario "Card actions fit the card").
- `landing`: MODIFIED "Offering card actions" (the card renders its consumer's content at the end of the badge row, and every footer action renders at one height; new scenarios "Consumer content in the badge row" and "Footer actions share one height").

## Non-goals

- No change to texts, requests, the public cards' content, the selection toolbar, the shared button, action group or checkbox components, tokens or dependencies.
- No other backlog entry is folded in.

## Impact

- Modified: `src/entities/offering/ui/OfferingCard.tsx` (badge row slot), `src/features/offering-management/ui/OfferingActions.tsx` (Delete only), `src/features/offering-management/index.ts`, `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx` (composes both slots).
- Added: `src/features/offering-management/ui/OfferingSelect.tsx` (the Select checkbox), `src/features/offering-management/lib/identification.ts` (the offering's identification shared by Select and Delete).
- Tests: four new tests, one per new scenario, in `src/entities/offering/ui/OfferingCard.test.tsx`, `src/widgets/offering-list/ui/OfferingList.test.tsx` and `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx`. No existing assertion changes.
- QA suite: `qa/src/features/offering-management/ui/OfferingActions.test.tsx` asserts Select and Delete in one wrapper and passes the Select props to `OfferingActions`; that behaviour changes on purpose, so the file becomes stale (it fails the QA suite and the typecheck of `qa/`). It is not rewritten here; it is reported to Product owner.

## Propose status

- Change-id: `fix-offering-card-actions-layout`
- Date: 2026-10-11
- `openspec validate fix-offering-card-actions-layout --strict`: valid
- Resolves backlog entry: R69 (fast lane by Product owner's order of 2026-10-11).
- Resolved (backlog entry R69, Product owner): Select's position and accessible name, the footer's content, buttons inside the card at 375px and 1280px, one height for the view button, nothing else changes.
- Resolved (architect, design.md D1–D4): an optional `badgeRowEnd` slot on the card in one always-rendered row (public cards measured unchanged); Select and Delete split into `OfferingSelect` and a Delete-only `OfferingActions` with no wrapper, composed by the page; the footer buttons keep the shared `sm` size, which already measures one height in Chromium.
- Open: `qa/src/features/offering-management/ui/OfferingActions.test.tsx` becomes stale on purpose and fails the QA suite, the typecheck and `next build` (which typechecks `qa/`) until Product owner updates it (design.md Risks).
