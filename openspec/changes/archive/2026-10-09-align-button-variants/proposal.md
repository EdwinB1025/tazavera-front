Type: Refactor (fast lane)

## Why

Product owner's AUT decision (2026-10-09, maximum priority): `Button` has five variants — `primary` and the four semantic action variants `action-1` to `action-4` — but no global rule assigns them, so different kinds of action look the same (`action-3` serves View, Back, Close evaluation and pagination; Close evaluation is `primary` in the evaluation form) and the same kind looks different (Add location and Add contact details are `primary` while Evaluate is `action-1`). This change applies the variant rule by Product owner's decision; Product owner typed it as fast lane.

## What Changes

- One rule for the whole application, by kind of action:

  | Variant | Kind of action | Examples |
  |---|---|---|
  | `primary` | The main action of a form or dialog | Save, Confirm, Sign in, Create offering, Register |
  | `action-1` | Create or start something | Evaluate, New offering, Add location, Add contact |
  | `action-2` | Destructive or irreversible | Delete, Deactivate, Delete account, Close evaluation |
  | `action-3` | Navigate or consult | View, View evaluations, View offerings, Show on map, Back, pagination |
  | `action-4` | Secondary or in-page edit | Cancel, Edit, Edit profile, Change password, Done |

  Where an action fits two rows, the more specific wins: destructive > main form action > create > edit/cancel > navigate.
- Every control whose variant differs from its kind takes the variant of its kind (list in `## Propose status`). Sizes, icons, texts, order and behaviour do not change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: ADDED "Action variants by kind" (the rule, one scenario per row).
- `landing`: "Entry page hero" and "About us page" no longer call the explore actions "primary" (they navigate, so they take `action-3`).
- Screens of `feedback`, `content-structure`, `offering-catalog`, `offering-management`, `user-account` and `evaluations` change variants only; none of their requirements names a variant, so their specs are unchanged.

## Non-goals

- No new token, variant, text, prop or dependency.
- The header's `nav-button` controls (Sign in, sidebar toggle) keep their navigation treatment, which `base-controls` "Action button treatments" defines for the header.
- Controls whose kind the rule does not settle keep their variant until Product owner decides (see Open in `## Propose status`).
- No other backlog entry is folded in.

## Impact

- Modified: `src/shared/ui/ConfirmDialog.tsx`, `src/shared/ui/Pagination.tsx`, `src/shared/ui/LocationsMap.tsx`, `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx`, `src/widgets/offering-detail/ui/DetailHeader.tsx`, `src/features/location-management/ui/LocationsPanelStates.tsx`, `src/features/user-account/ui/ContactSectionStates.tsx`, `src/pages/evaluation-form/ui/FormActions.tsx`, `src/pages/evaluations-list/ui/CloseEvaluationAction.tsx`, `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`, `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx`, `src/pages/home/ui/ExploreButton.tsx`, `src/pages/about/ui/ExploreButton.tsx`.
- Tests updated (they assert a variant class that changes): `src/shared/ui/ConfirmDialog.test.tsx` (confirm action), `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx` (Edit, Close evaluation). Assertions added to existing tests for the `base-controls` scenarios: `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx` (View), `src/features/user-account/ui/ContactSection.test.tsx` (Add contact details). No test file is added.
- QA suite: `qa/src/features/user-account/ui/ContactSection.test.tsx` asserts the old `primary` add button and is kept out of `vitest.qa.config.mts`; `qa/src/pages/evaluation-form/ui/FormActions.test.tsx` (old Save draft and Close variants) is already excluded.

## Propose status

- Change-id: `align-button-variants`
- Date: 2026-10-09
- `openspec validate align-button-variants --strict`: valid
- Resolves backlog entry: none (Product owner's AUT decision passed directly).
- Resolved (Product owner, 2026-10-09): the variant rule and its precedence. Controls that change (control — file — old → new):
  - Confirmation dialog confirm (Delete, Deactivate, Delete account; feedback "Confirmation dialog" calls it the destructive action) — `src/shared/ui/ConfirmDialog.tsx` — `primary` → `action-2`
  - Pagination Previous and Next — `src/shared/ui/Pagination.tsx` — `primary` → `action-3`
  - Map Zoom in and Zoom out — `src/shared/ui/LocationsMap.tsx` — `action-4` → `action-3`
  - Coffee shop map "Back to list" — `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx` — `primary` → `action-3`
  - Offering detail "Evaluate" — `src/widgets/offering-detail/ui/DetailHeader.tsx` — `action-3` → `action-1`
  - "Add location" — `src/features/location-management/ui/LocationsPanelStates.tsx` (`AddLocationButton`) — `primary` → `action-1`
  - "Add contact details" — `src/features/user-account/ui/ContactSectionStates.tsx` — `primary` → `action-1`
  - Evaluation form "Save draft" — `src/pages/evaluation-form/ui/FormActions.tsx` — `action-3` → `primary`
  - Evaluation form "Close evaluation" — `src/pages/evaluation-form/ui/FormActions.tsx` — `primary` → `action-2`
  - My evaluations row "Close evaluation" — `src/pages/evaluations-list/ui/CloseEvaluationAction.tsx` — `action-3` → `action-2`
  - My evaluations row "Edit" (open row) — `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx` — `action-3` → `action-4` ("View" on a closed row stays `action-3`)
  - Public evaluations row "View offering" — `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx` — `action-4` → `action-3`
  - Entry page hero explore action — `src/pages/home/ui/ExploreButton.tsx` — `primary` (default) → `action-3`
  - About page closing explore action — `src/pages/about/ui/ExploreButton.tsx` — `primary` (default) → `action-3`
- Already matching the rule (unchanged): confirmation dialog Cancel (`action-4`), step-up "Confirm identity" actions (`primary`), signed-out "Sign in" and register success "Sign in" (`primary`), form submits Save / Register / Create offering (`primary`), form Cancel buttons and links (`action-4`), Edit profile, Change password, Done (`action-4`), Delete and Deactivate triggers, bulk delete (`action-2`), Evaluate on offering cards (`action-1`), View, View evaluations, View offerings, Show on map, Back buttons and page numbers (`action-3`), the map panel's close button (`action-4`, closes like Cancel).
- Open (kept unchanged, Product owner to decide):
  1. Retry actions ("Try again") fit no row and differ today: `primary` in `src/shared/ui/RetryButton.tsx`, `src/pages/evaluation-form/ui/LoadFailure.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/pages/manage-offerings/ui/OwnOfferingsBody.tsx`, `src/features/offering-management/ui/LocationsFieldset.tsx`; `action-4` in `src/features/location-management/ui/LocationsPanelStates.tsx` and `src/features/user-account/ui/ContactSectionStates.tsx`. Which variant?
  2. The sidebar's "Filters" trigger (`src/shared/ui/FiltersTrigger.tsx`) and "Clear filters" (`src/shared/ui/ClearFiltersButton.tsx`) are `primary` and fit no row clearly (open a panel; reset the query). Which variant?
