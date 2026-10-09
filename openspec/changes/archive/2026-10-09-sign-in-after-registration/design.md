## Context

Backlog R44, front part (Product owner, 2026-10-08; the API part is done). `POST /register` (`registerAUser`, public, no auth) answers `201` with `data` (the user), `message` and, when the API's internal registration grant succeeded, `token`: `token_type` (string), `expires_in` (integer), `access_token` (string), `refresh_token` (string), issued on the front's public client with the default scope `profile:read`. Without the block the user is still created. Any other status keeps today's meaning (generic error). The regenerated `src/shared/api/schema.ts` already types `token` (every field optional).

Today `registerUser` (`src/features/user-account/api/register.ts`) returns `ApiResult<null>`; `RegisterForm` shows `RegisterSuccessPanel` on success; `RegisterClient` (`src/pages/register/ui`) injects `signIn` and, when the session is `authenticated`, replaces the route with `/{locale}` through the App Router. Tokens live only in the `tokens` variable of `src/shared/api/tokens.ts`; `src/features/auth/model/session.ts` owns the session store and fills the seam of `../api/authorize` (`authenticated` = its `loadProfile`, `anonymous` = settle `anonymous`).

## Goals / Non-Goals

**Goals:** sign the user in with the registration's token block and open the account page; keep today's success panel as the fallback.

**Non-Goals:** `/callback`, `exchangeCode`, the PKCE flow records, the marker of the other flows, silent re-authentication, the step-up, restoring a registration sign-in after a reload; new tokens, colours, texts, dependencies or routes; any change to the contract or the generated schema.

## API endpoints

| Method and path | Auth | Request | Response used | Errors |
|---|---|---|---|---|
| `POST /register` (`registerAUser`) | none (public client) | unchanged `RegisterPayload` | `201`: `token` (`token_type`, `expires_in`, `access_token`, `refresh_token`), when present | any other status or a network failure: the generic form-level error (unchanged) |
| `GET /user` (`getTheAuthenticatedUser`) | Bearer (the kept access token) | none | `200` `data` settles the session | failure: the session ends `anonymous` and the success panel shows, no error text |

No other request: the block is kept without calling `POST /oauth/token`; the later refreshes are the existing `refreshTokens()`.

## Types

Derived in `src/shared/api/index.ts` from the generated schema:

```ts
/** `token` of the `201` of `POST /register` (`registerAUser`); every field is optional in the contract. */
export type RegistrationToken = NonNullable<
  operations["registerAUser"]["responses"][201]["content"]["application/json"]["token"]
>;
```

## Decisions

### D1. The token entry point (`src/shared/api/tokens.ts`, shared)

One new exported function, `keepRegistrationGrant(block: unknown): void`, exported from `src/shared/api/index.ts`. It accepts the block only when it is an object whose `access_token`, `token_type` and `refresh_token` are strings and whose `expires_in` is a number; it then sets the module's `tokens` to a `TokenGrant` with exactly those four fields. Anything else throws and leaves `tokens` unchanged. It writes nothing to `localStorage`, `sessionStorage` or cookies and sends no request. The one shape check lives here: the security boundary of the token memory.

### D2. The registration request (`src/features/user-account/api/register.ts`, features)

`RegisterResult` becomes `ApiResult<RegistrationToken | null>`. On `201`, `registerUser` reads the body and returns `{ ok: true, data: token }` when `body.token` is a non-null object, and `{ ok: true, data: null }` otherwise, including a body that is not JSON. It does not re-check the four fields (D1 does, and a refused block reaches the same fallback as a missing one). Every other status and a network failure stay `{ ok: false, kind: "error" }`.

### D3. The sign-in from the block (`src/features/auth/model/session.ts`, features)

`signInWithRegistration(token: RegistrationToken): Promise<boolean>`, exported from `src/features/auth/index.ts`. It lives in the session module because that module owns the seam's `authenticated` step (`loadProfile`) and the `anonymous` settle; `src/features/auth/api/authorize.ts` is already above the file limit and stays untouched. Steps: `keepRegistrationGrant(token)`; then the popup completion's post-exchange step, `loadProfile()` (`GET /user`, settling the store). It resolves `true` when the session is then `authenticated`. When D1 throws or the profile cannot be loaded it clears the tokens, settles `anonymous` and resolves `false`. It never calls `setMarker`, `saveFlow`, `holdFlow`, `clearFlow` or `releaseFlow`, and never rejects.

### D4. The register screens (`src/features/user-account/ui/RegisterForm.tsx`, features; `src/pages/register/ui/RegisterClient.tsx`, pages)

`RegisterForm` gains a required prop `signInWithToken: (token: RegistrationToken) => Promise<boolean>`; `features/user-account` does not import `features/auth`. On a `201` with a token it awaits `signInWithToken(token)` while the submit button stays in its loading state; `true` leaves the form as it is (the page navigates), `false` and a `201` without a token show the success panel as today.

`RegisterClient` composes both slices: it passes `signInWithToken` as a callback that first records `/{locale}/account` as the destination, then calls `signInWithRegistration`, and restores `/{locale}` as the destination when it resolves `false`. Its existing effect, which runs `router.replace(destination)` once the session is `authenticated`, opens the account page, so there is one navigation and no race with the `/{locale}` replace. The App Router's `replace` is a client-side navigation: the JavaScript modules, and with them the in-memory tokens, survive it. The account page's session start finds the tokens and the settled session and sends no new request.

### D5. Errors

A refused block, a failed `GET /user` and a `201` without a token block all show today's success panel, with no error text; the user signs in from "Sign in" as today. The marker is never set by this flow, so after a reload the session start finds no marker and the user is `anonymous` with no message.

## Files

| Path | Layer | Change |
|---|---|---|
| `src/shared/api/tokens.ts` | shared | `keepRegistrationGrant` (D1) |
| `src/shared/api/index.ts` | shared | exports `keepRegistrationGrant` and `RegistrationToken` |
| `src/features/auth/model/session.ts` | features | `signInWithRegistration` (D3) |
| `src/features/auth/index.ts` | features | exports `signInWithRegistration` |
| `src/features/user-account/api/register.ts` | features | returns the token block (D2) |
| `src/features/user-account/ui/RegisterForm.tsx` | features | `signInWithToken` prop (D4) |
| `src/pages/register/ui/RegisterClient.tsx` | pages | composition and destination (D4) |

## Risks / Trade-offs

- A registration sign-in does not survive a reload (accepted by Product owner, R44).
- `src/features/auth/api/authorize.ts` (306 lines) is already above the 300-line file limit; this change does not touch it.
- The destination `/{locale}/account` for both roles is pending Product owner's review.
