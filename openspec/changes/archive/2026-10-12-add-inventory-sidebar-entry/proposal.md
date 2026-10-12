Type: Refactor (fast lane)

## Why

Backlog entry R79 (Product owner, 2026-10-12), an AUT correction taken as a fast lane by Product owner's standing order for AUT findings: "explorar inventario de café no hace parte del menú sidebar del coffeeshop". Today the sidebar of the offerings list, offering creation and locations routes shows only "Manage offerings" and "Manage locations"; "Explore coffee inventory" appears only on the inventory list and detail, without an icon, and in the user menu. Product owner settled the end state in the entry.

## What Changes

- On every coffee shop management route (offerings list, offering creation, locations, inventory list, inventory detail) the sidebar shows the same three entries in this order, each with its icon and visible label: "Manage offerings", "Manage locations", "Explore coffee inventory" (addressing `/{locale}/manage/inventory`, existing catalog text `sidebarExploreInventory`).
- The current-page marking stays as today for the first two ("Manage offerings" on the list and create routes, "Manage locations" on the locations route); "Explore coffee inventory" is the current page only on the inventory routes.
- On the inventory list, "Explore coffee inventory" still holds the inventory facets in its sub-section; elsewhere it holds none.
- The inventory entry's icon is the compass already used by the user menu's "Explore coffee inventory" item, from the shared icon entry point.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: MODIFIED "Management sidebar entry" (two entries become three; scenarios "One entry" (now naming the three entries), "Current entry marked" and "Locations entry marked" name the inventory entry, new scenario "Inventory entry navigates") and MODIFIED "Coffee inventory sidebar" (the three entries carry their icons; new scenario "Entries on the inventory detail").

## Non-goals

- No change to the user menu, the specialist's sidebar entries or any public list's sidebar.
- No new catalog text, token, dependency, guard test or API request; no contract change.
- No change to the inventory facets, their sub-section behaviour or the remembered filters.
- No other backlog entry is folded in (R76–R78 and R80 run on other files).

## Impact

- New: `src/features/offering-management/ui/InventorySidebarEntry.tsx` (the "Explore coffee inventory" entry), exported from `src/features/offering-management/index.ts`.
- Modified: `src/pages/manage-offerings/ui/ManageOfferingsSidebarEntries.tsx`, `src/pages/new-offering/ui/NewOfferingSidebarEntries.tsx`, `src/pages/manage-locations/ui/ManageLocationsSidebarEntries.tsx`, `src/pages/manage-inventory/ui/ManageInventorySidebarScreen.tsx`.
- Tests (validation suite): one new test file for the entry (scenario "Inventory entry navigates"), one new test for "Entries on the inventory detail", and the tests of the modified scenarios updated to three entries.
- QA suite: `qa/src/pages/new-offering/ui/NewOfferingSidebarEntries.test.tsx` asserts two entries and is expected to need only that expectation updated.

## Propose status

- Change-id: `add-inventory-sidebar-entry`
- Date: 2026-10-12
- `openspec validate add-inventory-sidebar-entry --strict`: valid
- Resolves backlog entry: R79 (fast lane by Product owner's order, AUT correction of 2026-10-12).
- Resolved (backlog entry R79, Product owner): three entries in fixed order on the five routes; current marking unchanged for the first two, inventory current only on the inventory routes; facets only on the inventory list; icon from `src/shared/ui/icons.ts`, no new dependency.
- Resolved (architect, design.md): the inventory sidebar entry had no icon, so the icon is `Compass`, the one the user menu's inventory item already uses (D2); the entry lives in the `offering-management` feature beside "Manage offerings" and every route's sidebar screen composes it, so no page slice imports another (D1); on the inventory list the facets sub-section is handed to the entry directly (D3).
- Open: none.
