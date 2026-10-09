Type: Refactor (fast lane)

# Proposal

## Why

The accessibility audit of the technical review (§3.1 row R32) found only axe best-practice findings: four `<nav>` landmarks without a name (`landmark-unique`), card headings that jump from the page's `h1` to an `h3` (`heading-order`), evaluation routes whose signed-out view and "My evaluations" list have no `h1` (`page-has-heading-one`), and a `treeitem` without `aria-selected` in the flavor wheel note list (lint `jsx-a11y/role-has-required-aria-props`). Backlog R17 adds that the result count of a filtered list is not announced while the small-viewport sidebar overlay is open, because the overlay hides everything behind it from assistive technology. Product owner approved both on 2026-10-08, fast lane although it adds catalog texts. Fixing them raises Usability from B to A.

## What Changes

- Every `<nav>` carries an accessible name from the catalog of the active locale, passed in as a prop like every other text: the header's primary navigation, the sidebar's management navigation, and the registration links of the entry page hero and of the About us page. Four new catalog keys in es, en and ca (design.md D1).
- Headings follow the page outline, keeping their type classes: the offering card, the coffee shop card and the map's location panel title go from `h3` to `h2`; the "My evaluations" list heading goes from `h2` to `h1` and its row headings from `h3` to `h2` (design.md D2).
- The signed-out view of the evaluation routes renders its existing access message as the page's `h1`, with the same type classes (design.md D3).
- The active row of the flavor wheel note list is exposed with `aria-selected="true"`, every other row with `aria-selected="false"` (design.md D4).
- The small-viewport sidebar overlay carries a polite status region that repeats the result count of the list behind it, so the count is announced while the overlay is open (design.md D5).
- Nothing a sighted user sees changes: same texts, sizes, colours and positions. The requests sent to the API do not change.

## Non-goals

- No change to the layout, the landmarks' positions (the sidebar `aside` stays inside `main`) or any other axe best-practice rule than the four above.
- No change to headings that already follow the outline (account, location management, evaluation sheet, offering detail).
- No new tests; no QA test is edited.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: every navigation landmark is named; the result count is announced inside the sidebar overlay.
- `content-structure`: headings follow the page outline and every page has one level-1 heading.
- `evaluations`: the "My evaluations" row heading is level 2 and the list heading level 1; the signed-out view of the evaluation routes has a level-1 heading.
- `feedback`: the flavor wheel note list exposes its active row as selected.

## Impact

- Code: `messages/{es,en,ca}/shell.json`, `messages/{es,en,ca}/landing.json`, `src/app/shell/AppShell.tsx`, `src/app/shell/SessionShell.tsx`, `src/widgets/app-header/ui/PrimaryNav.tsx`, `src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-sidebar/ui/AppSidebarContext.tsx`, `src/widgets/app-sidebar/ui/AppSidebar.tsx`, `src/pages/home/ui/HomeHero.tsx`, `src/pages/home/ui/HomeScreen.tsx`, `src/pages/about/ui/AboutContent.tsx` and its screen, `src/shared/ui/ResultStatus.tsx` (new), `src/shared/ui/Sidebar.tsx`, `src/shared/ui/index.ts`, `src/widgets/offering-list/ui/OfferingList.tsx`, `src/widgets/coffeeshop-list/ui/CoffeeshopList.tsx`, `src/widgets/public-evaluation-list/ui/EvaluationListPresentation.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/entities/offering/ui/OfferingCard.tsx`, `src/entities/coffeeshop/ui/CoffeeshopCard.tsx`, `src/shared/ui/LocationsMap.tsx`, `src/widgets/evaluation-row/ui/SpecialistEvaluationRowCard.tsx`, `src/shared/ui/SignedOutPrompt.tsx`, `src/features/manage-evaluations/ui/EvaluationsAccess.tsx`, `src/shared/ui/FlavorWheelNoteList.tsx`.
- Protecting tests: the header, sidebar, home, about, card, list, map, gate and flavor wheel tests that `vitest related` selects, and the catalog guard.
- Tests whose queries change (design.md D6): only queries that target a heading level this change moves; no assertion's expected value changes.
- Stale QA copies: QA tests that query the old heading levels fail and are not edited; they are listed in the final report.
- APIs, dependencies: none.

## Propose status

- **Change-id:** label-landmarks-and-headings
- **Date:** 2026-10-08
- **`openspec validate label-landmarks-and-headings --strict`:** valid
- **Backlog entries resolved:** R32 — Label the landmarks and fix the heading order; R17 — Result count not announced while the facets overlay is open.
- **Resolved:** the navigation names and their catalog keys (D1), the heading levels (D2), the signed-out `h1` (D3), the note list selection (D4), the overlay announcement mechanism (D5), and which test queries change (D6). The new name props are optional so the existing test fixtures stay valid (D1).
- **Open:** none.
