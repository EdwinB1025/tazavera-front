No derived API types are needed: the change reads `data.ulid`, already in `SessionUser`, and sends no new request.

## 1. The account's Security links name the user (user-account)

- [x] 1.1 Tests in `src/pages/account/ui/AccountClient.test.tsx` (validation suite); the fixture `USER` has `ulid: "u1"`:
  - Scenario "Two-factor authentication and passkeys" (existing test "shows its description and external same-tab links to {APP}/user/security …"): update only the expected `href` to `${APP}/user/security?login_hint=u1`.
  - Scenario "Verifying the email" (existing test "while the email is unverified lists a same-tab Verify email link …"): update only the expected `href` to `${APP}/email/verify?login_hint=u1`.
  - Popup scenarios (existing `ENTRIES` of "AccountClient — Security section popup" and the blocked-popup test's expected `${APP}/email/verify`): update only the expected addresses to carry `?login_hint=u1`.
  - New test, scenario "No user identifier in the session": an authenticated session whose user has no `ulid` and `emailVerifiedAt: null`; assert the `href` of "Verify email" is `${APP}/email/verify` and of "Two-factor authentication" and "Passkeys" is `${APP}/user/security`.
  Verify: the updated tests fail on the missing `login_hint`; the new test passes already (today's behaviour), which is expected; `npm run lint` passes.
- [x] 1.2 Implement design.md D1 (`apiWebPageUrl(path, loginHint?)` in `src/shared/api/web-pages.ts`) and D2 for the account: `SecuritySection` takes `ulid?: string` and passes it to both addresses; `AccountReadView` and `AccountEditView` pass `ulid={user.ulid}`. Verify: `npx vitest related` on the changed files passes, 1.1 included, with no other assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 2. The user menu's Security entry names the user (app-shell)

- [ ] 2.1 Tests in `src/widgets/app-header/ui/AppHeader.test.tsx` (validation suite); the fixture `USER` has `ulid: "01M35F5RX4ADGC3CSDXXYB08DD"`:
  - New test, scenario "The security entry names the signed-in user": open the menu; assert the security entry's `href` is `https://tazavera.test/user/security?login_hint=01M35F5RX4ADGC3CSDXXYB08DD`.
  - New test, scenario "No user identifier in the session": a session user without `ulid`; open the menu; assert the security entry's `href` is `https://tazavera.test/user/security`.
  - Existing tests "renders the security entry as an external link, natively" and "opens the security entry in a popup window on a plain click …": update only the expected address to carry `?login_hint=01M35F5RX4ADGC3CSDXXYB08DD`.
  Verify: the new "names the signed-in user" test and the two updated tests fail on the missing `login_hint`; the new "No user identifier" test passes already, which is expected; `npm run lint` passes.
- [ ] 2.2 Implement design.md D2 for the header: `UserMenu` builds `apiWebPageUrl("/user/security", user.ulid)`. Verify: `npx vitest related` on the changed files passes, 2.1 included, with no other assertion edited; `npx tsc --noEmit` and `npm run lint` report no errors.

## 3. Full checks

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa`, `npx tsc --noEmit`, `npm run lint` and `npm run build`. Expected: all pass, with three new tests. A QA test that fails only because one of these links now carries `login_hint` gets only that expected address updated and is listed in the final report; any other failure is fixed in its own `fix(<capability>): …` commit or, outside this change, reported.
