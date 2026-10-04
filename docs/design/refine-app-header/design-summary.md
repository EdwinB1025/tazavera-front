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
- Out of scope: "Sign in" button (stays as today: the navigation action treatment of `base-controls`, not the primary action), avatar images, the management sidebar, the theme selector's behaviour.

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

## 7. Explore feedback — front-only decisions (2026-10-04, acting product owner)

- **Change-id:** `refine-app-header` is final (branch, design folder and commit already use it).
- **Language trigger name:** the shell composes the catalog word ("Idioma" / "Language" / "Idioma") with the current language's own name and passes one string to the widget; the widget never joins text. The own names (Español, English, Català) and their `lang` codes are data, kept as constants beside `src/shared/config/locales.ts`, not interface text.
- **Current language marking:** the language menu is a single-choice group (radio items, `aria-checked` on the current one).
- **Icon colour:** the globe and chevron follow the control's text colour (`nav-text` → `nav-text-hover`), as `base-controls` "Shared icon source" already says; not `nav-icon`.
- **Tests:** add "current language is marked", "choosing a language calls back with the locale" and "language trigger shows globe, code and chevron on every viewport". The existing `AppHeader.test.tsx` cases that query the language control as `combobox` or `option`, and the `LanguageSelect` block, are rewritten to menu semantics (not deleted).
- **Backlog R1:** stays deferred; the callback seam survives this change.

## 8. Product owner answers (Augusto, 2026-10-05)

- **Menu triggers:** the `app-shell` delta states that header menu triggers (user and language) are not action controls. One capability only; no `base-controls` delta.
- **Shared menu:** `src/shared/ui/DropdownMenu.tsx` gets a surface variant (for example `surface="nav"`). Its defaults stay as they are. Both header menus use the nav variant.
- **Current language marker:** the checked radio item's indicator (check icon) follows the text colour, `nav-text` → `nav-text-hover`, as in §7. No row background, no `nav-current`, no `nav-indicator`, no new tokens.
- **Dark avatar initials:** fixed in this change, dark theme only; the traditional theme is unchanged. The avatar reuses the Sign in button's dark pair: the `nav-button` pair at rest (`nav-button-text` on `nav-button-bg`) and `action-primary-text` on `action-primary-hover` on hover. Contrasts re-measured against `globals.css` (WCAG, minimum 4.5:1):
  - At rest: `night-cream-100` #f2eadd on `night-oxblood-700` #a03f3c = 5.38:1. Passes.
  - On hover: `night-cream-100` #f2eadd on `night-oxblood-800` #90302e = 6.64:1. Passes.
- **Dark avatar boundary (Augusto, 2026-10-05):** the avatar circle fill (`nav-button-bg`, about 2.3:1 against `nav-surface`) gets a ring in the dark theme only, using `nav-button-border`, as Sign in has. No new token; the traditional theme is unchanged.
- **Panel radius:** `radius-field` (8px) in the nav variant only. The base panel keeps 16px. The spec/code mismatch (`base-controls` says menus use `radius-field`; the shared panel uses `rounded-container`) goes to `docs/backlog.md`. Augusto checks the MVC dropdown in the browser before the archive.
- **Theme selector inside the menu:** restyled with the menu, only if that is a token/class change scoped to that selector. If it requires changing the selector's own shared styling, it is left as is and added to the backlog. The propose states which case applies.

## Open

Nothing open on the design. Pending outside the propose: the backlog entry for the radius mismatch, and the MVC dropdown check before the archive.

## Propose status

- **Change-id:** `refine-app-header` (continued from the interrupted run of 2026-10-05: the change folder already held `.openspec.yaml`, no artifacts existed).
- **Date:** 2026-10-05.
- **Validation:** `openspec validate refine-app-header --strict` → `Change 'refine-app-header' is valid` (run after each artifact and again on the completed change).
- **Artifacts created:** `openspec/changes/refine-app-header/proposal.md`, `specs/app-shell/spec.md` (2 added requirements, 2 modified), `design.md` (D1–D13), `tasks.md` (4 groups). One capability, `app-shell`; no `base-controls` or `theming` delta.

### Resolved by this propose (decision → where it landed)

- **§8 menu triggers not action controls** → one capability: the delta states it (spec "Header menu triggers"); no `base-controls` delta (design.md D1).
- **§8 shared menu** → `src/shared/ui/DropdownMenu.tsx` gains `surface?: "card" | "nav"` with the card default byte-identical; two complete class sets chosen inside the component because `cn` does not merge (design.md D2). Nav panel: `nav-surface`/`nav-text` with `radius-field`; rows take `type-navlist-item` (which binds `nav-text`) with `nav-hover`/`nav-text-hover`.
- **§8 current language marker** → the check indicator follows the entry's text colour through `currentColor`; no row background, no `nav-current`, no `nav-indicator`, no new tokens (design.md D7).
- **§7 icon colour** → globe and chevron follow the control's text colour `nav-text` → `nav-text-hover`; `Globe` and `ChevronDown` from `src/shared/ui/icons.ts`, both verified in the installed `lucide-react` (design.md D8).
- **§8 dark avatar initials and boundary** → dark arm `nav-button-bg`/`nav-button-text` at rest, `action-primary-hover`/`action-primary-text` on hover, boundary `nav-button-border`; traditional arm keeps `nav-avatar`, `nav-text-dark`, `nav-avatar-hover` with no boundary (design.md D5; contrasts recorded in D13: 5.38:1 and 6.64:1 as re-measured here, ring ≈12:1 against `nav-surface`).
- **§8 panel radius** → `radius-field` in the nav variant only; the base panel keeps `rounded-container` (design.md D2).
- **§8 theme selector inside the menu** → **case (a) applies**: `ThemeSelect.tsx` is widget-local and shares no styling, so it is a token/class change scoped to the selector and is restyled with the menu; no backlog entry for it (design.md D9).
- **§7 language trigger name and data** → the shell composes `"<catalog word>: <own name>"` and passes one string; own names and `lang` codes live in `src/shared/config/locale-names.ts` as data (design.md D6).
- **§7 current language semantics and tests** → single-choice radio group with `aria-checked`; the named `AppHeader.test.tsx` cases and the `LanguageSelect` block are rewritten to menu semantics in task 2.1, plus the three added cases (design.md D7, tasks 2.1).
- **§7 backlog R1** → stays deferred; the callback seam survives unchanged (`ShellChrome.tsx` is untouched). No backlog entry is resolved by this change.
- **§4 contrast recording** → design.md D13 maps every token pair and records the contrasts; the failing pairs found in the explore (`nav-indicator`, `nav-current`, `nav-icon`) are avoided by the settled choices, so the "new tokens" hatch does not fire and no token is added or changed.

### Open (recorded here and in design.md "Open Questions"; the propose continued on the stated working reading)

1. **§4 "text" vs the user menu's link rows.** Working reading: rows rendering the internal `Link` treatment keep its colours (the link-treatment cases survive, per §7's test list), other rows take `nav-text` → `nav-text-hover`. If §4 meant every row in `nav-text`, those assertions change and `base-controls` "Link states" needs a carve-out.
2. **§2 "header hover and focus treatment".** Working reading: the trigger's content switches `nav-text` → `nav-text-hover` and gets no hover fill (design.md D3), matching how the header's own links hover and how §7/§8 phrase it. Alternative: a `nav-hover` background on hover.
3. **The dark-arm mechanism (design.md D5).** Working choice: one `@custom-variant theme-dark (&:is([data-theme="dark"] *));` declaration in `globals.css` — no token added or changed, the traditional theme untouched. It is the only vehicle found that satisfies "dark theme only, no new token" at once; alternatives were rejected in design.md D5.

### Pending outside this propose (product owner)

- The `docs/backlog.md` entry for the panel-radius mismatch (`base-controls` "fields and menus" at `radius-field` vs the shared card panel's `rounded-container`): agents only read that file, so it is added by the product owner.
- The MVC dropdown check in the browser before the archive.