# Design — refine-header-aut

Source: backlog R60 (production AUT finding 28) and R53 (finding 21), with the decisions of Product owner and the design lead given in the session prompt. No API endpoint is consumed or changed; no API error is presented.

## D1 — ThemeToggle replaces ThemeSelect (R60)

`src/widgets/app-header/ui/ThemeToggle.tsx` (widgets) is a native `<button type="button">`. It is not the shared `Button`: like the `NavigationMenu` trigger, it is a ghost control of the header. Classes: `flex size-10 items-center justify-center rounded-field text-nav-text hover:text-nav-text-hover focus-visible:focus-ring`, with no breakpoint gating. Activating it calls `setTheme(next)` from `@/shared/lib/theme`, which is unchanged: it writes the cookie and sets `data-theme`. The button then swaps its icon and its name.

The icon shows the CURRENT theme (Product owner): `Sun` in traditional, `Moon` in dark, `aria-hidden`, `size-6`. Both icons are added to the icon entry point `src/shared/ui/icons.ts` from `lucide-react`.

`ThemeSelect.tsx` and its test are deleted. The test's scenarios move to `ThemeToggle.test.tsx`. The user menu drops the select and its wrapper and keeps the separator after the security entry. The widget's public index exports `ThemeToggle` in place of `ThemeSelect`.

Header right group: language selector, then theme toggle, then "Sign in" or the user control. The gap is `gap-2 md:gap-4` (Product owner: no overflow at 375px).

Contrast (design lead): `nav-text`/`nav-surface` 6.32 (traditional) and 11.22 (dark). `nav-text-hover`/`nav-surface` 6.13 and 5.78. Focus ring 6.13 and 11.22. All pairs are already registered in the contrast matrix, so no new token is needed.

## D2 — Accessible name carries the state; no `aria-pressed`

Closed by the orchestrator for Product owner's review. The WAI-ARIA APG says a toggle button's label must not change with its state. Here the name changes with the theme, so the button is a plain button and carries no `aria-pressed`. Catalog `shell` texts:

| Key | es | en | ca |
|---|---|---|---|
| `themeToggleToDark` | Tema actual: tradicional. Cambiar al tema oscuro | Current theme: traditional. Switch to dark theme | Tema actual: tradicional. Canviar al tema fosc |
| `themeToggleToTraditional` | Tema actual: oscuro. Cambiar al tema tradicional | Current theme: dark. Switch to traditional theme | Tema actual: fosc. Canviar al tema tradicional |

`themeSelector` leaves the three catalogs, `UserMenuTexts` and `AppHeaderTexts`. `AppHeaderTexts` gains `themeToggleToDark` and `themeToggleToTraditional`, and the toggle receives both as texts.

## D3 — Initial theme from the server, no flash

`app/layout.tsx` already resolves `readTheme(cookie header)` for `data-theme`. A root layout cannot pass props to a nested layout, so `app/[locale]/layout.tsx` resolves the theme the same way: `readTheme((await headers()).get("cookie"))`, which is Next's async `headers()`. It passes the result to `AppShell` as `theme`. The prop then travels `AppShell` → `SessionShell` → `ShellChrome` → `AppHeader` → `ThemeToggle` (`initialTheme`).

The toggle holds the theme in state, seeded from that prop. The first server render therefore already shows the right icon and name, with no effect and no flash. The `theme` prop is optional on `AppShell`, `SessionShell`, `ShellChrome` and `AppHeader` and defaults to `"traditional"`, the same fallback as `readTheme`. That way the existing renders without the prop keep working. Since the root layout already reads `headers()`, the routes are dynamic already and nothing changes in rendering mode.

## D4 — Spec text

The theme requirement becomes a header switch, with the scenarios "Switching the theme", "Switch is named", "Switch icon" and "Switch presentation". The reload, no-choice and unusable-cookie scenarios stay; they are covered by `src/shared/lib/theme.test.ts`. The header menu requirement drops its theme-selector sentence and the scenario "Theme selector inside the menu".

OpenSpec 1.13.2 refuses a MODIFIED requirement that drops a current scenario, and refuses ADDED and REMOVED under the same name. Each of the two requirements is therefore REMOVED and ADDED again under a new name: "Theme selection" becomes "Theme switch", and "Header menu presentation" becomes "Header menu surface". The text is the one Product owner settled; only the header names change.

## D4b — The QA test of the deleted ThemeSelect

`qa/src/widgets/app-header/ui/ThemeSelect.test.tsx` imports the deleted `ThemeSelect`. No agent may delete or rewrite a QA test, and there is no new location for code that no longer exists. The file is therefore excluded from `vitest.qa.config.mts` and `tsconfig.json`, the way the earlier stale QA tests were. This is flagged for Product owner's reduction plan.

## D5 — "Explore offerings" for the specialist (R53)

The entry is for the specialist only and has no icon. It points at `/{locale}/offerings` with no query. Its text is the catalog `shell` key `exploreOfferings`: es "Explorar ofertas", en "Explore offerings", ca "Explorar ofertes". Its accessible name is its visible text.

- **User menu** (`UserMenu.tsx`): right after "Manage evaluations", with no separator, before "Sign out". It renders the same way as the management entry: a `DropdownMenuItem` over the shared `Link`.
- **Sidebar** (`src/features/manage-evaluations/ui/EvaluationsSidebarEntry.tsx`): a second `SidebarMenuItem` in the same `SidebarMenu`, after the evaluations entry, with the existing spacing. It is never marked current, so it gets no `isActive` and no `aria-current`. `SidebarEntryTexts` gains `explore`. `SessionShell` passes `texts.exploreOfferings`.
- `AppHeaderTexts` and `UserMenuTexts` gain `exploreOfferings`. The sidebar entry keeps rendering `manageEvaluations`; it is not renamed.

## Files

| File | Layer | Change |
|---|---|---|
| `app/[locale]/layout.tsx` | routing | resolves the theme and passes it to `AppShell` |
| `src/app/shell/AppShell.tsx`, `SessionShell.tsx`, `ShellChrome.tsx` | app | `theme` prop; texts for the toggle and `exploreOfferings` |
| `src/widgets/app-header/ui/ThemeToggle.tsx` | widgets | new |
| `src/widgets/app-header/ui/ThemeSelect.tsx` (+ test) | widgets | deleted |
| `src/widgets/app-header/ui/AppHeader.tsx`, `UserMenu.tsx`, `index.ts` | widgets | toggle in the right group; menu without the selector; explore entry |
| `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.tsx` | features | second entry |
| `src/shared/ui/icons.ts` | shared | `Sun`, `Moon` |
| `messages/{es,en,ca}/shell.json` | — | add the toggle texts and `exploreOfferings`; remove `themeSelector` |
| `vitest.qa.config.mts`, `tsconfig.json` | config | exclude the stale QA ThemeSelect test (D4b) |
