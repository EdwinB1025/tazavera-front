Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT pass found that "Close evaluation" is offered on a new evaluation, before anything is saved, and that an open evaluation can only be closed from its form. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that Close shows only for an evaluation that already exists, and that each open row of "My evaluations" also offers it. It changes the form's and the rows' actions by Product owner's decision.

## What Changes

- The evaluation form (`src/pages/evaluation-form/ui/FormActions.tsx`, `EvaluationForm.tsx`) renders "Close evaluation" only when the evaluation exists: a form loaded from `/{locale}/manage/evaluations/{ulid}`, or a new form once its first save has created the evaluation (the route already becomes the evaluation's own then). A new form with nothing saved shows Save draft and Cancel only. Save draft, Cancel, the status region and the layout are otherwise unchanged.
- Each open row of "My evaluations" (`src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`) offers Close between Edit and Delete: a `Button` with the Edit button's variant (`action-3`) and size, labelled with the form's `closeLabel`. It sends the same request function as the form (`closeAnEvaluation` from `@/entities/evaluation`; no confirmation, since the form asks for none) and maps the outcomes as the form does: success → the form's closed message; `409` → the form's incomplete message; `403` → the "not yours" message; any other failure → the generic failure message. The message shows in a status line in the row. Closed rows and rows whose `offeringId` is `null` show no Close.
- On success the list marks the row closed in place (its Edit becomes View and Close disappears) and reloads the page behind it without the loading placeholder, as it does after a deletion. No full page reload.
- `closeAnEvaluation` already lives in `entities/evaluation` (`api` segment), importable by both pages: nothing moves.
- Texts reuse the `evaluations` catalog keys of the form (`closeLabel`, `closedMessage`, `incompleteMessage`, `notYoursMessage`, `failureMessage`). No new key, token or dependency.

## Non-goals

- The form's Cancel and back controls and the legend position (other sessions change them).
- No change to the close request, its body or the form's close flow.
- No change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: "Closing an evaluation" (Close only for an evaluation that exists) and "Row actions" (Close on open rows and its outcomes).

## Impact

- Code: `src/pages/evaluation-form/ui/FormActions.tsx`, `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`, a new `src/pages/evaluations-list/ui/CloseEvaluationAction.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.tsx`, `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx` (texts).
- Tests: `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.test.tsx` (scenarios below; text fixtures gain the reused keys). QA copies of these files may go stale.
- APIs, dependencies, tokens: none.

## Propose status

- **Change-id:** close-evaluation-only-when-saved
- **Date:** 2026-10-09
- **`openspec validate close-evaluation-only-when-saved --strict`:** valid
- **Backlog entries resolved:** none (AUT correction from Product owner)
- **Resolved:**
  - Form → Close only when the evaluation exists (Product owner, 2026-10-09); a new form shows it once its first save created the evaluation, since it then edits a saved evaluation on its own route.
  - Row → Close on open, non-orphan rows, order Edit, Close, Delete, `action-3` like Edit, same request and outcome texts as the form, no confirmation (the form has none) (Product owner, 2026-10-09).
  - Row success → the row is marked closed in place and the page reloads quietly, as after a deletion.
  - Request location → `closeAnEvaluation` is already in `entities/evaluation`; nothing moves.
- **Open:**
  - The row's status line mounts only while it holds a message, because an always-mounted status per row would add one `status` region per row next to the list's result count.
  - "Cancelling the evaluation form" still names "the Save draft and Close evaluation actions" and "the two actions side by side"; on a new form Cancel follows Save draft alone. That requirement is left to the session converting Cancel.
