Type: Refactor (fast lane)

## Why

Backlog entry R67 (Product owner, 2026-10-11, maximum priority): Manage locations (`/{locale}/manage/locations`) exists, but the user menu offers the coffee shop only "Manage offerings", so Manage locations is reachable only from the management sidebar. The coffee shop should reach its locations in one step, like its offerings. Product owner typed it as fast lane and decided that, as an exception to the refactor rules, this change adds the menu entry and its one test.

## What Changes

- For the `coffeeshop` role, the header's user menu adds "Manage locations" right after "Manage offerings", pointing at `/{locale}/manage/locations`, led by a decorative icon from `src/shared/ui/icons.ts` and with the same header menu entry look as the other entries. The user menu is the same menu on every viewport (below `md` it opens from the initials circle alone), so the mobile submenu gets the entry with it.
- One new text, `manageLocations`, in the shell message catalogs (es, en, ca), passed to the header as a prop.
- Other roles see no change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: MODIFIED "Signed-in header and user menu" (the coffee shop's management entries are "Manage offerings" followed by "Manage locations"; one new scenario, "Manage locations entry for a coffeeshop").

## Non-goals

- No change to the management sidebar, the Manage locations screen, requests, tokens or dependencies.
- R68 (the inventory entry after this one) is not folded in.

## Impact

- Modified: `src/widgets/app-header/ui/UserMenu.tsx`, `src/widgets/app-header/ui/AppHeader.tsx` (texts type), `src/app/shell/AppShell.tsx` (passes the text), `messages/{es,en,ca}/shell.json`.
- Tests: one new test in `src/widgets/app-header/ui/AppHeader.test.tsx` for the scenario "Manage locations entry for a coffeeshop"; its texts fixture gains the new key. No existing assertion changes.

## Propose status

- Change-id: `add-manage-locations-menu-entry`
- Date: 2026-10-11
- `openspec validate add-manage-locations-menu-entry --strict`: valid
- Resolves backlog entry: R67.
- Resolved (backlog entry R67, Product owner): entry, role, position, destination, look and catalogs.
- Resolved (architect, design.md D1–D2): the icon is `MapPin`, the one the Manage locations sidebar entry already shows; the texts repeat that sidebar entry's wording in each locale; the "mobile submenu" is the same user menu below `md`, so one entry covers both.
- Open: nothing.
