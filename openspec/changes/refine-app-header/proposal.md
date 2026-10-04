# Proposal

## Why

The header's two controls are the roughest part of the shell the previous change landed: the language selector is a native select dressed as a filled navigation button, the user control is a bare initials circle with no name, and both menus drop cream panels over the sage header instead of extending it. The dark theme also ships an accessibility defect in the avatar: the initials measure about 2.9:1 against their circle. This change refines the two controls and their menus to the settled design (the Flux profile control as reference) before `add-auth` and `add-landing` build on the header.

## What Changes

- **User control.** The trigger becomes a ghost control on the header surface — no fill, no border — carrying the initials circle and, from `md` up, the user's name and a chevron after it; below `md` the circle alone. In the dark theme the circle takes the "Sign in" pair at rest and the primary action pair on hover, with a boundary ring so the circle is perceivable against the header surface. The traditional theme is unchanged.
- **Language control.** The native select becomes a menu: a ghost trigger with a globe icon, the current locale code and a chevron on every viewport, named from the message catalog with the current language's own name. Each entry shows the language in its own name with its own `lang` attribute, the current one is marked as the single choice, and choosing one keeps today's behaviour (the same route under the new locale prefix).
- **Header menus.** Both menus extend the header: the navigation surface, text and hover colours instead of the cream panel treatment, the field corner radius on the panel, and the current choice marked with an indicator that follows the entry's text colour. The theme selector inside the user menu is restyled with the menu; its behaviour is untouched.
- **Header menu triggers.** The delta states that the user and language controls are menu triggers and not action controls, so `base-controls` needs no delta.
- No route, session or API change. No new color or radius token.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-shell`: the signed-in user control and its menu, the language selection and its menu, a new requirement for the presentation shared by the two header menus, and the statement that header menu triggers are not action controls.

## Out of Scope (non-goals)

- **"Sign in" button.** Stays as today: the navigation action treatment of `base-controls`, not the primary action.
- **Avatar images.** The control keeps rendering initials only.
- **The management sidebar.** Untouched.
- **The theme selector's behaviour.** Choosing and keeping a theme is unchanged; only its appearance inside the menu is in scope.
- **Any `base-controls` or `theming` requirement change.** Header menu triggers are declared not action controls in the `app-shell` delta instead.
- **New tokens.** Every colour comes from the existing semantic tokens; the dark avatar reuses the pairs "Sign in" already renders.
- **End-to-end verification of the locale swap** (backlog R1, stays deferred) and the MVC dropdown check Augusto performs before the archive.
- **Any change to `contracts/openapi.yaml` or `src/shared/api/schema.ts`.**

## Impact

- **Code (all under `src/` unless stated):** New — `src/shared/config/locale-names.ts` (FSD layer `shared`, segment `config`). Modified — `src/shared/ui/DropdownMenu.tsx` and `src/shared/ui/icons.ts` (FSD layer `shared`, segment `ui`), `src/shared/ui/DropdownMenu.test.tsx`, `src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-header/ui/LanguageSelect.tsx`, `src/widgets/app-header/ui/UserMenu.tsx` and `src/widgets/app-header/ui/ThemeSelect.tsx` (FSD layer `widgets`, slice `app-header`) with their tests, `src/app/shell/AppShell.tsx` (FSD layer `app`), `src/app/styles/globals.css` (FSD layer `app`; one theme-scoped variant declaration, no token added or changed) and `src/app/styles/theme-tokens.test.ts` (the documented contrast pairs this change introduces).
- **Dependencies:** none added, removed or upgraded. The menu reuses the Radix dropdown menu `add-app-shell` already pulled and the `Globe` and `ChevronDown` icons already present in the installed `lucide-react`.
- **API:** no endpoint is consumed beyond what the header already reads through the session contract. `data.name` and `data.surname` of `GET /user` keep filling the initials, the visible name and the accessible name. No generated type is edited.
- **Existing behavior:** `base-controls`, `form-fields` and `theming` requirements are unchanged. The shared dropdown menu keeps its current rendering as its default; the header menus opt into the new nav treatment through it.
