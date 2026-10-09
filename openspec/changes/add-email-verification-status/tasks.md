No derived API types are needed: `SessionUser` already carries `emailVerifiedAt` from the regenerated schema.

## 1. Profile verification row (user-account)

- [x] 1.1 Add to `src/features/user-account/ui/ProfileDetails.test.tsx` one test per scenario: "A verified email" (`emailVerifiedAt` set: the row after the email row has the `emailVerificationLabel` label and the `emailVerified` value), "An unverified email" (`null`: same row with `emailNotVerified`), "No verification state" (absent: no `emailVerificationLabel` text); add the three new keys to the `TEXTS` fixture. Verify: the "verified" and "unverified" tests fail on the current `ProfileDetails`; the rest pass; `npx tsc --noEmit` reports only errors for the new text keys; `npm run lint` reports no errors.
- [x] 1.2 Implement design.md D1 and the D3 keys `emailVerificationLabel`, `emailVerified`, `emailNotVerified` (catalogs and `AccountScreen`). Protecting tests: `ProfileDetails.test.tsx`, `AccountScreen.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Security verification entry (user-account)

- [x] 2.1 Add to `src/pages/account/ui/AccountClient.test.tsx` one test per scenario: "Verifying the email" (`emailVerifiedAt: null`: a link named `verifyEmail` with `href` `{API}/email/verify`, no `target`, in the first `li` of the Security list, before the two-factor link), "The email is verified" (`emailVerifiedAt` set: the text `emailVerifiedStatus` in the first `li` and no `verifyEmail` link); add the new keys to the `TEXTS` fixture. Verify: both tests fail on the current `SecuritySection`; the rest pass; `npx tsc --noEmit` reports only errors for the new text keys; `npm run lint` reports no errors.
- [ ] 2.2 Implement design.md D2, the D3 keys `verifyEmail` and `emailVerifiedStatus`, and the `securityDescription` copy in the three locales. Protecting tests: `AccountClient.test.tsx`, `AccountScreen.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds.
