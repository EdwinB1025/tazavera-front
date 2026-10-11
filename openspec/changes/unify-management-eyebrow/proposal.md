Type: Refactor (fast lane)

## Why

Backlog entry R70 (Product owner, 2026-10-11), taken as a fast lane by Product owner's order of 2026-10-11: the coffee shop's management pages show two eyebrow styles. My offerings and New offering use the management eyebrow style (semibold, uppercase, label color), while the coffee inventory list and the coffee inventory detail use the plain eyebrow style. Product owner chose option B: the inventory pages take the management eyebrow style, so the management area has one eyebrow style.

## What Changes

- The eyebrow of the coffee inventory list ("Management") renders in the management eyebrow style (`type-eyebrow-strong`), as My offerings and New offering do.
- The eyebrow of the coffee inventory detail ("Coffee inventory") renders in the same management eyebrow style.
- Nothing else changes: texts, layout, requests and every other page keep their current eyebrow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Coffee inventory list" (its eyebrow uses the management eyebrow style; new scenario "Inventory list eyebrow") and MODIFIED "Coffee inventory detail" (its eyebrow uses the management eyebrow style; new scenario "Inventory detail eyebrow").

## Non-goals

- No change to any other eyebrow (`/{locale}/offerings`, the coffee shop directory and detail, the evaluation form, the public lists, landing and so on).
- No change to texts, layout, requests, tokens, the `type-eyebrow` or `type-eyebrow-strong` utilities, or dependencies.
- No other backlog entry is folded in (R71 touches the same pages and runs after this change).

## Impact

- Modified: `src/pages/manage-inventory/ui/InventoryListClient.tsx` and `src/pages/inventory-detail/ui/InventoryDetailView.tsx` (one class name each).
- Tests: two new tests, one per new scenario, in `src/pages/manage-inventory/ui/InventoryListClient.test.tsx` and `src/pages/inventory-detail/ui/InventoryDetailClient.test.tsx`. No existing assertion changes.
- QA suite: no QA test asserts the inventory eyebrow's class, so no QA test is expected to become stale.

## Propose status

- Change-id: `unify-management-eyebrow`
- Date: 2026-10-11
- `openspec validate unify-management-eyebrow --strict`: valid
- Resolves backlog entry: R70 (fast lane by Product owner's order of 2026-10-11).
- Resolved (backlog entry R70, Product owner, option B): the inventory list's and the inventory detail's eyebrow use `type-eyebrow-strong`; nothing else changes.
- Resolved (architect): the scenarios are checked by the exact class name, as jsdom has no CSS engine (same pattern as the My offerings header test).
- Skipped: design.md (conditional in the schema; no technical decision to settle beyond the two class names).
- Open: none.
