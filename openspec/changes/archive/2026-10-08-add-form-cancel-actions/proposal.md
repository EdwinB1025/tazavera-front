Type: Refactor (fast lane)

## Why

Production AUT finding 25 (2026-10-08), backlog entry R57: every create/update form must offer "Cancel" next to its submit, in New offering's actions-row order (submit, then Cancel), going to the page's back destination and sending no request. The evaluation form (new and edit) and the two register forms lack it. Product owner typed this correction for the fast lane; unlike a pure refactor it adds visible behaviour, by Product owner's decision (AUT finding 25) with the design lead's layout.

## What Changes

- `evaluations`: the editable evaluation form shows a "Cancel" link after Save draft and Close evaluation, opening `/{locale}/manage/evaluations` (the destination of the header's back link) without saving, usable while an action runs. A closed (read-only) evaluation has no Cancel. Below 768px the sticky action bar stacks three rows (status; the two buttons, equal width, 1rem apart; Cancel centred on its own line), 0.5rem apart, and the form's bottom padding grows to leave room for the taller bar; from 768px it stays one right-aligned row with Cancel 1rem after Close evaluation. Text: the catalog's existing `deleteCancelLabel`.
- `user-account`: both registration forms (specialist and coffee shop) show a "Cancel" link under the full-width submit, centred, opening the active locale's root without sending anything. Not on the success panel nor while the session resolves. Text: `account` catalog `cancel`.
- `offering-management`: "Creating offerings" states the existing Cancel link of the New offering form and gains its scenario (behaviour unchanged).
- No unsaved-input warning on any form (Product owner 2026-10-08).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluations`: ADDED "Cancelling the evaluation form".
- `user-account`: ADDED "Cancelling registration".
- `offering-management`: "Creating offerings" states the Cancel link and gains the scenario "Cancel leaves for the list".

## Out of Scope (non-goals)

- A Cancel on the inline account profile and password forms (Product owner 2026-10-08: none).
- Any warning about unsaved input.
- The location form and the contact section, which already have Cancel; the bottom "Back" of detail views (R63).
- Any new token, API call, route or catalog key.

## Impact

- **Code**: `src/pages/evaluation-form/ui/FormActions.tsx`, `EvaluationForm.tsx`, `form-texts.ts` (FSD `pages`); `src/features/user-account/ui/RegisterForm.tsx` (`features`); `src/pages/register/ui/RegisterClient.tsx`, `RegisterScreen.tsx` (`pages`); `tsconfig.json` (stale QA copies excluded from the typecheck).
- **Tests**: `src/pages/evaluation-form/ui/FormActions.test.tsx`, `EvaluationForm.test.tsx`, `form-fixtures.ts`; `src/features/user-account/ui/RegisterForm.test.tsx`; `src/pages/register/ui/RegisterClient.test.tsx`; `src/pages/new-offering/ui/NewOfferingForm.test.tsx`.
- **API**: none. **Dependencies**: none.

## Propose status

- Change-id: `add-form-cancel-actions`; date 2026-10-08.
- Backlog entry resolved: R57 (table row `0m`).
- Resolved (Product owner 2026-10-08 and design lead): no Cancel on profile/password; no unsaved-input warning; register Cancel goes to `/{locale}`; the New offering Cancel scenario is added now; the evaluation action bar layout (stacked rows below `md`, `pb-36`, one row with `md:gap-4` from `md`); control = shared `Link` default variant; texts `deleteCancelLabel` (evaluations) and `cancel` (account, present in es/en/ca).
- Resolved in design.md: `cancelLabel`/`cancelHref` are required props (D1, D3); the QA copies made stale by the new required props are excluded from the typecheck only, following refine-header-aut D4b (D5).
- Open: none.
- `openspec validate add-form-cancel-actions --strict`: passed.
