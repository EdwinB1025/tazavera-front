# Design

## Context

See `proposal.md` — Why. The product decisions are settled in `docs/design/extract-access-and-status-pieces/design-summary.md` (Status: approved), whose note under the title closes Open 1 as (c) and Open 2 as (a); D1–D8 below record the end states that follow from it. The constraints that shape the approach:

- The code being moved lives in `src/features/user-account/ui/` on `develop` (`SessionGate.tsx`, `StepUpNotice.tsx`, `FormStatus.tsx`, `LoadingStatus.tsx`) and, for the management gate, on `feature/add-offering-management` (`8168634`, `src/features/offering-management/ui/ManagementGate.tsx`), read with `git show origin/feature/add-offering-management:<path>`.
- **This change's apply runs after `add-offering-management` merges into `develop`** (it owns `ManagementGate`), and after `adopt-section-card-in-account` (both edit `AccountClient.tsx`; R11 moves the gate with the frame that change leaves). `add-coffeeshop-location`'s apply waits for this change (location summary Open 4, closed).
- **`EvaluationsAccess` is excluded** (Open 1, option c): `add-specialist-evaluations` has not merged into `develop`, so its third gate copy stays untouched here and a follow-up backlog entry moves it onto the shared gate (recorded in the Propose status). Management's inline step-up stays as it is (Open 2, option a).
- FSD: a layer imports only from layers below, never between slices of one layer; `shared` is business-agnostic and split into segments (`ui`, `api`, `lib`, `config`); `Session` and `SessionUser` are exported from `src/shared/api` (derived from `UserResponse` of the generated `schema.ts`), and shared → shared imports are allowed.
- Every `src/shared/ui` file with a handler or hook starts with `"use client"` (`src/shared/ui/client-boundary.test.ts`); icons come only from `src/shared/ui/icons`; texts reach every component as props from the message catalogs, so no text key moves.
- The feature requirements stay unchanged: user-account "Account page and its session gate" and "Writes and the step-up", management "Access to the management area", evaluations "Sign-in to the evaluation routes".

## Goals / Non-Goals

**Goals:**

- One copy of the protected-route gate and of the three write-status presentations in `src/shared/ui`, taking texts and callbacks only — no text, route, role name or API data of their own — so the account, the management area and `add-coffeeshop-location` share them.
- Nothing the user sees or hears changes: same elements, roles, classes, texts, focus and calls in every state of every consumer.
- Every test kept: cases move with their subject and the route assertions stay at the consumers.

**Non-Goals:**

- No unification of management's inline step-up with the shared notice (a visible change, Open 2 (b) not taken).
- No shared-card field mapping: the gate's nodes carry no API fields, so the card field mapping rule does not apply.
- No generalisation beyond the five settled prop shapes: no generic "access page", no session reading inside `shared`, no role enumeration in `shared`.
- No change to any endpoint call, catalog key, token, route or dependency.

## Decisions

### D1 — The shared gate and prompt (`app-shell`)

`src/shared/ui/SessionGate.tsx` is the three-state switch of every protected view; `src/shared/ui/SignedOutPrompt.tsx` is the visible signed-out block each consumer passes it. Each file declares its UI-specific prop types before its component. `Session` and `SessionUser` come from `@/shared/api`.

`SessionGate`:

| Prop | Type | Use |
|---|---|---|
| `session` | `Session` | the injected session (the pages read it with `useSession` and pass it, user-account D1, management D6) |
| `loading` | `ReactNode` | rendered while `session.state === "loading"` (account: its card with the loading status; management: `SkeletonGrid` or the disabled form) |
| `signedOut` | `ReactNode` | rendered while `anonymous` (each consumer passes `SignedOutPrompt`, framed or not) |
| `allows` | `(user: SessionUser) => boolean`, optional | when given and false for the signed-in user, the gate renders the application's 404 (`notFound()`); absent → every signed-in user passes (account) |
| `children` | `(user: SessionUser) => ReactNode` | rendered for an allowed signed-in user |

- `"use client"` (it is rendered from client compositions and calls `notFound` from `next/navigation`; the build confirms the directive against `client-boundary.test.ts`).
- Renders no element of its own in any state: no wrapper, padding, margin, gap, border or radius. Layout belongs to what the consumer passes.
- Behaviour per state is exactly today's: the anonymous branch never redirects and calls no navigation; the role check is the consumer's predicate (management `role === "coffeeshop"`, location `role === "coffeeshop"`), so no role name lives in `shared`.

`SignedOutPrompt`:

| Prop | Type |
|---|---|
| `text` | `string` — the signed-out message |
| `signInLabel` | `string` — the button text |
| `onSignIn` | `() => void` — called synchronously inside the click (the popup must open within the activation) |

- Render: a `div` `flex flex-col items-start gap-4`: `p.type-body` (text), then `Button variant="primary"` default size (`base`), `type="button"`, text `signInLabel`. Values: column, 1rem gap, button at its own width, start-aligned; no padding, border, radius or fill (`ManagementGate` `SIGNED_OUT_CLASSES`, `EvaluationsAccess` `MESSAGE_CLASSES`).
- Account: the same visible block. Today the account's button sits in a `flex flex-wrap gap-3` row instead of `items-start`; with a single button both render it at its own width at the start of the column, so nothing visible changes. The account's `CardContent` loses its `flex flex-col gap-4` classes (the prompt carries them).
- `"use client"` (click handler).

### D2 — The shared status presentations (`feedback`)

`src/shared/ui/LoadingStatus.tsx`, `src/shared/ui/FormStatus.tsx` and `src/shared/ui/StepUpNotice.tsx`, each with its UI-specific prop types declared before its component. Two move unchanged; the notice loses its route.

| Piece | Props | Render (unchanged from user-account) |
|---|---|---|
| `LoadingStatus` | `text: string` | `role="status"` row `flex items-center justify-center gap-2`: `Loader2` `size-4 motion-safe:animate-spin` `aria-hidden`, then `span.type-meta` |
| `FormStatus` | `kind: "success" \| "error"`, `text: string`; type `FormStatusKind` | `error` → `p.type-error` `role="alert"`; `success` → `role="status"` row `flex items-start gap-2`: `Check` `size-4 shrink-0` `aria-hidden`, `span.type-body` |
| `StepUpNotice` | `text: string`, `actionLabel: string`, `onConfirm: () => void` | `span` `flex flex-col items-start gap-3`: `span.type-body` `role="alert"` (text), then `Button variant="primary"` `size="base"` `type="button"` (actionLabel). Phrasing elements only, so it still sits inside `ConfirmDialog`'s error paragraph in `DangerZone` |

- `LoadingStatus` is server-safe (no handler, no hook): no directive needed unless the guard says otherwise. `FormStatus` likewise. `StepUpNotice` carries `"use client"` (click handler).
- The `locale` prop and the hard-coded `/{locale}/account` route leave `StepUpNotice` (a route is business data): `ProfileForm`, `PasswordForm` and `DangerZone` pass `onConfirm={() => requestProfileWrite(\`/${locale}/account\`)}`, and `add-coffeeshop-location` will pass its own return route. `onConfirm` is called synchronously inside the click.
- Contrast: every element keeps its current tokens on its current surface (`type-body`, `type-meta`, `type-error`, `Button primary` on `surface-card` and `surface-page`), all registered on `develop`. No new pair.

### D3 — Consumers and what changes in each

| File | Change |
|---|---|
| `src/pages/account/ui/AccountClient.tsx` | `SessionGate` from `@/shared/ui` with `loading={<Card><CardContent><LoadingStatus text={texts.loading} /></CardContent></Card>}` and `signedOut={<Card><CardContent><SignedOutPrompt text={texts.signedOutText} signInLabel={texts.signIn} onSignIn={() => signIn()} /></CardContent></Card>}`; no `allows`. The card variant is the one `adopt-section-card-in-account` leaves (section card without a band; its Open 1, closed (b)) |
| `src/pages/register/ui/RegisterClient.tsx` | `LoadingStatus` from `@/shared/ui` |
| `src/features/user-account/ui/{ProfileForm,PasswordForm,RegisterForm,DangerZone}.tsx` | `FormStatus` and `StepUpNotice` from `@/shared/ui`; `StepUpNotice` gets `text`, `actionLabel`, `onConfirm` (D2). Their `*Texts` types keep `stepUpText` / `stepUpButton` (the account catalog keys do not change) |
| `src/features/user-account/ui/{SessionGate,StepUpNotice,FormStatus,LoadingStatus}.tsx` (+ tests) and their lines in `src/features/user-account/index.ts` | removed |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx`, `src/pages/new-offering/ui/NewOfferingForm.tsx` | `SessionGate` from `@/shared/ui` with their current `loading` node, `signedOut={<SignedOutPrompt text={texts.signedOutMessage} signInLabel={texts.signInLabel} onSignIn={() => signIn(route)} />}` and `allows={(user) => user.role === "coffeeshop"}` |
| `src/features/offering-management/ui/ManagementGate.tsx` (+ test) and its lines in `src/features/offering-management/index.ts` | removed; `ManagementGateTexts` is replaced by the two text keys the pages already pass (the page `*Texts` types keep `signedOutMessage` / `signInLabel`) |
| `src/pages/new-offering/ui/NewOfferingForm.tsx`, `src/features/offering-management/ui/DeleteOfferingsDialog.tsx` step-up areas | unchanged (Open 2, option a): management keeps its inline form — small button, text without its own role inside the single `role="alert"` region |
| `src/features/manage-evaluations/ui/EvaluationsAccess.tsx` | **excluded** (Open 1, option c): `add-specialist-evaluations` has not merged, so its gate copy stays as it is; the follow-up backlog entry moves it onto the shared gate and prompt |

### D4 — Files created or modified

Tests live beside the file they test.

**Created** (all `shared` layer):

| Path | Holds |
|---|---|
| `src/shared/ui/SessionGate.tsx` | the gate (D1) |
| `src/shared/ui/SessionGate.test.tsx` | its cases (D6) |
| `src/shared/ui/SignedOutPrompt.tsx` | the prompt (D1) |
| `src/shared/ui/SignedOutPrompt.test.tsx` | its cases (D6) |
| `src/shared/ui/LoadingStatus.tsx` | moved (D2) |
| `src/shared/ui/LoadingStatus.test.tsx` | moved unchanged (D6) |
| `src/shared/ui/FormStatus.tsx` | moved (D2) |
| `src/shared/ui/FormStatus.test.tsx` | moved unchanged (D6) |
| `src/shared/ui/StepUpNotice.tsx` | moved and re-propped (D2) |
| `src/shared/ui/StepUpNotice.test.tsx` | moved and re-stated (D6) |

**Modified**

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/ui/index.ts` | shared | append the five exports and their prop type exports |
| `src/shared/ui/index.test.tsx` | shared | one smoke render per new export; every other case stays |
| `src/pages/account/ui/AccountClient.tsx` | pages | D3 |
| `src/pages/account/ui/AccountClient.test.tsx` | pages | stays green unchanged (D6) |
| `src/pages/register/ui/RegisterClient.tsx` | pages | D3 |
| `src/features/user-account/ui/ProfileForm.tsx` | features | D3 |
| `src/features/user-account/ui/PasswordForm.tsx` | features | D3 |
| `src/features/user-account/ui/RegisterForm.tsx` | features | D3 |
| `src/features/user-account/ui/DangerZone.tsx` | features | D3 |
| `src/features/user-account/ui/{ProfileForm,PasswordForm,DangerZone}.test.tsx` | features | keep their `requestProfileWrite("/es/account")` cases (D6) |
| `src/features/user-account/index.ts` | features | drop the four removed pieces and their types |
| `src/pages/manage-offerings/ui/ManageOfferingsPanel.tsx` | pages | D3 (after `add-offering-management` merges) |
| `src/pages/new-offering/ui/NewOfferingForm.tsx` | pages | D3 (after `add-offering-management` merges) |
| `src/pages/{manage-offerings,new-offering}/ui/*.test.tsx` | pages | keep or gain the sign-in route and 404 cases (D6) |
| `src/features/offering-management/index.ts` | features | drop `ManagementGate` and `ManagementGateTexts` |

**Removed**

| Path | FSD layer | Why |
|---|---|---|
| `src/features/user-account/ui/{SessionGate,StepUpNotice,FormStatus,LoadingStatus}.tsx` | features | replaced by the shared pieces |
| `src/features/user-account/ui/{SessionGate,StepUpNotice,FormStatus,LoadingStatus}.test.tsx` | features | their cases live in `src/shared/ui` since D6 |
| `src/features/offering-management/ui/ManagementGate.tsx` | features | replaced by the shared gate and prompt |
| `src/features/offering-management/ui/ManagementGate.test.tsx` | features | its cases live in `SessionGate.test.tsx` and `SignedOutPrompt.test.tsx` |

No root `app/` route file changes: this change moves pieces, not screens. `src/shared/api/schema.ts` and `contracts/openapi.yaml` stay untouched.

### D5 — Tests (design-summary §6)

No test is removed or weakened; cases move with their subject.

- **`src/shared/ui/SessionGate.test.tsx`** (`next/navigation` mocked so `notFound()` can be observed), restated against props: renders `loading` and nothing else ("while loading …", `ManagementGate.test` "renders the loading branch … with no gate message"); renders `signedOut` and no content ("while anonymous …"); renders `children(user)` with the session user ("while authenticated renders its content with the session user", `ManagementGate.test` "passes the signed-in user to the content" and "renders the content for a signed-in coffeeshop"); with `allows` false calls `notFound()` once and renders no content (`ManagementGate.test` the 404 cases); with no `allows` any signed-in role passes.
- **`src/shared/ui/SignedOutPrompt.test.tsx`**: "lays the signed-out branch out as a column 1rem apart, the button at its own width" (the root carries exactly `flex flex-col items-start gap-4`, the message `type-body`); text and button from props; `onSignIn` called once with no arguments, asserted right after the click (synchronously) with no navigation (from `SessionGate.test` "Sign in calls the injected signIn once …" and `ManagementGate.test` "calls signIn with the current route synchronously …").
- **`src/shared/ui/LoadingStatus.test.tsx`, `FormStatus.test.tsx`**: moved unchanged.
- **`src/shared/ui/StepUpNotice.test.tsx`**: "renders its text as an alert and its button from props" unchanged (the button keeps `bg-action-primary`); "Confirm identity calls requestProfileWrite once with /{locale}/account" becomes "calls `onConfirm` once with no arguments, asserted right after the click".
- **Consumer tests keep or gain the route assertions** that leave the components: `ProfileForm.test`, `PasswordForm.test`, `DangerZone.test` assert that "Confirm identity" calls `requestProfileWrite("/es/account")` (all three have the case today); `ManageOfferingsPanel.test`, `NewOfferingForm.test` assert sign in with their route and the 404 for a non-coffeeshop (added where missing); `AccountClient.test` ("while loading shows the loading status in place of the sections", the signed-out case, the authenticated sections) stays green unchanged.
- **Keep green:** the whole suite, `client-boundary.test.ts` (the new files with handlers start with `"use client"`), `color-guard`, `focus-guard`, `radius-guard`, `icons.test.ts`, `index.test.tsx`, `theme-tokens.test.ts` (unchanged), lint, typecheck and `npm run build`.

### D6 — API endpoints consumed and how errors reach the user

The five shared pieces send no request and consume no endpoint: the session arrives as a `Session` prop and writes stay in the consumers. The files this change rewires consume their endpoints exactly as today:

| Endpoint | Auth | Request | Response | Errors presented to the user |
|---|---|---|---|---|
| `POST /register` (`registerAUser`) | none (no credentials) | `name`, `surname`, `email`, `password`, `passwordConfirmation`, `role` | `201` | `422`, server error, network failure or any other status → the generic form-level error above the actions; the API's message is never rendered |
| `PUT /users/{ulid}` (`updateAUser`) | Bearer, current token | `name`, `surname`, `email` | `200` | `403` → the step-up notice; `422`, server error, network failure or any other status → the generic form-level error |
| `PUT /users/{ulid}/password` (`updateUserPassword`) | Bearer, current token | `currentPassword`, `password`, `passwordConfirmation` | `200` | `403` → the step-up notice; anything else → the generic form-level error |
| `DELETE /users/{ulid}` (`deactivateAUser`) | Bearer, current token | — | `200` → sign out | `403` → the step-up notice inside the open dialog; server error or network failure → the generic error inside the dialog, with retry |
| `DELETE /users/{ulid}/force` (`permanentlyDeleteAUser`) | Bearer, current token | — | `200` → sign out | `403` → the step-up notice inside the open dialog; server error or network failure → the generic error inside the dialog, with retry |
| The management flows' operations (`listOfferings`, `createOfferings`, `deleteAnOffering`, `deleteMultipleOfferings`, `listMyLocations`) | Bearer, current token | unchanged | unchanged | unchanged — only the gate wiring above them changes |

No card in this change maps API fields to card sections (the gate's nodes hold only catalog texts), so the shared-card field mapping rule is not applicable.

### D7 — Spec deltas

Two ADDED requirements, worded from the behaviour the pieces already satisfy and adding none (precedent `extract-offering-list-parts`, ADDED "Pagination"): `specs/app-shell/spec.md` — "Protected content gate" (scenarios: session resolving, anonymous visitor, signing in from the gate, role the route does not allow, allowed signed-in user, the gate adds no text of its own); `specs/feedback/spec.md` — "Request status messages" (scenarios: loading status, form status success, form status error, step-up notice, consumer text only). The feature requirements named in Context stay unchanged.

## Risks / Trade-offs

- **`ManagementGate` comes from a branch that has not merged** — the moved content is `feature/add-offering-management` (`8168634`)'s, and the apply runs after the merge. → If the merged file differs from `8168634`, the moved copy is the merged one: the end states of D1–D3 are what is fixed, and the build verifies the moved classes against the merged text first.
- **Two changes edit `AccountClient.tsx`** (`adopt-section-card-in-account` and this one). → Sequential application, adoption first (Context); the gate's card frame is whatever the adoption leaves.
- **Shared file with parallel changes** — `src/shared/ui/index.ts` and `index.test.tsx` (append-only). → Each change adds its own export lines and smoke renders; a textual conflict in the same block resolves by keeping both sides.
- **The behavioural contract now lives in both the feature specs and the new app-shell/feedback requirements** (design-summary §3.6 keeps the feature requirements unchanged). → The deltas state the generic contract only and name no consumer, so the two wordings cannot drift apart on a specific screen.
- **Reported, not fixed here:** `features/manage-evaluations/ui/EvaluationsAccess.tsx` imports `@/features/auth` (feature → feature, against AGENTS.md "Architecture"). → Observation for Product owner (design-summary §7): a backlog entry or an unplanned fix in `add-specialist-evaluations` before its archive.

## Migration Plan

A pure refactor: no data, request, route, catalog or behaviour to migrate. Rollback is reverting the change: the feature slices restore their own copies and the five shared files and their exports disappear together. The two feature public-API removals (**BREAKING**) are internal to the repository and land together with their consumers' rewiring, so no commit leaves a broken import.

## Open Questions

None.
