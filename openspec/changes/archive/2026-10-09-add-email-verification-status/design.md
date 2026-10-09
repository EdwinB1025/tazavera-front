## Context

Backlog R66, front part (Product owner, 2026-10-09). `SessionUser` (`src/shared/api/index.ts`) is `data` of `GET /user`, which now carries `emailVerifiedAt?: string | null`. `ProfileDetails` (`src/features/user-account/ui/`) renders the read-only rows from its `ROWS` table; `SecuritySection` (`src/pages/account/ui/`) renders "Change password" and a `ul` of two `ExternalLink`s to `{NEXT_PUBLIC_API_URL}/user/security`. `AccountReadView` has the session user and renders both.

## Goals / Non-Goals

**Goals:** show the email verification state in the read-only Profile and in the Security section; offer the API's verification page while the email is unverified.

**Non-Goals:** handling `?verified=1`; any change to tokens, the session, the auth flow or the API contract; new tokens, colours, icons, dependencies or routes.

## Decisions

### D1. The Profile verification row

`ProfileDetails` keeps its `ROWS` table and adds, right after the email row, one `LabelValueRow` with label `emailVerificationLabel` and value `emailVerified` ("Verified") when `user.emailVerifiedAt` is a string, `emailNotVerified` when it is `null`, and no row when it is `undefined`. The texts reach it in `ProfileDetailsTexts`, like the other labels.

### D2. The Security verification entry

`SecuritySection` gains a prop `emailVerifiedAt?: string | null`, passed by `AccountReadView` from `user.emailVerifiedAt`; it does not read the session. The first `li` of its list is: when `null`, an `ExternalLink` to `${NEXT_PUBLIC_API_URL}/email/verify` with text `verifyEmail`; when a string, the plain text `emailVerifiedStatus`; when `undefined`, no `li`. The conditional stays inside the one list (no boolean prop switching render trees).

### D3. Texts

New keys in `messages/{es,en,ca}/account.json`, passed by `AccountScreen`:

| Key | es | en | ca |
|---|---|---|---|
| `emailVerificationLabel` | Verificación del correo | Email verification | Verificació del correu |
| `emailVerified` | Verificado | Verified | Verificat |
| `emailNotVerified` | Sin verificar | Not verified | Sense verificar |
| `verifyEmail` | Verificar el correo | Verify email | Verificar el correu |
| `emailVerifiedStatus` | Correo verificado | Email verified | Correu verificat |

`securityDescription` also names email verification. The copy is proposed and pending Product owner's review.

### D4. The return from the API

Fortify redirects to `/{locale}/account?verified=1` with a full page load; the session reloads `GET /user`. The account page reads only `edit`, so `verified=1` is ignored and needs no code.

## Risks / Trade-offs

- If `GET /user` ever omits `emailVerifiedAt`, both places show nothing for it (by design).
