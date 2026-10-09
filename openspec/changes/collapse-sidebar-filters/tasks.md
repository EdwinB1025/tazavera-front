# Tasks

## 1. Sidebar entry sub-section (app-shell)

- [ ] 1.1 Test first. New `src/shared/ui/SidebarMenuSub.test.tsx`: "Closed by default" (inside `SidebarProvider`, the toggle named by its title reports `aria-expanded="false"`) and "Opens on its toggle" (after a click it reports `aria-expanded="true"`). In `src/widgets/app-sidebar/ui/AppSidebar.test.tsx`, one test: with `listEntry` and `subsection`, the navigation holds the entry link marked `aria-current="page"` and the sub-section toggle inside the entry's list item. No `qa/` test changes.

  Verify: `npx vitest related src/shared/ui/SidebarMenuSub.test.tsx src/widgets/app-sidebar/ui/AppSidebar.test.tsx --run`. Expected: only the new tests fail (and typecheck errors only for the missing module and props).

- [ ] 1.2 `SidebarProvider` holds `subsectionOpen` / `setSubsectionOpen` (closed on arrival). New `src/shared/ui/SidebarMenuSub.tsx`: `SidebarMenuSub` (a controlled `Collapsible` on that state, header with the sidebar entry hover classes, body below, indented; closes on unmount) and `SidebarSubsectionProvider` / `SidebarSubsectionOutlet` (the outlet renders the sub-section a parent provides). `AppSidebar` takes `listEntry` and `subsection`: nested under the list entry; on a management route with role entries, provided to the outlet that `EvaluationsSidebarEntry` renders under its current entry; otherwise standalone above `children`.

  Verify: `npx vitest related` on the changed files, `npx tsc --noEmit`, `npm run lint`. Expected: all pass.

## 2. Sidebar facets sub-section (filtering)

- [ ] 2.1 Test first. In `src/shared/ui/FiltersTrigger.test.tsx`: "Facets open from the toolbar" (from `md` with the sidebar open and the sub-section closed the trigger shows and, activated, opens the sub-section; below `md` it opens the sidebar and the sub-section); update "renders from md only while the sidebar is collapsed" to the new visibility rule. In `src/pages/coffeeshops/ui/CoffeeshopsSidebarScreen.test.tsx`, "Filters keep applying while collapsed" (the "Filters" toggle reports collapsed under the "Explore coffee shops" entry, and the name facet still holds the URL value) and update its "no navigation" assertion. In `src/pages/offerings-sidebar/ui/OfferingsSidebarScreen.test.tsx`, update the "no navigation" assertion to the "Explore offerings" entry. No `qa/` test changes.

  Verify: `npx vitest related` on those test files. Expected: only the new and updated assertions fail.

- [ ] 2.2 `FiltersTrigger` opens the sidebar and the sub-section, shows from `md` while the sidebar is collapsed or the sub-section closed, and reports both in `aria-expanded`. The sidebar screens pass their facets as `subsection` titled with `filters.title`: offerings and coffee shops with their `listEntry` (`shell.exploreOfferings`, `shell.exploreCoffeeshops`), my evaluations nested in the role entry, public evaluations and the coffee shop Offerings tab standalone.

  Verify: `npx vitest related` on the changed files, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
