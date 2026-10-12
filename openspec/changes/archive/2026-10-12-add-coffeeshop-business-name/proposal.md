Type: Refactor (fast lane)

## Why

Backlog entry R81 (Product owner, 2026-10-12), taken as a fast lane by Product owner's order of 2026-10-12: the API added the coffee shop's business name (`businessName`). `POST /register` requires it when `role` is `coffeeshop` (max 150 characters) and rejects it for every other role with `422`; `PUT /users/{user}` accepts it only for a coffee shop and it cannot be emptied; `GET /user` returns it (`null` for other roles). The front never sends or shows it, so a coffee shop cannot register today (the API answers `422`), and the demo of 2026-10-13 shows the coffee shop's business name. The contract is already in `contracts/openapi.yaml` and `src/shared/api/schema.ts` (commit `f14cb2a9`).

## What Changes

- Coffee shop registration (`/{locale}/register/coffeeshop`): a required "Business name" field ("Nombre comercial" / "Business name" / "Nom comercial"), after Surname and before Email, keeping at most 150 characters, sent as `businessName`. An empty value shows the required-field message like the other required fields; a `422` message for `businessName` renders under the field. The specialist registration form is unchanged and never sends `businessName`.
- Account page, coffee shop only: the read-only Profile shows a "Business name" row with `data.businessName`, after Surname and before Email; the edit form holds the same required field after Surname and before Email, prefilled from `data.businessName`, sent as `businessName` on save, its empty value blocked with the required-field message and its `422` message rendered under it. For every other role nothing is shown and `businessName` is never sent.
- One new text, `businessNameLabel`, in `messages/{es,en,ca}/account.json`. No new tokens, components of `shared`, dependencies or API fields.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: MODIFIED "Registration form" (the coffee shop route also collects and requires the business name; the request carries the form's values), MODIFIED "Profile settings" (a coffee shop's business name row and form field; the business name is the one field the profile form requires); ADDED "Coffee shop business name" (the new scenarios).

## Non-goals

- No change to the specialist registration route or to the profile of any role but `coffeeshop`, beyond never sending `businessName`.
- No change to the coffee shop directory, its detail page or any other screen that shows a coffee shop's `name`.
- No change to the registration result, the step-up, the password change, the contact details or the account deactivation and deletion.
- No change to `contracts/openapi.yaml`, `src/shared/api/schema.ts`, tokens, `shared` components or dependencies.
- No other backlog entry is folded in.

## Impact

- Modified (features, `src/features/user-account/`): `model/use-register-form.ts`, `model/use-profile-form.ts`, `ui/RegisterForm.tsx`, `ui/ProfileForm.tsx`, `ui/ProfileDetails.tsx`; created `ui/BusinessNameField.tsx` (design.md D1).
- Modified (pages): `src/pages/register/ui/RegisterScreen.tsx`, `src/pages/account/ui/AccountScreen.tsx` (the new text).
- Modified (messages): `messages/es/account.json`, `messages/en/account.json`, `messages/ca/account.json`.
- Tests: one validation test per new scenario, in `src/features/user-account/ui/RegisterForm.test.tsx`, `ProfileDetails.test.tsx` and `ProfileForm.test.tsx`. Existing tests keep their assertions; text fixtures add `businessNameLabel`, and the tests that submit the coffee shop registration fill the business name, the expected body of that role adding it (design.md D4).

## Propose status

- Change-id: `add-coffeeshop-business-name`
- Date: 2026-10-12
- `openspec validate add-coffeeshop-business-name --strict` (`@fission-ai/openspec@1.13.2`): valid
- Resolves backlog entry: R81 (fast lane by Product owner's order of 2026-10-12).
- Resolved (backlog entry R81): the end state as stated in What Changes.
- Resolved (architect): "the edit form has the same required field" is read as the registration's required field: marked required and blocked by the client's required check with the required-field message. The profile form's rule "no field is required" therefore names the business name as its one exception, and the scenario "An emptied field reaches the API" names the name, surname and email fields; the existing tests of that scenario use a specialist and keep their assertions.
- Resolved (architect): the business name row and field sit after Surname and before Email in the Profile section and the edit form, as in the registration form (R81: "same pattern as name and surname").
- Resolved (architect): "keeps at most 150 characters" is the input's maximum length, as in the contact details form's "Maximum lengths".
- Resolved (architect, design.md D1): one field component in the slice serves the registration and profile forms, which keeps `RegisterForm` within 80 lines.
- Note: R81 mentions "the specialist and generic user registration forms"; the front has only the specialist and coffee shop routes (spec "Registration routes"), so the specialist form is the one kept unchanged.
- Open: none.
