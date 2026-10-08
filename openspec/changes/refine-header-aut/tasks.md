# Tasks

## 1. Theme switch in the header (R60, app-shell)

- [ ] 1.1 Tests first. Create `src/widgets/app-header/ui/ThemeToggle.test.tsx`, one test per scenario:
  - "Switching the theme": a click writes `theme=dark` to the cookie and sets `data-theme="dark"`.
  - "Switch is named": the button is named with `themeToggleToDark` in traditional and with `themeToggleToTraditional` after the click, and has no `aria-pressed`.
  - "Switch icon": a sun icon (`lucide-sun`) in traditional and a moon icon (`lucide-moon`) with `initialTheme="dark"`, with no visible text.
  - "Switch presentation": the exact classes of design.md D1.

  Delete `src/widgets/app-header/ui/ThemeSelect.test.tsx`; its scenarios move to the new file. Update the assertions of `src/widgets/app-header/ui/AppHeader.test.tsx`:
  - the TEXTS fixture: `themeSelector` → `themeToggleToDark`, `themeToggleToTraditional`;
  - "mounts the theme selector" → the header shows the theme switch button and the menu has no combobox;
  - the right-group test → language selector, theme switch, "Sign in" in that order, with the group classes `gap-2 md:gap-4`;
  - the small-viewport test → the theme switch is not gated by a breakpoint.

  Update `src/app/shell/AppShell.test.tsx` (~228-235): 2 → 3 buttons besides the navigation menu control. Expected: the new and updated tests fail only because ThemeToggle is missing.
- [ ] 1.2 Implement design.md D1–D3:
  - `ThemeToggle.tsx`, and `Sun`/`Moon` in `src/shared/ui/icons.ts`;
  - the toggle in the AppHeader right group, with `gap-2 md:gap-4`;
  - remove ThemeSelect from `UserMenu.tsx` and delete `ThemeSelect.tsx`;
  - the public index exports ThemeToggle;
  - catalogs es/en/ca: add the two toggle texts, remove `themeSelector`, also from `UserMenuTexts`, `AppHeaderTexts` and `AppShell`;
  - the `theme` prop from `app/[locale]/layout.tsx` through AppShell, SessionShell and ShellChrome to AppHeader;
  - exclude `qa/src/widgets/app-header/ui/ThemeSelect.test.tsx` in `vitest.qa.config.mts` and `tsconfig.json` (D4b).

  Verify: `npx vitest related <changed files> --run` passes, `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. "Explore offerings" for the specialist (R53)

- [ ] 2.1 (app-shell) Tests first in `src/widgets/app-header/ui/AppHeader.test.tsx`:
  - add `exploreOfferings` to TEXTS;
  - "Management entry for a specialist": "Explore offerings" points at `/es/offerings` and directly follows "Manage evaluations" among the menu items;
  - "Menu content": the coffeeshop menu shows no explore entry.

  Expected: the tests fail only because the entry is missing.
- [ ] 2.2 (app-shell) Implement D5 in `UserMenu.tsx`, `AppHeader.tsx` (texts type), `AppShell.tsx` and the catalogs es/en/ca (`exploreOfferings`). Verify as in 1.2.
- [ ] 2.3 (evaluations) Test first in `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.test.tsx`, for "The explore entry": on the list route, the second link of the same list is named with the explore text, points at `/es/offerings` and has no `aria-current`. Update the existing renders to pass the new `explore` text. Expected: the test fails only because the entry is missing.
- [ ] 2.4 (evaluations) Implement D5 in `EvaluationsSidebarEntry.tsx` and `SessionShell.tsx`. Verify as in 1.2.

## 3. Full checks

- [ ] 3.1 Run each on its own: `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: every suite passes, the typecheck and lint report no errors, and the build succeeds.
