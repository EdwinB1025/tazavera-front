# Tasks

## 1. Measure before

- [x] 1.1 On `origin/develop`, measure every list route with both methods of design.md "Measurement plan" (including, for `/en/offerings` and `/en/coffeeshops/{ulid}`, the sum after opening the "Filters" sub-section). No file changes; the table goes in the body of the commit of task 2.1. Expected: the numbers are within 3 KB gz of the review's §1.4 for the routes it measured, and a cmdk chunk is listed for `/[locale]/offerings` and `/[locale]/coffeeshops/[ulid]`.

## 2. Load the facet comboboxes on the first opening

- [x] 2.1 Tests first:
  - New `src/shared/ui/ComboboxLoader.test.tsx`, one test for the scenario "First opening while the comboboxes load": the `./Combobox` module is mocked with a factory that records that it was imported and never resolves; a `ComboboxLoader` rendered inside `SidebarProvider` and `SidebarMenuSub` (title "Filters") does not import the module before the toggle is activated, and after activating the toggle the module has been imported and a `role="status"` with the text "Loading…" is shown in the combobox's place. It must fail while `ComboboxLoader` does not exist or loads the module before the opening, and pass once D1–D2 are implemented.
  - In `src/features/offering-facets/ui/OfferingFacets.test.tsx`, one new test for the scenario "Facets after loading": the panel rendered inside `SidebarProvider` and `SidebarMenuSub` (texts with `loading: "Loading…"`) shows no Coffee combobox before the "Filters" toggle is activated; after activating it, it shows the Coffee, Producer and Roastery comboboxes (awaited), no "Loading…" text remains (the combobox's own option count is also a `role="status"`, so the text is asserted), and the Coffee combobox precedes the Verification radio group and the Producer combobox follows the Variety radio group. It must fail while the panel renders no loader, and pass after task 2.2.
  - In the same file, the existing tests "shows the eleven facets in the spec order", "writes the chosen coffee's name to coffeeName without page" and "disables the five coffee-based facets with Options unavailable when the coffees fail" first await the Coffee combobox (`findByRole`) before their existing queries, since the comboboxes now load asynchronously outside a sub-section. Their assertions stay unchanged.
  - Commit `test(filtering): …`. Expected: the new tests fail only on the missing `ComboboxLoader` module or export (typecheck errors limited to it); every other test passes.
- [x] 2.2 Implement design.md D1–D3: `ComboboxLoader` and its export, `SubsectionOpenedContext` in `SidebarMenuSub`, `ComboboxLoader` in the three combobox places of `OfferingFacets`, and `FilteredOfferingsFacets` adding the `account` catalog's `loading` to the texts it passes (D3). Expected: `npx vitest related` on the changed files passes (the tests of task 2.1 included), `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Measure after and check in a browser

- [x] 3.1 After task 2.2, measure again with both methods and the same routes as task 1.1, and on `next start` check in Chromium, for `/en/offerings`, `/en/evaluations`, `/en/coffeeshops` and `/en/coffeeshops/{ulid}`, that opening the filters panel shows the facets (on the offering-facet routes, the comboboxes appear after the loading status) with no console error and no CSP violation. No file changes; the before/after table goes in the final report. Expected: no cmdk chunk in the first load of any route; the offering-facet routes load less JavaScript before the first opening than in task 1.1.

## 4. Full checks

- [x] 4.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; `test:qa` fails only on files that also fail on `origin/develop`; typecheck and lint report no errors; the build succeeds.
