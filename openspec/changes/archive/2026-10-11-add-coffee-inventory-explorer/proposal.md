Type: Refactor (fast lane)

## Why

Backlog entry R68 (Product owner, 2026-10-11, maximum priority): the coffee shop reads the coffee inventory today only through the New offering combobox, one coffee name at a time. It should see the available inventory, filter it and start an offering from an item before creating offerings. Product owner typed it as fast lane and decided that, as an exception to the refactor rules, this change adds a screen, a detail page, a menu entry and the New offering preselection, with one test per scenario of its spec deltas.

## What Changes

- **Entry point.** For the `coffeeshop` role the user menu adds "Explore coffee inventory" right after "Manage locations", pointing at `/{locale}/manage/inventory`. The user menu is the same menu on every viewport, so the mobile submenu gets it too.
- **List.** `/{locale}/manage/inventory`, only for a signed-in coffeeshop (the management gate), built like the offerings and evaluations lists: heading block, a toolbar with the Filters trigger, cards in a grid, the filters in the sidebar. Its data is `GET /coffeeInventory` (`listCoffeeInventory`) on the client through the token client; the contract has no pagination, so every returned item renders. Loading, empty, error with retry, and filtered-empty states.
- **Filters.** The six query parameters of the contract — `coffeeName` (150), `originCountry` (60), `originRegion` (90), `process` (60), `producer` (150) and `city` (90) — as text facets in the sidebar, written to the URL like the other lists, with applied chips, "Clear all" and the trigger count. No other filter and no sort.
- **Card.** Coffee name, country and region, process, variety, roast level, altitude, producer when present, certifications, roastery, roast lot and production date; actions "View" (positional treatment 3) and "Create offering" (positional treatment 1).
- **Detail.** `/{locale}/manage/inventory/{ulid}` with every field of the item, read from the same inventory request (the contract has no read of one item); its header has the back link first (fallback: the list) and "Create offering" as an action button after the title; an unknown `ulid` shows the project's item-not-found message.
- **Create offering.** Opens New offering with the item already chosen in the inventory field; without a preselected item New offering stays as today.
- The New offering inventory search and the explorer share one inventory request in the offering-management feature.
- Texts in the message catalogs (es, en, ca); icons from `src/shared/ui/icons.ts`; semantic tokens only.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: ADDED "Access to the coffee inventory pages", "Coffee inventory list", "Coffee inventory card", "Coffee inventory detail", "Creating an offering from an inventory item" and "Coffee inventory sidebar".
- `filtering`: ADDED "Inventory facets in the sidebar", "Inventory filter state in the URL", "Applied inventory filters", "Inventory filter toolbar" and "Filtered inventory results".
- `app-shell`: MODIFIED "Signed-in header and user menu" (the coffee shop's entries end with "Explore coffee inventory"; one new scenario).

## Non-goals

- No sort, pagination, selection or delete on the inventory list; no filter beyond the contract's six parameters.
- No change to the API, the contract or `src/shared/api/schema.ts`.
- No new entry in the management sidebar of the offerings and locations routes; their two entries stay as they are.
- No change to New offering without a preselected item; no new dependency, token or colour value.

## Impact

- Routes: `app/[locale]/manage/inventory/page.tsx`, `app/[locale]/manage/inventory/[ulid]/page.tsx`, `app/[locale]/@sidebar/manage/inventory/page.tsx`, `app/[locale]/@sidebar/manage/inventory/[ulid]/page.tsx`; `app/[locale]/manage/offerings/new/page.tsx` passes the preselection query.
- New slices: `src/pages/manage-inventory`, `src/pages/inventory-detail`, `src/entities/coffee-inventory`, `src/features/inventory-facets`.
- Modified: `src/features/offering-management` (the shared inventory request, the inventory read hook, the create flow's preselection), `src/pages/new-offering`, `src/widgets/app-header/ui/UserMenu.tsx`, `src/widgets/app-header/ui/AppHeader.tsx`, `src/app/shell/AppShell.tsx`, `messages/{es,en,ca}/shell.json`, `messages/{es,en,ca}/offering-management.json`.
- Tests: one per new scenario. Existing assertions stay.

## Propose status

- Change-id: `add-coffee-inventory-explorer`
- Date: 2026-10-11
- `openspec validate add-coffee-inventory-explorer --strict`: valid
- Resolves backlog entry: R68.
- Resolved (backlog entry R68, Product owner): entry point, role and position; list, data source and states; the six filters; card fields and actions; the detail page and its header; the "Create offering" preselection; catalogs, icons and tokens.
- Resolved (architect, design.md D1–D10): the shared request takes the six keys and the combobox search calls it with `coffeeName` (URL unchanged); the detail and the preselection read the whole inventory and pick the `ulid`; the preselection travels as `?inventory={ulid}`; the list and detail sidebars show the two management entries and "Explore coffee inventory" as the list's entry holding the filters; the toolbar holds only the Filters trigger (the contract has no sort); the user menu icon is `Compass` (the other "Explore" entry); texts in `offering-management` and `shell`, generic filter texts reused from `filters`.
- Open: nothing.
