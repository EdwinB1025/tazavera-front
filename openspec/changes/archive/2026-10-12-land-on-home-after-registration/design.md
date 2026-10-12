## Context

See proposal.md (Why) and backlog entry R78, whose settled end state this design implements. Current state:

- `src/pages/register/ui/RegisterClient.tsx` (pages, client component) is the client region of both registration routes. When the session becomes authenticated it calls the App Router's `router.replace` with a destination held in a ref: `/{locale}` by default, or `/{locale}/account` once `signInWithToken` has started a registration sign-in through `signInWithRegistration` from `@/features/auth` (decision D4 of the archived change `sign-in-after-registration`). The ref is reset when the token block does not sign the user in, so the success panel path keeps working.
- `src/pages/register/ui/RegisterClient.test.tsx` holds the validation test of the scenario "Signed in by the registration".

API endpoints: none added or changed. `POST /register` and the token block it returns are consumed as today by `RegisterForm` (`@/features/user-account`) and `signInWithRegistration`; errors are presented as today. No derived API type is needed.

## Goals / Non-Goals

**Goals:** R78's end state: after a registration sign-in, `/{locale}` opens through `router.replace` (client-side navigation).

**Non-Goals:** no change to `RegisterForm`, `signInWithRegistration`, the success panel, the error paths, other routes, texts, tokens or dependencies.

## Decisions

### D1 — One destination for every authenticated session

`RegisterClient` opens `/{locale}` through `router.replace` whenever the session is authenticated, whether it already was or the registration signed the user in. The destination ref and its reset are removed, and the `signInWithToken` prop passed to `RegisterForm` hands the token block to `signInWithRegistration` and returns its result, as today. The doc comment and the inline comment that describe the account destination are updated to the new behaviour. Keeping a second destination equal to the first would leave dead state with no observable effect.

The navigation stays client-side (`useRouter` from `next/navigation`, `replace`), so the in-memory tokens survive; no full page load is introduced.

## Risks / Trade-offs

- [Validation test of "Signed in by the registration"] → it changes only its expected destination (task 1.1); no other assertion, query or structure changes.
- [QA test `qa/src/pages/register/ui/RegisterClient.test.tsx`] → it asserts no registration sign-in destination and is expected to pass unchanged; a QA test that fails only because it expects `/{locale}/account` after a registration sign-in gets only that destination changed and is listed in the build's final report.
