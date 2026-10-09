Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT pass found that the evaluation form edits only one of the contract's five extrinsic fields. The write contract (`createAnEvaluation` / `updateAnEvaluation` in `contracts/openapi.yaml`) defines `extrinsics` with five optional nullable strings: `farming`, `processing`, `trading`, `certifications` and `generalObservation`. The form's Extrinsic group edits only `generalObservation`, and `src/entities/evaluation/model/body.ts` sends the other four as `null` on every save; since the API replaces the whole block, any value stored there is lost. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that the form shows the five fields, as the contract is designed. The change exposes the contract's fields by that decision.

## What Changes

- Form state (`src/entities/evaluation/model/state.ts`) holds the four new values as `extrinsics: { farming, processing, trading, certifications }` (`string | null`, `null` in a new form) beside the existing `generalObservation`, which keeps its place.
- Load (`load.ts`) fills the five from the evaluation's `extrinsics`; the body (`body.ts`) sends the five, an empty field as `null`, like the general observation today.
- The Extrinsic group (`src/pages/evaluation-form/ui/GroupParts.tsx`, `ExtrinsicNotes`) shows, inside its existing card and with its existing `gap-4`, Farming, Processing, Trading and Certifications, each a `Field` with its visible label and a `Textarea`, followed by the General observation note exactly as it is today. Read-only, each of the four shows as the form's read-only notes do: label and text, nothing when empty.
- Labels: the form reads the `evaluations` catalog only, so the four keys `extrinsicFarming`, `extrinsicProcessing`, `extrinsicTrading` and `extrinsicCertifications` are added to `messages/{es,en,ca}/evaluations.json` with the same copy as `public-evaluations.json`; General observation keeps `extrinsicNoteLabel`, whose copy is already the same.
- Completeness does not change: the five fields are optional.

## Non-goals

- No change to the General observation control, the completeness rule, the read-only evaluation sheet, tokens, dependencies or components.
- No change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: "Evaluation form" states the Extrinsic group's five optional fields, their order and the `extrinsics` fields they send; two scenarios (editing and sending, loading).

## Impact

- Code: `src/entities/evaluation/model/state.ts`, `load.ts`, `body.ts`; `src/pages/evaluation-form/model/form-updates.ts`, `ui/GroupParts.tsx`, `ui/group-texts.ts`, `ui/form-texts.ts`, `ui/form-fixtures.ts`; `messages/{es,en,ca}/evaluations.json`.
- Tests: new `src/entities/evaluation/model/body.test.ts` (the five values sent); one test added to `load.test.ts` and one to `EvaluationGroupCard.test.tsx`. QA copies `qa/src/entities/evaluation/model/body.test.ts` and `load.test.ts` may go stale.
- API: none (the contract already defines the five fields).

## Propose status

- **Change-id:** add-extrinsic-fields
- **Date:** 2026-10-09
- **`openspec validate add-extrinsic-fields --strict`:** valid
- **Backlog entries resolved:** none (AUT correction from Product owner)
- **Resolved:**
  - The Extrinsic group shows the contract's five fields, in its order (Product owner, 2026-10-09).
  - General observation stays exactly as it is ("Add note" control); the four new fields use `Field` + `Textarea` with a visible label, the form's existing free-text control (Product owner, 2026-10-09).
  - Labels → four keys added to the form's `evaluations` area with the sheet's copy, because the form screens read only that area; General observation keeps `extrinsicNoteLabel` (same copy).
  - Completeness → unchanged; the five fields are optional.
- **Open:** stale QA copies, if any, are left to Product owner's reduction plan.
