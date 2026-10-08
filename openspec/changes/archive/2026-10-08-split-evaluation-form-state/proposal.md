Type: Refactor (fast lane)

# Proposal

## Why

`src/pages/evaluation-form/ui/EvaluationForm.tsx` holds the whole state of the CVA combined form in nine `useState` calls inside one 244-line component with a cyclomatic complexity of 25, in a 339-line file; `EvaluationGroupCard.tsx` renders every axis control, note and part of a group in one 205-line component with a complexity of 17. All four figures exceed the size limits of AGENTS.md (a component or function of at most 80 lines, a file of at most 300 lines, a cyclomatic complexity of at most 15), and every edit to the form's state means reading its markup too (backlog R34; technical review §3.1, row R34). Nothing the user sees and no request changes.

## What Changes

- The form's state moves into a `model` segment of the `evaluation-form` page slice: a reducer with its state and action types, the pure updaters of the form values, and a `useEvaluationForm` hook that owns the reducer and the draft-save and close flows (design.md D1–D3).
- `EvaluationForm` keeps its props and only composes: the page header, the context card (roast level and extraction method), the group list with the 1–9 legend, and the actions or the read-only status, each in its own sibling component (design.md D4).
- `EvaluationGroupCard` keeps its props and its uncontrolled fallback, and composes a descriptive part, an affective part and the Extrinsic notes part built from shared axis controls and an axis note (design.md D5).
- `EvaluationGroupTexts` moves to its own types file and `FormBusy` to the model; the importers are updated (design.md D6).
- No markup, class name, accessible name, text, focus or validation behaviour, request, body or request order changes.

## Out of scope (non-goals)

- `EvaluationDetail.tsx`, `EvaluationScreen.tsx`, `NewEvaluationScreen.tsx`, `DescriptorBlock.tsx`, `NoteField.tsx`, `ScaleLegend.tsx`, `CompletenessIndicator.tsx`, `LoadFailure.tsx`, `form-fixtures.ts` and the slice's public index: unchanged.
- `form-texts.ts`, whose `formTextsFrom` (90 lines) is also over the function limit: not part of R34; reported as an open point.
- `@/entities/evaluation` (state, body builders, completeness, requests) and the shared components the form uses.
- The message files and the text keys: no key is added, removed or renamed.
- No new test, no changed assertion, no new token, contract operation or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: one ADDED requirement, "Evaluation form kept as one form", stating the observable property the refactor keeps. It adds no behaviour.

## Impact

- **Code** (FSD layer `pages`, slice `evaluation-form`): modified `ui/EvaluationForm.tsx`, `ui/EvaluationGroupCard.tsx`, `ui/FormActions.tsx`; new `model/form-updates.ts`, `model/form-model.ts`, `model/use-evaluation-form.ts`, `ui/group-texts.ts`, `ui/EvaluationFormHeader.tsx`, `ui/ContextFieldsCard.tsx`, `ui/EvaluationGroupList.tsx`, `ui/AxisControls.tsx`, `ui/GroupParts.tsx`.
- **Tests**: none added or changed. Protecting tests: `EvaluationForm.test.tsx` (36 tests), `EvaluationDetail.test.tsx`, `EvaluationGroupCard.test.tsx` and `FormActions.test.tsx`, each in `src/pages/evaluation-form/ui/` and `qa/src/pages/evaluation-form/ui/`; they carry the "Evaluation form", "Notes", "Fragrance not evaluated", "Completeness indicator", "Saving a draft", "Closing an evaluation" and "Read-only evaluation presentation" scenarios.
- **API**: none changed. The form keeps sending `POST /user/evaluations`, `PUT /user/evaluations/{evaluation_ulid}` and `PATCH /user/evaluations/{evaluation_ulid}/close` through `@/entities/evaluation`, with the same bodies and in the same order.
- **Dependencies, contract, texts, tokens**: none.
- **Resolves**: backlog R34.

## Propose status

- **Change-id:** `split-evaluation-form-state`
- **Date:** 2026-10-08
- **Validation:** `openspec validate split-evaluation-form-state --strict` → "Change 'split-evaluation-form-state' is valid".
- **Resolves:** backlog R34.
- **Resolved:** the form's state moves into the slice's `model` segment as one reducer (`FormModel`, `FormAction`) driven by `useEvaluationForm`, with the value edits as pure updaters and each dispatch replacing one group of today's setter calls (design.md D1–D3); `EvaluationForm` composes a header, a context card, a group list and the inline actions or status (design.md D4); `EvaluationGroupCard` keeps its 11 props and uncontrolled fallback, because both card tests render it with them, and composes axis controls and one component per part (design.md D5); `EvaluationGroupTexts`, `FormStateUpdate` and `FormBusy` move, with no test importing them (design.md D6).
- **Open:** `formTextsFrom` in `src/pages/evaluation-form/ui/form-texts.ts` (90 lines) also exceeds the function limit and is not covered by R34; reported to Product owner as a backlog candidate.
