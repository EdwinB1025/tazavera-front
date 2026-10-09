No derived API types are needed: the change only moves the panel's title.

## 1. Title shown once in the sidebar (filtering)

- [x] 1.1 Update `src/pages/coffeeshops/ui/CoffeeshopsSidebarScreen.test.tsx` ("renders the sidebar with the list's entry holding the coffee shop facets") for the scenario "Title shown once in the sidebar": besides the search region named "Filtros", the sidebar has no heading named "Filtros". Verify: the new assertion fails on the current panel; the other tests of the file pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [x] 1.2 Implement design.md D1 in `src/shared/ui/Collapsible.tsx`, `src/shared/ui/SidebarMenuSub.tsx` and `src/shared/ui/FacetPanel.tsx`. Protecting tests: `src/shared/ui/FacetPanel.test.tsx`, `src/shared/ui/SidebarMenuSub.test.tsx`, the Collapsible tests. Verify: `npx vitest related` on the changed files passes, the test of 1.1 included; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [x] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: every validation test passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds. Any QA test that fails on the removed heading is reported to Product owner, not edited.
