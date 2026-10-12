## Context

See proposal.md (Why) and backlog entry R81, whose settled end state this design implements. Current state:

- `src/features/user-account/model/use-register-form.ts` holds the registration values, the client checks (`FIELD_ORDER`, every field required, email format, confirmation) and builds the `RegisterPayload` from the five values and the route's role; `ui/RegisterForm.tsx` renders the fields with `Field` and `Input` from `@/shared/ui`.
- `model/use-profile-form.ts` holds the profile values (`name`, `surname`, `email`, prefilled from the session), the email format check and sends them with `updateProfile` (`api/account.ts`); `ui/ProfileForm.tsx` renders them.
- `ui/ProfileDetails.tsx` renders the read-only rows from a `ROWS` table, one `LabelValueRow` per non-null value.
- `src/pages/register/ui/RegisterScreen.tsx` and `src/pages/account/ui/AccountScreen.tsx` load the `account` catalog and pass every text as props. `AccountScreen` already passes `requiredError`.

### API endpoints

| Method and path | Auth | Request | Response | Errors |
|---|---|---|---|---|
| `POST /register` (`registerAUser`) | none (public client) | `RegisterPayload`, now with `businessName` (string, max 150) when `role` is `coffeeshop` | `201` as today | `422` with field messages, `businessName` included; others as today |
| `PUT /users/{user_ulid}` (`updateAUser`) | Bearer, `profile:write` | `ProfileUpdatePayload`, now with `businessName` (string, max 150, cannot be emptied) for a coffee shop | `200` as today | `403` step-up, `422` with field messages, `businessName` included; others as today |
| `GET /user` (`getTheAuthenticatedUser`) | Bearer | — | `data.businessName` (`string \| null`, `null` for other roles) | as today |

No derived API type is added: `RegisterPayload`, `ProfileUpdatePayload` and `SessionUser` (`src/shared/api/index.ts`) already carry `businessName` from the generated `schema.ts`. Errors are presented as today: a `422` message for `businessName` is a field message shown under the Business name field through the existing `useServerFieldErrors`, never the generic error.

## Goals / Non-Goals

**Goals:** R81's end state (proposal.md What Changes).

**Non-Goals:** see proposal.md Non-goals.

## Decisions

### D1 — One Business name field component

A new `src/features/user-account/ui/BusinessNameField.tsx` (features layer) renders `Field` (`required`) with an `Input` named `businessName`, `type="text"`, `autoComplete="organization"` and `maxLength={150}`; its props are `label`, `value`, `error` and `onChange(value)`. The 150 is a constant in that file. `RegisterForm` and `ProfileForm` render it after the Surname field and before the Email field only when the role is `coffeeshop`. It is not exported from the slice's index: only the slice uses it. A shared field keeps `RegisterForm` within 80 lines and both forms identical for the field.

### D2 — Registration

`RegisterField` adds `businessName`; the values start with `businessName: ""`. The field order (focus order and the keys `useServerFieldErrors` maps) is the current one with `businessName` after `surname`, used whole for the coffeeshop role and without `businessName` for the specialist role, so the required check and the `422` mapping cover the business name only on the coffeeshop route. The payload is the values and the role, with `businessName` only for `coffeeshop`; the specialist payload stays exactly the current five values and the role. `RegisterFormTexts` adds `businessNameLabel`; `RegisterScreen` passes `catalog.businessNameLabel`.

### D3 — Profile

`use-profile-form.ts` prefills `businessName` from `user.businessName ?? ""` for a coffee shop (`user.role === "coffeeshop"`). For a coffee shop, an empty or only-spaces business name is the first check (it comes before email in the form) and shows `texts.requiredError` under the field, focuses it and sends nothing; the email format check runs as today. The payload is `name`, `surname`, `email` and, for a coffee shop only, `businessName`; the `422` mapping covers `businessName` only for a coffee shop. `ProfileFormTexts` adds `businessNameLabel` and `requiredError`. `ProfileDetails` adds the row `["businessName", "businessNameLabel"]` after the surname row, rendered only when `user.role === "coffeeshop"` and the value is not null; `ProfileDetailsTexts` adds `businessNameLabel`. `AccountScreen` passes `catalog.businessNameLabel` (its `requiredError` is already passed).

### D4 — Texts and existing tests

`messages/es/account.json`, `messages/en/account.json` and `messages/ca/account.json` add `businessNameLabel`: "Nombre comercial", "Business name", "Nom comercial". Existing tests keep their assertions: every text fixture typed with `RegisterFormTexts`, `RegisterClientTexts`, `ProfileFormTexts`, `ProfileDetailsTexts` or the account page texts adds `businessNameLabel` (and `requiredError` where `ProfileFormTexts` lacks it); a test that submits the coffee shop registration fills the Business name field, and the expected body of the coffeeshop role in `RegisterForm.test.tsx` "sends POST /register … with role" adds that `businessName`, the specialist body unchanged (R81: "fixtures may add the new texts or field").

## Risks / Trade-offs

- [QA tests that submit the coffee shop registration, e.g. `qa/src/pages/register/ui/RegisterClient.test.tsx` "passes the route's role to the form"] → they fail on the new required check until their fixture fills the Business name field; only the fixture changes, never an assertion, and the build lists them in its final report.
- [Text fixtures in tests] → the new required text keys fail the typecheck of fixtures that lack them; only the fixture gains the key.
