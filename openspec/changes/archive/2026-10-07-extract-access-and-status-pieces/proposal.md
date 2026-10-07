# Proposal

## Why

The protected-route gate and the write-status pieces are duplicated across feature slices: `add-user-account` (merged in `develop`) owns `SessionGate`, `StepUpNotice`, `FormStatus` and `LoadingStatus`, and `add-offering-management` owns its own `ManagementGate`. FSD forbids feature-to-feature imports, so `add-coffeeshop-location` would write a third copy of each (backlog R11). The pieces take only texts and callbacks — no business data — so one copy in `src/shared/ui` serves the account, the management area and the next protected screen.

## What Changes

- Five shared pieces appear in `src/shared/ui`: a session gate that renders the consumer's loading node while the session resolves, the consumer's signed-out node while it is anonymous, the application's not-found page for a signed-in user the route does not allow and the content for an allowed one; a signed-out prompt (message and a "Sign in" action); and the loading status, the form status and the step-up notice, moved unchanged except that the step-up notice's return route moves to its consumer.
- The account (`src/pages/account`, `src/pages/register`, `src/features/user-account`) and the management screens (`src/pages/manage-offerings`, `src/pages/new-offering`, `src/features/offering-management`) switch to the shared pieces; the feature copies, their exports and their tests are removed, and the tests move to `src/shared/ui` with the route assertions staying at the consumers.
- **Nothing the user sees or hears changes**: same elements, roles, classes, texts, focus and calls in every state of every consumer.
- **BREAKING** for the two feature public APIs only: `src/features/user-account/index.ts` stops exporting `SessionGate`, `StepUpNotice`, `FormStatus`, `LoadingStatus` and their prop and text types, and `src/features/offering-management/index.ts` stops exporting `ManagementGate` and `ManagementGateTexts`. Nothing outside those slices imports them today, and the pages switch in the same change.

## Out of scope (non-goals)

- Management's inline step-up (small button inside the form's or dialog's single alert region) stays as it is: only the account's step-up notice is shared (Open 2, option a). Unifying the two presentations would change what users see and hear and is not a refactor.
- `EvaluationsAccess` of `add-specialist-evaluations` is excluded (Open 1, option c): that change has not merged into `develop` and this change does not wait for it. A follow-up backlog candidate moves that gate onto the shared one; it is listed in the Propose status, not done here.
- `AccountSection`, `DangerZone`, `RoleRow` and `ExternalLink` stay in `src/features/user-account`: they are account-specific, not generic pieces.
- The 422 per-field mapping (backlog R8) and the feature-to-feature import inside `features/manage-evaluations` are reported, not fixed here.
- No message catalog key, token, route, contract operation, dependency or API change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: one ADDED requirement, "Protected content gate" — the three-state contract of a protected view's access gate and its signed-out prompt, worded from the behaviour the account and management gates already satisfy.
- `feedback`: one ADDED requirement, "Request status messages" — the loading status, the form status and the step-up notice, worded from the behaviour the moved pieces already satisfy.

## Impact

- **Code** (FSD layers): created `src/shared/ui/SessionGate.tsx`, `src/shared/ui/SignedOutPrompt.tsx`, `src/shared/ui/LoadingStatus.tsx`, `src/shared/ui/FormStatus.tsx`, `src/shared/ui/StepUpNotice.tsx` and their tests, exported from `src/shared/ui/index.ts` (shared); removed `src/features/user-account/ui/{SessionGate,StepUpNotice,FormStatus,LoadingStatus}.tsx` with their tests and `index.ts` lines (features) and `src/features/offering-management/ui/ManagementGate.tsx` with its test and `index.ts` lines (features); rewired `src/pages/account/ui/AccountClient.tsx`, `src/pages/register/ui/RegisterClient.tsx`, `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, `src/pages/new-offering/ui/NewOfferingForm.tsx` (pages) and `src/features/user-account/ui/{ProfileForm,PasswordForm,RegisterForm,DangerZone}.tsx` (features).
- **Tests**: the gate and prompt cases move to `src/shared/ui`, restated against props; the loading and form status cases move unchanged; the step-up notice's route case becomes a callback case at the piece and a route case at each consumer; consumer tests keep or gain the sign-in route and 404 cases. No test is removed or weakened.
- **Dependencies, contract, texts**: none added, none changed. Every consumer keeps its current catalog keys.
- **Ordering**: the apply runs after `add-offering-management` merges (it owns `ManagementGate`) and after `adopt-section-card-in-account` (both edit `AccountClient.tsx`); `add-coffeeshop-location`'s apply waits for this change.
- **Consumers unblocked**: `add-coffeeshop-location` and every later protected screen, which reuse the shared gate and status pieces instead of copying them.
