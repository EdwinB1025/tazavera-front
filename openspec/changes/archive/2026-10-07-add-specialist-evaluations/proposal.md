# Proposal

## Why

A signed-in specialist has no place in the front end to record the sensory evaluations of an offering. The API serves the workflow through the authenticated `/user/evaluations` operations and the landing page's Evaluate action already promises the entry point. This change builds the specialist evaluation workflow: create, edit, close, list and delete the signed-in user's own evaluations with the SCA CVA Combined Form adapted to the contract.

## What Changes

- Three routes: `/{locale}/manage/evaluations` (the "My evaluations" list), `/{locale}/manage/evaluations/new?offering={ulid}` (the CVA combined form for a new evaluation) and `/{locale}/manage/evaluations/{ulid}` (the same form for an existing one — editing an open evaluation, reading a closed one).
- The screens consume the authenticated specialist operations `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation` and `deleteAnEvaluation` (`/user/evaluations…`, only the token user's evaluations) and the public reads `getAnOffering` and `listOlfactoryTaxonomies`.
- The CVA combined form: roast level and extraction method, the eight CVA groups (Fragrance/Aroma, Flavor/Aftertaste, Acidity, Sweetness, Mouthfeel, Overall, Defects, Extrinsic) with a descriptive intensity slider and an affective bean scale per axis, shared descriptor blocks fed from `GET /taxonomies`, optional notes per axis and part, the "Fragrance not evaluated — use aroma values" option, a per-group completeness indicator, and the Save draft and Close evaluation actions.
- The list rows show the evaluation's `cuppingScore` with its "/100" and rating badge (the tier word), the status badge, the coffee name, the date of the row's state (`createdAt` for an open evaluation, `closedAt` for a closed one) and the offering's coffeeshop and roaster captions, with Edit (open) or View (closed) and Delete with an explicit confirmation, and Previous/Next pagination (15 per page, `created_at` descending).
- The Evaluate action on an offering card becomes session-aware: `EvaluateLink`, supplied to the card's actions slot, renders it only for a signed-in specialist and points at the new form; the remaining `session` props leave the widget and the page.
- The management sidebar gains the specialist area's one entry, "My evaluations", pointing at the list.
- New message catalog area `evaluations` (`messages/{es,en,ca}/evaluations.json`).

### Out of scope (non-goals)

- The evaluations list filter (facets, score range, order controls): `add-filter-controls`.
- The bean scale, intensity slider, descriptor chip group and confirmation dialog: `add-evaluation-scales`.
- The `OfferingCard` actions slot itself: `replace-offering-card-session`; this change only supplies `EvaluateLink` to it.
- The non-uniform cup and defective cup counts, the four extrinsic fields `farming`, `processing`, `trading` and `certifications`, and taxonomy level 2.
- Read-only views of other users' evaluations (the API answers `404`), the evaluations of a user other than the token user (`GET /users/{user}/evaluations`), and the provisional-evaluation tab of the offering detail.

## Capabilities

### New Capabilities

- `evaluations`: the specialist evaluation workflow — the CVA combined form (draft and close), the read-only view of a closed evaluation, the "My evaluations" list with its row actions and pagination, the delete confirmation, the failure messages of the operations, and the Evaluate entry point on an offering card.

### Modified Capabilities

None. The landing requirement "Offering card content" already specifies that the Evaluate link renders for a signed-in specialist, which the session-aware link now meets, and the app-shell requirement "Management sidebar" already delegates the entries to the capability that owns the management area in view.

## Impact

- **API contract** (`contracts/openapi.yaml`, read-only): `listMyEvaluations`, `getMyEvaluation`, `createAnEvaluation`, `updateAnEvaluation`, `closeAnEvaluation`, `deleteAnEvaluation` (authenticated, `specialist`), `getAnOffering` and `listOlfactoryTaxonomies` (public).
- **Dependencies (consumed, not changed)**: `add-auth` (`useSession`, `signIn`, the `request` client and its `401` recovery), `add-evaluation-scales` (bean scale, intensity slider, `DescriptorChipGroup`, `ConfirmDialog`), `replace-offering-card-session` (the `OfferingCard` actions slot), and the existing `PageSection`, `Pagination`, `Card`, `Badge`, `Button`, `Link`, `Field`, `Select`, `Checkbox`, `Textarea`, `fetchTaxonomies` and `buildTaxonomyLookup`. The apply starts only after `add-evaluation-scales` and `replace-offering-card-session` are merged into `develop` and `develop` into this branch.
- **New code**: `src/entities/evaluation`, `src/features/evaluate-offering`, `src/features/manage-evaluations`, `src/pages/evaluations-list`, `src/pages/evaluation-form`, the route files `app/[locale]/manage/evaluations/page.tsx`, `app/[locale]/manage/evaluations/new/page.tsx` and `app/[locale]/manage/evaluations/[ulid]/page.tsx`, and `messages/{es,en,ca}/evaluations.json`.
- **Modified code**: `src/shared/api/index.ts` (named aliases for the evaluation operations), `src/entities/offering` (the `GET /offerings/{ulid}` read and its export), `src/app/shell/SessionShell.tsx` (the sidebar entries of the management area in view), `src/shared/ui/Sidebar.tsx` (`SidebarMenuButton` link form), `src/widgets/offering-list` and `src/pages/home` (the actions slot consumption and the removed `session` props), and their tests.
- **Tests**: Vitest + React Testing Library component and rule tests for every new piece; the existing `OfferingList` and `HomeScreen` cases that pass a `session` are updated with the slot.
