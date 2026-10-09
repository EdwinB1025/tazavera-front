# Tasks

## 1. The five extrinsic values in state, load and body (evaluations)

- [ ] 1.1 Tests first. New `src/entities/evaluation/model/body.test.ts`: from `emptyFormState("medium")` with `extrinsics` `{ farming: "Smallholder", processing: "", trading: "Direct", certifications: null }` and `generalObservation: "Clean"`, `buildUpdateBody(...).extrinsics` equals `{ farming: "Smallholder", processing: null, trading: "Direct", certifications: null, generalObservation: "Clean" }` (spec "Editing and sending the extrinsic fields"). `load.test.ts`: one test where the item's `extrinsics` holds the five values and `formStateFromEvaluation` returns them in `extrinsics` and `generalObservation` (spec "Loading the extrinsic fields"). Expected: both fail (and typecheck errors only for the missing `extrinsics` state field).
- [ ] 1.2 `state.ts` adds `extrinsics: Record<ExtrinsicFieldKey, string | null>` (`ExtrinsicFieldKey` = `farming` | `processing` | `trading` | `certifications`, with an ordered `EXTRINSIC_FIELDS` list, exported from the entity), `null` in `emptyFormState`; `load.ts` fills it from `item.extrinsics`; `body.ts` sends the four with the same empty-to-`null` rule as the general observation.

  Verify: `npx vitest related src/entities/evaluation/model/state.ts src/entities/evaluation/model/load.ts src/entities/evaluation/model/body.ts --run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass.

## 2. The five fields in the Extrinsic group (evaluations)

- [ ] 2.1 Test first. `EvaluationGroupCard.test.tsx`: the editable `extrinsic` group, once expanded, shows text areas labelled "Farming", "Processing", "Trading" and "Certifications", in that order, followed by the General observation's "Add note" control (spec "Evaluation form"). `form-fixtures.ts` adds the four labels to `FORM_TEXTS.group`. Expected: the test fails (and typecheck errors only for the missing texts field).
- [ ] 2.2 `group-texts.ts` adds `extrinsicLabels: Record<ExtrinsicFieldKey, string>`, filled in `form-texts.ts` from the four new `evaluations` keys added to `messages/{es,en,ca}/evaluations.json` (same copy as `public-evaluations.json`); `form-updates.ts` adds an update for one extrinsic field; `ExtrinsicNotes` renders the four fields (editable: `Field` + `Textarea`; read-only: label and text, nothing when empty) before the unchanged General observation note, in its existing `gap-4` column.

  Verify: `npx vitest related` on the changed files `--run`, `npx tsc --noEmit`, `npm run lint`. Expected: all pass. Then the full checks, each on its own: `npm run test:run`, `npm run test:qa` (only failures that also fail on `origin/develop` are allowed, plus stale QA copies of `body.test.ts` / `load.test.ts` if any), `npx tsc --noEmit`, `npm run lint`, `npm run build`. Expected: all pass.
