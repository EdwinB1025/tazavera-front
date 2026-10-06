# Design — add-specialist-evaluations

## Context

See `proposal.md` for the motivation and `specs/evaluations/spec.md` for the behaviour. The state that shapes the approach:

- `contracts/openapi.yaml` on this branch (commit `84e29fe`) carries the `/user/evaluations` operations (`listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation`) with `createdAt` and `closedAt` on the evaluation resource, plus the public `getAnOffering` and `listOlfactoryTaxonomies`. The older public evaluation reads and the `legacy.*` write routes are not used by this change.
- `add-auth` is merged: `useSession()`, `signIn(route)` and the `request` client with its `401` recovery chain live in `src/features/auth` / `src/shared/api`. Tokens exist only in browser memory, so no authenticated read can run on the server.
- `add-landing` and the extracted parts are merged: `Card`, `Badge`, `Button`, `Link`, `Field`, `Select`, `Checkbox`, `Textarea`, `PageSection`, `Pagination`, `fetchTaxonomies`, `buildTaxonomyLookup` and `ratingTierFor`. `OfferingCard` still takes a `session` prop until `replace-offering-card-session` lands its actions slot.
- `add-evaluation-scales` (bean scale, intensity slider, `DescriptorChipGroup`, `ConfirmDialog`) is not built yet. The apply starts only after `add-evaluation-scales` and `replace-offering-card-session` are merged into `develop` and `develop` into this branch (Product owner, 2026-10-06).
- Layout and spacing end states are settled in `docs/design/add-specialist-evaluations/design-summary.md` §2, §3, §4 and §9 (from the MVC views and the D14 page layout); the response-state table is its §6 and the catalog areas its §10. This document records the decisions that turn those end states into code.

## Goals / Non-Goals

**Goals:**

- One evaluation slice family that owns the workflow end to end (list, form, read-only view, writes) and reads every rule from pure functions that Vitest can test.
- Reuse only settled primitives; no new token, no new shared control beyond the `SidebarMenuButton` link form the sidebar entry needs.
- Every evaluation read and write on the client through the add-auth `request` client; every public read on the server when its key is known at request time, on the client only where it depends on client-fetched data.

**Non-Goals:**

- Server rendering of evaluation data (impossible with in-memory tokens) and a read-only view for non-owners (the API answers `404`).
- The list filter, the scale and chip controls, the confirmation dialog's own behaviour, and the `OfferingCard` actions slot (other changes, per the proposal's out-of-scope list).
- Field-level `422` mapping (backlog R8): any `422` shows the generic failure message.

## API endpoints consumed

All request and response shapes are typed from `src/shared/api/schema.ts` (see "Derived types"); nothing in the contract is invented. "Token" means `Authorization: Bearer <access token>` sent by `request` (`src/shared/api/client.ts`), which recovers a `401` with one refresh and one retry before the add-auth recovery runs.

| # | Method and path | `operationId` | Auth | Request | Response | Errors in the contract |
|---|---|---|---|---|---|---|
| 1 | `GET /user/evaluations` | `listMyEvaluations` | Token, `specialist`, `profile:read` (the plain sign-in token; no `profile:write`, no step-up) | Query `page`, `orderBy=created_at`, `orderDirection=desc` (the settled default order). The remaining query fields (`coffeeId`, `locationId`, `city`, `process`, `status`, `scoreMin`, `scoreMax`, `orderBy`, `orderDirection`) belong to `add-filter-controls` and are never sent here | `200 {data: EvaluationItem[], meta: {current_page, last_page, per_page: 15, total}}` | none documented |
| 2 | `GET /user/evaluations/{evaluation}` | `getMyEvaluation` | Token, `specialist`, `profile:read` or `profile:write` | Path `evaluation` (ULID) | `200 {data: EvaluationItem}` | `404` — unknown, or another user's |
| 3 | `POST /user/evaluations` | `createAnEvaluation` | Token, `specialist` | JSON body: `offeringId` (required ULID), `extractionMethod` (nullable string, max 60), `descriptive` (required: `roastLevel` required, one of `light`, `medium_light`, `medium`, `medium_dark`, `dark`; `fragrance`, `aroma`, `flavor`, `aftertaste`, `mouthfeel` = `{score 0–15 or null, note string or null, cata ULID[]}`; `acidity`, `sweetness` = `{score, note}` (no `cata`); `mainTastes: ULID[]`), `affective` (required: `overall`, `fragrance`, `aroma`, `flavor`, `aftertaste`, `acidity`, `sweetness`, `mouthfeel` = `{score 1–9 or null, note}`; `defects: ULID[]`), `extrinsics` (nullable: `farming`, `processing`, `trading`, `certifications`, `generalObservation`, all nullable strings). `status` exists in the body and is never sent: the evaluation is created `open` | `201 {data: EvaluationItem, message}` | none documented |
| 4 | `PUT /user/evaluations/{evaluation_ulid}` | `updateAnEvaluation` | Token, `specialist`, ownership (policy) | Same body as `createAnEvaluation` minus `offeringId`, which is prohibited; `descriptive` and `affective` required | `200 {data: EvaluationItem, message}` | `403` not the owner, `409` already closed |
| 5 | `PATCH /user/evaluations/{evaluation_ulid}/close` | `closeAnEvaluation` | Token, `specialist`, ownership | Path `evaluation_ulid`; no request body | `200 {message}` (idempotent: an already closed evaluation also answers `200`) | `403` not the owner, `409` incomplete (all 15 scores > 0 and one descriptor for main tastes, mouthfeel and the aromatic set) |
| 6 | `DELETE /user/evaluations/{evaluation_ulid}` | `deleteAnEvaluation` | Token, `specialist`, ownership | Path `evaluation_ulid`; no request body | `200 {message}` | `403` not the owner |
| 7 | `GET /offerings/{offering_ulid}` | `getAnOffering` | Public (`security: []`) — sent with `publicRequest` | Path `offering_ulid` (ULID) | `200 {data: <offering>}` (fields used: `ulid`, `coffeeInventory.coffee.name`, `coffeeInventory.coffee.roastLevel`, `coffeeInventory.roastery.name`, `location.name`) | none documented (an unknown offering is answered `404` by the API) |
| 8 | `GET /taxonomies` | `listOlfactoryTaxonomies` | Public (`security: []`) | none | `200 {data: TaxonomyNode[]}` (`ulid`, `level`, `nameEs`, `nameEn`, `nameCa`, `color`, `categories`, `children`) | none documented |

### How each error is presented

| Status | Where | Presentation (one catalog text per status; the API `message` strings are never shown) |
|---|---|---|
| `401` | any token request | The add-auth client's recovery chain (refresh, then silent re-authentication or sign-out); this change shows nothing |
| `403` | `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` | The "not yours" message beside the actions (form) or in the confirmation dialog (delete); no retry and no sign-in request (Product owner, 2026-10-06) |
| `404` | `getMyEvaluation`, `getAnOffering` | The 404 page (an evaluation of another user is indistinguishable from an unknown one, as the API intends) |
| `409` | `updateAnEvaluation` | The "already closed" message beside the actions; no retry |
| `409` | `closeAnEvaluation` | The "incomplete" message beside the actions, and the incomplete groups are highlighted |
| `422` | `createAnEvaluation`, `updateAnEvaluation` | The generic failure message beside the actions (decisions log: any `422` shows the generic form error; field mapping is backlog R8) |
| Network failure or `5xx` | every operation | Loads: the failure message with a retry action in the content's place. Writes: the generic failure message beside the actions; nothing is resent automatically |
| Empty `data` | `listMyEvaluations` | The empty message in the list's place |

## Derived types

Declared before any component (they are the first task). Named aliases are exported from `src/shared/api/index.ts`, built from `operations` in `src/shared/api/schema.ts`, which is never edited; UI-specific types live in their slice and are declared before the component that uses them.

From `src/shared/api/index.ts` (derived, generated types untouched):

- `EvaluationItem` — one item of `listMyEvaluations` `data` (`NonNullable<…["data"]>[number]`); the `data` of `getMyEvaluation`, `createAnEvaluation` and `updateAnEvaluation` has the same shape and reuses it.
- `EvaluationPageMeta` — `meta` of `listMyEvaluations` (`current_page`, `last_page`, `per_page`, `total`).
- `EvaluationDescriptive`, `EvaluationAffective`, `EvaluationExtrinsics`, `EvaluationTaste` — the blocks of `EvaluationItem` (`tastes` items are `{ref, type}`).
- `EvaluationCreateBody`, `EvaluationUpdateBody` — the request bodies of `createAnEvaluation` and `updateAnEvaluation` (`EvaluationUpdateBody` is the create body without `offeringId`).
- `OfferingDetail` — `data` of `getAnOffering` (the fields of `OfferingSummary` this change reads, from the detail operation).

UI-specific types (in their slices, before the components): `EvaluationFormState` and `AxisKey`, `PartKey`, `DescriptorBlockKey`, `GroupDefinition` (`src/pages/evaluation-form` and `src/entities/evaluation/model`), `EvaluationRowTexts`, `EvaluationFormTexts`, `EvaluateLinkTexts`, `SidebarEntryTexts`.

## Card field mapping

| Card | Section | API field |
|---|---|---|
| List row (`Card` `layout="default"`) | `CardAside` score row | `cuppingScore` in `type-score`, the "/100" scale in `type-meta`, and `Badge` with the tier word of `ratingTierFor(cuppingScore)` (`rating-exceptional` ≥ 90, `rating-excellent` ≥ 85, `rating-good` ≥ 80, `rating-commercial` < 80; the words of the four rating variants, as the offering card shows them). Absent `cuppingScore` renders no `CardAside` content: no score, no scale, no badge |
| List row | `CardContent` | The status badge (`status` `open` → `Badge` `provisional`, `closed` → `Badge` `verified`, catalog labels "Open"/"Closed"); the coffee name in `type-card-heading` (`coffeeInventory.coffee.name` of the row's offering); the date in `type-meta` directly below the coffee name ("Created on" `createdAt` when open, "Closed on" `closedAt` when closed); the coffeeshop and roaster captions in `type-label` (`location.name`, `coffeeInventory.roastery.name` of the offering) |
| List row | `CardFooter` | Edit (open) or View (closed) and Delete — the row actions, not data |
| Form group card (`Card` `layout="stacked"`) | `CardAside` | The group name and its completeness indicator (UI text, not API data) |
| Form group card | `CardContent` | The descriptive and affective parts: `descriptive.{axis}.score`/`note`/`cata`, `descriptive.mainTastes`, `affective.{axis}.score`/`note`, `affective.defects`, `extrinsics.generalObservation` |
| Form context card (`Card` `layout="stacked"`, `CardContent` only) | `CardContent` | `descriptive.roastLevel` (prefilled from `coffeeInventory.coffee.roastLevel`) and `extractionMethod` |
| Offering card (`OfferingCard`, landing) | actions slot | `EvaluateLink` with the offering's `ulid` (its `Evaluate` action targets `/{locale}/manage/evaluations/new?offering={ulid}`) |

## Files

Next.js route files go in the root `app/` folder and only import screens from `src/pages/`. Tests live next to the file they test. The async server wrappers (`EvaluationsListScreen`, `NewEvaluationScreen`, `EvaluationScreen`) stay thin — they resolve the catalog and the public reads and render the client components — because Vitest cannot test async Server Components.

### Created

| Path | FSD layer | Holds |
|---|---|---|
| `app/[locale]/manage/evaluations/page.tsx` | app (Next.js routing) | Passes `params.locale` to `EvaluationsListScreen`; no logic |
| `app/[locale]/manage/evaluations/new/page.tsx` | app (Next.js routing) | Passes `params.locale` and `searchParams.offering` to `NewEvaluationScreen`; no logic |
| `app/[locale]/manage/evaluations/[ulid]/page.tsx` | app (Next.js routing) | Passes `params.locale` and `params.ulid` to `EvaluationScreen`; no logic |
| `src/entities/evaluation/index.ts` | entities | Public API: the six calls and the model functions and types |
| `src/entities/evaluation/api/user-evaluations.ts` (+ `user-evaluations.test.ts`) | entities | `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` through `request` (D1) |
| `src/entities/evaluation/model/groups.ts` (+ `groups.test.ts`) | entities | The eight groups, their axes, parts and descriptor block keys (`GroupDefinition`) |
| `src/entities/evaluation/model/body.ts` (+ `body.test.ts`) | entities | `EvaluationFormState` → `EvaluationCreateBody`/`EvaluationUpdateBody` (shared `cata` pairs, `mainTastes`, `defects`, `extrinsics.generalObservation`, the fragrance copy of D9) |
| `src/entities/evaluation/model/load.ts` (+ `load.test.ts`) | entities | `EvaluationItem` → `EvaluationFormState`, `tastes` `{ref, type}` → blocks (D7) |
| `src/entities/evaluation/model/completeness.ts` (+ `completeness.test.ts`) | entities | The completeness rule of D10 over the form state |
| `src/entities/offering/api/offering.ts` (+ `offering.test.ts`) | entities | `fetchOffering` (`getAnOffering` via `publicRequest`), distinguishing found, not-found and failed (D1) |
| `src/features/evaluate-offering/index.ts`, `ui/EvaluateLink.tsx` (+ `EvaluateLink.test.tsx`) | features | The session-aware `Evaluate` link of D6 |
| `src/features/manage-evaluations/index.ts` | features | Public API of the area's chrome |
| `src/features/manage-evaluations/ui/EvaluationsSidebarEntry.tsx` (+ `EvaluationsSidebarEntry.test.tsx`) | features | The "My evaluations" sidebar entry of D5 |
| `src/features/manage-evaluations/ui/EvaluationsAccess.tsx` (+ `EvaluationsAccess.test.tsx`) | features | The access gate of D13 (loading wait, anonymous message with the Sign in button, 404 for another role) |
| `src/pages/evaluations-list/index.ts` | pages | Public API of the list screen |
| `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx` | pages | Async thin wrapper: `getMessages("evaluations", locale)` and `EvaluationsList` |
| `src/pages/evaluations-list/ui/EvaluationsList.tsx` (+ `EvaluationsList.test.tsx`) | pages | The client list: fetch, states, rows, `Pagination`, delete |
| `src/pages/evaluations-list/ui/EvaluationRowCard.tsx` (+ `EvaluationRowCard.test.tsx`) | pages | One row card (the card field mapping above) |
| `src/pages/evaluations-list/ui/DeleteEvaluationAction.tsx` (+ `DeleteEvaluationAction.test.tsx`) | pages | The delete flow through `ConfirmDialog` (D4) |
| `src/pages/evaluation-form/index.ts` | pages | Public API of the form screen |
| `src/pages/evaluation-form/ui/NewEvaluationScreen.tsx` | pages | Async thin wrapper for `/new`: server reads of D1, `notFound()` for an unknown offering, renders `EvaluationForm` |
| `src/pages/evaluation-form/ui/EvaluationScreen.tsx` | pages | Async thin wrapper for `/{ulid}`: the server read of D1, renders `EvaluationDetail` |
| `src/pages/evaluation-form/ui/EvaluationDetail.tsx` (+ `EvaluationDetail.test.tsx`) | pages | Client load of `getMyEvaluation` and its offering (loading, failure, 404), then `EvaluationForm` |
| `src/pages/evaluation-form/ui/EvaluationForm.tsx` (+ `EvaluationForm.test.tsx`) | pages | The form state and tree of D3, read-only when closed (D4) |
| `src/pages/evaluation-form/ui/EvaluationGroupCard.tsx` (+ `EvaluationGroupCard.test.tsx`) | pages | One CVA group card: the collapsible header with the indicator (D15), descriptive and affective parts |
| `src/pages/evaluation-form/ui/DescriptorBlock.tsx` (+ `DescriptorBlock.test.tsx`) | pages | One descriptor block over the taxonomy tree (D7) |
| `src/pages/evaluation-form/ui/NoteField.tsx` (+ `NoteField.test.tsx`) | pages | "Add note" / remove-note and the note `Field` (D14) |
| `src/pages/evaluation-form/ui/FormActions.tsx` (+ `FormActions.test.tsx`) | pages | Save draft and Close evaluation (variants per D14), the `role="status"` region, sticky bar below `md` and actions row from `md` |
| `src/pages/evaluation-form/ui/CompletenessIndicator.tsx` (+ `CompletenessIndicator.test.tsx`) | pages | "Complete" with `Check` / "Incomplete" text (D10) |
| `messages/es/evaluations.json`, `messages/en/evaluations.json`, `messages/ca/evaluations.json` | shared (message catalogs) | The catalog area `evaluations` (D14) |

### Modified

| Path | FSD layer | Change |
|---|---|---|
| `src/shared/api/index.ts` | shared | The derived aliases of "Derived types"; `schema.ts` untouched |
| `src/shared/ui/Sidebar.tsx` (+ `Sidebar.test.tsx`) | shared | `SidebarMenuButton` gains its link form (`asChild`, D5) |
| `src/app/shell/SessionShell.tsx` (+ `AppShell.test.tsx`) | app | Fills `AppSidebar`'s `entries` region with the area's entries for the session's role (D5) |
| `src/entities/offering/index.ts` | entities | Exports `fetchOffering` |
| `src/widgets/offering-list/ui/OfferingList.tsx` (+ `OfferingList.test.tsx`) | widgets | Supplies `EvaluateLink` through the actions slot; its `session` prop and specialist check go (D6) |
| `src/pages/home/ui/HomeScreen.tsx` (+ `HomeScreen.test.tsx`) | pages | Supplies `EvaluateLink` through the actions slot; its `session` prop goes (D6) |

## Decisions

**D1 — Where each read runs.** Every `/user/evaluations` call runs on the client through `request` (the token is in browser memory). The public reads run on the server and arrive as props when their key is known at request time: the new form's `getAnOffering` (the `offering` query value) and the form's `listOlfactoryTaxonomies`; the edit page's `listOlfactoryTaxonomies` likewise. Two reads stay on the client because their keys come from client data: the list's per-row `getAnOffering` (keys come from `listMyEvaluations`) and the edit page's `getAnOffering` (the key is `data.offeringId` of the evaluation). Alternatives: everything on the client (violates the settled data-loading rule for public reads) or everything on the server (impossible for the token requests). The thin async server wrappers fetch and pass props; all logic lives in testable client components and pure functions (Vitest cannot test async Server Components).

**D2 — Slices.** `src/entities/evaluation` owns the evaluation data and rules: the six `/user/evaluations` calls (`api/`) and the pure model (`model/`): the eight groups and their axes and parts, the write-body builder, the read-to-state mapping, the `tastes` mapping and the completeness rule. `src/entities/offering` gains the `getAnOffering` read (`api/offering.ts`) beside its card and rating rule. `src/features/evaluate-offering` owns `EvaluateLink`; `src/features/manage-evaluations` owns the management-area chrome this change contributes — the sidebar entry `EvaluationsSidebarEntry` and the access gate `EvaluationsAccess` (D13) that every evaluation route renders around its content. `src/pages/evaluations-list` and `src/pages/evaluation-form` own the two screens and their UI parts. Alternatives: one `features/evaluation-crud` slice for the write flows (rejected: the flows are inseparable from the screens that hold the state, and the rules they need are already the entity's model) and a `widgets` layer between pages and features (rejected: each screen is one self-contained composition and nothing is shared between the two screens that would justify a block).

**D3 — Form state.** One client form component tree holds the whole form in one state object (`EvaluationFormState`: per axis and part `{score, note}` plus the descriptor selections and the open/closed note flags). All conversions are pure functions in `src/entities/evaluation/model` and are what the tests assert: state → `EvaluationCreateBody`/`EvaluationUpdateBody`, `EvaluationItem` → state, `tastes` → blocks, state → completeness. The screens only wire data and actions to those functions.

**D4 — Write sequence.** Save draft sends `createAnEvaluation` the first time (with `offeringId`) and `updateAnEvaluation` afterwards (without it); on the first success the route is replaced with `/{locale}/manage/evaluations/{ulid}` through the router (no reload) and a `role="status"` region beside the actions shows the saved confirmation. Close evaluation saves first, then sends `closeAnEvaluation`; on success the screen switches to the read-only presentation and the status region shows the closed confirmation. Delete sends `deleteAnEvaluation` from the row's `ConfirmDialog` (`title`, `description`, `confirmLabel`, `cancelLabel`, `pending`, `error` — `add-evaluation-scales` §5); on success the row is removed and the list reloads. The form is `noValidate`; before sending, the only client validation is the contract's required `descriptive.roastLevel`, with the catalog message under its field (decisions log: browser validation of documented `requestBody` rules).

**D5 — Sidebar entry (no `@sidebar` slot).** The management sidebar's `entries` region (`AppSidebarProps.entries`, the app-shell spec seam "the navigation entries come from the capability that owns the management area in view") is filled by `SessionShell` with the entries of the management area for the session's role — the same role rule the user menu uses (`UserMenu.tsx:115-120`): `specialist` → one entry "My evaluations" (`Link` to `/{locale}/manage/evaluations`, marked `aria-current="page"` on the list route), `coffeeshop` → none (this change contributes nothing for it). The entry is `SidebarMenu > SidebarMenuItem > SidebarMenuButton asChild > Link`, so `SidebarMenuButton` gains its link form (shadcn's `asChild`), which also fixes F5. The label reuses the shell catalog key `manageEvaluations` (the user menu's word; no new key). Alternatives: the `@sidebar` parallel-route slot of `add-filter-controls` (rejected by Product owner's answer to Q2: no dependency on that slot) and each screen drawing its own sidebar column (rejected: it contradicts the app-shell region). Note for Product owner: `add-offering-management` plans to deliver its entries through the slot; the two answers can coexist (its entries arrive through the slot, this one through the `entries` seam) but leave two mechanisms until one is retired.

**D6 — EvaluateLink and the card.** `EvaluateLink` (`src/features/evaluate-offering`) reads `useSession()` and renders the `Evaluate` link only for `role === "specialist"`, targeting `/{locale}/manage/evaluations/new?offering={ulid}` with the `ulid` the card's actions slot passes it. `src/widgets/offering-list` and `src/pages/home` supply it through the actions slot `replace-offering-card-session` builds, and their remaining `session` props and `OfferingList`'s specialist check go away with that change's tests updated. The entity keeps no auth knowledge.

**D7 — Descriptors and `tastes`.** Each block filters the `GET /taxonomies` tree by `categories` (`aromatics`, `main_tastes`, `mouthfeel`, `defects`) over levels 0 and 1 exactly as `specs/evaluations/spec.md` states. On send, a shared aromatic block is written as `cata` on both axes of its pair, the mouthfeel block as `descriptive.mouthfeel.cata`, main tastes as `descriptive.mainTastes` and defects as `affective.defects`. On read, `tastes` `{ref, type}` is mapped back by the `type` value as the contract reports it: `main_tastes`, `mouthfeel`, `defects` to their block, and `aroma` or `fragrance` to the fragrance/aroma block, `flavor` or `aftertaste` to the flavor/aftertaste block (either axis restores the shared selection). The contract declares `type` as a plain string and its examples show only `defects`, `main_tastes`, `flavor`, `aroma` and `mouthfeel`; the missing values are reported to the API as a documentation gap (non-blocking).

**D8 — Unset scores and bounds.** The intensity sliders are 0–15 and start at 0, sending 0 (Product owner's answer to Open 4: shown and sent as 0, flagged by the completeness indicator). The preference bean scales are 1–9 and start unset, sending `null` for `score` (0 is not in the contract's 1–9 bounds). Bounds are the scales' own; this change adds no bounds validation and an API `422` shows the generic failure message (R8 for field mapping).

**D9 — "Fragrance not evaluated".** A `Checkbox` at the top of the Fragrance / Aroma body, unchecked on load (for a new form and a loaded draft alike). While checked, the fragrance controls of both parts are disabled and, on send, the fragrance `score` of each part takes the aroma `score` of that part (the shared aromatic selection already travels on both axes; the disabled fragrance note sends its empty value). The completeness rule counts the group's fragrance scores as satisfied while the option is checked, because the close request will receive the aroma values.

**D10 — Completeness rule.** A pure function over the form state, per Product owner's answer to Q5: a score group is complete when every score of the group is > 0 (`descriptive` 0 and `affective` `null` are unset); the aromatic-set descriptor requirement is one requirement shared by the Fragrance / Aroma and Flavor / Aftertaste groups; the Flavor / Aftertaste group additionally requires one main tastes descriptor and the Mouthfeel group one mouthfeel descriptor (the other two close requirements); Defects and Extrinsic have no indicator. The indicator is "Complete" with the `Check` icon (already in `icons.ts`) or "Incomplete" as text alone — never colour alone. A `409` on close highlights exactly the groups this function reports incomplete.

**D11 — Roast level read gap.** `getMyEvaluation` does not return `descriptive.roastLevel` while both writes require it. The control is prefilled from the offering's `coffeeInventory.coffee.roastLevel` for a new form and a loaded draft alike, and the control's value is sent on every write. If the offering's roast changes after a draft was saved, the form shows and sends the offering's current value. The read gap is reported to the API (risk below).

**D12 — Extraction method.** A choice among the nine MVC values (`espresso`, `v60`, `chemex`, `aeropress`, `french_press`, `moka`, `cold_brew`, `siphon`, `kalita` — `EvaluationForm.php:114`), each shown with its catalog label and sent as its value. The contract takes a free string (max 60), so a loaded value outside the nine is shown as-is as one more option (its raw value as the label) and is sent back unchanged.

**D13 — Access control.** `EvaluationsAccess` (`src/features/manage-evaluations`) wraps every evaluation route's content: while the session is `loading` it waits; `anonymous` shows the message with the "Sign in" button that calls `signIn(currentRoute)` inside the click (popup; the visitor stays on the route); an authenticated user whose role is not `specialist` gets the 404 page, as does an unknown `offering` or `{ulid}`. The routes themselves are ordinary `app/[locale]/manage/evaluations` routes; the app-shell sidebar already appears on `/manage/*` for an authenticated session.

**D14 — Layout and texts.** The layout end states of the summary §9 are implemented with the settled primitives: `PageSection surface="page"` (container, padding and gaps per D14) around each screen's content; one `Card layout="stacked"` for the context card and per CVA group (1rem between cards), the group header in `CardAside`, the parts in `CardContent` (two equal columns 1.5rem apart from `md` with a `border-subtle` divider, stacked below); the score and descriptor panels on `surface-section` with `border-subtle` and 1rem padding; the group header as the collapse toggle at every viewport (D15); the sticky actions bar below `md` and the actions row with `border-subtle` from `md`; the list rows `Card layout="default"` with 1rem between cards; `Pagination` below the list with `path` `/{locale}/manage/evaluations`. Button variants (Open 2, settled): Close evaluation `primary`, Save draft and Edit/View `action-3`, Delete `action-2`; Confirm and Cancel follow `add-evaluation-scales`' dialog. "Add note" and the remove-note control are `Link`-styled buttons (`type-body`, `text-link`); the remove-note control is built in this change (the note label, control and error treatment come from `Field`). All interface text arrives as props from the new catalog area `evaluations` (`messages/{es,en,ca}/evaluations.json`): page texts (list heading, form eyebrow, back link, coffeeshop and roaster captions), header field labels and the nine extraction labels and placeholder, the eight group names, the part headings, the four descriptor block labels, the "Fragrance not evaluated — use aroma values" label, "Complete"/"Incomplete", "Add note"/"Remove note"/note label and the extrinsic notes label, the scale texts passed to the `add-evaluation-scales` controls (LOW/MEDIUM/HIGH, "/15", "/9", the accessible names per axis), the actions (Save draft, Close evaluation, Edit, View, Delete, Previous, Next, Sign in) and the delete dialog's four texts, the status labels "Open"/"Closed" and the date labels "Created on"/"Closed on", and the messages (saved, closed, not yours, already closed, incomplete, generic failure, empty list, load failure). Roast level values, extraction values in transit, taxonomy names, coffee, coffeeshop and roaster names and scores are data, never catalog text. The sidebar entry label reuses `shell.manageEvaluations`.

**D15 — Collapsible groups (review round 1).** Each CVA group card adopts the shared collapsible section of content-structure (`Collapsible`, `CollapsibleHeader`, `CollapsibleBody` from `@/shared/ui`, as `add-collapsible-section` built it) at every viewport, replacing the toggle below `md` and the static header from `md`; the form's structure is unchanged (group order, `Card layout="stacked"`, the actions). Composition, per that change's consumer guidance (its summary §6.3): `Collapsible` wraps the `Card`, `CollapsibleHeader` sits inside `CardAside` with the group name as its title (`headingLevel` 3, keeping the group name a level-3 heading) and the completeness indicator as its `aside`, and `CollapsibleBody` wraps `CardContent`. The chevron, `aria-expanded`, `aria-controls`, the focus ring and the animation are the shared component's; the group card draws no chevron or toggle of its own, and the header's accessible name is the group name, with the indicator as its description. End states:
- Initial state: in an editable form (new or open evaluation) every group starts collapsed; in a closed evaluation every group starts expanded. When a successful close turns the form into the read-only view, every group expands, as a closed evaluation starts.
- Header spacing: 1rem in total from the card's edges to the header's content on every side, `CardAside`'s own padding reduced to 0.5rem around the header's own 0.5rem (option of `add-collapsible-section` Open 2, approved by the orchestrator).
- Collapsed card: only the header row shows; `CardAside`'s separating bottom border is not drawn while the body is collapsed and is drawn while it is expanded.
- Validation: a `409` on close expands every group the completeness rule (D10) reports incomplete, collapsed ones included, so its highlight and its unset controls are in view; groups reported complete keep their state. The roast level's validation message is in the context card, which is not collapsible, so saving changes no group's state.
- `src/shared/ui/Collapsible.tsx` is consumed as built; no new token, icon export or dependency.


- **`tastes[].type` is not enumerated in the contract** (plain string; examples cover 5 of the 7 values the API stores) → the mapping accepts either axis of a pair and the tested values are the contract's reported ones; the gap is reported to the API. If the API reports another value, the selection is silently dropped from the loaded form → the write restores it from what the user re-selects; acceptable for a draft workflow, and tracked with the report.
- **`descriptive.roastLevel` is missing on reads** → prefilled from the offering (D11): if the offering's roast level changes after a draft was saved, the form shows and sends the new value. Reported to the API as the symmetric-resource gap; the front change that follows a fix is small (fill from the read when present).
- **Up to 15 `getAnOffering` calls per list page** (one per row; distinct `offeringId`s only) → acceptable at 15 rows per page; the alternative (embedding the offering in the evaluation resource) is an API change and stays on the API's backlog.
- **The sidebar entry wiring touches `src/app/shell/SessionShell.tsx` and `src/shared/ui/Sidebar.tsx`** (shared seam) → minimal surface: one prop pass choosing the entries by the role rule the user menu already uses, and the `asChild` link form of one control. `add-offering-management` may later bring the `@sidebar` slot for its entries; flagged to Product owner in D5.
- **`add-evaluation-scales`' control names are referenced from its summary** (`DescriptorChipGroup`, `ConfirmDialog`; the two scales by description) → imports follow the names that change exports at merge time; the props used are its settled ones (values, `readOnly`, labels as props; `ConfirmDialog` `title`, `description`, `confirmLabel`, `cancelLabel`, `pending`, `error`).
- **Undocumented `422` and `403` on creation** → the generic failure message and the "not yours" message cover them without inventing error formats; R8 owns the field mapping.

## Migration Plan

None: the change adds routes and screens and migrates no data. It is additive and rolls back by reverting the merge. The apply starts after `add-evaluation-scales` and `replace-offering-card-session` are merged into `develop` and `develop` is merged into this branch (Product owner, 2026-10-06).

## Open Questions

- **The 1–9 scale legend (review round 1, correction 1).** The correction asks for the 1–9 scale legend to use the collapsible section, but this change's form has no 1–9 legend and no artifact defines one (its title, the nine labels and their catalog texts, its place in the form); adding it would change the form's structure, which the same correction keeps unchanged. Pending Product owner: the legend's content and position, or its removal from the correction. No task covers it until then.

Otherwise none. The two API documentation gaps (`tastes[].type` values, the missing `descriptive.roastLevel` on reads) are reported to the API and do not change the specs, this approach or the task breakdown.
