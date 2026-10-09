# Design

## Context

See `proposal.md`. Fast-lane correction from backlog entry R63 (production AUT finding 33); the decisions below are Product owner's (2026-10-08) and the design lead's, closed by the orchestrator on the design lead's recommendation. No API endpoint is consumed and no request is added: every bottom back link is the same in-application link as the top one, so no API error presentation applies. No generated type is used or defined; no route file, catalog key or token is added. `base-controls` (`BackLink`, `Link`) is unchanged.

## Decisions

### D1. Offering detail (offering-catalog)

In `OfferingDetailContent.tsx` the success branch renders the existing `backLink` element (`BackLink`, fallback `/{locale}/offerings`, text `texts.backLabel`) a second time, wrapped in a plain `<div>`, as the last child of the `flex flex-col gap-8` page container, after `DetailTabs`: 2rem below the tab panel and outside every tab. The `div` is a block-level flex item that stretches, so the inline-flex link inside it keeps its own width. The error branch is unchanged; the loading state (the route's skeleton) is unchanged.

### D2. Coffee shop detail (offering-catalog)

The same in `CoffeeshopDetailContent.tsx`: the existing `backLink` (fallback `/{locale}/coffeeshops`, text `texts.backToDirectory`) in a plain `<div>` after `CoffeeshopTabs`, as the last child of the `flex flex-col gap-8` container. Error and loading states unchanged.

### D3. Public evaluation (evaluations)

In `EvaluationSheetView.tsx` the success branch's second `PageSection` (`surface="section"`) gets `containerClassName` `flex flex-col gap-8` and holds the `EvaluationSheet`, then `<div>{back}</div>`, reusing the `back` prop the route passes (the first section keeps it at the top). The skeleton and the error branch are unchanged.

The bottom link now sits on `surface-section`: the pairs `text-link`/`surface-section` and `text-link-hover`/`surface-section` (kind `text`) are registered in `TRADITIONAL_PAIRS` and `DARK_PAIRS` of `src/app/styles/theme-tokens.test.ts`. Measured by the design lead: traditional 5.72 and 10.28, dark 11.97 and 13.35, all above 4.5; no token changes.

### D4. Evaluation form (evaluations)

In `EvaluationForm.tsx` the read-only branch renders, after the status paragraph, `<div>` holding the same fixed `Link variant="back"` as `EvaluationFormHeader.tsx` (`href` `/{locale}/manage/evaluations`, text `texts.backLabel`), inside the form's `flex flex-col gap-8`. The read-only branch is the one without `FormActions`: a closed evaluation and an evaluation whose `offeringId` is `null` (open or closed). The design lead's criterion is "no action bar", so both get the bottom link; the spec states it that way. The editable branch keeps `FormActions` (Save draft, Close evaluation, Cancel of R57) and gets no bottom link. A successful close turns the form read-only, so the bottom link appears with the closed message.

## Tests

One test per new scenario, each asserting two links with the same accessible name and `href` and that the last one follows the tab panel or the section's last content:

- `offering-catalog` "Offering detail page" — "Back link at the end": `OfferingDetailContent.test.tsx`, success: two links named `texts.backLabel`, both `href` `/es/offerings`; the last follows the `tabpanel` and is not inside it.
- `offering-catalog` "Coffee shop detail page" — "Back link at the end": `CoffeeshopDetailContent.test.tsx`, the same with "Volver a cafeterías", `/es/coffeeshops`.
- `evaluations` "Read-only evaluation view" — "Back link at the end": `EvaluationSheetView.test.tsx`, a closed evaluation: two links named "Back", both `href` `/en/evaluations`; the last follows the sheet's "Context" heading and sits in the second section.
- `evaluations` "Evaluation form" — "Back link at the end of a read-only evaluation": `EvaluationForm.test.tsx`, a closed evaluation: two links named "My evaluations", both `href` `/en/manage/evaluations`; the last follows the read-only status. No separate test is added for the editable form: its existing header test queries the back link with `getByRole`, which would fail on a second link.

Existing tests that render the success state and query the back link with `getByRole` switch to `getAllByRole(...)[0]`, assertions otherwise unchanged: `OfferingDetailContent.test.tsx` ("Back link"; "Detail on the page background"), `CoffeeshopDetailContent.test.tsx` ("Back link"), `EvaluationSheetView.test.tsx` (the null-offeringId case), `EvaluationForm.test.tsx` (the deleted-offering "keeps the back link" case, read-only). No test is deleted; no `qa/` test is edited (stale QA copies: refine-header-aut D4b, excluded only if they fail the typecheck or cannot load, and reported).

## Files

- `src/widgets/offering-detail/ui/OfferingDetailContent.tsx`, `src/widgets/coffeeshop-detail/ui/CoffeeshopDetailContent.tsx`, `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx` (FSD `widgets`).
- `src/pages/evaluation-form/ui/EvaluationForm.tsx` (`pages`).
- Tests: the four component tests above and `src/app/styles/theme-tokens.test.ts`.

## Risks

- QA copies of the touched component tests may find two back links and fail at run time; they are not edited, and are reported (excluded in `vitest.qa.config.mts` with a comment only if they cannot load).
