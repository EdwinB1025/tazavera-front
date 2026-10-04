# Design summary — refine-app-header

Input for `/opsx:propose`. Decisions taken by the product owner (Augusto) on 2026-10-04 unless listed under Open.

- Change-id: `refine-app-header`
- Capability: `app-shell` (modified requirements)
- Depends on: `add-app-shell` merged into `develop`.
- Reference: the Flux profile control of the previous MVC app — header-themed, initials on mobile, initials plus name on larger screens.

## 1. Scope

Visual and interaction refinement of the signed-in and signed-out header. No route, session or API change.

- User control (avatar trigger) and its menu.
- Language control and its menu.
- Out of scope: "Sign in" button (stays the primary button), avatar images, the management sidebar, the theme selector's behaviour.

## 2. User control

- Ghost trigger on the header surface: no button fill, no border at rest; header hover and focus treatment.
- Content: initials circle (existing `nav-avatar*` tokens). From `md` up, the user's name (`data.name`, `data.surname`) and a chevron follow the circle; below `md`, the initials circle only.
- Accessible name: the user's full name, as today.

## 3. Language control

- Replaces the native `select` with the Radix DropdownMenu already pulled by `add-app-shell`.
- Trigger: same ghost style as the user control — never the primary button pattern. Content: globe icon, current locale code ("ES") and a chevron, on every viewport.
- Accessible name from the `shell` catalog, including the current language (for example "Language: Español").
- Menu items: each language in its own name (Español, English, Català), each with its own `lang` attribute; the current one marked. Choosing one keeps the current behaviour: same route under the new locale prefix.
- No flags: flags represent countries, not languages.

## 4. Menus

- Both menus extend the header: they use the header's existing `nav-*` tokens (surface, text, hover, indicator for the current item) instead of the cream surface tokens.
- No new tokens unless a pair on the header surface fails 4.5:1 for text or 3:1 for indicators and focus; the architect maps the exact token names from `globals.css` and records the contrasts.

## 5. Icons

Globe (or Languages) and ChevronDown, re-exported from `src/shared/ui/icons.ts`; exact Lucide names checked against the installed version.

## 6. Tests

Trigger accessible names; the user control's name and chevron hidden below `md` and shown from `md`; language items carry `lang`; menus render with the `nav-*` tokens; the guards (color, focus, icons, literal text) stay green.

## Open

1. **Change-id:** `refine-app-header` is a proposal.