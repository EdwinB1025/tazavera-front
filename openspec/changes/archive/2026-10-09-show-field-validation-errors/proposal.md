## Why

Backlog R8 (decisions log 2026-10-06, "escrituras, rutas protegidas y 422"): every form shows one generic form-level error for any `422`, although the API returns a message per field. The contract now documents the `422` of every write in Laravel's shape (`{"message", "errors": {field: [messages]}}`, `develop` at `2bdde09`), and Product owner scheduled this change once that was done (2026-10-08).

## What Changes

- One shared, pure mapping turns a documented `422` body into per-field messages keyed by each form's field names; the shared `ApiResult` gains a `validation` failure kind carrying that map.
- Every writing form — registration, profile, password, contact, new location, new offering, evaluation create and update — shows each field's first API message under its `Field` (invalid state, described by the message), keeps its existing form-level error for keys that name no field, and clears a field's message when the user edits it.
- Non-`422` failures keep today's handling. No new text, token, route or dependency.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `form-fields`: ADDED "Server validation errors" (the mapping, the message under the field, clearing on edit).
- `user-account`: MODIFIED "Registration result", "Profile settings", "Password change", "Contact details form" (a `422` shows its messages under the fields).
- `offering-management`: MODIFIED "Creating offerings", "Location creation failures".
- `evaluations`: MODIFIED "Saving a draft".

## Non-goals

- No change to `contracts/openapi.yaml` or `src/shared/api/schema.ts`; no change to the read paths of offerings and evaluations (`show-item-not-found-message` works there).
- The evaluation form maps only its context card's two fields (design.md D5); the new-offering locations group gets no field error slot.

## Impact

- New: `src/shared/lib/field-errors.ts`, `src/shared/lib/field-errors.test.ts`.
- Modified: `src/shared/api/result.ts`, `src/shared/lib/hooks/index.ts`; `src/features/user-account` (api `register.ts`, `account.ts`, `contacts.ts`; `model/use-contact-form.ts`; ui `RegisterForm.tsx`, `ProfileForm.tsx`, `PasswordForm.tsx`, `ContactForm.tsx`); `src/features/location-management` (`api/locations.ts`, `model/submit-location.ts`, `ui/LocationForm.tsx`, `ui/LocationsPanel.tsx`); `src/features/offering-management` (`api/management.ts`, `model/create-flow.ts`); `src/pages/new-offering/ui/NewOfferingForm.tsx`; `src/entities/evaluation/api/user-evaluations.ts`; `src/pages/evaluation-form` (`model/use-evaluation-form.ts`, `ui/EvaluationForm.tsx`, `ui/ContextFieldsCard.tsx`).
- Tests: the mapping (`field-errors.test.ts`); one form per capability (`RegisterForm.test.tsx`, `NewOfferingForm.test.tsx`, `EvaluationForm.test.tsx`); `ContactSection.test.tsx` (its `422` case's body).

## Propose status

- Change-id: `show-field-validation-errors`
- Date: 2026-10-09
- `openspec validate show-field-validation-errors --strict`: valid
- Resolves backlog entry: R8
- Resolved (Product owner, 2026-10-08 and this change's prompt): one shared pure mapping in `src/shared`, a `validation` kind on `ApiResult`, the API's text under each field's `Field`, the existing form-level line for unmatched keys, clearing on edit, no new token, dependency or text.
- Decided by the architect (design.md): the mapping and `FieldErrors` live in `src/shared/lib/field-errors.ts` (moved from `src/shared/api` during the build, design.md D2) and the form state in a `useServerFieldErrors` hook in `src/shared/lib/hooks`; `unmatched` also covers a `422` with no usable message; the API key aliases of the contact and location forms (D5); the evaluation form maps only `descriptive.roastLevel` and `extractionMethod` and the new-offering form only `coffeeInventoryId` (D5).
- Open: none blocking. Product owner may later want the evaluation form's collapsed groups and the new-offering locations group to show field messages (a new change).
