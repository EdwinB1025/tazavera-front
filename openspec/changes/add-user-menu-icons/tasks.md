No derived API types are needed: the change only touches header menu markup and icon exports.

## 1. User menu icons and header look (app-shell)

- [x] 1.1 Add to `src/widgets/app-header/ui/AppHeader.test.tsx` (describe "UserMenu") one test for the scenario "Menu entries carry icons and the header look": for a specialist, every menu item contains an `svg` with `aria-hidden="true"` before its text, its classes include `hover:text-nav-text-hover` and `type-navlist-item`, and include neither `underline` nor `text-text-link`. Verify: the test fails on the current menu (no icons, link classes); the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 and D2 in `src/widgets/app-header/ui/UserMenu.tsx`, adding the needed exports to `src/shared/ui/icons.ts`. Protecting tests: `src/widgets/app-header/ui/AppHeader.test.tsx`, `src/shared/ui/icons.test.ts`. Verify: `npx vitest related` on the changed files passes, the test of 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Navigation menu icons and header look (app-shell)

- [x] 2.1 Add to `src/widgets/app-header/ui/AppHeader.test.tsx` (describe "NavigationMenu") one test for the scenario "Navigation menu entries carry icons and the header look", with the same assertions as 1.1 over the navigation menu's items. Verify: the test fails on the current menu; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 2.2 Implement design.md D1–D3 in `src/widgets/app-header/lib/nav-entries.ts` and `src/widgets/app-header/ui/NavigationMenu.tsx`, adding the needed exports to `src/shared/ui/icons.ts`. Protecting tests: `src/widgets/app-header/ui/AppHeader.test.tsx`. Verify: `npx vitest related` on the changed files passes, the test of 2.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds. Any QA test that fails on the new markup is reported to Product owner, not edited.
