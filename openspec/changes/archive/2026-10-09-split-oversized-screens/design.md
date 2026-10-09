# Design

Sources: `docs/review/technical-review-2026-10-09.md`, top risk 6 and Appendix B.1/B.2; the AGENTS.md Code structure rules (size limits) and FSD rules. Fast lane: no design folder.

## Context

On `develop`, `npm run lint` reports `max-lines-per-function` (> 80) and `complexity` (> 15) warnings for fifteen units of the `evaluations`, `offering-catalog`, `user-account` and `offering-management` capabilities, in the `pages`, `widgets`, `features` and `entities` layers. No file of those layers exceeds 300 lines; `EvaluationSheet.tsx` is at 295.

## Goals / Non-Goals

**Goals:** no size or complexity warning left for the units in scope; identical props, public exports, requests, DOM, class names, texts and accessible names.

**Non-Goals:** no change to the facets, the sidebars or `src/shared/`; no test added or changed; no new public export.

## API

None.

## Files

| Unit (before) | Capability | Split |
|---|---|---|
| `src/pages/evaluations-list/ui/EvaluationsList.tsx` — `EvaluationsList` (128 lines, CC 18) | evaluations | Loading, retry and row updates move to `useEvaluationsPage` in new `src/pages/evaluations-list/model/use-evaluations-page.ts` (D2); the loading placeholder and the empty state become sibling components in the same file (D3) |
| `src/pages/evaluations-list/ui/EvaluationsListScreen.tsx` — `EvaluationsListScreen` (93) | evaluations | The list texts move to a module-level function in the same file (D1) |
| `src/pages/evaluation-form/model/use-evaluation-form.ts` — `useEvaluationForm` (83) | evaluations | The failure message and the incomplete groups move to module-level functions in the same file (D4) |
| `src/pages/evaluation-form/ui/form-texts.ts` — `formTextsFrom` (96) | evaluations | The group texts move to a module-level function in the same file (D1) |
| `src/widgets/evaluation-sheet/ui/EvaluationSheet.tsx` — `EvaluationSheet` (141) | evaluations | The cards move to new `src/widgets/evaluation-sheet/ui/EvaluationSheetCards.tsx` (D3) |
| `src/widgets/evaluation-sheet/ui/EvaluationSheetView.tsx` — `EvaluationSheetView` (CC 19) | evaluations | The error state and the header block become sibling components in the same file (D3) |
| `src/entities/offering/ui/OfferingCard.tsx` — `OfferingCard` (CC 17) | offering-catalog | The captions, origin and counts move to a module-level function in the same file (D4) |
| `src/pages/coffeeshops/ui/CoffeeshopsScreen.tsx` — `CoffeeshopsScreen` (93) | offering-catalog | The list and map texts move to module-level functions in the same file (D1) |
| `src/pages/offering-detail/ui/OfferingDetailScreen.tsx` — `OfferingDetailScreen` (121) | offering-catalog | The detail texts move to a module-level function and the Suspense fallback to a sibling component, in the same file (D1, D3) |
| `src/widgets/coffeeshop-list/ui/CoffeeshopsMapView.tsx` — `CoffeeshopsMapView` (96) | offering-catalog | The map area and the small-viewport sheet become sibling components in the same file (D3) |
| `src/features/user-account/ui/RegisterForm.tsx` — `RegisterForm` (111) | user-account | State, checks and submit move to `useRegisterForm` in new `src/features/user-account/model/use-register-form.ts` (D2) |
| `src/features/user-account/ui/PasswordForm.tsx` — `PasswordForm` (105) | user-account | State, checks and submit move to `usePasswordForm` in new `src/features/user-account/model/use-password-form.ts` (D2) |
| `src/features/user-account/ui/ProfileForm.tsx` — `ProfileForm` (106) | user-account | State, check and submit move to `useProfileForm` in new `src/features/user-account/model/use-profile-form.ts` (D2) |
| `src/features/user-account/ui/DangerZone.tsx` — `DangerZone` (105) | user-account | One block becomes a sibling component and the block list a module-level function, in the same file (D3, D1) |
| `src/features/location-management/ui/LocationForm.tsx` — `LocationForm` (111) | offering-management | The two fieldsets become a sibling component in the same file (D3) |

No index file, test file or consumer changes.

## Decisions

### D1 — Text mappings become module-level functions
A screen that builds a texts object from message catalogs moves that object literal, unchanged, into a module-level function of the same file that takes the catalogs and returns the same type. Same keys, same values.

### D2 — Client form state moves to a hook in the slice's `model` segment
A client form whose state, client checks and submit handler push it over the limit keeps its render in `ui` and moves the state, the checks and the handler unchanged into a `use-<name>.ts` hook in the slice's `model` segment, as `use-contact-form.ts` already does in `user-account`. The hook takes the props it needs and returns what the render reads. The order of checks, state updates and requests stays the same. The hook declares the check texts it needs as its own type; the form's texts type stays where it is and satisfies it structurally.

### D3 — Render branches become sibling components
A render branch (a state, a card, a fieldset, a block) moves unchanged into a sibling component, in the same file when it stays under 300 lines, else in a new file of the same segment. The parent renders it with the same props; the DOM and class names stay identical. Sibling files are imported directly, never through the segment's index.

### D4 — Pure computations become module-level functions
Derived values computed inside a unit (failure messages, captions, counts) move unchanged into module-level functions of the same file.

## Risks / Trade-offs

- A hook that moves into a child component (D3, the small-viewport sheet of the map view) is called only when that child renders; it reads the same router state at the same time, so behaviour is unchanged.
