No derived API types are needed: the change reads only `data.role`, already typed.

## 1. Manage locations in the user menu (app-shell)

- [x] 1.1 Test in `src/widgets/app-header/ui/AppHeader.test.tsx` for "Manage locations entry for a coffeeshop": with a `coffeeshop` session, the menu item named `TEXTS.manageLocations` points at `/es/manage/locations` and comes right after the "Manage offerings" item. Add `manageLocations` to the file's texts fixture. No existing assertion changes. Verify: the new test fails only because the entry is missing (and a typecheck error for the missing `manageLocations` text type is allowed); the rest of the file passes; lint is clean.
- [x] 1.2 Implement design.md D1–D2: `UserMenu.tsx` (the entry with `MapPin`, `coffeeshop` only, after "Manage offerings"), `AppHeader.tsx` (texts type), `AppShell.tsx` (passes the text), `messages/{es,en,ca}/shell.json` (`manageLocations`). Verify: `npx vitest related` on the changed files passes, 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [x] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/qa`; no typecheck or lint errors; the build succeeds.
