# Tasks

Every updated case queries the control by role `button` instead of `link` and asserts its navigation as a `router.push` call with the destination the link had (the app router mocked as in `EvaluateLink.test.tsx`); no other assertion changes and no test is added.

## 1. Tests (test-first, one commit per capability)

- [x] 1.1 `offering-catalog`: update `OfferingDetailScreen.test.tsx`, `OfferingDetailContent.test.tsx`, `CoffeeshopDetailScreen.test.tsx`, `CoffeeshopDetailContent.test.tsx` (back controls) and `DetailHeader.test.tsx` ("View evaluations", "Evaluate") — verifying they fail only because the controls are still links
- [x] 1.2 `evaluations`: update `EvaluationForm.test.tsx` (header and bottom back, Cancel), `FormActions.test.tsx` if it queries Cancel as a link, and `EvaluationSheetView.test.tsx` (back controls) — verifying they fail only because the controls are still links
- [x] 1.3 `user-account`: update `PasswordScreen.test.tsx` (back) and `RegisterClient.test.tsx` / `RegisterForm.test.tsx` (Cancel) — verifying they fail only because the controls are still links
- [x] 1.4 `offering-management`: update `NewOfferingForm.test.tsx` (Cancel) and the New offering screen's test if it queries the back link — verifying they fail only because the controls are still links
- [x] 1.5 `base-controls`: update `BackLink.test.tsx` ("No previous page": the button navigates to the fallback) — verifying it fails only because the control is still a link

## 2. Implementation (one commit per capability)

- [x] 2.1 `base-controls`: `RouteButton` takes an optional `icon` passed to `Button`; `BackLink` renders `RouteButton` (`action-3`, `sm`, `ArrowLeft`) pushing the previous page or the fallback — verifying `BackLink.test.tsx` and the back cases of 1.1–1.3 pass, lint and typecheck exit 0
- [x] 2.2 `offering-catalog`: `DetailHeader` renders "View evaluations" and "Evaluate" as `RouteButton`s (`action-3`, `sm`), same destinations and order — verifying the 1.1 tests pass, lint and typecheck exit 0
- [x] 2.3 `evaluations`: `EvaluationFormHeader` and the read-only `EvaluationForm` render the back as `RouteButton` (`action-3`, `sm`, `ArrowLeft`); `FormActions` renders Cancel as `RouteButton` (`action-4`, `base`) in a `self-center` wrapper — verifying the 1.2 tests pass, lint and typecheck exit 0
- [x] 2.4 `user-account`: `RegisterForm` renders Cancel as `RouteButton` (`action-4`, `base`) under the submit — verifying the 1.3 tests pass, lint and typecheck exit 0
- [ ] 2.5 `offering-management`: `NewOfferingForm` renders Cancel as `RouteButton` (`action-4`, `base`) after the submit and `NewOfferingScreen` renders its back as `RouteButton` (`action-3`, `sm`, `ArrowLeft`) — verifying the 1.4 tests pass, lint and typecheck exit 0

## 3. Integration verification

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa` (only failures also present on `origin/develop`), `npx tsc --noEmit`, `npm run lint` and `npm run build`, each on its own
