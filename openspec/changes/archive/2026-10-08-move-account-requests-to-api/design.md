# Design

## Context

`ProfileForm`, `PasswordForm` and `DangerZone` call `request` from `@/shared/api` and `RegisterForm` calls `publicRequest`, each with its own `try`/`catch` and status checks. The slice already has `src/features/user-account/api/contacts.ts`, whose functions take the path parameters and the payload and send the request through the client. `PasswordForm.tsx` (new password and confirmation `Field`s) and `RegisterForm.tsx` (password and confirmation `Field`s) render the same two fields; only the first label's text differs.

## Goals / Non-Goals

**Goals:**
- Every account write is sent, and its status mapped, in `src/features/user-account/api/`.
- One shared new-password fields part, used by both forms.
- Identical markup, texts, requests and outcomes.

**Non-Goals:**
- Per-field `422` errors (R8), changes to `contacts.ts` or `ContactSection`, changes to the public index.

## Decisions

### D1. Endpoints (unchanged)

| Function | Method and path | Client | Headers | Body |
|---|---|---|---|---|
| `updateProfile` | `PUT /users/{ulid}` | `request` (token) | `Accept: application/json`, `Content-Type: application/json` | `ProfileUpdatePayload` as JSON |
| `updatePassword` | `PUT /users/{ulid}/password` | `request` (token) | `Accept: application/json`, `Content-Type: application/json` | `PasswordUpdatePayload` as JSON |
| `deactivateAccount` | `DELETE /users/{ulid}` | `request` (token) | `Accept: application/json` | none |
| `deleteAccount` | `DELETE /users/{ulid}/force` | `request` (token) | `Accept: application/json` | none |
| `registerUser` | `POST /register` | `publicRequest` | `Accept: application/json`, `Content-Type: application/json` | `RegisterPayload` as JSON |

### D2. `api/account.ts`

The four token writes, in the style of `contacts.ts` (one exported function per request, a doc comment naming the endpoint, imports from `@/shared/api`). Each catches a network failure and maps the status with one private helper: `200` → `"success"`, `403` → `"stepUp"`, any other status or a network failure → `"error"`. This is the mapping all three components apply today.

```ts
export type AccountWriteResult = "success" | "stepUp" | "error";

export function updateProfile(
  ulid: string,
  payload: ProfileUpdatePayload,
): Promise<AccountWriteResult>;
export function updatePassword(
  ulid: string,
  payload: PasswordUpdatePayload,
): Promise<AccountWriteResult>;
export function deactivateAccount(ulid: string): Promise<AccountWriteResult>;
export function deleteAccount(ulid: string): Promise<AccountWriteResult>;
```

How each component shows the result (unchanged): `ProfileForm` shows the success status and refreshes the profile on `"success"`, the step-up notice on `"stepUp"`, the generic error on `"error"`. `PasswordForm` shows the step-up notice on `"stepUp"` keeping the fields, and otherwise the success status or the generic error, clearing the fields. `DangerZone` signs out on `"success"`, and shows the step-up notice or the generic error in the dialog otherwise.

### D3. `api/register.ts`

`registerUser` sends `POST /register` through `publicRequest` and returns `"created"` on `201`, `"error"` on any other status or a network failure. `RegisterForm` shows the success panel on `"created"`, and otherwise the generic error, clearing the two password fields.

```ts
export type RegisterResult = "created" | "error";

export function registerUser(payload: RegisterPayload): Promise<RegisterResult>;
```

### D4. `ui/NewPasswordFields.tsx`

Renders, as a fragment (so both stay direct children of the form), the `password` field with its help and the `passwordConfirmation` field, with the markup both forms render today (`required`, `PasswordInput` with `autoComplete="new-password"` and the show/hide labels). Not exported from the slice's public index.

```ts
export type NewPasswordFieldsTexts = {
  passwordLabel: string;
  passwordConfirmationLabel: string;
  passwordHelp: string;
  showPassword: string;
  hidePassword: string;
};

export type NewPasswordFieldsProps = {
  texts: NewPasswordFieldsTexts;
  password: string;
  passwordConfirmation: string;
  passwordError?: string;
  passwordConfirmationError?: string;
  onChange: (field: "password" | "passwordConfirmation", value: string) => void;
};
```

`PasswordForm` passes `newPasswordLabel` as `passwordLabel`; `RegisterForm` passes its own texts.

### D5. Files

| File | Layer | Change |
|---|---|---|
| `src/features/user-account/api/account.ts` | features | new |
| `src/features/user-account/api/register.ts` | features | new |
| `src/features/user-account/ui/NewPasswordFields.tsx` | features | new |
| `src/features/user-account/ui/ProfileForm.tsx` | features | uses `updateProfile` |
| `src/features/user-account/ui/PasswordForm.tsx` | features | uses `updatePassword` and `NewPasswordFields` |
| `src/features/user-account/ui/RegisterForm.tsx` | features | uses `registerUser` and `NewPasswordFields` |
| `src/features/user-account/ui/DangerZone.tsx` | features | uses `deactivateAccount` and `deleteAccount` |

## Risks / Trade-offs

- The protecting tests stub `fetch`, so they see the same calls; no mock path moves. If a protecting test fails, the build stops and reports it instead of changing an assertion.
