Type: Refactor (fast lane)

## Why

Product owner's AUT finding (2026-10-09, maximum priority): the entries of the user menu and of the small-viewport navigation menu render through the shared `Link`, so they show the inline-link look (underline, `text-link` colour) instead of the header's own options, and they carry no icon. By Product owner's decision this change modifies the two header menus: each entry gets a small decorative icon that reflects its action and the look of the header's options. Product owner typed it as fast lane.

## What Changes

- User menu (`UserMenu`): "Mi cuenta", "Seguridad", the role's management entry, the specialist's "Explorar ofertas" and "Cerrar sesión" each show a decorative icon before their text.
- Navigation menu of a small viewport (`NavigationMenu`): "Top rated", "Explore coffee shops" and "About us" each show a decorative icon before their text.
- The internal entries of both menus render `next/link` instead of the shared `Link`, so they take the header menu entry treatment (`nav-text` with `nav-text-hover`, the navigation list typography, the shared focus ring) and no link look (no underline, no link colour) in both themes. Client-side navigation is kept.
- The menus keep their `nav` surface, separators, order, destinations and behaviour ("Seguridad" keeps its popup).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: "Header brand and primary navigation" (navigation menu entries show a decorative icon and the header options' look; new scenario "Navigation menu entries carry icons and the header look") and "Signed-in header and user menu" (menu entries show a decorative icon and the header options' look; new scenario "Menu entries carry icons and the header look").

## Non-goals

- No new token, text or dependency (`lucide-react` is already the icon library; icons go through `src/shared/ui/icons.ts`).
- No change to the shared `DropdownMenu`, the shared `Link`, the language menu, the primary navigation or the sidebar.
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/ui/icons.ts` (new lucide exports), `src/widgets/app-header/ui/UserMenu.tsx`, `src/widgets/app-header/ui/NavigationMenu.tsx`, `src/widgets/app-header/lib/nav-entries.ts`.
- Tests: `src/widgets/app-header/ui/AppHeader.test.tsx` gets one test per new scenario. No existing assertion is expected to break.

## Propose status

- Change-id: `add-user-menu-icons`
- Date: 2026-10-09
- `openspec validate add-user-menu-icons --strict`: valid
- Resolves backlog entry: none (Product owner's AUT finding passed directly).
- Resolved (Product owner, 2026-10-09): icon per option, decorative, through `src/shared/ui/icons.ts`; the header options' look, no link look; surface, separators, order, destinations and behaviour kept (design.md D1–D3).
- Icons chosen: "Mi cuenta" → `User`; "Seguridad" → `ShieldCheck`; "Gestionar ofertas" / "Gestionar evaluaciones" → `ClipboardList`; "Explorar ofertas" → `Compass` (the header and sidebar have no explore icon); "Cerrar sesión" → `LogOut`; navigation menu: "Top rated" → `Star`, "Explore coffee shops" → `Store`, "About us" → `Info`.
- Open: the navigation menu's icons are not named in the finding (it describes that menu as listing the user menu's options, but it lists the primary navigation entries); the icons above were chosen by the same rule, pending Product owner's confirmation.
