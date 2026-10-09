Type: Refactor (fast lane)

# Proposal

## Why

Two production AUT findings of 2026-10-08 call for header changes. Product owner typed them for the fast lane, and by Product owner's decision they change settled behaviour (backlog R60 and R53):

- Finding 28 (R60): the only theme control is a native select inside the signed-in user menu. Anonymous visitors cannot switch theme although "Theme selection" says the choice needs no sign in, and the select shows the raw, untranslated theme value with no visible label.
- Finding 21 (R53): a specialist has no direct route to the full offerings list (`/{locale}/offerings` with no query). "Top rated" opens the verified offerings only.

## What Changes

- **Theme switch in the header (R60).** An icon button sits next to the language selector, for every visitor and on every viewport. It toggles between the traditional and the dark theme and keeps the choice in the browser cookie, as today. Its icon shows the current theme (sun in traditional, moon in dark). Its accessible name states the current theme and the target theme, in es/en/ca. The header's first render already shows the right icon and name, from the theme the server resolves from the cookie. The theme selector leaves the user menu, and the `themeSelector` text leaves the catalogs.
- **"Explore offerings" for the specialist (R53).** A specialist gets an "Explore offerings" entry pointing at `/{locale}/offerings` with no query. It sits in the user menu right after "Manage evaluations" and in the management sidebar right after "My evaluations", and is never marked as the current page. New catalog text `exploreOfferings` (es/en/ca).
- The right group of the header becomes language selector, theme switch, session control, with a tighter gap below `md` so it does not overflow at 375px.

## Non-goals

- No change to how the theme is stored or applied (`shared/lib/theme`, cookie, `data-theme` on `<html>`), and no new theme token.
- No "Explore offerings" entry for the coffee-shop role or any role other than specialist.
- No rename of the specialist sidebar entry's text (the spec says "My evaluations"; the code keeps rendering `manageEvaluations`).
- No change to the QA suite (`qa/`), and no API or contract change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: header grouping and signed-out/signed-in header content gain the theme switch. "Theme selection" moves from a menu selector to a header icon switch. The user menu loses the theme selector and, for a specialist, gains "Explore offerings". "Header menu presentation" drops the theme selector clause.
- `evaluations`: the management sidebar entry adds "Explore offerings" after "My evaluations".

## Impact

- Code: `src/widgets/app-header/ui/ThemeToggle.tsx` (new), `src/widgets/app-header/ui/ThemeSelect.tsx` (deleted), `src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-header/ui/UserMenu.tsx`, `src/widgets/app-header/index.ts`, `src/shared/ui/icons.ts`, `src/app/shell/AppShell.tsx`, `src/app/shell/SessionShell.tsx`, `src/app/shell/ShellChrome.tsx`, `app/[locale]/layout.tsx`, `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.tsx`, `messages/{es,en,ca}/shell.json`.
- Tests: `src/widgets/app-header/ui/ThemeToggle.test.tsx` (new; takes over the scenarios of the deleted `ThemeSelect.test.tsx`), `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/app/shell/AppShell.test.tsx`, `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.test.tsx`. `qa/src/widgets/app-header/ui/ThemeSelect.test.tsx` imports the deleted component and is excluded from the QA run and the typecheck (design.md D4b). `qa/src/widgets/app-header/ui/AppHeader.test.tsx` still sets `themeSelector`. It is already excluded from `test:qa` and from `tsconfig.json`, so it stays untouched.
- APIs, dependencies: none (`Sun` and `Moon` come from the installed `lucide-react`).

## Propose status

- **Change-id:** refine-header-aut
- **Date:** 2026-10-08
- **`openspec validate refine-header-aut --strict`:** valid
- **Backlog entries resolved:** R60 (theme switch in the header for every visitor) and R53 ("Explore offerings" entry for the specialist)
- **Resolved:**
  - Toggle or menu → an icon toggle button (Product owner). The icon shows the current theme, sun/moon (Product owner). ThemeSelect leaves the user menu, and its scenario is removed (design lead).
  - Contrast → the existing `nav-text`/`nav-text-hover`/focus-ring pairs on `nav-surface` (design lead), with no new token.
  - The pressed state → no `aria-pressed`: the name carries the state (design.md D2, closed by the orchestrator for Product owner's review).
  - First render → the server-resolved theme reaches the header as a prop (design.md D3).
  - Explore entry → specialist only, with no icon. In the menu it goes right after "Manage evaluations"; in the sidebar it goes second (design.md D5).
  - Spec names → "Theme selection" becomes "Theme switch", and "Header menu presentation" becomes "Header menu surface". Both are REMOVED and ADDED again, because the OpenSpec CLI cannot drop scenarios through MODIFIED (design.md D4).
- **Open:** Product owner's review of D2 (no `aria-pressed`). Also the stale QA test `qa/src/widgets/app-header/ui/ThemeSelect.test.tsx`: it is excluded in config, and its removal is left to Product owner's reduction plan (design.md D4b).
