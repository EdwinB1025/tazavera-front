# Design

## Context

Product owner's AUT findings of 2026-10-09 (points a–e of the session brief), settled by Product owner. This file records the decisions that place each end state in the code; the proposal lists the end states.

## Decisions

### D1. Close returns to the list

`onClose` in `use-evaluation-form.ts` ends a successful close as `onSave` ends a successful save: busy cleared, then `router.push("/{locale}/manage/evaluations")`. The reducer's `close` action (the read-only switch after a close) has no caller left and is removed. A failed close keeps the `refuse` path.

### D2. Optional extrinsic notes

`ExtrinsicField` keeps its read-only branch. Editable, it renders the field's label as `type-label` text, always, followed by the shared `NoteField` (the control Overall's note uses through `AxisNote`), with the note label `noteLabel (label)`, the add label `addNoteLabel (label)` (several "Add note" controls share the group, as a pair's do) and `removeNoteLabel`. `null` is closed, `""` open and empty. `formStateFromEvaluation` already maps a saved value to its text and an empty one to `null`, and `buildUpdateBody` sends `""` and `null` as `null`, so loading and the body are unchanged.

### D3. Close readiness

`isReadyForClosing(evaluation: EvaluationItem): boolean` in `entities/evaluation/model/closing.ts`, exported by the slice: every one of the 7 descriptive axes' and 8 affective axes' `score` is greater than 0, and `tastes[].type` holds `main_tastes`, `mouthfeel` and at least one type outside `main_tastes`, `mouthfeel` and `defects`. The axis lists are the ones `state.ts` already holds.

- List: `SpecialistEvaluationRow` renders `CloseEvaluationAction` only when the row is open, its `offeringId` is not `null` and `isReadyForClosing(evaluation)`.
- Form: `useEvaluationForm` returns `closable`, true when the `evaluation` input exists, is not read-only and `isReadyForClosing(evaluation)`. The form loads the evaluation once and leaves after a successful save, so the loaded evaluation is the saved state. `EvaluationForm` passes `onClose` only when `model.ulid` and `closable`.

### D4. Read-only mode

The route `app/[locale]/manage/evaluations/[ulid]/page.tsx` reads `mode` from `searchParams`, as the new-evaluation route reads `offering`, and passes `viewOnly={mode === "view"}` through `EvaluationScreen` and `EvaluationDetail` to `EvaluationForm`. `initialFormModel` takes `viewOnly` and opens read-only when the evaluation is closed, its offering is missing or `viewOnly` is set; the rest of the read-only rendering (groups and legend expanded, no actions, the bottom back button) is the existing one.

### D5. Card actions

`EvaluationRowParts.tsx` gains `ViewOfferingButton` (`RouteButton` `action-3` `sm` to `/{locale}/offerings/{offeringId}`, `viewOfferingLabel`, the hidden suffix), used by `PublicEvaluationRowCard`'s `RowActions` and exported by the widget for `SpecialistEvaluationRow`. The specialist row's suffix is the coffee name. `SpecialistEvaluationRow` renders: View (`action-3`, to the form route with `?mode=view` when the evaluation is open, without it otherwise), View offering (when `offeringId` is not `null`), Close (D3), Edit (`action-4`, open with its offering, the form route), Delete. `EvaluationsListScreen` reads `viewOfferingLabel` from the `public-evaluations` catalog: no new text.

## Risks

- A specialist whose unsaved edits make a complete evaluation incomplete still sees Close; the `409` message and highlighting stay as the fallback (D3).
