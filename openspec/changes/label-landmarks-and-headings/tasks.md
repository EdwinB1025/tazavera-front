# Tasks

No test is added and no assertion's expected value changes. The only test edits allowed are the heading-level swaps in queries listed in design.md D6 (and any other query whose target heading level this change moves, reported in the final report). QA tests are never edited; a QA copy that fails because it targets an old heading level is listed in the final report.

## 1. Name every navigation landmark (app-shell)

- [x] 1.1 Shell: add `primaryNavigation` (es "Principal", en "Main", ca "Principal") and `sidebarNavigation` (es "Gestión", en "Management", ca "Gestió") to `messages/{es,en,ca}/shell.json`; add the optional `primaryNavigation` text to `PrimaryNavTexts` / `AppHeaderTexts` and render it as the header `nav`'s `aria-label`; add an optional `navigationLabel` to `AppSidebarContextValue` and render it as the sidebar `nav`'s `aria-label`; `AppShell` and `SessionShell` pass both from the catalog (design.md D1). Protecting tests: the header, sidebar, shell and catalog guard tests. Expected: `npx vitest related` on the changed files passes, `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 1.2 Landing: add `heroRegisterNavigation` and `aboutRegisterNavigation` (es "Registro", en "Registration", ca "Registre") to `messages/{es,en,ca}/landing.json`; add an optional `registerNavigation` text to `HomeHeroTexts` and `AboutContentTexts`, rendered as the registration `nav`'s `aria-label`, and pass it from `HomeScreen` and the About us screen (design.md D1). Protecting tests: `HomeHero.test`, `HomeScreen.test`, `AboutContent.test`, the About us screen test and the catalog guard. Expected: as 1.1.

## 2. Announce the result count inside the sidebar overlay (app-shell)

- [ ] 2.1 Shared: add `src/shared/ui/ResultStatus.tsx` with `SidebarAnnouncementProvider`, `ResultStatus` and `OverlayStatus` (design.md D5); `SidebarProvider` renders the provider, `Sidebar` renders `OverlayStatus` inside the small-viewport sheet, and `src/shared/ui/index.ts` exports `ResultStatus`. `OfferingList`, `CoffeeshopList`, `EvaluationListPresentation` and `EvaluationsList` render `ResultStatus` in place of their status `div`, with the same text in the same states. Protecting tests: `Sidebar.test`, the four lists' tests and their callers' tests, the client-boundary guard. Expected: as 1.1.

## 3. Card and panel headings follow the outline (content-structure)

- [ ] 3.1 Entities and shared: `OfferingCard`, `CoffeeshopCard` and the `LocationsMap` panel title go from `h3` to `h2`, keeping their classes (design.md D2). Update the queries listed in design.md D6 for `CoffeeshopCard.test.tsx` and `ManageOfferingsPanel.test.tsx` (`level: 3` → `level: 2`). Expected: as 1.1.

## 4. Evaluation route headings (evaluations)

- [ ] 4.1 `EvaluationsList` heading `h2` → `h1`, `SpecialistEvaluationRowCard` title `h3` → `h2` (design.md D2); `SignedOutPrompt` gets the optional `messageAs` prop and `EvaluationsAccess` passes `"h1"` (design.md D3). Update the queries listed in design.md D6 for `EvaluationsList.test.tsx` and `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`. Expected: as 1.1.

## 5. Selected row of the note list (feedback)

- [ ] 5.1 `FlavorWheelNoteList`: each `treeitem` carries `aria-selected`, `true` for the active note's row and `false` otherwise (design.md D4). Expected: as 1.1, and `npm run lint` no longer reports `jsx-a11y/role-has-required-aria-props` for the file.

## 6. Full checks

- [ ] 6.1 Run, each on its own, `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; `test:qa` fails only on the 9 stale QA copies from `refine-offering-facets-aut` (its design D6) and the QA copies that target the old heading levels (listed in the final report); the typecheck and lint report no errors; the build succeeds.
