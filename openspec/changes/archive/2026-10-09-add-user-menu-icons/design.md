## Context

Product owner's AUT finding (2026-10-09): the header menus' entries look like inline links. `UserMenu` and `NavigationMenu` (`src/widgets/app-header/ui/`) wrap the shared `Link` in `DropdownMenuItem asChild`; the shared `Link` prepends `LINK_CLASSES` (`underline text-text-link hover:text-text-link-hover`), which override the `nav` item treatment of the shared `DropdownMenu` (`type-navlist-item`, `hover:text-nav-text-hover`, `focus:text-nav-text-hover`, `focus-visible:focus-ring`, `gap-2`, svg `size-4`). No API endpoint is consumed or changed.

## Goals / Non-Goals

**Goals:** a decorative icon before every entry of both header menus; the entries take the header menu entry treatment and no link look.

**Non-Goals:** changing the shared `DropdownMenu`, the shared `Link`, the language menu, tokens or texts.

## Decisions

### D1. Entries render `next/link`, as the primary navigation does

The internal entries render `next/link` directly (refine-app-header D14 precedent in `PrimaryNav`), so only the `nav` item classes of `DropdownMenuItem` apply: `nav-text` at rest through `type-navlist-item`, `nav-hover` with `nav-text-hover` on hover and focus, the shared focus ring. `next/link` keeps client-side navigation for the internal routes. "Seguridad" stays a native anchor opening its popup; "Cerrar sesión" stays a plain item.

### D2. Icons

Each entry renders its icon before its text, `aria-hidden`, at `size-4` (the size of the header's small icons, e.g. the user control's chevron), separated from the text by the item's `gap-2` (the header triggers' gap). Icons come only from `src/shared/ui/icons.ts`, which gains the lucide exports `User`, `ShieldCheck`, `ClipboardList`, `Compass`, `LogOut`, `Star`, `Store` and `Info`.

| Entry | Icon |
|---|---|
| Account | `User` |
| Security | `ShieldCheck` |
| Manage offerings / Manage evaluations | `ClipboardList` |
| Explore offerings | `Compass` |
| Sign out | `LogOut` |
| Top rated | `Star` |
| Explore coffee shops | `Store` |
| About us | `Info` |

### D3. Navigation entries carry their icon

`primaryNavEntries` (`src/widgets/app-header/lib/nav-entries.ts`) gains an `icon` per entry; `NavigationMenu` renders it and `PrimaryNav` ignores it.

## Risks / Trade-offs

- [jsdom asserts classes, not pixels] → the tests assert the icon (`aria-hidden` svg) and the classes; Product owner checks the visual end state in both themes.
- [Navigation menu icons not named by the finding] → chosen by the finding's rule; open in the propose status.
