Type: Refactor (fast lane)

## Why

Product owner's decision (2026-10-09, maximum priority): only the account's own actions (profile update, password, deactivate, permanent delete on the account page) need the `profile:write` scope. The API was aligned on `dev` (`tazavera-api` `26bcb49`): deleting one or several offerings no longer requires `profile:write`, and creating offerings never did. The front still treats both as step-up writes: a `403` on create or delete shows the step-up text and a "Confirm your identity" action that starts `requestProfileWrite`. This change removes the step-up from offerings by Product owner's decision; Product owner typed it as fast lane (AUT correction).

## What Changes

- Creating offerings and deleting one or several offerings are plain writes: the request is sent directly, with no identity check before or after it.
- A `403` on these calls is no longer read as "needs step-up": the create form shows its existing generic error (`createError`) with every value kept, and the delete confirmation shows its existing error (`deleteError`) and stays open. No step-up text or "Confirm your identity" action renders on either screen.
- The offering-management uses of `requestProfileWrite` go away, and the text keys `stepUpMessage` and `stepUpLabel` of `messages/{ca,en,es}/offering-management.json`, unused after the change, are removed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `offering-management`: "Deleting offerings" (a delete is a plain write; a 403 is an ordinary failure; scenario "Step-up after 403" now states the plain failure) and "Creating offerings" (a create is a plain write; a 403 shows the generic form error; scenario "Step-up after 403" now states the plain failure).

## Non-goals

- No change to the account page's step-up (`src/pages/account`, `src/features/user-account`), to `src/features/auth` or to `StepUpNotice` (still used by the account).
- No new token, text, route or dependency; no change to `contracts/` or `src/shared/api/schema.ts`.
- No change to the create form's "Cancel" control (edited by another change).

## Impact

- Modified: `src/features/offering-management/api/management.ts`, `src/features/offering-management/model/create-flow.ts`, `src/features/offering-management/model/delete-flow.ts`, `src/features/offering-management/ui/DeleteOfferingsDialog.tsx`, `src/pages/new-offering/ui/NewOfferingForm.tsx`, `src/pages/new-offering/ui/NewOfferingScreen.tsx`, `src/pages/manage-offerings/ui/OwnOfferingsList.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsScreen.tsx`, `messages/{ca,en,es}/offering-management.json`.
- Tests updated (they assert the step-up): `src/pages/new-offering/ui/NewOfferingForm.test.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsPanel.test.tsx`, `src/features/offering-management/ui/DeleteOfferingsDialog.test.tsx`. No test is added. Stale QA copies are not edited; they may be kept out of the typecheck in `tsconfig.json`.

## Propose status

- Change-id: `drop-step-up-for-offerings`
- Date: 2026-10-09
- `openspec validate drop-step-up-for-offerings --strict`: valid
- Resolves backlog entry: none (Product owner's decision passed directly).
- Resolved (Product owner, 2026-10-09): create and delete are plain writes with no identity check; a 403 reuses the screen's existing generic error; the account step-up, `src/features/auth` and `StepUpNotice` are unchanged; the offering-management step-up text keys are removed in all three locales.
- Open: nothing.
