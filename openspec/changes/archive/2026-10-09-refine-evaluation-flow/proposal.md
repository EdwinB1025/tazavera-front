Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT findings of 2026-10-09 on the evaluation screens, typed for the fast lane and settled by Product owner (2026-10-09). They change settled behaviour of the `evaluations` capability:

- A successful close leaves the specialist on a read-only form instead of returning to "My evaluations", as a successful save does.
- The four extrinsic fields always show a text area, while the other optional notes (Overall's included) stay behind "Add note".
- A "My evaluations" card has no route to its offering, and an open evaluation cannot be opened read-only: the card offers either Edit or View, never both, unlike the MVC card (View always, then Close and Edit when open, then Delete).
- Close is offered on every open card and every saved open form, although the API closes only a complete evaluation (`PATCH /user/evaluations/{evaluation_ulid}/close`, its description and its `409` "Evaluation incomplete").

## What Changes

- **Close returns to the list.** In the form, a successful close navigates to `/{locale}/manage/evaluations`, as a successful save does. A failed close keeps today's messages and highlighting and stays on the form.
- **Optional extrinsic notes.** Farming, Processing, Trading and Certifications behave like Overall's note: the label is always shown and the text area appears only after "Add note"; a saved value opens with its text area shown. The request body is unchanged (an unopened field sends `null`).
- **View offering on the specialist's card.** A "View offering" route button, the public card's control (`RouteButton` `action-3` `sm`, `viewOfferingLabel` of `public-evaluations`, hidden suffix), opens `/{locale}/offerings/{offeringId}`; shown only when `offeringId` is not `null`. Both cards use one shared piece of the `evaluation-row` widget.
- **View on every card.** View (`action-3`, `viewLabel`) on every card opens the form read-only: an open evaluation through `/{locale}/manage/evaluations/{ulid}?mode=view`, which forces the form's read-only rendering. Edit (`action-4`, `editLabel`) only for an open evaluation with its offering, without the query. Card order: View, View offering, Close, Edit, Delete.
- **Close only for a complete evaluation.** One pure function `isReadyForClosing(evaluation)` in `entities/evaluation/model` implements the contract's rule on the API's evaluation shape: the 7 `descriptive` and 8 `affective` scores greater than 0, and among `tastes[].type` at least one `main_tastes`, one `mouthfeel` and one aromatic type (any type other than `main_tastes`, `mouthfeel` and `defects`). Close shows on a card only for an open evaluation with its offering that the function accepts, and in the form only when the saved evaluation (the one loaded) is accepted. The `409` handling stays as a fallback.

## Non-goals

- No API or contract change, no new token, no new dependency, no new catalog text (`viewOfferingLabel` is reused from `public-evaluations`).
- No change to the public evaluations list or view, the header back link, the form's field errors or the not-found message (other sessions own them).
- No change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: "Row actions" (View on every card, View offering, Edit only when open with its offering, Close only when complete, the order), "Evaluation form" (the `?mode=view` read-only mode, optional extrinsic notes behind "Add note") and "Closing an evaluation" (shown only for a complete saved evaluation, returns to the list).

## Impact

- Code: `src/entities/evaluation/model/closing.ts` (new), `src/entities/evaluation/index.ts`, `src/widgets/evaluation-row/ui/EvaluationRowParts.tsx`, `src/widgets/evaluation-row/ui/PublicEvaluationRowCard.tsx`, `src/widgets/evaluation-row/index.ts`, `src/pages/evaluations-list/ui/SpecialistEvaluationRow.tsx`, `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx`, `src/pages/evaluation-form/model/use-evaluation-form.ts`, `src/pages/evaluation-form/model/form-model.ts`, `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `src/pages/evaluation-form/ui/EvaluationDetail.tsx`, `src/pages/evaluation-form/ui/EvaluationScreen.tsx`, `src/pages/evaluation-form/ui/ExtrinsicField.tsx`, `src/pages/evaluation-form/ui/GroupParts.tsx`, `app/[locale]/manage/evaluations/[ulid]/page.tsx`.
- Tests: `src/entities/evaluation/model/closing.test.ts` (new), `src/pages/evaluations-list/ui/EvaluationRowCard.test.tsx`, `src/pages/evaluations-list/ui/EvaluationsList.test.tsx`, `src/pages/evaluation-form/ui/EvaluationForm.test.tsx`, `src/pages/evaluation-form/ui/EvaluationDetail.test.tsx`, `src/pages/evaluation-form/ui/EvaluationGroupCard.test.tsx`, `src/pages/evaluation-form/ui/form-fixtures.ts`.
- APIs, dependencies: none.

## Propose status

- **Change-id:** refine-evaluation-flow
- **Date:** 2026-10-09
- **`openspec validate refine-evaluation-flow --strict`:** valid
- **Backlog entries resolved:** none (Product owner's AUT findings a–e of 2026-10-09)
- **Resolved:**
  - a. Close returns to the list, as Save does (D1).
  - b. The four extrinsic fields reuse `NoteField` behind "Add note" with their label always shown; General observation unchanged (D2).
  - c. View offering through one `ViewOfferingButton` of the `evaluation-row` widget, shared by both cards; text reused from `public-evaluations.viewOfferingLabel` (D5).
  - d. View on every card, `?mode=view` for an open evaluation; Edit only when open with its offering; order View, View offering, Close, Edit, Delete (D4, D5).
  - e. `isReadyForClosing` in `entities/evaluation/model`; Close on a card and in the form only when it accepts the saved evaluation; `409` handling kept (D3).
  - The brief's "My evaluations list" requirement: the card actions are specified in "Row actions", so that requirement is the one modified; "My evaluations list" keeps its text.
- **Open:** none.
