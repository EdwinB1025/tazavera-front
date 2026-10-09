Type: Refactor (fast lane)

## Why

Production AUT finding (Product owner, 2026-10-09), maximum priority: a navigation control on the first line of a page header (the back control above the eyebrow and the title) is a link; every other navigation control — in the header but not on its first line, or among the actions at the end of a view, list or card — is an action button (`RouteButton`, variant by the `base-controls` rule "Action variants by kind"). Today `BackLink` renders a button at the top and at the bottom of the detail views, the evaluation view's "View offering" is a link in its header, and Manage offerings has two different links ("New offering", "Create an offering") for one action. Product owner typed this correction for the fast lane; unlike a pure refactor it changes these controls between link and button, by Product owner's decision. Positions, spacing and texts otherwise stay.

## What Changes

- `base-controls`: `BackLink` (`src/shared/ui/BackLink.tsx`) renders the shared `Link` with its `back` variant; a new `BackButton` in the same segment renders today's `RouteButton` (`action-3`, `sm`, `ArrowLeft`). Both take their destination from one shared hook (`use-back-href.ts`: the previous page, or the fallback), so the logic is not copied. The rule becomes a requirement ("Navigation controls by position").
- `offering-catalog`: the offering detail (content, error state and skeleton) and the coffee shop detail (content, error state and skeleton) keep `BackLink` at the top, now a link, and use `BackButton` at the end.
- `evaluations`: the public evaluation view's header (`EvaluationSheetView` and its skeleton, through `ViewScreen`) shows a `BackLink`; its end shows a `BackButton`, passed as a separate prop (`bottomBack`); "View offering" becomes a `RouteButton` (`action-3`, `sm`). The evaluation form header (`EvaluationFormHeader`) shows a `BackLink` with fallback `/{locale}/manage/evaluations`, and the read-only form's end back becomes a `BackButton` with the same fallback, so both keep the same text and destination.
- `user-account`: the Change password view keeps `BackLink`, now a link.
- `offering-management`: the New offering page's header back becomes a `BackLink` with fallback `/{locale}/manage/offerings`. One `NewOfferingButton` (`src/pages/manage-offerings/ui/`) renders a `RouteButton` (`action-1`, `sm`, as the panel's other actions) to `/{locale}/manage/offerings/new` with the text `newOfferingLink`; it replaces the panel header's "New offering" link and the empty list's "Create an offering" link. The `listEmptyCreateLink` key is removed from es, en and ca.
- Links in running text (home, about, the New offering form's status line) and the not-found page's home link stay links.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `base-controls`: "Back link to the previous page"; added "Navigation controls by position".
- `offering-catalog`: "Offering detail page", "Coffee shop detail page".
- `evaluations`: "Evaluation form", "Read-only evaluation view".
- `offering-management`: "Access to the management area", "My offerings list".
- `user-account`: "Change password view".

## Out of Scope (non-goals)

- Any new token, dependency or text; any change of position or spacing; any other control.
- The not-found message inside the detail views (R18) and form field errors (R8), handled by other changes.
- Any `qa/` test.

## Impact

- **Code**: `src/shared/ui/BackLink.tsx`, new `BackButton.tsx` and `use-back-href.ts`, `index.ts`; `src/widgets/offering-detail/ui/OfferingDetailContent.tsx`; `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx`; `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx`; `src/pages/public-evaluation/ui/ViewScreen.tsx`; `src/pages/evaluation-form/ui/EvaluationFormHeader.tsx`, `EvaluationForm.tsx`; `src/pages/new-offering/ui/NewOfferingScreen.tsx`; `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, `OwnOfferingsBody.tsx`, `ManageOfferingsScreen.tsx`, new `NewOfferingButton.tsx`; `messages/{es,en,ca}/offering-management.json`.
- **Tests**: the tests that query these controls by role (header back → `link`; end back, "View offering" and "New offering" → `button` with `router.push`).
- **API**: none. **Dependencies**: none.

## Propose status

- Change-id: `apply-header-link-rule`; date 2026-10-09.
- Source: Product owner's AUT finding (2026-10-09), settled in the session prompt (the rule, items a–d).
- Resolved: the back logic is shared through a hook file in `src/shared/ui` used by `BackLink` and `BackButton`; the evaluation form and New offering headers use `BackLink` as the prompt lists them, with their previous fixed route as fallback, so they now open the previous page when there is one; the read-only evaluation form's end back becomes a `BackButton` with the same fallback, keeping "same text and destination as the header's"; `EvaluationSheetView` takes a second prop `bottomBack`; "New offering" takes size `sm`, as the panel's other actions (the toolbar and card actions).
- Scenario titles: the MODIFIED blocks keep the titles of the "… is a button" / "Back buttons on …" scenarios, because a MODIFIED block may not drop a scenario; their WHEN/THEN now state the link at the top and the button at the end.
- Open (for Product owner): the `user-account` capability is also modified (the Change password view's spec stated a button); the evaluation form and New offering headers' back now follow the previous page instead of a fixed route.
- `openspec validate apply-header-link-rule --strict`: passed.
