Type: Refactor (fast lane)

# Proposal

## Why

The four account forms send their own requests and map the response statuses inside the UI components (`ProfileForm.tsx`, `PasswordForm.tsx`, `RegisterForm.tsx`, `DangerZone.tsx`), against the rule that requests and status mapping live in the slice's `api` segment. `PasswordForm` and `RegisterForm` also carry a 33-line clone of the new-password and confirmation fields (backlog R25, technical review §3.1). The planned per-field `422` errors (R8) would otherwise land in four places.

## What Changes

- New `src/features/user-account/api/account.ts`, next to `contacts.ts` and in its style: `updateProfile`, `updatePassword`, `deactivateAccount` and `deleteAccount` send the same requests through `request` and map the status (and a network failure) to an `AccountWriteResult`.
- New `src/features/user-account/api/register.ts`: `registerUser` sends `POST /register` through `publicRequest` and maps the status (and a network failure) to a `RegisterResult`.
- `ProfileForm`, `PasswordForm`, `RegisterForm` and `DangerZone` call those functions instead of the request client and branch on the result.
- New `src/features/user-account/ui/NewPasswordFields.tsx`: the shared new-password and confirmation fields, rendered by `PasswordForm` and `RegisterForm` with identical markup.
- What users see (markup, classes, accessible names, texts, the message per status) and the requests sent to the API (method, path, body, headers) stay the same.

## Non-goals

- No per-field `422` errors (R8) and no new outcome per status.
- No change to `contacts.ts`, `ContactSection` or the request client.
- No change to the slice's public index: the new api functions and `NewPasswordFields` are used only inside the slice.
- No new tests and no changed assertions. The protecting tests stub `fetch`, so no mock path moves.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `user-account`: adds the structural property that the account forms send their requests and map the statuses through the slice's request layer, and share one new-password fields part, with behaviour unchanged.

## Impact

- Code: `src/features/user-account/api/account.ts` (new), `src/features/user-account/api/register.ts` (new), `src/features/user-account/ui/NewPasswordFields.tsx` (new), `src/features/user-account/ui/ProfileForm.tsx`, `PasswordForm.tsx`, `RegisterForm.tsx`, `DangerZone.tsx`.
- Protecting tests: `src/features/user-account/ui/ProfileForm.test.tsx`, `PasswordForm.test.tsx`, `RegisterForm.test.tsx`, `DangerZone.test.tsx` and their copies under `qa/src/features/user-account/ui/`. They stub `fetch`; the URLs, methods, bodies and headers do not change.
- APIs, dependencies: none.

## Propose status

- **Change-id:** move-account-requests-to-api
- **Date:** 2026-10-08
- **`openspec validate move-account-requests-to-api --strict`:** valid
- **Backlog entry resolved:** R25 — Move the account requests to the api segment
- **Resolved:** the backlog entry and the review row R25 settle every decision; design.md records the api functions' signatures and result types (modelled on `contacts.ts`) and the shared fields part's props.
- **Open:** nothing.
