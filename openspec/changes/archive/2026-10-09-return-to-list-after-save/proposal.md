Type: Refactor (fast lane)

# Proposal

## Why

Product owner's AUT pass found that after "Save draft" the specialist stays on the form, with a saved confirmation and, on the first save, the URL rewritten to the evaluation's own route. Product owner typed this AUT correction for the fast lane and decided (2026-10-09) that a successful save returns to "My evaluations". It changes the save flow by Product owner's decision.

## What Changes

- On a successful Save draft (create or update), the form navigates client-side with the App Router (`router.push`, never a full page load, which would drop the in-memory tokens) to `/{locale}/manage/evaluations`. The list loads its rows on mount, so the saved evaluation shows there as after a fresh load.
- The first save no longer rewrites the URL with `window.history.replaceState` and no saved confirmation shows on the form.
- A failed save keeps the form with its message, as today; the missing-roast-level validation is unchanged.
- Close evaluation keeps its current behaviour (another session changes it).
- The `savedMessage` catalog key is used nowhere else and is removed from the three locales. No new key, token or dependency.

## Non-goals

- Close evaluation, Cancel, the legend position and the extrinsic fields (other sessions change them).
- No change to the create or update requests.
- No change to the QA suite (`qa/`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: "Saving a draft" (a successful save returns to My evaluations; a failed one keeps the form with its message).

## Impact

- Code: `src/pages/evaluation-form/model/use-evaluation-form.ts`, `src/pages/evaluation-form/ui/EvaluationForm.tsx`, `src/pages/evaluation-form/ui/form-texts.ts`, `src/pages/evaluation-form/ui/form-fixtures.ts`, `messages/{en,es,ca}/evaluations.json`.
- Tests: `src/pages/evaluation-form/ui/EvaluationForm.test.tsx` (the save tests). QA copies of this file may go stale.
- APIs, dependencies, tokens: none.

## Propose status

- **Change-id:** return-to-list-after-save
- **Date:** 2026-10-09
- **`openspec validate return-to-list-after-save --strict`:** valid
- **Backlog entries resolved:** none (AUT correction from Product owner)
- **Resolved:**
  - Successful save → client-side `router.push` to `/{locale}/manage/evaluations` (Product owner, 2026-10-09). The list fetches its rows on mount and a push mounts the route afresh, so no extra refresh is needed.
  - First-save URL rewrite (`window.history.replaceState`) → removed; Close is offered only on a saved evaluation, so no remaining flow needs it.
  - `savedMessage` → removed from the catalog (no other use).
  - The delta keeps the four scenario names of "Saving a draft" (the validator refuses dropping scenarios); "The first save" and "A later save" now assert the navigation, "The API refuses the write" adds that the form stays.
- **Open:**
  - "Closing an evaluation" still says a new form offers Close "once its first save created it"; after this change a new form leaves on its first save, so that case no longer occurs. The wording is left to the Close session.
