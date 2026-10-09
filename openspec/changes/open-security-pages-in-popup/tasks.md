## 1. Security section entries open in a popup window (user-account)

- [x] 1.1 Add to the "AccountClient — Security section" block of `src/pages/account/ui/AccountClient.test.tsx` one test per new scenario, stubbing `window.open`: "An API entry opens in a popup window" (for "Verify email", "Two-factor authentication" and "Passkeys", a `fireEvent.click`: `window.open` is called with the link's URL, `"tazavera-security"` and `"popup"`, the click's default is prevented and `fetch` is not called); "The popup window is blocked" (`window.open` returns `null` for the popup: it is called next with the URL, `"_blank"` and `"noopener"`, and the click's default is prevented); "The popup window closes" (with fake timers, the popup's `closed` turns `true`: after advancing the timers `refreshProfile` is called once, and not before). Existing tests keep their assertions. Verify: the three new tests fail only because the entries do not open a popup yet; the rest pass; `npx tsc --noEmit` and `npm run lint` report no errors.
- [ ] 1.2 Implement design.md D1–D4. Protecting tests: `AccountClient.test.tsx`, `AccountScreen.test.tsx`, `PasswordScreen.test.tsx`, `AppHeader.test.tsx`. Verify: `npx vitest related` on the changed files passes; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. Full checks

- [ ] 2.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: the validation suite passes; the QA suite fails only in files that also fail on `origin/develop`; no typecheck or lint errors; the build succeeds.
