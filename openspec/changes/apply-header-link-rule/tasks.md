# Tasks

Every updated case queries a header back control by role `link` and asserts its `href`, and queries an end back control, "View offering" or "New offering" by role `button` and asserts its navigation as a `router.push` call with the same destination; no other assertion changes and no test is added. `qa/` tests are not edited.

## 1. Tests (test-first, one commit per capability)

- [x] 1.1 `base-controls`: update `src/shared/ui/BackLink.test.tsx` ("No previous page": the link's `href` is the fallback) — verifying it fails only because the control is still a button
- [x] 1.2 `offering-catalog`: update `OfferingDetailScreen.test.tsx` (skeleton back → link), `OfferingDetailContent.test.tsx` (top back → link in "Back link", "Detail on the page background" and "Error and retry"; "Back link at the end": top link and end button), `CoffeeshopDetailScreen.test.tsx` (skeleton back → link) and `CoffeeshopDetailContent.test.tsx` (top back → link in "Back link" and the error case; "Back link at the end": top link and end button) — verifying they fail only because of the controls' roles
- [x] 1.3 `evaluations`: update `EvaluationSheetView.test.tsx` ("View offering" → button pushing `/en/offerings/01JOFFERA` and absent as a button when there is no offering; "Back link at the end": the header's `back` link and the end's `bottomBack` button) and `EvaluationForm.test.tsx` (header back → link to `/en/manage/evaluations`; the read-only end back → button pushing it) — verifying they fail only because of the controls' roles or the missing `bottomBack` prop
- [ ] 1.4 `user-account`: update `PasswordScreen.test.tsx` ("Back to the account": link to `/es/account`) — verifying it fails only because the control is still a button
- [ ] 1.5 `offering-management`: update `ManageOfferingsPanel.test.tsx` (header "New offering" → button pushing `/en/manage/offerings/new`, absent for an anonymous visitor; the empty state shows the same "New offering" button; `listEmptyCreateLink` removed from the fixture) — verifying they fail only because the controls are still links

## 2. Implementation (one commit per capability)

- [ ] 2.1 `base-controls`: `use-back-href.ts` returns the previous page or the fallback; `BackLink` renders `Link` with variant `back`; new `BackButton` renders `RouteButton` (`action-3`, `sm`, `ArrowLeft`); both exported from `@/shared/ui` — verifying 1.1 passes, lint and typecheck exit 0
- [ ] 2.2 `offering-catalog`: `OfferingDetailContent` and `CoffeeshopDetailContent` render `BackLink` at the top and `BackButton` at the end; the screens' skeletons keep `BackLink` — verifying 1.2 passes, lint and typecheck exit 0
- [ ] 2.3 `evaluations`: `EvaluationSheetView` takes `back` (header) and `bottomBack` (end) and renders "View offering" as `RouteButton` (`action-3`, `sm`); `ViewScreen` passes a `BackLink` and a `BackButton`; `EvaluationFormHeader` renders `BackLink` and the read-only `EvaluationForm` a `BackButton`, both with fallback `/{locale}/manage/evaluations` — verifying 1.3 passes, lint and typecheck exit 0
- [ ] 2.4 `user-account`: no code change (`PasswordScreen` keeps `BackLink`, now a link) — verifying 1.4 passes
- [ ] 2.5 `offering-management`: `NewOfferingButton` renders `RouteButton` (`action-1`, `sm`) to `/{locale}/manage/offerings/new` with `newOfferingLink`, used by `ManageOfferingsPanel` and `OwnOfferingsBody`; `listEmptyCreateLink` removed from the texts and from es, en and ca; `NewOfferingScreen` renders `BackLink` with fallback `/{locale}/manage/offerings` — verifying 1.5 passes, lint and typecheck exit 0

## 3. Integration verification

- [ ] 3.1 Run `npm run test:run`, `npm run test:qa` (only failures also present on `origin/develop`), `npx tsc --noEmit`, `npm run lint` and `npm run build`, each on its own; keep the stale `qa/` copies of the tests above out of `vitest.qa.config.mts` and `tsconfig.json`
