Type: Refactor (fast lane)

## Why

Backlog entry R71 (Product owner, 2026-10-11), taken as a fast lane by Product owner's order of 2026-10-11 (option A): on the coffee inventory list every card's "View" and "Create offering" have the same accessible name, and so does every My offerings card's "View", so a screen-reader user cannot tell the cards apart (WCAG 2.5.3 / 2.4.6). My offerings' Select and Delete already name the offering they act on.

## What Changes

- On the coffee inventory list, each card's "View" and "Create offering" have an accessible name that starts with the visible label and then names the item's coffee, followed by its roastery when the item has one, as Select and Delete do on My offerings. The visible text stays the label alone; the extra words are for assistive technology only.
- On My offerings, each card's "View" has an accessible name that starts with "View" and then names the offering as Select and Delete do (coffee name — location name), with the same visible text as today.
- Nothing else changes: visible texts, layout, the public offering cards' actions (their View keeps its current accessible name) and the requests stay as today. No new interface text, catalog key, token or component.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Coffee inventory card" (View and Create offering are named by the coffee and its roastery; new scenario "Card actions name the coffee") and MODIFIED "My offerings list" (View is named by the offering; new scenario "View names the offering").

## Non-goals

- No change to the public offering cards (`/{locale}`, `/{locale}/offerings`, the coffee shop detail): their View, "View evaluations" and Evaluate keep their accessible names (landing "Offering card actions").
- No change to the inventory detail page's "Create offering", to Select or Delete, to visible texts, layout, requests, shared controls (`Button`, `RouteButton`), tokens, message catalogs or dependencies.
- No other backlog entry is folded in (R72 runs after this change).

## Impact

- Modified: `src/features/offering-management/lib/identification.ts` (an inventory item's identification beside the offering's), `src/features/offering-management/index.ts` (exports the identification helpers the pages import), `src/entities/offering/ui/OfferingViewButton.tsx` (its label accepts rich content), `src/pages/manage-offerings/ui/OwnOfferingsGrid.tsx`, `src/pages/manage-inventory/ui/InventoryCardActions.tsx` and `src/pages/manage-inventory/ui/InventoryResults.tsx`.
- Tests: two new tests, one per new scenario. Two existing validation tests look the changed buttons up by their old exact name ("View" on My offerings, "View" and "Create offering" on the inventory card); only those lookups take the new name, and their `expect` assertions stay as they are.
- QA suite: any QA test that looks these buttons up by the old exact name becomes stale on purpose; it is left untouched and listed in the build's final report.

## Propose status

- Change-id: `name-card-actions-by-coffee`
- Date: 2026-10-11
- `openspec validate name-card-actions-by-coffee --strict`: valid
- Resolves backlog entry: R71 (fast lane by Product owner's order of 2026-10-11, option A).
- Resolved (backlog entry R71): points 1–3 as stated in What Changes.
- Resolved (architect): the inventory card's names live in "Coffee inventory card" and My offerings' View in "My offerings list", the requirements that already state those buttons; "Offering selection" (Select's name) stays as it is.
- Resolved (architect, design.md D1–D3): the extra words come only from the API data on the card, joined with the separators Select and Delete already use (label, a space, then the names joined by " — "); they render as visually hidden text inside the button, so no shared control changes.
- Resolved (architect): the existing lookups by the old exact name in `ManageOfferingsPanel.test.tsx` and `InventoryListClient.test.tsx` take the new name; their assertions do not change (tasks 1.1 and 2.1).
- Open: none.
